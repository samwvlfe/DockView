function stateMachine(currentState, previousState, conditions, ControllerAction) {
    // normalize to an array so your logic is consistent
    const sensors = Array.isArray(conditions) ? conditions : conditions ? [conditions] : [];
    const sensType = Object.fromEntries(sensors.map(s => [s.sensor_type, !!s.sensor_state]));

    const newCycle = previousState == null || previousState === "Cycle_Complete";

    // NOTE: logic comes from truth table in Google Docs https://docs.google.com/document/d/1OW7ICOHWWbTl6MIPaEOI94iCg4rlvvch8xvbQnZDOVo/edit?tab=t.0

    // Incoming conditions are of the previous state

    // >>> (1 0 0)
    if (currentState === "Bay_Available"
            && newCycle
            && sensType.RESTRAINT === false
            && sensType.DOOR === false 
            && sensType.LEVELER === false
            && ControllerAction === "Vehicle Restraint Engaged"
        ) {
            return "Restrained_DoorClosed";
        }

    // (1 1 0)
    else if (currentState === "Restrained_DoorClosed"
            && previousState === "Bay_Available"
            && sensType.RESTRAINT === true
            && sensType.DOOR === false
            && sensType.LEVELER === false
            && ControllerAction === "Door Opened"
        ) {
            return "DoorOpen_LevelerClosed";
        }

    // (1 1 1)
    else if (currentState === "DoorOpen_LevelerClosed"
            && previousState === "Restrained_DoorClosed"
            && sensType.RESTRAINT === true
            && sensType.DOOR === true 
            && sensType.LEVELER === false
            && ControllerAction === "Dock Leveler Deployed"
        ) {
            return "LevelerEngaged_ReadyToLoad";
        }

    // (1 1 0)
    else if (currentState === "LevelerEngaged_ReadyToLoad"
            && previousState === "DoorOpen_LevelerClosed"
            && sensType.RESTRAINT === true
            && sensType.DOOR === true 
            && sensType.LEVELER === true
            && ControllerAction === "Dock Leveler Reset"
        ) {
            return "LoadingComplete_DoorOpen";
        }

    // (1 0 0)
    else if (currentState === "LoadingComplete_DoorOpen"
            && previousState === "LevelerEngaged_ReadyToLoad"
            && sensType.RESTRAINT === true
            && sensType.DOOR === true
            && sensType.LEVELER === false
            && ControllerAction === "Door Closed"
        ) {
            return "DoorClosed_Restrained";
        }

    // (0 0 0)
    else if (currentState === "DoorClosed_Restrained"
            && previousState === "LoadingComplete_DoorOpen"
            && sensType.RESTRAINT === true
            && sensType.DOOR === false
            && sensType.LEVELER === false
            && ControllerAction === "Vehicle Restraint Disengaged"
        ) {
            return "Cycle_Complete";
        }
    else{
        return "Exception"
    }
}

module.exports = { stateMachine };