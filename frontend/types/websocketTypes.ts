// DOCK STATUS UPDATE MESSAGE
export type DockStatusUpdatePayload = {
  dock_bay_id: string;
  old_status: string;
  new_status: string;
  event_type: string;
  status_changed_at: string;
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

// DOCK TURNOVER MESSAGE
export interface DockTurnoverPayload {
    dock_bay_id: string;
    duration: string;
}
export interface DockTurnoverMessage {
    type: "dock_turnover";
    payload: DockTurnoverPayload;
}

// SENSOR UPDATED MESSAGE
export interface SensorUpdatePayload {
    dock_bay_id: string;
    sensor_id: string;
    sensor_type: string;
    sensor_state?: boolean | null;
    action: string;
    timestamp: string;
}
export interface SensorUpdateMessage {
    type: "sensor_updated";
    payload: SensorUpdatePayload;
}

//ADD MORE MESSAGE TYPES AS NEEDED

// UNION OF ALL POSSIBLE MESSAGES
export type WebSocketMessage =
  | { type: "dock_status_update"; payload: DockStatusUpdatePayload }
  | { type: "load_completed"; payload: LoadCompletedPayload }
  | { type: "dock_turnover"; payload: DockTurnoverPayload }
  | { type: "sensor_updated"; payload: SensorUpdatePayload };