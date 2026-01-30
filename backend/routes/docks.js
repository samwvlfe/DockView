module.exports = async function (fastify, opts) {

    // GET all Dock Bays 
    fastify.get("/docks", async () => {
        const { data, error } = await fastify.supabase
            .from("dock_bays")
            .select("*")
            .order("name", { ascending: true });
        if (error) return { error: "Failed to fetch docks" };
        return data;
    });

    // GET all info for info card
    fastify.get("/dock/:id", async (request, reply) => {
        const { id } = request.params;
        //get date 7 days ago
        const sevenDays = new Date();
        sevenDays.setDate(sevenDays.getDate() - 7);

        const { data, error } = await fastify.supabase
            .from("dock_bays")
            //select all from dock_bays AND dock_bay_history
            .select(
                `*,
                dock_bay_history (
                    id,
                    old_status,
                    new_status,
                    reason,
                    created_at
                )`)
            .eq("id", id)
            .gte("dock_bay_history.created_at", sevenDays.toISOString())
            .order("created_at", {
                foreignTable: "dock_bay_history",
                ascending: false
            })
            .single();

        if (error) {
            reply.code(404);
            return {error: `Failed to fetch dock ${id}`}
        }

        return data;
    });

    // get loads completed today - cycles that are closed
    fastify.get("/stats/loadsCompleted", async () => {
        const start = new Date();
        start.setHours(0, 0, 0, 0);

        const end = new Date(start);
        end.setDate(end.getDate() + 1);

        const { data, error } = await fastify.supabase
            .from("dock_cycles")
            .select("ended_at")
            .not("ended_at", "is", null)
            .gte("ended_at", start.toISOString())
            .lt("ended_at", end.toISOString());

        if (error) return { error: "Failed to fetch dock history" };
        return data;
    });

}