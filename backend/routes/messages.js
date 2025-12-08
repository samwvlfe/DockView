module.exports = async function (fastify, opts) {
  fastify.get("/messages", async () => {
    const { data, error } = await fastify.supabase
      .from("messages")
      .select("*");

    if (error) return { error: "Failed to fetch messages" };
    return { messages: data };
  });
};
