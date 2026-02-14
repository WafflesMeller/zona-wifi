import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabaseClient";
import {
  Users,
  DollarSign,
  Ticket,
  Clock,
  ShieldAlert,
} from "lucide-react";
import AdminNavbar from "../../components/AdminNavbar";

interface Venta {
  id: string;
  cliente_nombre: string;
  cliente_telefono: string; // Faltaba en la interfaz anterior
  plan_seleccionado: string;
  precio_pagado: number;
  codigo_login: string;
  duracion_minutos: number;
  created_at: string;
}

export default function AdminDashboard() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);
  const [bcvRate, setBcvRate] = useState<number>(0);


  // ✨ NUEVO: Estado del reloj que se actualiza cada segundo
  const [currentTime, setCurrentTime] = useState(Date.now());

    useEffect(() => {
      const fetchBcv = async () => {
        try {
          const response = await fetch("/api/bcv");
          const contentType = response.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            throw new Error("No JSON");
          }
          const data = await response.json();
          if (data.ok && data.price) {
            setBcvRate(data.price);
          }
        } catch (error) {
          console.error("Error obteniendo BCV, usando fallback", error);
          setBcvRate(38.5);
        } finally {
          setTimeout(() => setLoading(false), 800);
        }
      };
  
      fetchBcv();
    }, []);

  useEffect(() => {
    // 1. Carga inicial de datos
    fetchDashboardData();

    // 2. 🕒 Iniciar el reloj en tiempo real para el contador de la tabla
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000); // Actualiza cada 1 segundo

    // 3. 📡 Conectar a Supabase Realtime (WebSockets)
    const subscription = supabase
      .channel("ventas_channel") // Nombre del canal (puede ser cualquiera)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "ventas_wifi" },
        (payload) => {
          console.log("🔥 ¡Nueva venta en vivo!", payload.new);
          // Agregamos la nueva venta al INICIO del arreglo actual
          setVentas((prev) => [payload.new as Venta, ...prev]);
        },
      )
      .subscribe();

    // Limpieza al desmontar el componente
    return () => {
      clearInterval(timer);
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data, error } = await supabase
        .from("ventas_wifi")
        .select("*")
        .gte(
          "created_at",
          new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setVentas(data as Venta[]);
    } catch (err) {
      console.error("Error cargando el dashboard:", err);
    } finally {
      setLoading(false);
    }
  };


  // ==========================================
  // 🧠 LÓGICA DE CÁLCULO DE MÉTRICAS (Basada en currentTime)
  // Como currentTime cambia cada segundo, ¡toda esta data se recalcula en vivo!
  // ==========================================

  const todayStart = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();

  // 1. Ventas de Hoy
  const ventasHoy = ventas.filter((v) => v.created_at >= todayStart);
  const totalDolares = ventasHoy.reduce(
    (acc, curr) => acc + Number(curr.precio_pagado),
    0,
  );
  const totalBolivares = totalDolares * bcvRate;

  // 2. Usuarios Activos Reales
  const usuariosActivos = ventas.filter((v) => {
    const expireTime =
      new Date(v.created_at).getTime() + v.duracion_minutos * 60 * 1000;
    return expireTime > currentTime;
  });

  // 3. Función Formateadora de Tiempo Restante (Ahora incluye Segundos)
  const getTiempoRestante = (createdAt: string, duracion: number) => {
    const expireTime = new Date(createdAt).getTime() + duracion * 60 * 1000;
    const diff = expireTime - currentTime;

    if (diff <= 0) return "Finalizado";

    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000); // Segundos

    // Formatear para que se vea elegante (Ej: 01h 05m 09s)
    const pad = (num: number) => num.toString().padStart(2, "0");

    if (h > 0) return `${pad(h)}h ${pad(m)}m ${pad(s)}s`;
    return `${pad(m)}m ${pad(s)}s`;
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans pt-20 pb-10">

        <AdminNavbar />
      {/* 1. TOP NAVBAR ADMINISTRATIVO */}

      {/* 2. CONTENIDO PRINCIPAL */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="text-2xl font-extrabold text-white">
            Resumen en Vivo
          </h2>
          <p className="text-gray-400 text-sm">
            Métricas actualizadas automáticamente
          </p>
        </motion.div>

        {/* 3. GRID DE TARJETAS (CARDS) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-[2rem] relative overflow-hidden group hover:border-blue-500/30 transition-colors"
          >
            <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity">
              <Users size={64} className="text-blue-400" />
            </div>
            <div className="relative z-10">
              <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>{" "}
                Activos Ahora
              </p>
              {/* Animación cuando el número cambia */}
              <AnimatePresence mode="popLayout">
                <motion.h3
                  key={usuariosActivos.length}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-5xl font-black text-white mt-2"
                >
                  {loading ? "-" : usuariosActivos.length}
                </motion.h3>
              </AnimatePresence>
              <p className="text-xs text-blue-400 mt-2 font-medium bg-blue-500/10 inline-block px-2 py-1 rounded-md">
                Equipos conectados
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-green-500/10 to-[#121212]/40 backdrop-blur-md border border-green-500/20 p-6 rounded-[2rem] relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-6 opacity-20">
              <DollarSign size={64} className="text-green-400" />
            </div>
            <div className="relative z-10">
              <p className="text-sm font-semibold text-green-400/80 uppercase tracking-widest flex items-center gap-2">
                Ventas de Hoy
              </p>
              <div className="flex items-end gap-3 mt-2">
                <AnimatePresence mode="popLayout">
                  <motion.h3
                    key={totalDolares}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-5xl font-black text-white"
                  >
                    ${loading ? "-" : totalDolares.toFixed(2)}
                  </motion.h3>
                </AnimatePresence>
              </div>
              <p className="text-sm text-gray-400 mt-2 font-medium">
                Aprox. Bs. {loading ? "-" : totalBolivares.toFixed(2)}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-[2rem] relative overflow-hidden group hover:border-purple-500/30 transition-colors"
          >
            <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity">
              <Ticket size={64} className="text-purple-400" />
            </div>
            <div className="relative z-10">
              <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                Tickets Hoy
              </p>
              <AnimatePresence mode="popLayout">
                <motion.h3
                  key={ventasHoy.length}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-5xl font-black text-white mt-2"
                >
                  {loading ? "-" : ventasHoy.length}
                </motion.h3>
              </AnimatePresence>
              <p className="text-xs text-purple-400 mt-2 font-medium bg-purple-500/10 inline-block px-2 py-1 rounded-md">
                Fichas generadas
              </p>
            </div>
          </motion.div>
        </div>

        {/* 4. TABLA DE USUARIOS (Conectados Recientemente) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-10"
        >
          <div className="bg-[#121212]/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 text-xs uppercase tracking-widest text-gray-400 font-semibold border-b border-white/10">
                    <th className="px-6 py-4">Cliente</th>
                    <th className="px-6 py-4">Plan</th>
                    <th className="px-6 py-4">Código</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4 text-right">Tiempo Restante</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-white/5">
                  <AnimatePresence>
                    {loading ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-10 text-center text-gray-500"
                        >
                          Cargando registros...
                        </td>
                      </tr>
                    ) : ventas.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-10 text-center text-gray-500 flex flex-col items-center"
                        >
                          <ShieldAlert size={32} className="mb-2 opacity-50" />
                          Aún no hay ventas en las últimas 24 horas.
                        </td>
                      </tr>
                    ) : (
                      ventas.map((venta) => {
                        const tiempoRestante = getTiempoRestante(
                          venta.created_at,
                          venta.duracion_minutos,
                        );
                        const isActivo = tiempoRestante !== "Finalizado";

                        return (
                          <motion.tr
                            layout // Permite que las filas se muevan suavemente si cambia el orden
                            initial={{
                              opacity: 0,
                              backgroundColor: "rgba(37,99,235,0.2)",
                            }}
                            animate={{
                              opacity: 1,
                              backgroundColor: "rgba(0,0,0,0)",
                            }}
                            transition={{ duration: 0.8 }}
                            key={venta.id}
                            className="hover:bg-white/5 transition-colors group"
                          >
                            <td className="px-6 py-4">
                              <p className="font-bold text-white">
                                {venta.cliente_nombre}
                              </p>
                              <p className="text-xs text-gray-500 font-mono">
                                {venta.cliente_telefono}
                              </p>
                            </td>
                            <td className="px-6 py-4 text-gray-300 font-medium">
                              {venta.plan_seleccionado}
                            </td>
                            <td className="px-6 py-4">
                              <span className="bg-white/10 px-3 py-1 rounded-md font-mono text-blue-300 font-bold tracking-wider border border-white/10 group-hover:border-blue-500/30 transition-colors">
                                {venta.codigo_login}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {isActivo ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20">
                                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>{" "}
                                  Activo
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-500/10 text-gray-400 border border-gray-500/20">
                                  Finalizado
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              {/* AQUÍ ESTÁ EL RELOJ EN VIVO DE LA TABLA */}
                              <div className="flex items-center justify-end gap-2 text-gray-300">
                                {isActivo && (
                                  <Clock size={14} className="text-blue-400" />
                                )}
                                <span
                                  className={`${isActivo ? "font-black text-white font-mono tabular-nums" : "text-gray-500"} w-[75px] inline-block text-right`}
                                >
                                  {tiempoRestante}
                                </span>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
