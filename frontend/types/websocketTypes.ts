// DEFINITIONS OF WEBSOCKET MESSAGE TYPES

export type DockStatusUpdateMessage = {
  type: "dock_status_update";
  payload: {
    dock_bay_id: string;
    old_status: string;
    new_status: string;
    event_type: string;
    status_changed_at: string;
  };
};


// UNION OF ALL POSSIBLE MESSAGES
export type WebSocketMessage =
  | DockStatusUpdateMessage;
