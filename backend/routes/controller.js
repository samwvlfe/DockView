//Controller Actions
import { nextDockState } from "../services/stateMachine.js";

module.exports = async function (fastify, opts) {
    // any button pressed
    fastify.post("/controller/action", async (request, reply) => {
        try{
            const { dockId, sensorId, action } = request.body;
            if (!dockId || !sensorId || !action) { //verify all data is here
                return reply.code(400).send({ error: "Missing required fields" });
            }

            const NOW = new Date().toISOString();

            // Get add data needed for state machine
            const { data: dock, error } = await fastify.supabase
                .from("dock_bays")
                .select("fsm_state, last_valid_fsm_state")
                .eq("id", dockId)
                .single();
            if (error) {
                return reply.code(500).send({ error: "Database Error" });
            }
            if (!dock) {
                reply.code(404).send({ error: "Dock not found" });
            }

            const { data: conditions, err } = await fastify.supabase
                .from("sensors")
                .select("sensor_type, sensor_state")
                .eq("dock_bay_id", dockId)
            if (err) {
                return reply.code(500).send({ err: "Database Error" });
            }
            if (!dock) {
                reply.code(404).send({ err: "Sensors not found" });
            }

            const nextState = nextDockState(dock.fsm_state, dock.last_valid_fsm_state, conditions, action);

            const { data: insertedRow, error: insertError } = await fastify.supabase
                .from("test_table")
                .insert({ next_state: nextState })
                .select("*")
                .single();

            if (insertError) {
                request.log.error({ insertError }, "Failed to insert test_table row");
                return reply.code(500).send({ error: "Failed to insert row" });
            }

            return reply.send({ insertedRow });



        } catch (err) {
            console.error("SERVER ERROR:", err);
            reply.code(500).send({ error: "Error with state controller" });
        }
    });

}   