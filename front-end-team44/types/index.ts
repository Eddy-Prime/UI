export type User = {
  id?: number;
  name?: string;
  age?: number;
  email?: string;
  password?: string;
  yellowCards?: number;
  redCards?: number;
  greenCards?:number;
}

export type StatusMessage = {
  message: string;
  type: 'error' | 'success';
}

// Alarm-related types
export type AlarmSeverity = 'critical' | 'warning' | 'info';

export type ProductionStep = 'polymerization' | 'mixing' | 'drying' | 'packaging' | 'qa';

export interface Alarm {
  id: string;
  timestamp: string;
  severity: AlarmSeverity;
  equipment_id: string;
  production_step: ProductionStep;
  message: string;
  batch_id: string;
}

export interface AlarmsResponse {
  alarms: Alarm[];
  total: number;
  page: number;
  totalPages: number;
}

export interface AlarmFilters {
  severity?: AlarmSeverity | 'all';
  equipment_id?: string;
  production_step?: ProductionStep | 'all';
  start_date?: string;
  end_date?: string;
  batch_id?: string;
  page?: number;
  limit?: number;
}
