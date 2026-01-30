const broadcaster = require("../lib/broadcaster");

module.exports = async function (fastify, opts) {

    // Get all sensors 
    fastify.get("/sensors/all", async (request, reply) => {
        const { data, error } = await fastify.supabase
        .from("sensors")
        .select("*")
        if (error) {
            return reply.code(500).send({ error: "Failed to fetch sensors" });
        }
        return reply.send(data);
    });

    // Get all 3 sensors for dock by id
    fastify.get("/sensors/:id", async (request, reply) => {
        const { id } = request.params;

        const { data, error } = await fastify.supabase
        .from("sensors")
        .select("*")
        .eq("dock_bay_id", id);

        if (error) {
            return reply.code(500).send({ error: "Failed to fetch sensors" });
        }

        return reply.send(data);
    });

};