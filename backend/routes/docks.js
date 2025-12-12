module.exports = async function (fastify, opts) {

    // GET all Dock Bays 
    fastify.get("/api/docks", async () => {
        const { data, error } = await fastify.supabase
            .from("dock_bays")
            .select("id, friendly_id, name, status, status_changed_at");

        if (error) return { error: "Failed to fetch docks" };
        return data;
    });

    // GET all info for bay by UUID
    fastify.get("/api/dock/:id", async (request, reply) => {
        const { id } = request.params;

        const { data, error } = await fastify.supabase
            .from("dock_bays")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            reply.code(404);
            return {error: `Failed to fetch dock ${id}`}
        }
        return data;
    });

    // GET Dock Bay loads completed today
    fastify.get("/api/stats/loadsCompleted", async () => {
        const { data, error } = await fastify.supabase
            .from("dock_bay_history")
            .select("*")
            .eq("old_status", "occupied")
            .eq("new_status", "idle")
            //only get completed loads TODAY
            .gte("created_at", new Date(new Date().setHours(0,0,0,0)).toISOString());

        if (error) return { error: "Failed to fetch dock history" };
        return data;
    });

}