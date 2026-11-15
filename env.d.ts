// Cloudflare bindings exposed through getCloudflareContext().env.
// D1Database comes from @cloudflare/workers-types (see tsconfig "types").
interface CloudflareEnv {
  DB: D1Database;
}
