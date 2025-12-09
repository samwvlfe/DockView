module.exports = async function (fastify, opts) {

    // GET all Dock Bays 
    fastify.get("/api/docks", async () => {
        const { data, error } = await fastify.supabase
            .from("dock_bays")
            .select("id, friendly_id, name, status, status_changed_at");

        if (error) return { error: "Failed to fetch docks" };
        return data;
    });

    // GET Dock Bay History
    fastify.get("/api/docks/history", async (request) => {
        const { data, error } = await fastify.supabase
            .from("dock_bay_history")
            .select("dock_bay_id, old_status, new_status, changed_at");

        if (error) return { error: "Failed to fetch dock history" };
        return data;
    });
    
}