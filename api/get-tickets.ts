import { createClient } from "@supabase/supabase-js";

export default async function handler(req: any, res: any) {

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { key } = req.query;

  if (key !== process.env.MIKROTIK_SECRET) {
    return res.status(401).send("unauthorized");
  }

  const { data, error } = await supabase
    .from("tickets_activos_mikrotik")
    .select("codigo_login, plan_mikrotik");

  if (error) return res.status(500).send("error");

  if (!data || data.length === 0) {
    return res.status(200).send("none");
  }

  const formatted = data
    .map(row => `${row.codigo_login},${row.plan_mikrotik}`)
    .join(";");

  res.setHeader("Content-Type", "text/plain");
  return res.status(200).send(formatted);
}
