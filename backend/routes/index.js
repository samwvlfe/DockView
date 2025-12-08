module.exports = async function (fastify, opts) {
  fastify.get("/", async () => {
    return { message: "Backend is running on Render!" };
  });
};
