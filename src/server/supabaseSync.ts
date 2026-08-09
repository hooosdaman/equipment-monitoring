import { createClient } from '@supabase/supabase-js';

let supabaseClient: any = null;
let warnedMissingConfig = false;

export function getSupabase() {
  // Read env lazily at call-time so dotenv.config() has already run when invoked.
  // Reading module-level constants at import time would capture empty values because
  // import statements are hoisted above dotenv.config() in the entry point.
  const SUPABASE_URL = process.env.SUPABASE_URL || '';
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    if (!warnedMissingConfig) {
      console.warn(
        '[SupabaseSync] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. ' +
        'Equipment changes will NOT be synced to Supabase. Please configure the .env file.'
      );
      warnedMissingConfig = true;
    }
    return null;
  }
  if (!supabaseClient) {
    try {
      supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    } catch (err) {
      console.warn('Failed initializing Supabase client:', err);
    }
  }
  return supabaseClient;
}

export async function syncEquipmentToSupabase(equipmentData: any): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

try {
    const payload = {
      id: equipmentData.id,
      system: equipmentData.system,
      equipment_id: equipmentData.equipment_name,
      specifications: equipmentData.specs,
      location: equipmentData.location,
      status: equipmentData.status
    };

    const { error } = await supabase.from('equipment').upsert([payload], { onConflict: 'id' });
    if (error) {
      console.warn('Supabase equipment sync error:', error.message);
      return false;
    } else {
      console.log(`Synced equipment ${equipmentData.equipment_name} (ID: ${equipmentData.id}) to Supabase equipment table`);
      return true;
    }
  } catch (err) {
    console.warn('Supabase equipment sync exception:', err);
    return false;
  }
}

export async function deleteEquipmentFromSupabase(id: number): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

try {
    const { error } = await supabase.from('equipment').delete().eq('id', id);
    if (error) {
      console.warn('Supabase delete equipment error:', error.message);
      return false;
    } else {
      console.log(`Deleted equipment ID ${id} from Supabase equipment table`);
      return true;
    }
  } catch (err) {
    console.warn('Supabase delete equipment exception:', err);
    return false;
  }
}

export async function syncNeedActionToSupabase(item: any) {
  const supabase = getSupabase();
  if (!supabase) return;

  try {
const payload = {
      id: item.id,
      date_reported: item.date_reported,
      reported_by: item.reported_by,
      complaint: item.complaint,
      location: item.location,
      status: item.status,
      remarks: item.remarks || '',
      photo_url: item.photo_url || '',
      created_at: item.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase.from('need_action').upsert([payload], { onConflict: 'id' });
    if (error) {
      console.warn('Supabase need_action sync error:', error.message);
    } else {
      console.log(`Synced need_action item ID ${item.id} (Status: ${item.status}) to Supabase need_action table`);
    }
  } catch (err) {
    console.warn('Supabase need_action sync exception:', err);
  }
}

export async function syncDefectReportToSupabase(report: any) {
  const supabase = getSupabase();
  if (!supabase) return;

  try {
    const payload = {
      id: report.id,
      equipment_name: report.equipment_name,
      date_reported: report.date_reported,
      findings: report.findings,
      attended_by: report.attended_by,
      status: report.status,
      remarks: report.remarks || '',
      photo_url: report.photo_url || '',
      created_at: report.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase.from('repair_logs').upsert([payload], { onConflict: 'id' });
    if (error) {
      console.warn('Supabase repair_logs sync error:', error.message);
    } else {
      console.log(`Synced defect report ID ${report.id} (Status: ${report.status}) to Supabase repair_logs table`);
    }
  } catch (err) {
    console.warn('Supabase repair_logs sync exception:', err);
  }
}

// Map a local Weekly PM item to the Supabase weekly_pm_schedule row shape
function weeklyPmToSupabaseRow(pmItem: any) {
  return {
    id: pmItem.id,
    equipment: pmItem.equipment_name,
    system: pmItem.system,
    location: pmItem.location,
    pm_type: pmItem.pm_type,
    date: pmItem.scheduled_date,
    week: pmItem.week_number,
    status: pmItem.status,
    remarks: pmItem.remarks || null,
    AttendedBy: pmItem.assigned_to
  };
}

// Map a Supabase weekly_pm_schedule row back to the frontend WeeklyPmItem shape
function supabaseRowToWeeklyPm(row: any) {
  return {
    id: row.id,
    equipment_name: row.equipment,
    system: row.system,
    location: row.location,
    pm_type: row.pm_type,
    scheduled_date: row.date ? String(row.date).slice(0, 10) : '',
    week_number: typeof row.week === 'number' ? row.week : parseInt(row.week, 10) || 0,
    status: row.status,
    assigned_to: row.AttendedBy,
    remarks: row.remarks || '',
    updated_at: new Date().toISOString()
  };
}

export async function syncWeeklyPmToSupabase(pmItem: any) {
  const supabase = getSupabase();
  if (!supabase) return;

  try {
    const payload = weeklyPmToSupabaseRow(pmItem);
    const { error } = await supabase.from('weekly_pm_schedule').upsert([payload], { onConflict: 'id' });
    if (error) {
      console.warn('Supabase weekly_pm_schedule sync error:', error.message);
    } else {
      console.log(`Synced weekly_pm_schedule item ID ${pmItem.id} (Status: ${pmItem.status}) to Supabase weekly_pm_schedule table`);
    }
  } catch (err) {
    console.warn('Supabase weekly_pm_schedule sync exception:', err);
  }
}

export async function fetchWeeklyPmFromSupabase(): Promise<any[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('weekly_pm_schedule')
      .select('*')
      .order('date', { ascending: true });
    if (error) {
      console.warn('Supabase weekly_pm_schedule fetch error:', error.message);
      return [];
    }
    return (data || []).map(supabaseRowToWeeklyPm);
  } catch (err) {
    console.warn('Supabase weekly_pm_schedule fetch exception:', err);
    return [];
  }
}

export async function insertWeeklyPmToSupabase(pmItem: any): Promise<any | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const payload: any = {
      equipment: pmItem.equipment_name,
      system: pmItem.system,
      location: pmItem.location,
      pm_type: pmItem.pm_type,
      date: pmItem.scheduled_date,
      week: pmItem.week_number,
      status: pmItem.status || 'scheduled',
      remarks: pmItem.remarks || null,
      AttendedBy: pmItem.assigned_to
    };
    if (pmItem.id) payload.id = pmItem.id;

    const { data, error } = await supabase
      .from('weekly_pm_schedule')
      .insert(payload)
      .select('*')
      .single();
    if (error) {
      console.warn('Supabase weekly_pm_schedule insert error:', error.message);
      return null;
    }
    return supabaseRowToWeeklyPm(data);
  } catch (err) {
    console.warn('Supabase weekly_pm_schedule insert exception:', err);
    return null;
  }
}

export async function fetchWeeklyPmByIdFromSupabase(id: number): Promise<any | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('weekly_pm_schedule')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      console.warn('Supabase weekly_pm_schedule fetch-by-id error:', error.message);
      return null;
    }
    return supabaseRowToWeeklyPm(data);
  } catch (err) {
    console.warn('Supabase weekly_pm_schedule fetch-by-id exception:', err);
    return null;
  }
}

export async function deleteWeeklyPmFromSupabase(id: number) {
  const supabase = getSupabase();
  if (!supabase) return;

  try {
    const { error } = await supabase.from('weekly_pm_schedule').delete().eq('id', id);
    if (error) {
      console.warn('Supabase weekly_pm_schedule delete error:', error.message);
    } else {
      console.log(`Deleted weekly PM schedule ID ${id} from Supabase weekly_pm_schedule`);
    }
  } catch (err) {
    console.warn('Supabase weekly_pm_schedule delete exception:', err);
  }
}

export async function syncWeeklyPmToPmLogs(pmItem: any) {
  const supabase = getSupabase();
  if (!supabase) return;

  try {
    const payload = {
      id: pmItem.id,
      equipment_name: pmItem.equipment_name,
      system: pmItem.system,
      location: pmItem.location,
      pm_type: pmItem.pm_type,
      scheduled_date: pmItem.scheduled_date,
      week_number: pmItem.week_number,
      status: pmItem.status,
      assigned_to: pmItem.assigned_to,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase.from('pm_logs').upsert([payload], { onConflict: 'id' });
    if (error) {
      console.warn('Supabase pm_logs sync error:', error.message);
    } else {
      console.log(`Logged weekly PM item ID ${pmItem.id} (Status: ${pmItem.status}) to Supabase pm_logs table`);
    }
  } catch (err) {
    console.warn('Supabase pm_logs sync exception:', err);
  }
}
