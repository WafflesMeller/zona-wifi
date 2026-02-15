import { createClient } from "@supabase/supabase-js";

function minutosToHHMMSS(minutos: number) {
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;

  return `${horas.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}:00`;
}

export default async function handler(req: any, res: any) {

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const key = req.headers["x-api-key"];

  if (key !== process.env.MIKROTIK_SECRET) {
    return res.status(401).send("unauthorized");
  }

  const { data, error } = await supabase
    .from("tickets_activos_mikrotik")
    .select("codigo_login, duracion_minutos");

  if (error) return res.status(500).send("error");

  if (!data || data.length === 0) {
    return res.status(200).send("none");
  }

  const formatted = data
    .map(row => {
      const tiempo = minutosToHHMMSS(row.duracion_minutos);
      return `${row.codigo_login},${tiempo}`;
    })
    .join(";");

  res.setHeader("Content-Type", "text/plain");
  return res.status(200).send(formatted);
}
