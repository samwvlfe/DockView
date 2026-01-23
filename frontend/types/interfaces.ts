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

export interface AvgTurnoverResponse {
  avg_turnover_time: number | null;
  turnover_count: number | null;
}

export interface Sensor {
  id: string;
  dock_bay_id: string;
  sensor_type: "LEVELER" | "RESTRAINT" | "DOOR" | string;
  name: string;
  created_at: string;
  friendly_id: number;
  sensor_state: boolean;
}