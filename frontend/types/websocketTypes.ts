import { ExceptionDetails } from './interfaces';

// DOCK STATUS UPDATE MESSAGE
export type DockStatusUpdatePayload = {
  dock_bay_id: string;
  old_status: string;
  new_status: string;
  event_type: string;
  status_changed_at: string;
  active_cycle_id : string;
};
export interface DockStatusUpdateMessage {
  type: "dock_status_update";
  payload: DockStatusUpdatePayload;
}

// LOAD COMPLETED MESSAGE
export interface LoadCompletedPayload {
    dock_bay_id: number;
    completed_at: string;
}
export interface LoadCompletedMessage {
    type: "load_completed";
    payload: LoadCompletedPayload;
}

// SENSOR UPDATED MESSAGE
export interface SensorUpdatePayload {
    dock_bay_id: string;
    sensor_id: string;
    sensor_type: string;
    sensor_state?: boolean | null;
    new_fsm_state: string;
    action: string;
    timestamp: string;
    loadingStarted_at: string | null;
}
export interface SensorUpdateMessage {
    type: "sensor_updated";
    payload: SensorUpdatePayload;
}

// EXCEPTION MESSAGE
export interface ExceptionPayload {
    payload: ExceptionDetails;    
    dock_bay_id: string;
    old_fsm_state: string;
    new_fsm_state: string;
    timestamp: string;
}
export interface ExceptionMessage {
    type: "exception";
    payload: ExceptionPayload;
}

//ADD MORE MESSAGE TYPES AS NEEDED

// UNION OF ALL POSSIBLE MESSAGES
export type WebSocketMessage =
  | { type: "dock_status_update"; payload: DockStatusUpdatePayload }
  | { type: "load_completed"; payload: LoadCompletedPayload }
  | { type: "sensor_updated"; payload: SensorUpdatePayload }
  | { type: "exception"; payload: ExceptionMessage };