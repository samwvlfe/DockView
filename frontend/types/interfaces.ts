export interface DockBay {
  id: string;
  friendly_id: number;
  name: string;
  status: string;
  status_changed_at?: string;
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