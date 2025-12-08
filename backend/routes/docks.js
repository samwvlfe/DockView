module.exports = async function (fastify, opts) {

    // GET all Dock Bays
    fastify.get("/api/docks", async () => {
        const { data, error } = await fastify.supabase
            .from("dock_bays")
            .select("*");

        if (error) return { error: "Failed to fetch docks" };
        return data;
    });

    // GET Dock Bay by ID
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

};
