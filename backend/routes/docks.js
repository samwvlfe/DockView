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
                    created_at,
                    turnover_time
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

    // GET Dock Bay loads completed today
    fastify.get("/stats/loadsCompleted", async () => {
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

    // Call get_turnover_stats() stored procedure
    fastify.get("/stats/turnover/:days", async (request, reply) => {
    try {
        const days = request.params.days;
        const daysNum = Number(days);

        if (Number.isNaN(daysNum)) {
            reply.code(400);
            return { error: "Invalid days parameter" };
        }

        const { data, error } = await fastify.supabase
            .rpc('get_turnover_stats', { days_ago: daysNum });

        if (error) {
            console.error("Supabase error:", error);
            reply.code(500);
            return { error: "Failed to fetch turnover avg" };
        }

        if (!data || data.length === 0) {
            return {
                avg_turnover_time: null,
                turnover_count: 0
            };
        }

            return data[0];
        } catch (err) {
            console.error("Route error:", err);
            reply.code(500);
            return { error: "Internal server error" };
        }
    });
}