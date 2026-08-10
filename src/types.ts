export type Role = 'superuser' | 'admin' | 'engineer' | 'user';

export interface User {
  id: number;
  username: string;
  role: Role;
}

export type EquipmentStatusType = 'operational' | 'minor' | 'critical' | 'Good';

export type EquipmentIconType = 'generator' | 'aircon' | 'chillers' | 'pumps' | 'ups' | 'elevator' | 'cooling_tower';

export interface Equipment {
  id: number;
  system: string;
  equipment_name: string;
  specs: string;
  location: string;
  status: EquipmentStatusType;
  icon: EquipmentIconType;
  created_at: string;
  updated_at: string;
}

export interface PMMasterlistItem {
  id: number;
  equipment_name: string;
  system: string;
  specs: string;
  location: string;
  jan: string;
  feb: string;
  mar: string;
  apr: string;
  may: string;
  jun: string;
  jul: string;
  aug: string;
  sep: string;
  oct: string;
  nov: string;
  dec: string;
}

export type WeeklyPmStatus = 'scheduled' | 'completed' | 'cancelled';

export interface WeeklyPmItem {
  id: number;
  equipment_name: string;
  system: string;
  location: string;
  pm_type: string;
  scheduled_date: string;
  week_number: number;
  status: WeeklyPmStatus;
  assigned_to: string;
  updated_at: string;
}

export type DefectStatus = 'open' | 'minor' | 'critical' | 'done';

export interface DefectReport {
  id: number;
  equipment_name: string;
  date_reported: string;
  findings: string;
  attended_by: string;
  status: DefectStatus;
  remarks?: string;
  photo_url?: string;
  created_at: string;
}

export type NeedActionStatus = 'open' | 'ongoing' | 'done';

export interface NeedActionItem {
  id: number;
  date_reported: string;
  reported_by: string;
  complaint: string;
  location: string;
  status: NeedActionStatus;
  remarks?: string;
  photo_url?: string;
  created_at: string;
}

export interface DashboardMetrics {
  totalEquipment: number;
  operationalCount: number;
  minorCount: number;
  criticalCount: number;
  healthPercent: number;
  pmCompletionRate: number;
  defectCounts: {
    open: number;
    ongoing: number;
    done: number;
    total: number;
  };
}
