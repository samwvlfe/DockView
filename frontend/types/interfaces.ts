export interface DockBay {
  id: string;
  friendly_id: number;
  name: string;
  status: string;
  status_changed_at?: string;
  fsm_state?: string | null;
  last_valid_fsm_state?: string | null;
  exception_code?: string | null;
  exception_payload?: string | null;
  consitions?: string | null;
  active_cycle_id?: string | null;
  fsm_state_entered_at?: string | null;
  fsm_updated_at?: string | null;
  group_id?: string | null;
}

export interface DockHistory {
  id: string;
  old_status: string;
  new_status: string;
  reason: string;
  created_at: string;
  turnover_time: number;
}

export interface DockInfoHistory {
  id: string;
  friendly_id: number;
  name: string;
  status: string;
  status_changed_at?: string;
  history: DockHistory[];
}


export interface Sensor {
  id: string;
  dock_bay_id: string;
  sensor_type: "LEVELER" | "RESTRAINT" | "DOOR" | string;
  name: string;
  created_at: string;
  friendly_id: number;
  sensor_state: boolean;
  updated_state_at: string | null;
}

export interface ExceptionDetails {
  code: string;
  message: string;
  sensor: Sensor;
  fix: string;
}

export interface Notification {
  id: string;
  isException: boolean;
  message: string;
  dock_bay: string
  sensor: Sensor;
  action_fix: string;
  timestamp: string;
}