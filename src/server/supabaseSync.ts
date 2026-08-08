import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

let supabaseClient: any = null;

export function getSupabase() {
  if (!supabaseClient && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
    try {
      supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    } catch (err) {
      console.warn('Failed initializing Supabase client:', err);
    }
  }
  return supabaseClient;
}

export async function syncEquipmentToSupabase(equipmentData: any) {
  const supabase = getSupabase();
  if (!supabase) return;

  try {
    const payload = {
      id: equipmentData.id,
      system: equipmentData.system,
      equipment_name: equipmentData.equipment_name,
      specs: equipmentData.specs,
      location: equipmentData.location,
      status: equipmentData.status,
      icon: equipmentData.icon,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase.from('equipment_list').upsert([payload], { onConflict: 'id' });
    if (error) {
      console.warn('Supabase equipment_list sync error:', error.message);
    } else {
      console.log(`Synced equipment ${equipmentData.equipment_name} (ID: ${equipmentData.id}) to Supabase equipment_list`);
    }
  } catch (err) {
    console.warn('Supabase equipment sync exception:', err);
  }
}

export async function deleteEquipmentFromSupabase(id: number) {
  const supabase = getSupabase();
  if (!supabase) return;

  try {
    const { error } = await supabase.from('equipment_list').delete().eq('id', id);
    if (error) {
      console.warn('Supabase delete equipment error:', error.message);
    } else {
      console.log(`Deleted equipment ID ${id} from Supabase equipment_list`);
    }
  } catch (err) {
    console.warn('Supabase delete equipment exception:', err);
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

export async function syncWeeklyPmToSupabase(pmItem: any) {
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
      updated_at: new Date().toISOString()
    };

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
