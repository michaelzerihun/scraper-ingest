import { Hono } from "hono";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { serve } from "@hono/node-server";

dotenv.config();

const app = new Hono();
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

app.get("/api/chapters", async (c) => {
  const { data, error } = await supabase
    .from("chapters")
    .select("id, chapter_number, title")
    .order("chapter_number", { ascending: true });

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

app.get("/api/chapters/:id", async (c) => {
  const id = c.req.param("id");
  const { data, error } = await supabase
    .from("chapters")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return c.json({ error: error.message }, 500);
  if (!data) return c.json({ error: "Chapter not found" }, 404);
  return c.json(data);
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Backend running on http://localhost:${info.port}`);
  }
);
export default app;
