module.exports = async function (fastify, opts) {

    // GET all Dock Bays 
    fastify.get("/api/docks", async () => {
        const { data, error } = await fastify.supabase
            .from("dock_bays")
            .select("id, friendly_id, name, status, status_changed_at");

        if (error) return { error: "Failed to fetch docks" };
        return data;
    });

    // GET all info for info card
    fastify.get("/api/dock/:id", async (request, reply) => {
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

    //Average turnover from user specified time interval
    fastify.get("/api/stats/turnover/:days", async (request, reply) => {
        const { days } = request.params;
        const daysNum = Number(days);

        if (isNaN(daysNum)) {
            reply.code(400);
            return { error: "Invalid days parameter" };
        }

        // Date X days ago
        const daysDate = new Date();
        daysDate.setDate(daysDate.getDate() - daysNum);

        const { data, error } = await fastify.supabase
            .from("dock_bay_history")
            .select("avg_turnover_time:turnover_time.avg()")
            .not("turnover_time", "is", null)
            .eq("new_status", "idle")
            .gte("created_at", daysDate.toISOString());

        if (error) {
            reply.code(500);
            return { error: "Failed to fetch dock history" };
        }

        return data?.[0] ?? { avg_turnover_time: null };
    });

}