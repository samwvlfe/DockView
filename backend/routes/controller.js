//Controller Actions
const { stateMachine } = require("../lib/helpers/controllerHelpers");

module.exports = async function (fastify, opts) {
    // any button pressed
    fastify.post("/controller/action", async (request, reply) => {
        try{
            const { dockId, sensorId, action } = request.body;
            if (!dockId || !sensorId || !action) {
                return reply.code(400).send({ error: "Missing required fields" });
            }

            const NOW = new Date().toISOString();

            // Get add data needed for state machine
            const { data: dock, error: dockError } = await fastify.supabase
                .from("dock_bays")
                .select("fsm_state, last_valid_fsm_state")
                .eq("id", dockId)
                .single();
            
            if (dockError) {
                return reply.code(500).send({ error: "Database Error", dockError });
            }
            if (!dock) {
                return reply.code(404).send({ error: "Dock not found" });
            }

            // get sensor conditions
            const { data: conditions, error: sensorsError } = await fastify.supabase
                .from("sensors")
                .select("sensor_type, sensor_state")
                .eq("dock_bay_id", dockId)
            
            if (sensorsError) {
                return reply.code(500).send({ error: "Database Error (sensors)", sensorsError });
            }
            if (!conditions || conditions.length === 0) {
                return reply.code(404).send({ error: "Sensors not found" });
            }

            // call stateMachine function
            const nextState = stateMachine(dock.fsm_state, dock.last_valid_fsm_state, conditions, action);

            // insert new state into test table
            const { data: insertedRow, error: insertError } = await fastify.supabase
                .from("test_table")
                .insert({ next_state: nextState })
                .select("*")
                .single();
            if (insertError) {
                console.error("Insert error:", insertError);
                return reply.code(500).send({ error: "Failed to insert row" });
            }

            // insert data into cycle or create one
            const { data: insertCycle, error: cycleError} = await fastify.supabase
                .from("sensor_events")
                .insert({
                    dock_bay_id: dockId,
                    terminal_state: nextState,
                    terminal_reason: action,
                    state_started_at: NOW,
                    meta: conditions,
                    created_at: nextState === "Cycle_Complete" ? NOW : null
                })
            if (cycleError) {
                console.error("Insert error: ", cycleError);
                return reply.code(500).send({ error: "Failed to inser cycle data"});
            }
                //Start a cycle! (if curr = bay_available and starting cycle)
                //   - dock_bay_id, state_started_at = NOW, terminal_STATE, reason(create export function map), 
                
                // add new state to dockbay 'fsm_state'
                // add previous to 'last_valid_fsm_state'
                // insert the three sensor codes to 'conditions'
                // add active cycle ID to dock_bay and Sensor_events
                // fsm_state_entered = NOW()
                
            
                
                
            return reply.send({ insertedRow, debug: debugInfo });

        } catch (err) {
            return reply.code(500).send({ error: "Error with state controller" });
        }
    });

}   