module.exports = async function (fastify, opts) {

    // GET all Dock Bays 
    fastify.get("/api/docks", async () => {
        const { data, error } = await fastify.supabase
            .from("dock_bays")
            .select("id, friendly_id, name, status, status_changed_at");

        if (error) return { error: "Failed to fetch docks" };
        return data;
    });

    // GET specific Dock Bay by ID
    fastify.get("/api/docks/:dockId", async (request) => {
        const { dockId } = request.params;

        const { data, error } = await fastify.supabase
            .from("dock_bays")
            .select("*")
            .eq("id", dockId)
            .single();

        if (error) return { error: "Dock not found" };
        return data;
    });

    // GET dock's sensor by dock ID
    fastify.get("/api/docks/:dockId/sensors", async (request) => {
        const { dockId } = request.params;

        const { data, error } = await fastify.supabase
            .from("sensors")
            .select("*")
            .eq("dock_bay_id", dockId)
            .single();

        if (error) return { error: "Sensor not found for this Dock Bay" };
        return data;
    });
};
