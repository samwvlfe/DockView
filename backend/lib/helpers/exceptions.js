// exceptionHandler.js

function getExceptionPayload(lastState, sensor) {
  // Door opened before restraint
  if (lastState === "Truck_Present"){
    if(sensor.sensor_type === "DOOR") {
        return {
            exception_code: "Invalid_Open",
            message: "Tried To Open Door Before Restraint In Place",
            sensor: sensor,  // Pass the entire sensor object
            fix: "Close Door, Restrain Truck",
        };
    }
    if(sensor.sensor_type === "LEVELER") {
        return {
            exception_code: "Invalid_Open",
            message: "Tried To Open Leveler Before Restraint In Place",
            sensor: sensor,  // Pass the entire sensor object
            fix: "Close Leveler, Restrain Truck",
        };
    }
  }
  else if(lastState === "Restrained_DoorClosed"){
    if(sensor.sensor_type === "LEVELER"){
        return {
            exception_code: "Invalid_Open",
            message: "Tried To Open Leveler Before Door Open",
            sensor: sensor,  // Pass the entire sensor object
            fix: "Close Leveler, Open Door",
        };
    }
  } 
  
  // No exception detected
  return null;
}

module.exports = { getExceptionPayload };
