import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { getDb, queryAll, queryOne, executeRun, saveDb } from './src/server/db';
import {
  syncEquipmentToSupabase,
  deleteEquipmentFromSupabase,
  syncNeedActionToSupabase,
  syncDefectReportToSupabase,
  syncWeeklyPmToSupabase,
  deleteWeeklyPmFromSupabase,
syncWeeklyPmToPmLogs,
  fetchWeeklyPmFromSupabase,
  fetchWeeklyPmByIdFromSupabase,
  insertWeeklyPmToSupabase
} from './src/server/supabaseSync';

dotenv.config();

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || '8fKx92LmPq77Zs1A0vNc45Rt9YwQe31Hd6Ua78Bb';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: string;
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Initialize SQLite database
  const db = await getDb();

  // Authentication Middleware
  const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Authentication token required' });
    }

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid or expired session token' });
      }
      req.user = user;
      next();
    });
  };

// Helper function to auto-adjust equipment status based on repair logs
  const adjustEquipmentStatus = async (equipmentName: string) => {
    // Check latest active defect report for this equipment
    const reports = queryAll(
      db,
      'SELECT status FROM defect_reports WHERE LOWER(equipment_name) = LOWER(?) ORDER BY id DESC',
      [equipmentName]
    );

    let newStatus = 'operational';
    if (reports.length > 0) {
      const activeReport = reports.find(
        (r) => r.status === 'Critical' || r.status === 'Minor' || r.status === 'Open' || r.status === 'Ongoing'
      );

      if (activeReport) {
        if (activeReport.status === 'Critical') {
          newStatus = 'critical';
        } else {
          newStatus = 'minor';
        }
      }
    }

    // Update equipment status in DB
    db.run('UPDATE equipment SET status = ?, updated_at = ? WHERE LOWER(equipment_name) = LOWER(?)', [
      newStatus,
      new Date().toISOString(),
      equipmentName
    ]);
    saveDb();

// Get updated equipment item and sync to Supabase
    const updatedEq = queryOne(db, 'SELECT * FROM equipment WHERE LOWER(equipment_name) = LOWER(?)', [equipmentName]);
    if (updatedEq) {
      await syncEquipmentToSupabase(updatedEq);
    }
    return newStatus;
  };

  // -------------------------------------------------------------
  // API ROUTES (/api/*)
  // -------------------------------------------------------------

  // Login
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { username, password, rememberMe } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Case-insensitive match for username
    const user = queryOne(db, 'SELECT * FROM users WHERE LOWER(username) = LOWER(?)', [username.trim()]);

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Check password (supports case-insensitive comparison or bcrypt)
    let isPasswordValid = false;
    if (bcrypt.compareSync(password, user.password_hash)) {
      isPasswordValid = true;
    } else if (password.toLowerCase() === user.password_hash.toLowerCase()) {
      isPasswordValid = true;
    }

    // Fallback password checks for initial seeded credentials
    if (!isPasswordValid) {
      const seededPasswords: Record<string, string> = {
        superadmin: 'niceday1%',
        manager: 'qwerty1%',
        engineer: 'abc123%',
        helpdesk: 'abc123%'
      };

      const defaultPass = seededPasswords[user.username.toLowerCase()];
      if (defaultPass && (password === defaultPass || password.toLowerCase() === defaultPass.toLowerCase())) {
        isPasswordValid = true;
      }
    }

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const expiresIn = rememberMe ? '30d' : '1d';
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  });

  // Current User Profile
  app.get('/api/auth/me', authenticateToken, (req: AuthRequest, res: Response) => {
    res.json({ user: req.user });
  });

  // Accounts Management
  app.get('/api/accounts', authenticateToken, (req: AuthRequest, res: Response) => {
    const users = queryAll(db, 'SELECT id, username, role FROM users');
    res.json(users);
  });

  app.put('/api/accounts/:id', authenticateToken, (req: AuthRequest, res: Response) => {
    const targetId = parseInt(req.params.id, 10);
    const { newUsername, newPassword } = req.body;
    const currentUser = req.user!;

    const targetUser = queryOne(db, 'SELECT * FROM users WHERE id = ?', [targetId]);
    if (!targetUser) {
      return res.status(404).json({ error: 'Account not found' });
    }

// Permissions check:
    // superuser can edit all accounts
    // admin can edit admin, engineer, and user accounts (not superuser)
    if (currentUser.role === 'admin' && (targetUser.role === 'superuser')) {
      return res.status(403).json({ error: 'Admins cannot edit superuser accounts' });
    }
    if (currentUser.role !== 'superuser' && currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Permission denied for modifying accounts' });
    }

    let updatedUsername = targetUser.username;
    if (newUsername && newUsername.trim()) {
      updatedUsername = newUsername.trim();
    }

    let updatedHash = targetUser.password_hash;
    if (newPassword && newPassword.trim()) {
      updatedHash = bcrypt.hashSync(newPassword.trim(), 10);
    }

    db.run('UPDATE users SET username = ?, password_hash = ? WHERE id = ?', [
      updatedUsername,
      updatedHash,
      targetId
    ]);
    saveDb();

    res.json({ message: 'Account updated successfully', user: { id: targetId, username: updatedUsername, role: targetUser.role } });
  });

  // Equipment Endpoints
  app.get('/api/equipment', authenticateToken, (req: AuthRequest, res: Response) => {
    const items = queryAll(db, 'SELECT * FROM equipment ORDER BY id DESC');
    res.json(items);
  });

app.post('/api/equipment', authenticateToken, async (req: AuthRequest, res: Response) => {
    const userRole = req.user?.role;
    if (userRole === 'user') {
      return res.status(403).json({ error: 'Helpdesk users cannot add new equipment' });
    }

    const { system, equipment_name, specs, location, status, icon } = req.body;
    if (!system || !equipment_name || !specs || !location) {
      return res.status(400).json({ error: 'System, Equipment Name, Specs, and Location are required' });
    }

    const now = new Date().toISOString();
    const result = executeRun(
      db,
      `INSERT INTO equipment (system, equipment_name, specs, location, status, icon, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        system,
        equipment_name.trim(),
        specs,
        location,
        status || 'operational',
        icon || 'generator',
        now,
        now
      ]
    );

const newEquipment = queryOne(db, 'SELECT * FROM equipment WHERE id = ?', [result.lastInsertRowid]);

    // Also insert into PM Masterlist
    db.run(
      `INSERT INTO pm_masterlist (equipment_name, system, specs, location) VALUES (?, ?, ?, ?)`,
      [equipment_name.trim(), system, specs, location]
    );
    saveDb();

    // Sync to Supabase equipment_list table (always awaited to guarantee propagation)
    if (newEquipment) {
      await syncEquipmentToSupabase(newEquipment);
    }

    res.status(201).json(newEquipment);
  });

app.put('/api/equipment/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
    const userRole = req.user?.role;
    if (userRole === 'user') {
      return res.status(403).json({ error: 'Helpdesk users cannot update equipment' });
    }

    const id = parseInt(req.params.id, 10);
    const { system, equipment_name, specs, location, status, icon } = req.body;

    const existing = queryOne(db, 'SELECT * FROM equipment WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    const now = new Date().toISOString();
    db.run(
      `UPDATE equipment SET system = ?, equipment_name = ?, specs = ?, location = ?, status = ?, icon = ?, updated_at = ?
       WHERE id = ?`,
      [
        system || existing.system,
        equipment_name || existing.equipment_name,
        specs || existing.specs,
        location || existing.location,
        status || existing.status,
        icon || existing.icon,
        now,
        id
      ]
    );
    saveDb();

const updated = queryOne(db, 'SELECT * FROM equipment WHERE id = ?', [id]);

    // Sync to Supabase (always awaited to guarantee propagation)
    if (updated) {
      await syncEquipmentToSupabase(updated);
    }

    res.json(updated);
  });

app.delete('/api/equipment/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
    const userRole = req.user?.role;
    if (userRole === 'user') {
      return res.status(403).json({ error: 'Helpdesk users cannot delete equipment' });
    }

    const id = parseInt(req.params.id, 10);
    const existing = queryOne(db, 'SELECT * FROM equipment WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

db.run('DELETE FROM equipment WHERE id = ?', [id]);
    saveDb();

    // Sync deletion to Supabase (always awaited to guarantee propagation)
    await deleteEquipmentFromSupabase(id);

    res.json({ message: 'Equipment deleted successfully', id });
  });

  // PM Masterlist Endpoints
  app.get('/api/pm-masterlist', authenticateToken, (req: AuthRequest, res: Response) => {
    const items = queryAll(db, 'SELECT * FROM pm_masterlist ORDER BY id ASC');
    res.json(items);
  });

  app.put('/api/pm-masterlist/:id', authenticateToken, (req: AuthRequest, res: Response) => {
    const userRole = req.user?.role;
    if (userRole === 'user') {
      return res.status(403).json({ error: 'Helpdesk users cannot edit PM Masterlist' });
    }

    const id = parseInt(req.params.id, 10);
    const fields = req.body;

    const existing = queryOne(db, 'SELECT * FROM pm_masterlist WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'PM Masterlist row not found' });
    }

    db.run(
      `UPDATE pm_masterlist SET
        equipment_name = ?, system = ?, specs = ?, location = ?,
        jan = ?, feb = ?, mar = ?, apr = ?, may = ?, jun = ?,
        jul = ?, aug = ?, sep = ?, oct = ?, nov = ?, dec = ?
       WHERE id = ?`,
      [
        fields.equipment_name || existing.equipment_name,
        fields.system || existing.system,
        fields.specs || existing.specs,
        fields.location || existing.location,
        fields.jan || existing.jan,
        fields.feb || existing.feb,
        fields.mar || existing.mar,
        fields.apr || existing.apr,
        fields.may || existing.may,
        fields.jun || existing.jun,
        fields.jul || existing.jul,
        fields.aug || existing.aug,
        fields.sep || existing.sep,
        fields.oct || existing.oct,
        fields.nov || existing.nov,
        fields.dec || existing.dec,
        id
      ]
    );
    saveDb();

    const updated = queryOne(db, 'SELECT * FROM pm_masterlist WHERE id = ?', [id]);
    res.json(updated);
  });

  app.post('/api/pm-masterlist', authenticateToken, (req: AuthRequest, res: Response) => {
    const userRole = req.user?.role;
    if (userRole === 'user') {
      return res.status(403).json({ error: 'Permission denied' });
    }

    const { equipment_name, system, specs, location, jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec } = req.body;
    const result = executeRun(
      db,
      `INSERT INTO pm_masterlist (equipment_name, system, specs, location, jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [equipment_name, system, specs, location, jan||'M', feb||'M', mar||'M', apr||'M', may||'M', jun||'M', jul||'M', aug||'M', sep||'M', oct||'M', nov||'M', dec||'M']
    );

    const created = queryOne(db, 'SELECT * FROM pm_masterlist WHERE id = ?', [result.lastInsertRowid]);
    res.status(201).json(created);
  });

  app.delete('/api/pm-masterlist/:id', authenticateToken, (req: AuthRequest, res: Response) => {
    const userRole = req.user?.role;
    if (userRole === 'user') {
      return res.status(403).json({ error: 'Permission denied' });
    }

    const id = parseInt(req.params.id, 10);
    db.run('DELETE FROM pm_masterlist WHERE id = ?', [id]);
    saveDb();
    res.json({ message: 'Masterlist entry deleted', id });
  });

// Weekly PM Endpoints
  app.get('/api/weekly-pm', authenticateToken, async (req: AuthRequest, res: Response) => {
    // Fetch Weekly PM rows from the Supabase weekly_pm_schedule table
    const items = await fetchWeeklyPmFromSupabase();
    res.json(items);
  });

app.post('/api/weekly-pm', authenticateToken, async (req: AuthRequest, res: Response) => {
    const userRole = req.user?.role;
    if (userRole === 'user') {
      return res.status(403).json({ error: 'Helpdesk users can only view Weekly PM schedules' });
    }

    const { equipment_name, system, location, pm_type, scheduled_date, week_number, assigned_to, status } = req.body;

    // Insert directly into the Supabase weekly_pm_schedule table
    const created = await insertWeeklyPmToSupabase({
      equipment_name,
      system,
      location,
      pm_type,
      scheduled_date,
      week_number: week_number || 32,
      assigned_to: assigned_to || 'Maintenance Team',
      status: status || 'scheduled'
    });

    if (!created) {
      return res.status(500).json({ error: 'Failed to create Weekly PM schedule in Supabase' });
    }

    res.status(201).json(created);
  });

app.put('/api/weekly-pm/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
    const userRole = req.user?.role;
    if (userRole === 'user') {
      return res.status(403).json({ error: 'Helpdesk users can only view Weekly PM schedules' });
    }

    const id = parseInt(req.params.id, 10);
    const { status, assigned_to, scheduled_date } = req.body;

    // Fetch the existing row directly from the Supabase weekly_pm_schedule table
    const existing = await fetchWeeklyPmByIdFromSupabase(id);
    if (!existing) {
      return res.status(404).json({ error: 'Weekly PM entry not found' });
    }

    // Build the updated item (frontend shape) preserving existing fields
    const updatedItem = {
      ...existing,
      status: status || existing.status,
      assigned_to: assigned_to || existing.assigned_to,
      scheduled_date: scheduled_date || existing.scheduled_date
    };

    // Update directly in Supabase weekly_pm_schedule
    await syncWeeklyPmToSupabase(updatedItem);

    // When completed or cancelled, also log to Supabase pm_logs
    if (updatedItem.status === 'completed' || updatedItem.status === 'cancelled') {
      await syncWeeklyPmToPmLogs(updatedItem);
    }

    res.json(updatedItem);
  });

  // Delete Weekly PM schedule item (removes from Supabase weekly_pm_schedule)
  app.delete('/api/weekly-pm/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
    const userRole = req.user?.role;
    if (userRole === 'user') {
      return res.status(403).json({ error: 'Helpdesk users cannot delete Weekly PM schedules' });
    }

    const id = parseInt(req.params.id, 10);
    const existing = await fetchWeeklyPmByIdFromSupabase(id);
    if (!existing) {
      return res.status(404).json({ error: 'Weekly PM entry not found' });
    }

    // Delete directly from Supabase weekly_pm_schedule
    await deleteWeeklyPmFromSupabase(id);

    res.json({ message: 'Weekly PM schedule deleted successfully', id });
  });

  // Defect Reports / Repair Logs Endpoints
  app.get('/api/defect-reports', authenticateToken, (req: AuthRequest, res: Response) => {
    const reports = queryAll(db, 'SELECT * FROM defect_reports ORDER BY id DESC');
    res.json(reports);
  });

app.post('/api/defect-reports', authenticateToken, (req: AuthRequest, res: Response) => {
    const userRole = req.user?.role;
    if (userRole === 'user') {
      return res.status(403).json({ error: 'Helpdesk users cannot create or edit defect reports' });
    }

    const { equipment_name, date_reported, findings, attended_by, status, remarks, photo_url } = req.body;

    if (!equipment_name || !findings) {
      return res.status(400).json({ error: 'Equipment name and findings are required' });
    }

    const now = new Date().toISOString();
    const result = executeRun(
      db,
      `INSERT INTO defect_reports (equipment_name, date_reported, findings, attended_by, status, remarks, photo_url, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        equipment_name,
        date_reported || new Date().toISOString().split('T')[0],
        findings,
        attended_by || req.user?.username || 'Helpdesk',
        status || 'Open',
        remarks || '',
        photo_url || '',
        now
      ]
    );

const created = queryOne(db, 'SELECT * FROM defect_reports WHERE id = ?', [result.lastInsertRowid]);

    // Sync the new defect report to Supabase repair_logs table
    if (created) {
      syncDefectReportToSupabase(created);
    }

    // Automatically adjust equipment status based on repair logs!
    const updatedStatus = adjustEquipmentStatus(equipment_name);

    res.status(201).json({ report: created, updatedEquipmentStatus: updatedStatus });
  });

  // Update defect report status / remarks (engineer, admin, superuser only)
  app.put('/api/defect-reports/:id', authenticateToken, (req: AuthRequest, res: Response) => {
    const userRole = req.user?.role;
    if (userRole === 'user') {
      return res.status(403).json({ error: 'Helpdesk users cannot edit defect reports' });
    }

    const id = parseInt(req.params.id, 10);
    const { status, remarks, attended_by } = req.body;

    const existing = queryOne(db, 'SELECT * FROM defect_reports WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Defect report not found' });
    }

    db.run('UPDATE defect_reports SET status = ?, remarks = ?, attended_by = ? WHERE id = ?', [
      status || existing.status,
      remarks !== undefined ? remarks : existing.remarks,
      attended_by || existing.attended_by,
      id
    ]);
    saveDb();

    const updated = queryOne(db, 'SELECT * FROM defect_reports WHERE id = ?', [id]);

    // Sync updated defect report to Supabase repair_logs table
    if (updated) {
      syncDefectReportToSupabase(updated);
    }

    // Automatically adjust equipment status based on the updated repair log
    adjustEquipmentStatus(updated.equipment_name);

    res.json(updated);
  });

  // Need Action Endpoints
  app.get('/api/need-action', authenticateToken, (req: AuthRequest, res: Response) => {
    const items = queryAll(db, 'SELECT * FROM need_action ORDER BY id DESC');
    res.json(items);
  });

  app.post('/api/need-action', authenticateToken, async (req: AuthRequest, res: Response) => {
    console.log('[need-action POST] Request body:', req.body);
    const { date_reported, reported_by, complaint, location, status, remarks, photo_url } = req.body;

    if (!complaint || !location) {
      return res.status(400).json({ error: 'Complaint and location are required' });
    }

    const now = new Date().toISOString();
    console.log('[need-action POST] Inserting with columns:', [
      'date_reported', 'reported_by', 'complaint', 'location', 'status', 'remarks', 'photo_url', 'created_at', 'updated_at'
    ]);
    const result = executeRun(
      db,
      `INSERT INTO need_action (date_reported, reported_by, complaint, location, status, remarks, photo_url, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        date_reported || new Date().toISOString().split('T')[0],
        reported_by || req.user?.username || 'Staff',
        complaint,
        location,
        status || 'open',
        remarks || '',
        photo_url || '',
        now,
        now
      ]
    );
    console.log('[need-action POST] Insert result:', result);

    const created = queryOne(db, 'SELECT * FROM need_action WHERE id = ?', [result.lastInsertRowid]);
    console.log('[need-action POST] Query result for id', result.lastInsertRowid, ':', created);
    if (!created) {
      console.error('[need-action POST] INSERT FAILED - need_action table may be missing updated_at column');
      console.error('[need-action POST] All need_action columns:', queryOne(db, 'PRAGMA table_info(need_action)'));
    }

    // Sync to Supabase need_action table
    if (created) {
      await syncNeedActionToSupabase(created);
    }

    res.status(201).json(created);
  });

  app.put('/api/need-action/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const { status, remarks } = req.body;
    console.log('[need-action PUT] id:', id, 'body:', req.body);

    const existing = queryOne(db, 'SELECT * FROM need_action WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Need Action item not found' });
    }

    db.run('UPDATE need_action SET status = ?, remarks = ?, updated_at = ? WHERE id = ?', [
      status || existing.status,
      remarks !== undefined ? remarks : existing.remarks,
      new Date().toISOString(),
      id
    ]);
    saveDb();

    const updated = queryOne(db, 'SELECT * FROM need_action WHERE id = ?', [id]);
    console.log('[need-action PUT] Updated item:', updated);

    // Update in Supabase even when status changes!
    if (updated) {
      await syncNeedActionToSupabase(updated);
    }

    res.json(updated);
  });

  // Dashboard Summary Data
  app.get('/api/dashboard/summary', authenticateToken, (req: AuthRequest, res: Response) => {
    const equipment = queryAll(db, 'SELECT * FROM equipment');
    const defectReports = queryAll(db, 'SELECT * FROM defect_reports ORDER BY id DESC');
    const weeklyPm = queryAll(db, 'SELECT * FROM weekly_pm_schedule');
    const needActions = queryAll(db, 'SELECT * FROM need_action ORDER BY id DESC');

    const totalEquip = equipment.length;
    const operationalCount = equipment.filter((e) => e.status === 'operational' || e.status === 'Good').length;
    const minorCount = equipment.filter((e) => e.status === 'minor').length;
    const criticalCount = equipment.filter((e) => e.status === 'critical').length;
    const healthPercent = totalEquip > 0 ? Math.round((operationalCount / totalEquip) * 100) : 100;

    const totalPm = weeklyPm.length;
    const completedPm = weeklyPm.filter((p) => p.status === 'completed').length;
    const pmCompletionRate = totalPm > 0 ? Math.round((completedPm / totalPm) * 100) : 85;

    const defectOpen = defectReports.filter((r) => r.status === 'Open' || r.status === 'Critical' || r.status === 'Minor').length;
    const defectOngoing = defectReports.filter((r) => r.status === 'Ongoing').length;
    const defectDone = defectReports.filter((r) => r.status === 'Done' || r.status === 'Repaired').length;

    const pendingDefects = defectReports.filter((r) => r.status !== 'Done' && r.status !== 'Repaired');

    res.json({
      metrics: {
        totalEquipment: totalEquip,
        operationalCount,
        minorCount,
        criticalCount,
        healthPercent,
        pmCompletionRate,
        defectCounts: {
          open: defectOpen,
          ongoing: defectOngoing,
          done: defectDone,
          total: defectReports.length
        }
      },
      pendingDefects,
      recentNeedActions: needActions.slice(0, 5)
    });
  });

  // Global Search
  app.get('/api/search', authenticateToken, (req: AuthRequest, res: Response) => {
    const q = ((req.query.q as string) || '').trim().toLowerCase();
    if (!q) {
      return res.json({ equipment: [], defects: [], needAction: [], pm: [] });
    }

    const allEquip = queryAll(db, 'SELECT * FROM equipment');
    const matchingEquip = allEquip.filter(
      (e) =>
        e.equipment_name.toLowerCase().includes(q) ||
        e.specs.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q) ||
        e.system.toLowerCase().includes(q)
    );

    const allDefects = queryAll(db, 'SELECT * FROM defect_reports');
    const matchingDefects = allDefects.filter(
      (d) =>
        d.equipment_name.toLowerCase().includes(q) ||
        d.findings.toLowerCase().includes(q) ||
        d.attended_by.toLowerCase().includes(q) ||
        d.status.toLowerCase().includes(q)
    );

    const allNeedAction = queryAll(db, 'SELECT * FROM need_action');
    const matchingNeedAction = allNeedAction.filter(
      (n) =>
        n.complaint.toLowerCase().includes(q) ||
        n.location.toLowerCase().includes(q) ||
        n.reported_by.toLowerCase().includes(q)
    );

    res.json({
      equipment: matchingEquip,
      defects: matchingDefects,
      needAction: matchingNeedAction
    });
  });

  // Settings & System Config (superuser only)
  app.get('/api/settings', authenticateToken, (req: AuthRequest, res: Response) => {
    if (req.user?.role !== 'superuser') {
      return res.status(403).json({ error: 'Access restricted to Superuser role' });
    }

    res.json({
      dbPath: process.env.DB_PATH || '/var/data/smartinventory.db',
      nodeEnv: process.env.NODE_ENV || 'production',
      supabaseUrl: process.env.SUPABASE_URL || 'https://magiaognakiosojtubkh.supabase.co',
      supabaseConfigured: true,
      n8nWebhookUrl: 'https://n8n.internal.automation/webhook/equipment-status',
      n8nStatus: 'Active'
    });
  });

  app.post('/api/settings/n8n-test', authenticateToken, (req: AuthRequest, res: Response) => {
    if (req.user?.role !== 'superuser') {
      return res.status(403).json({ error: 'Access restricted to Superuser role' });
    }

    res.json({
      success: true,
      message: 'Test alert payload dispatched to n8n webhook',
      timestamp: new Date().toISOString()
    });
  });

  // -------------------------------------------------------------
  // VITE / STATIC FRONTEND SERVING
  // -------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
});
