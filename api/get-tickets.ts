import { createClient } from "@supabase/supabase-js";

export default async function handler(req: any, res: any) {

  try {

    if (!process.env.VITE_SUPABASE_URL) {
      throw new Error("SUPABASE_URL missing");
    }

    if (!process.env.VITE_SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("SERVICE_ROLE_KEY missing");
    }

    if (!process.env.VITE_MIKROTIK_SECRET) {
      throw new Error("MIKROTIK_SECRET missing");
    }

    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
    );

    const key = req.headers["x-api-key"];

    if (key !== process.env.VITE_MIKROTIK_SECRET) {
      return res.status(401).send("unauthorized");
    }

    // 🔥 Solo tickets de las últimas 24 horas
    const { data, error } = await supabase
      .from("ventas_wifi")
      .select("codigo_login, duracion_minutos, created_at")
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (error) {
      console.error(error);
      return res.status(500).send("db_error");
    }

    if (!data || data.length === 0) {
      return res.status(200).send("none");
    }

    const formatted = data
      .map(row => `${row.codigo_login},${row.duracion_minutos}`)
      .join(";");

    res.setHeader("Content-Type", "text/plain");
    return res.status(200).send(formatted);

  } catch (err: any) {
    console.error("FATAL:", err.message);
    return res.status(500).send(err.message);
  }
}
