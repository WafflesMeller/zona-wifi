import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  try {

    // -----------------------------
    // CORS
    // -----------------------------
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // -----------------------------
    // RECIBIR DATOS
    // -----------------------------
    const body = req.body || {};
    const query = req.query || {};

    const TituloNotificacion = body.TituloNotificacion || query.TituloNotificacion;
    const TextoNotificacion = body.TextoNotificacion || query.TextoNotificacion;

    if (!TituloNotificacion || !TextoNotificacion) {
      return res.status(400).json({ error: "Faltan parámetros" });
    }

    // -----------------------------
    // EXTRAER MONTO Y REFERENCIA
    // -----------------------------
    const parseMonto = (str) => {
      if (!str) return 0;
      const limpio = str.replace(/[^\d,]/g, '');
      return parseFloat(limpio.replace(',', '.')) || 0;
    };

    // 🔥 NUEVA FUNCIÓN: obtener últimos 4 dígitos
    const ultimos4 = (ref) => {
      if (!ref) return null;
      const soloNumeros = ref.toString().replace(/\D/g, '');
      return soloNumeros.slice(-4);
    };

    let referencia = null;
    let monto = 0;
    let banco = "DESCONOCIDO";

    const titulo = TituloNotificacion.trim();

    // Pago móvil BDV
    if (titulo === "PagomóvilBDV recibido") {
      banco = "BDV";

      const match = TextoNotificacion.match(/por Bs\. ?([\d\.,]+).*operaci[oó]n (\d+)/i);
      if (match) {
        monto = parseMonto(match[1]);
        referencia = match[2];
      }
    }

    // Transferencia otros bancos
    else if (titulo === "Transferencia de otros bancos recibida") {
      banco = "OTROS";

      const match = TextoNotificacion.match(/por Bs\. ?([\d\.,]+).*operación (\d+)/i);
      if (match) {
        monto = parseMonto(match[1]);
        referencia = match[2];
      }
    }

    // Transferencia BDV
    else if (titulo === "Transferencia BDV recibida") {
      banco = "BDV";

      const match = TextoNotificacion.match(/por Bs\. ?([\d\.,]+).*operación (\d+)/i);
      if (match) {
        monto = parseMonto(match[1]);
        referencia = match[2];
      }
    }

    // Si no encontró referencia válida
    if (!referencia) {
      referencia = `ERR-${Date.now()}`;
      monto = 0;
      banco = "DESCONOCIDO";
    }

    // 🔥 AQUÍ SE RECORTA A LOS ÚLTIMOS 4 DÍGITOS
    referencia = ultimos4(referencia);

    // -----------------------------
    // INSERTAR EN transacciones_inju
    // -----------------------------
    const { error } = await supabase
      .from('transacciones_inju')
      .insert([
        {
          referencia,
          monto: Number(monto.toFixed(2)),
          banco_origen: banco,
          estado: 'pendiente'
        }
      ]);

    if (error) {

      if (error.code === '23505') {
        return res.status(409).json({
          success: false,
          mensaje: "Referencia duplicada"
        });
      }

      console.error("Error Supabase:", error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    return res.status(200).json({
      success: true,
      referencia,
      monto,
      banco
    });

  } catch (err) {
    console.error("Error crítico:", err);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
}
