//Controller Actions
const { nextDockState } = require("../lib/helpers/stateMachine");

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
            const nextState = nextDockState(dock.fsm_state, dock.last_valid_fsm_state, conditions, action);

            // Create debug info
            const debugInfo = {
                input: {
                    dockId,
                    sensorId,
                    action
                },
                dock: {
                    currentState: dock.fsm_state,
                    previousState: dock.last_valid_fsm_state
                },
                conditions: conditions,
                sensType: Object.fromEntries(
                    (Array.isArray(conditions) ? conditions : [conditions])
                    .map(s => [s.sensor_type, !!s.sensor_state])
                ),
                result: {
                    nextState: nextState,
                    nextStateType: typeof nextState,
                    isUndefined: nextState === undefined
                }
            };

            // Check if nextState is valid
            if (!nextState || nextState === undefined) {
                return reply.code(400).send({ 
                    error: "State machine returned invalid state",
                    debug: debugInfo
                });
            }

            // insert new state into test table
            const { data: insertedRow, error: insertError } = await fastify.supabase
                .from("test_table")
                .insert({ next_state: nextState })
                .select("*")
                .single();

            if (insertError) {
                return reply.code(500).send({ 
                    error: "Failed to insert row",
                    details: insertError.message,
                    debug: debugInfo
                });
            }

            return reply.send({ 
                success: true,
                insertedRow,
                debug: debugInfo 
            });

        } catch (err) {
            return reply.code(500).send({ 
                error: "Error with state controller",
                message: err.message,
                stack: err.stack 
            });
        }
    });

}   