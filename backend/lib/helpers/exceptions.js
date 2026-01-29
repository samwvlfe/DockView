// takes in the last valid state the sensor data
// compiles exception payload: exception_code, message, sensor, dock
// broadcasts to page.tsx to build notification -> notification.tsx

//const broadcaster = require("../lib/broadcaster");

function getExceptionPayload(lastState, sensor){
    console.log("SENSOR ON EXCEPTION: ", sensor);
    return "(((temp payload)))"
}

module.exports = { getExceptionPayload };