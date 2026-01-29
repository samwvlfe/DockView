// exceptionHandler.js

function getExceptionPayload(lastState, sensor) {
  console.log(sensor);
  // Door opened before restraint
  if (lastState === "Truck_Present" && sensor.type === "DOOR") {
    return {
      exception_code: "Invalid_Open",
      message: "Tried To Open Door Before Restraint In Place",
      sensor: sensor,  // Pass the entire sensor object
      fix: "Close Door",
    };
  }
  
  // Leveler opened before restraint
  if (lastState === "Truck_Present" && sensor.type === "LEVELER") {
    return {
      exception_code: "Invalid_Open",
      message: "Tried To Open Leveler Before Restraint In Place",
      sensor: sensor,  // Pass the entire sensor object
      fix: "Close Leveler",
    };
  }
  
  // No exception detected
  return null;
}

module.exports = { getExceptionPayload };
