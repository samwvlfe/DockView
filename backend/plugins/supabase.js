const fp = require("fastify-plugin");
const { createClient } = require("@supabase/supabase-js");

module.exports = fp(async (fastify, opts) => {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );

  fastify.decorate("supabase", supabase);
});
