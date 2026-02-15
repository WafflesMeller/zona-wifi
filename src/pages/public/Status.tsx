import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  Wifi,
  Copy,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

export default function Status() {
  const navigate = useNavigate();

  // Estados del temporizador y ticket
  const [ticket, setTicket] = useState<{
    codigo: string;
    duracionMinutos: number;
    startTime: number;
  } | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isExpired, setIsExpired] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [percentage, setPercentage] = useState(100);

  const [searchParams] = useSearchParams();

  useEffect(() => {
    const fetchStatus = async () => {
      // 1️⃣ Obtener código desde URL o localStorage
      const codeFromUrl = searchParams.get("code");
      const savedCode = localStorage.getItem("wifi_last_code");

      const finalCode = codeFromUrl || savedCode;

      if (!finalCode) {
        navigate("/");
        return;
      }

      // Guardarlo para futuras recargas
      localStorage.setItem("wifi_last_code", finalCode);

      // 2️⃣ Consultar Supabase
      const { data, error } = await supabase
        .from("ventas_wifi")
        .select("created_at, duracion_minutos")
        .eq("codigo_login", finalCode)
        .single();

      if (error || !data) {
        navigate("/");
        return;
      }

      // 3️⃣ Calcular tiempo real basado en BD
      const endTime =
        new Date(data.created_at).getTime() + data.duracion_minutos * 60 * 1000;

      setTicket({
        codigo: finalCode,
        duracionMinutos: data.duracion_minutos,
        startTime: new Date(data.created_at).getTime(),
      });


      const updateTimer = () => {
        const now = Date.now();
        const remainingSeconds = Math.floor((endTime - now) / 1000);

        if (remainingSeconds <= 0) {
          setTimeLeft(0);
          setPercentage(0);
          setIsExpired(true);
          return;
        }

        setTimeLeft(remainingSeconds);

        const totalSeconds = data.duracion_minutos * 60;
        setPercentage((remainingSeconds / totalSeconds) * 100);
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);

      return () => clearInterval(interval);
    };

    fetchStatus();
  }, [navigate, searchParams]);

  // Función para formatear HH:MM:SS
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    if (h > 0) {
      return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Copiar código al portapapeles
const handleCopyCode = async () => {
  if (!ticket) return;

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(ticket.codigo);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = ticket.codigo;
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand("copy");
      textArea.remove();
    }

    setIsCopied(true);

    // 🔥 Redirigir después de copiar
    setTimeout(() => {
      window.location.href = "http://10.0.0.1/login";
    }, 800);

  } catch (err) {
    console.error("Error al copiar", err);
  }
};


  if (!ticket) return null;

 

  return (
    <div className="min-h-screen w-full bg-gray-950 font-sans text-gray-100 flex flex-col relative overflow-hidden">
      {/* Destello de fondo */}
      <div
        className={`absolute top-0 w-[150%] h-[150%] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] -z-10 transition-colors duration-1000 ${
          isExpired
            ? "from-red-900/20 via-gray-950 to-gray-950"
            : "from-blue-900/30 via-gray-950 to-gray-950"
        }`}
      />

      {/* Header Simplificado */}
      <div className="pt-10 pb-4 px-6 flex justify-center items-center relative z-10">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-2"
        >
          <div
            className={`p-2 rounded-xl shadow-lg ${isExpired ? "bg-red-500/20 text-red-400" : "bg-blue-500/20 text-blue-400"}`}
          >
            <Wifi size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-wide">Zona Wi-Fi</h1>
        </motion.div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20 z-10">
        <AnimatePresence mode="wait">
          {/* ESTADO 1: ACTIVO */}
          {!isExpired ? (
            <motion.div
              key="active"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-sm flex flex-col items-center"
            >
              {/* Círculo Animado del Temporizador */}
              <div className="relative w-64 h-64 mb-8 flex items-center justify-center">
                {/* SVG Ring Background */}
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                  <circle
                    cx="128"
                    cy="128"
                    r="120"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="transparent"
                    className="text-gray-800"
                  />
                  {/* SVG Ring Progress */}
                  <motion.circle
                    cx="128"
                    cy="128"
                    r="120"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeLinecap="round"
                    className="text-blue-500"
                    initial={{ strokeDasharray: 754, strokeDashoffset: 0 }}
                    animate={{
                      strokeDashoffset: 754 - (percentage / 100) * 754,
                    }}
                    transition={{ ease: "linear", duration: 1 }}
                  />
                </svg>

                {/* Texto Central del Reloj */}
                <div className="flex flex-col items-center text-center">
                  <Clock size={28} className="text-blue-400 mb-2 opacity-80" />
                  <span className="text-5xl font-black tabular-nums tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-300">
                    {formatTime(timeLeft)}
                  </span>
                  <span className="text-sm font-medium text-gray-400 mt-1 uppercase tracking-widest">
                    Restantes
                  </span>
                </div>
              </div>

              {/* Tarjeta del Código */}
              <div className="w-full bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] shadow-2xl flex flex-col items-center">
                <p className="text-sm text-gray-400 mb-2">
                  Tu código de conexión es:
                </p>
                <div className="text-4xl font-black tracking-[0.2em] text-white mb-6 select-all">
                  {ticket.codigo}
                </div>

                <motion.button
                  onClick={handleCopyCode}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-full py-4 rounded-2xl flex items-center justify-center font-bold text-sm transition-all duration-300 shadow-lg ${
                    isCopied
                      ? "bg-green-500/20 text-green-400 border border-green-500/50 shadow-green-900/20"
                      : "bg-blue-600 text-white border border-blue-400/30 shadow-blue-900/30 hover:bg-blue-500"
                  }`}
                >
                  <AnimatePresence mode="wait">
                    {isCopied ? (
                      <motion.div
                        key="copied"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="flex items-center gap-2"
                      >
                        <CheckCircle2 size={18} /> Código copiado
                      </motion.div>
                    ) : (
                      <motion.div
                        key="copy"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-2"
                      >
                        <Copy size={18} /> Copiar Código
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>

              <p className="mt-6 text-xs text-gray-500 text-center px-4">
                Conéctate a la red{" "}
                <strong className="text-gray-300">Zona Wi-Fi</strong> en tus
                ajustes e ingresa este código.
              </p>
            </motion.div>
          ) : (
            /* ESTADO 2: FINALIZADO */
            <motion.div
              key="expired"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-sm flex flex-col items-center text-center"
            >
              <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                <AlertCircle size={48} className="text-red-500" />
              </div>

              <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
                Tiempo Agotado
              </h2>
              <p className="text-gray-400 mb-8 px-4">
                Tu sesión de internet ha finalizado. Esperamos que hayas
                disfrutado la conexión.
              </p>

              <motion.button
                onClick={() => navigate("/")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-white text-gray-950 font-black py-4 rounded-full flex items-center justify-center gap-2 shadow-xl hover:bg-gray-200 transition-colors"
              >
                Comprar más tiempo <ArrowRight size={20} />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
