import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

let dbInstance: Database | null = null;
let dbFilePath: string = '';

export async function getDb(): Promise<Database> {
  if (dbInstance) return dbInstance;

  const SQL = await initSqlJs();
  
  // Preferred DB path from env or fallback
  const envPath = process.env.DB_PATH || '/var/data/smartinventory.db';
  const fallbackPath = path.resolve(process.cwd(), 'smartinventory.db');

  let targetPath = envPath;
  const dir = path.dirname(targetPath);

  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch (err) {
    console.warn(`Could not create directory ${dir}, falling back to local file path ${fallbackPath}`);
    targetPath = fallbackPath;
  }

  dbFilePath = targetPath;

  if (fs.existsSync(dbFilePath)) {
    try {
      const fileBuffer = fs.readFileSync(dbFilePath);
      dbInstance = new SQL.Database(fileBuffer);
      console.log(`Loaded SQLite database from ${dbFilePath}`);
    } catch (err) {
      console.error(`Failed reading existing DB file at ${dbFilePath}, initializing new standard DB instance.`, err);
      dbInstance = new SQL.Database();
    }
  } else {
    console.log(`Creating new SQLite database at ${dbFilePath}`);
    dbInstance = new SQL.Database();
  }

  initTablesAndSeed(dbInstance);
  saveDb();

  return dbInstance;
}

export function saveDb() {
  if (!dbInstance || !dbFilePath) return;
  try {
    const data = dbInstance.export();
    const buffer = Buffer.from(data);
    const dir = path.dirname(dbFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dbFilePath, buffer);
  } catch (err) {
    console.error(`Failed saving DB to ${dbFilePath}`, err);
  }
}

// Helper query wrappers for easy sql.js usage
export function queryAll(db: Database, sql: string, params: any[] = []): any[] {
  const stmt = db.prepare(sql);
  if (params.length > 0) stmt.bind(params);
  const results: any[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

export function queryOne(db: Database, sql: string, params: any[] = []): any | null {
  const rows = queryAll(db, sql, params);
  return rows.length > 0 ? rows[0] : null;
}

export function executeRun(db: Database, sql: string, params: any[] = []): { lastInsertRowid: number; changes: number } {
  db.run(sql, params);
  const res = queryOne(db, 'SELECT last_insert_rowid() as id, changes() as cnt');
  saveDb();
  return { lastInsertRowid: res?.id || 0, changes: res?.cnt || 0 };
}

function initTablesAndSeed(db: Database) {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL
    );
  `);

  // Equipment table
  db.run(`
    CREATE TABLE IF NOT EXISTS equipment (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      system TEXT NOT NULL,
      equipment_name TEXT NOT NULL,
      specs TEXT NOT NULL,
      location TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'operational',
      icon TEXT NOT NULL DEFAULT 'generator',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // PM Masterlist table
  db.run(`
    CREATE TABLE IF NOT EXISTS pm_masterlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      equipment_name TEXT NOT NULL,
      system TEXT NOT NULL,
      specs TEXT NOT NULL,
      location TEXT NOT NULL,
      jan TEXT DEFAULT 'M',
      feb TEXT DEFAULT 'M',
      mar TEXT DEFAULT 'M',
      apr TEXT DEFAULT 'M',
      may TEXT DEFAULT 'M',
      jun TEXT DEFAULT 'M',
      jul TEXT DEFAULT 'M',
      aug TEXT DEFAULT 'M',
      sep TEXT DEFAULT 'M',
      oct TEXT DEFAULT 'M',
      nov TEXT DEFAULT 'M',
      dec TEXT DEFAULT 'M'
    );
  `);

  // Weekly PM Schedule
  db.run(`
    CREATE TABLE IF NOT EXISTS weekly_pm_schedule (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      equipment_name TEXT NOT NULL,
      system TEXT NOT NULL,
      location TEXT NOT NULL,
      pm_type TEXT NOT NULL,
      scheduled_date TEXT NOT NULL,
      week_number INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'scheduled',
      assigned_to TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Defect Reports / Repair Logs
  db.run(`
    CREATE TABLE IF NOT EXISTS defect_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      equipment_name TEXT NOT NULL,
      date_reported TEXT NOT NULL,
      findings TEXT NOT NULL,
      attended_by TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Open',
      remarks TEXT,
      photo_url TEXT,
      created_at TEXT NOT NULL
    );
  `);

  // Need Action Table
  db.run(`
    CREATE TABLE IF NOT EXISTS need_action (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date_reported TEXT NOT NULL,
      reported_by TEXT NOT NULL,
      complaint TEXT NOT NULL,
      location TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open',
      remarks TEXT,
      photo_url TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT ''
    );
  `);

  // Need Action Table - migrate existing table if schema is outdated
  const existingNeedActionColumns = queryAll(db, 'PRAGMA table_info(need_action)').map((c: any) => c.name);
  const requiredNeedActionColumns = ['id', 'date_reported', 'reported_by', 'complaint', 'location', 'status', 'remarks', 'photo_url', 'created_at', 'updated_at'];
  const missingNeedActionColumns = requiredNeedActionColumns.filter((col) => !existingNeedActionColumns.includes(col));
  for (const col of missingNeedActionColumns) {
    if (col === 'updated_at') {
      db.run(`ALTER TABLE need_action ADD COLUMN updated_at TEXT NOT NULL DEFAULT ''`);
    } else if (col === 'remarks') {
      db.run(`ALTER TABLE need_action ADD COLUMN remarks TEXT`);
    } else if (col === 'photo_url') {
      db.run(`ALTER TABLE need_action ADD COLUMN photo_url TEXT`);
    } else if (col === 'status') {
      db.run(`ALTER TABLE need_action ADD COLUMN status TEXT NOT NULL DEFAULT 'open'`);
    } else if (col === 'location') {
      db.run(`ALTER TABLE need_action ADD COLUMN location TEXT NOT NULL DEFAULT ''`);
    } else if (col === 'complaint') {
      db.run(`ALTER TABLE need_action ADD COLUMN complaint TEXT NOT NULL DEFAULT ''`);
    } else if (col === 'reported_by') {
      db.run(`ALTER TABLE need_action ADD COLUMN reported_by TEXT NOT NULL DEFAULT ''`);
    } else if (col === 'date_reported') {
      db.run(`ALTER TABLE need_action ADD COLUMN date_reported TEXT NOT NULL DEFAULT ''`);
    } else if (col === 'created_at') {
      db.run(`ALTER TABLE need_action ADD COLUMN created_at TEXT NOT NULL DEFAULT ''`);
    }
  }

  // Seed default users if empty
  const userCount = queryOne(db, 'SELECT COUNT(*) as count FROM users');
  if (!userCount || userCount.count === 0) {
    console.log('Seeding initial user accounts...');
    const usersToSeed = [
      { username: 'superadmin', pass: 'niceday1%', role: 'superuser' },
      { username: 'manager', pass: 'qwerty1%', role: 'admin' },
      { username: 'engineer', pass: 'abc123%', role: 'engineer' },
      { username: 'helpdesk', pass: 'abc123%', role: 'user' }
    ];

    for (const u of usersToSeed) {
      const hash = bcrypt.hashSync(u.pass, 10);
      db.run('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)', [u.username, hash, u.role]);
    }
  }

  // Seed Equipment & Masterlist if empty
  const equipCount = queryOne(db, 'SELECT COUNT(*) as count FROM equipment');
  if (!equipCount || equipCount.count === 0) {
    console.log('Seeding equipment and PM masterlist from specs image...');
    
    const initialEquipment = [
      { system: 'HVAC', name: 'Chiller-01', specs: '200TR Daikin', location: 'Plant Room', icon: 'chillers', status: 'operational', m: ['A','M','M','Q','M','M','Q','M','M','Q','M','M'] },
      { system: 'HVAC', name: 'Chiller-02', specs: '200TR Daikin', location: 'Plant Room', icon: 'chillers', status: 'operational', m: ['M','A','M','M','Q','M','M','Q','M','M','Q','M'] },
      { system: 'HVAC', name: 'Chiller-03', specs: '200TR Daikin', location: 'Plant Room', icon: 'chillers', status: 'operational', m: ['M','M','A','M','M','Q','M','M','Q','M','M','Q'] },
      { system: 'HVAC', name: 'Chiller-04', specs: '200TR Daikin', location: 'Plant Room', icon: 'chillers', status: 'operational', m: ['Q','M','M','A','M','M','Q','M','M','Q','M','M'] },
      { system: 'HVAC', name: 'SPU-01', specs: 'SPU-10TR', location: '1st Floor', icon: 'aircon', status: 'operational', m: ['M','Q','M','M','A','M','M','Q','M','M','Q','M'] },
      { system: 'HVAC', name: 'SPU-02', specs: 'SPU-10TR', location: '1st Floor', icon: 'aircon', status: 'operational', m: ['M','M','Q','M','M','A','M','M','Q','M','M','Q'] },
      { system: 'HVAC', name: 'SPU-03', specs: 'SPU-10TR', location: '2nd Floor', icon: 'aircon', status: 'operational', m: ['Q','M','M','Q','M','M','A','M','M','Q','M','Q'] },
      { system: 'HVAC', name: 'SPU-04', specs: 'SPU-10TR', location: '2nd Floor', icon: 'aircon', status: 'operational', m: ['M','Q','M','M','Q','M','M','A','M','M','Q','M'] },
      { system: 'HVAC', name: 'SPU-05', specs: 'SPU-10TR', location: '3rd Floor', icon: 'aircon', status: 'operational', m: ['M','M','Q','M','M','Q','M','M','A','M','M','Q'] },
      { system: 'HVAC', name: 'SPU-06', specs: 'SPU-10TR', location: '3rd Floor', icon: 'aircon', status: 'operational', m: ['Q','M','M','Q','M','M','Q','M','M','A','M','M'] },
      { system: 'HVAC', name: 'SPU-07', specs: 'SPU-10TR', location: '4th Floor', icon: 'aircon', status: 'operational', m: ['M','Q','M','M','Q','M','M','Q','M','M','A','M'] },
      { system: 'HVAC', name: 'SPU-08', specs: 'SPU-10TR', location: '4th Floor', icon: 'aircon', status: 'operational', m: ['M','M','Q','M','M','Q','M','M','Q','M','M','A'] },
      { system: 'HVAC', name: 'SPU-09', specs: 'SPU-10TR', location: '5th Floor', icon: 'aircon', status: 'operational', m: ['A','M','M','Q','M','M','Q','M','M','Q','M','M'] },
      { system: 'HVAC', name: 'SPU-10', specs: 'SPU-10TR', location: '5th Floor', icon: 'aircon', status: 'operational', m: ['M','A','M','M','Q','M','M','Q','M','M','Q','M'] },
      { system: 'Mechanical', name: 'Pump-01', specs: '22 kW Centrifugal Pump', location: 'Rooftop', icon: 'pumps', status: 'operational', m: ['M','M','A','M','M','M','M','M','M','M','M','M'] },
      { system: 'Mechanical', name: 'Pump-02', specs: '22 kW Centrifugal Pump', location: 'Rooftop', icon: 'pumps', status: 'operational', m: ['M','M','M','A','M','M','M','M','M','M','M','M'] },
      { system: 'Mechanical', name: 'Pump-03', specs: '22 kW Centrifugal Pump', location: 'Basement', icon: 'pumps', status: 'minor', m: ['M','M','M','M','A','M','M','M','M','M','M','M'] },
      { system: 'Mechanical', name: 'Pump-04', specs: '22 kW Centrifugal Pump', location: 'Basement', icon: 'pumps', status: 'operational', m: ['M','M','M','M','M','A','M','M','M','M','M','M'] },
      { system: 'Mechanical', name: 'Pump-05', specs: '22 kW Centrifugal Pump', location: 'Basement', icon: 'pumps', status: 'operational', m: ['M','M','M','M','M','M','A','M','M','M','M','M'] },
      { system: 'Mechanical', name: 'Pump-06', specs: '22 kW Centrifugal Pump', location: 'Basement', icon: 'pumps', status: 'operational', m: ['M','M','M','M','M','M','M','A','M','M','M','M'] },
      { system: 'Electrical', name: 'GEN-01', specs: 'DG-500 Standby Genset', location: 'Electrical Room', icon: 'generator', status: 'operational', m: ['M','Q','M','M','A','M','M','Q','M','M','Q','M'] },
      { system: 'Electrical', name: 'GEN-02', specs: 'DG-500 Standby Genset', location: 'Electrical Room', icon: 'generator', status: 'operational', m: ['M','Q','M','M','A','M','M','Q','M','M','Q','M'] },
      { system: 'Electrical', name: 'UPS-01', specs: '10kVA Online Double Conv', location: 'Electrical Room', icon: 'ups', status: 'operational', m: ['M','M','Q','M','M','Q','M','A','M','M','M','Q'] },
      { system: 'Electrical', name: 'UPS-02', specs: '10kVA Online Double Conv', location: 'Electrical Room', icon: 'ups', status: 'operational', m: ['M','M','Q','M','M','Q','M','M','A','M','M','Q'] },
      { system: 'Transport', name: 'ELEV-01', specs: '1000kg Passenger Lift', location: 'Main Lobby', icon: 'elevator', status: 'operational', m: ['M','M','Q','M','A','M','M','Q','M','M','Q','M'] },
      { system: 'HVAC', name: 'CT-01', specs: '300RT Counterflow Tower', location: 'Roof Deck', icon: 'cooling_tower', status: 'operational', m: ['M','Q','M','M','A','M','M','Q','M','M','Q','M'] }
    ];

    const now = new Date().toISOString();

    for (const item of initialEquipment) {
      db.run(
        'INSERT INTO equipment (system, equipment_name, specs, location, status, icon, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [item.system, item.name, item.specs, item.location, item.status, item.icon, now, now]
      );

      db.run(
        `INSERT INTO pm_masterlist (equipment_name, system, specs, location, jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [item.name, item.system, item.specs, item.location, ...item.m]
      );
    }
  }

  // Seed Weekly PM Schedule if empty
  const weeklyCount = queryOne(db, 'SELECT COUNT(*) as count FROM weekly_pm_schedule');
  if (!weeklyCount || weeklyCount.count === 0) {
    console.log('Seeding weekly PM schedule...');
    const initialWeeklyPM = [
      { equipment: 'Chiller-01', system: 'HVAC', location: 'Plant Room', type: 'Monthly PM - Filter & Oil Check', date: '2026-08-10', week: 32, status: 'scheduled', assigned: 'Engineer John' },
      { equipment: 'SPU-01', system: 'HVAC', location: '1st Floor', type: 'Monthly PM - Coil Clean & Pressure', date: '2026-08-12', week: 32, status: 'scheduled', assigned: 'Tech Mike' },
      { equipment: 'Pump-03', system: 'Mechanical', location: 'Basement', type: 'Annual PM - Mechanical Seal Inspection', date: '2026-08-05', week: 31, status: 'completed', assigned: 'Engr Alex' },
      { equipment: 'GEN-01', system: 'Electrical', location: 'Electrical Room', type: 'Quarterly PM - Battery & Fuel Line', date: '2026-08-15', week: 32, status: 'scheduled', assigned: 'Tech Dave' },
      { equipment: 'UPS-01', system: 'Electrical', location: 'Electrical Room', type: 'Annual PM - Load Bank Testing', date: '2026-08-01', week: 31, status: 'completed', assigned: 'Engr Alex' }
    ];

    const now = new Date().toISOString();
    for (const w of initialWeeklyPM) {
      db.run(
        `INSERT INTO weekly_pm_schedule (equipment_name, system, location, pm_type, scheduled_date, week_number, status, assigned_to, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [w.equipment, w.system, w.location, w.type, w.date, w.week, w.status, w.assigned, now]
      );
    }
  }

  // Seed Defect Reports & Need Action if empty
  const defectCount = queryOne(db, 'SELECT COUNT(*) as count FROM defect_reports');
  if (!defectCount || defectCount.count === 0) {
    const now = new Date().toISOString().split('T')[0];
    db.run(
      `INSERT INTO defect_reports (equipment_name, date_reported, findings, attended_by, status, remarks, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['Pump-03', now, 'Minor water leakage near mechanical seal gasket', 'Engineer John', 'minor', 'Gasket replacement scheduled', new Date().toISOString()]
    );
  }

  const needActionCount = queryOne(db, 'SELECT COUNT(*) as count FROM need_action');
  if (!needActionCount || needActionCount.count === 0) {
    const now = new Date().toISOString().split('T')[0];
    db.run(
      `INSERT INTO need_action (date_reported, reported_by, complaint, location, status, remarks, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [now, 'Helpdesk Staff', 'High noise level coming from basement pump room', 'Basement', 'ongoing', 'Awaiting vibration analysis report', new Date().toISOString()]
    );
  }
}
