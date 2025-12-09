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

//ADD MORE MESSAGE TYPES AS NEEDED

// UNION OF ALL POSSIBLE MESSAGES
export type WebSocketMessage =
  | DockStatusUpdateMessage;
