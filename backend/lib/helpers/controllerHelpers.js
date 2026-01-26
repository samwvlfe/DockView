function stateMachine(currentState, previousState, conditions, ControllerAction) {
    // normalize to an array so your logic is consistent
    const sensors = Array.isArray(conditions) ? conditions : conditions ? [conditions] : [];
    const sensType = Object.fromEntries(sensors.map(s => [s.sensor_type, !!s.sensor_state]));

    const newCycle = previousState == null || previousState === "Cycle_Complete";

    // Define reversible actions - these can happen without following strict sequence
    const reversibleTransitions = {
        // Restraint can be engaged/disengaged from Bay_Available
        "Bay_Available": {
            "Vehicle Restraint Engaged": {
                nextState: "Restrained_DoorClosed",
                requires: { RESTRAINT: false, DOOR: false, LEVELER: false }
            },
            "Vehicle Restraint Disengaged": {
                nextState: "Bay_Available", // stays same
                requires: { RESTRAINT: true, DOOR: false, LEVELER: false }
            }
        },
        "Restrained_DoorClosed": {
            "Vehicle Restraint Disengaged": {
                nextState: "Bay_Available",
                requires: { RESTRAINT: true, DOOR: false, LEVELER: false }
            },
            "Door Opened": {
                nextState: "DoorOpen_LevelerClosed",
                requires: { RESTRAINT: true, DOOR: false, LEVELER: false }
            }
        },
        "DoorOpen_LevelerClosed": {
            "Door Closed": {
                nextState: "Restrained_DoorClosed",
                requires: { RESTRAINT: true, DOOR: true, LEVELER: false }
            },
            "Dock Leveler Deployed": {
                nextState: "LevelerEngaged_ReadyToLoad",
                requires: { RESTRAINT: true, DOOR: true, LEVELER: false }
            }
        },
        "LevelerEngaged_ReadyToLoad": {
            "Dock Leveler Reset": {
                nextState: "LoadingComplete_DoorOpen",
                requires: { RESTRAINT: true, DOOR: true, LEVELER: true }
            }
        },
        "LoadingComplete_DoorOpen": {
            "Dock Leveler Deployed": {
                nextState: "LevelerEngaged_ReadyToLoad",
                requires: { RESTRAINT: true, DOOR: true, LEVELER: false }
            },
            "Door Closed": {
                nextState: "DoorClosed_Restrained",
                requires: { RESTRAINT: true, DOOR: true, LEVELER: false }
            }
        },
        "DoorClosed_Restrained": {
            "Door Opened": {
                nextState: "LoadingComplete_DoorOpen",
                requires: { RESTRAINT: true, DOOR: false, LEVELER: false }
            },
            "Vehicle Restraint Disengaged": {
                nextState: "Cycle_Complete",
                requires: { RESTRAINT: true, DOOR: false, LEVELER: false }
            }
        }
    };

    // Check if this state has valid transitions
    const stateTransitions = reversibleTransitions[currentState];
    if (!stateTransitions) {
        return "Exception";
    }

    // Check if this action is valid for current state
    const transition = stateTransitions[ControllerAction];
    if (!transition) {
        return "Exception";
    }

    // Verify sensor requirements match
    const requirementsMet = Object.entries(transition.requires).every(
        ([sensorType, expectedState]) => sensType[sensorType] === expectedState
    );

    if (!requirementsMet) {
        return "Exception";
    }

    return transition.nextState;
}

module.exports = { stateMachine };