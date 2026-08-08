/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { LoginView } from './components/LoginView';
import { DashboardView } from './components/DashboardView';
import { NeedActionView } from './components/NeedActionView';
import { DefectReportsView } from './components/DefectReportsView';
import { PMMasterlistView } from './components/PMMasterlistView';
import { WeeklyPmView } from './components/WeeklyPmView';
import { EquipmentStatusView } from './components/EquipmentStatusView';
import { AccountsView } from './components/AccountsView';
import { SettingsView } from './components/SettingsView';
import {
  User,
  Equipment,
  PMMasterlistItem,
  WeeklyPmItem,
  DefectReport,
  NeedActionItem,
  DashboardMetrics,
  NeedActionStatus,
  WeeklyPmStatus
} from './types';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  // Data states
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [pendingDefects, setPendingDefects] = useState<DefectReport[]>([]);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [pmMasterlist, setPmMasterlist] = useState<PMMasterlistItem[]>([]);
  const [weeklyPm, setWeeklyPm] = useState<WeeklyPmItem[]>([]);
  const [defectReports, setDefectReports] = useState<DefectReport[]>([]);
  const [needActionItems, setNeedActionItems] = useState<NeedActionItem[]>([]);
  const [accounts, setAccounts] = useState<User[]>([]);

  // Search results state
  const [searchResults, setSearchResults] = useState<{
    equipment: Equipment[];
    defects: DefectReport[];
    needAction: NeedActionItem[];
  } | null>(null);

  const authHeaders = useCallback(() => {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    };
  }, [token]);

  // Load User Profile on mount
  useEffect(() => {
    if (token) {
      fetch('/api/auth/me', { headers: authHeaders() })
        .then((res) => {
          if (!res.ok) throw new Error('Session invalid');
          return res.json();
        })
        .then((data) => {
          setCurrentUser(data.user);
        })
        .catch(() => {
          handleLogout();
        });
    }
  }, [token, authHeaders]);

  // Fetch all application data
  const refreshAllData = useCallback(() => {
    if (!token) return;

    // Dashboard summary
    fetch('/api/dashboard/summary', { headers: authHeaders() })
      .then((res) => res.json())
      .then((data) => {
        if (data.metrics) setMetrics(data.metrics);
        if (data.pendingDefects) setPendingDefects(data.pendingDefects);
      })
      .catch((err) => console.error('Error fetching dashboard summary:', err));

    // Equipment
    fetch('/api/equipment', { headers: authHeaders() })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setEquipmentList(data);
      })
      .catch((err) => console.error('Error fetching equipment:', err));

    // PM Masterlist
    fetch('/api/pm-masterlist', { headers: authHeaders() })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setPmMasterlist(data);
      })
      .catch((err) => console.error('Error fetching PM masterlist:', err));

    // Weekly PM
    fetch('/api/weekly-pm', { headers: authHeaders() })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setWeeklyPm(data);
      })
      .catch((err) => console.error('Error fetching weekly PM:', err));

    // Defect Reports
    fetch('/api/defect-reports', { headers: authHeaders() })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setDefectReports(data);
      })
      .catch((err) => console.error('Error fetching defect reports:', err));

    // Need Action
    fetch('/api/need-action', { headers: authHeaders() })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setNeedActionItems(data);
      })
      .catch((err) => console.error('Error fetching need action:', err));

    // Accounts
    fetch('/api/accounts', { headers: authHeaders() })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setAccounts(data);
      })
      .catch((err) => console.error('Error fetching accounts:', err));
  }, [token, authHeaders]);

  useEffect(() => {
    if (token) {
      refreshAllData();
    }
  }, [token, refreshAllData]);

  // Handle Search Query
  useEffect(() => {
    if (!token || !searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`, { headers: authHeaders() })
      .then((res) => res.json())
      .then((data) => setSearchResults(data))
      .catch((err) => console.error('Search error:', err));
  }, [searchQuery, token, authHeaders]);

  // Auth Actions
  const handleLogin = async (username: string, pass: string, remember: boolean) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password: pass, rememberMe: remember })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Authentication failed');
    }

    localStorage.setItem('token', data.token);
    setToken(data.token);
    setCurrentUser(data.user);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentUser(null);
  };

  // CRUD Handlers
  const handleAddEquipment = async (data: Partial<Equipment>) => {
    const res = await fetch('/api/equipment', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed adding equipment');
    }
    refreshAllData();
  };

  const handleUpdateEquipment = async (id: number, data: Partial<Equipment>) => {
    const res = await fetch(`/api/equipment/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed updating equipment');
    }
    refreshAllData();
  };

  const handleDeleteEquipment = async (id: number) => {
    const res = await fetch(`/api/equipment/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed deleting equipment');
    }
    refreshAllData();
  };

  const handleLogDefectReport = async (data: Partial<DefectReport>) => {
    const res = await fetch('/api/defect-reports', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed logging defect report');
    }
    refreshAllData();
  };

  const handleLogNeedAction = async (data: Partial<NeedActionItem>) => {
    const res = await fetch('/api/need-action', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed logging need action item');
    }
    refreshAllData();
  };

  const handleUpdateNeedActionStatus = async (id: number, status: NeedActionStatus, remarks?: string) => {
    const res = await fetch(`/api/need-action/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ status, remarks })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed updating need action item');
    }
    refreshAllData();
  };

  const handleUpdatePmMasterlist = async (id: number, data: Partial<PMMasterlistItem>) => {
    const res = await fetch(`/api/pm-masterlist/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed updating PM masterlist');
    }
    refreshAllData();
  };

  const handleAddPmMasterlist = async (data: Partial<PMMasterlistItem>) => {
    const res = await fetch('/api/pm-masterlist', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed adding PM masterlist item');
    }
    refreshAllData();
  };

  const handleDeletePmMasterlist = async (id: number) => {
    const res = await fetch(`/api/pm-masterlist/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed deleting PM masterlist item');
    }
    refreshAllData();
  };

  const handleUpdateWeeklyPmStatus = async (id: number, status: WeeklyPmStatus) => {
    const res = await fetch(`/api/weekly-pm/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ status })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed updating weekly PM status');
    }
    refreshAllData();
  };

  const handleAddWeeklyPm = async (data: Partial<WeeklyPmItem>) => {
    const res = await fetch('/api/weekly-pm', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed adding weekly PM');
    }
    refreshAllData();
  };

  const handleUpdateAccount = async (id: number, username: string, password?: string) => {
    const res = await fetch(`/api/accounts/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ newUsername: username, newPassword: password })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed updating user account');
    }
    refreshAllData();
  };

  // If no user logged in, render main landing login view
  if (!token || !currentUser) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Left Navigation Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} currentUser={currentUser} />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar */}
        <Navbar
          currentUser={currentUser}
          onLogout={handleLogout}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          metrics={metrics}
        />

        {/* Scrollable View Content */}
        <main className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
          {activeTab === 'dashboard' && (
            <DashboardView
              metrics={metrics}
              pendingDefects={pendingDefects}
              searchQuery={searchQuery}
              searchResults={searchResults}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'need_action' && (
            <NeedActionView
              items={needActionItems}
              onSubmitItem={handleLogNeedAction}
              onUpdateStatus={handleUpdateNeedActionStatus}
            />
          )}

{activeTab === 'defect_reports' && (
            <DefectReportsView
              reports={defectReports}
              equipmentList={equipmentList}
              onSubmitReport={handleLogDefectReport}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'pm_masterlist' && (
            <PMMasterlistView
              items={pmMasterlist}
              currentUser={currentUser}
              onUpdateItem={handleUpdatePmMasterlist}
              onAddItem={handleAddPmMasterlist}
              onDeleteItem={handleDeletePmMasterlist}
            />
          )}

{activeTab === 'weekly_pm' && (
            <WeeklyPmView
              schedule={weeklyPm}
              onUpdateStatus={handleUpdateWeeklyPmStatus}
              onAddSchedule={handleAddWeeklyPm}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'equipment_status' && (
            <EquipmentStatusView
              equipmentList={equipmentList}
              currentUser={currentUser}
              onAddEquipment={handleAddEquipment}
              onUpdateEquipment={handleUpdateEquipment}
              onDeleteEquipment={handleDeleteEquipment}
            />
          )}

          {activeTab === 'accounts' && (currentUser?.role === 'superuser' || currentUser?.role === 'admin') && (
            <AccountsView
              accounts={accounts}
              currentUser={currentUser}
              onUpdateAccount={handleUpdateAccount}
            />
          )}

          {activeTab === 'settings' && <SettingsView currentUser={currentUser} />}
        </main>
      </div>
    </div>
  );
}
