// import { WebSocketMessage } from "@/types/websocketTypes";
// const ws = new WebSocket("wss://dockview.onrender.com/ws");


// ws.onmessage = (event) => {
//   const msg = JSON.parse(event.data) as WebSocketMessage;

//   switch (msg.type) {
//     case "dock_status_update":
//       onDockStatusUpdate(msg.payload);
//       break;

//     // case "load_completed":
//     //   onLoadCompleted(msg.payload);
//     //   break;

//     // case "sensor_event":
//     //   onSensorEvent(msg.payload);
//     //   break;

//     default:
//       console.warn("Unknown WS message:", msg);
//   }
// };
