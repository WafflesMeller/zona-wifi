import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Smartphone,
  User,
  CreditCard,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  Copy,
  ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import QrAccordion from "./QrAccordion";

const PLANES = [
  { id: 1, horas: 1, precio: 1, titulo: "1 Hora" },
  { id: 2, horas: 3, precio: 2, titulo: "3 Horas" },
  { id: 3, horas: 5, precio: 3, titulo: "5 Horas" },
];

const DATOS_PAGO = {
  banco: "VENEZUELA",
  telefono: "0424-29-29-579",
  cedula: "26.597.356",
};

export default function PaymentFlow() {
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);

  const [loadingBcv, setLoadingBcv] = useState(true);
  const [bcvRate, setBcvRate] = useState<number>(0);

  const [isCopied, setIsCopied] = useState(false);

  const navigate = useNavigate();

  // ✨ NUEVO: Estado para saber si estamos enviando los datos a la BD
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    cedula: "",
    referencia: "",
  });

  const abrirLinkBDV = () => {
    // Limpiamos los formatos visuales de DATOS_PAGO para la URL
    // Cédula: "26.597.356" -> "V26597356"
    const RECEPTOR_ID = `V${DATOS_PAGO.cedula.replace(/\./g, "")}`;

    // Teléfono: "0424-29-29-579" -> "584242929579"
    const RECEPTOR_TLF = `58${DATOS_PAGO.telefono.replace(/-/g, "").substring(1)}`;

    const RECEPTOR_BANCO = "0102";

    // Calculamos el monto usando la misma lógica de tu interfaz
    const precioPlan = PLANES.find((p) => p.id === selectedPlan)?.precio || 0;
    const montoFormateado = (precioPlan * bcvRate).toFixed(2);

    const descripcion = "9dxBliWt4XnVSB0LTqNasQ%3D%3D";

    const linkBDV = `https://bdvdigital.banvenez.com/pagomovil?id=${RECEPTOR_ID}&phone=${RECEPTOR_TLF}&bank=${RECEPTOR_BANCO}&description=${descripcion}&amount=${montoFormateado}`;
    window.open(linkBDV, "_blank");
  };

  useEffect(() => {
    const fetchBcv = async () => {
      try {
        const res = await fetch(
          "https://bici-aventuras-app.vercel.app/api/tasa",
        );
        const data = await res.json();

        if (data.ok) {
          setBcvRate(data.price);
        }
      } catch (error) {
        console.error("Error BCV:", error);
        setBcvRate(396.37); // fallback
      } finally {
        setLoadingBcv(false);
      }
    };

    fetchBcv();
  }, []);

  const handleSelectPlan = (planId: number) => {
    setSelectedPlan(planId);
    setStep(2);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🚀 LA MAGIA SUCEDE AQUÍ: Conexión con tu RPC en Supabase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.rpc("procesar_venta_wifi", {
        p_referencia: formData.referencia,
        p_cedula: formData.cedula,
        p_nombre: formData.nombre,
        p_telefono: formData.telefono,
        p_plan_id: selectedPlan,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data?.codigo) {
        throw new Error("No se recibió código de conexión.");
      }

      // 🔥 Forzar MAYÚSCULAS SIEMPRE
      const codigo = String(data.codigo).toUpperCase().trim();

      const planSeleccionadoObj = PLANES.find((p) => p.id === selectedPlan);
      const duracionMinutos = planSeleccionadoObj
        ? planSeleccionadoObj.horas * 60
        : 60;

      const ticketData = {
        codigo,
        duracionMinutos,
        startTime: Date.now(),
      };

      // Guardamos el ticket
      localStorage.setItem("wifi_ticket", JSON.stringify(ticketData));
      localStorage.setItem("wifi_last_code", codigo);

      // 🔥 IMPORTANTE: SOLO REDIRIGIR A STATUS
      navigate("/status");
    } catch (err: any) {
      console.error("Error procesando pago:", err);
      alert(
        err.message || "No se encontró el pago o la referencia ya fue usada.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para copiar (con soporte para localhost/HTTP)
  const handleCopy = async () => {
    const monto = (
      (PLANES.find((p) => p.id === selectedPlan)?.precio || 0) * bcvRate
    ).toFixed(2);
    const textoACopiar = `Datos de Pago Móvil:\nBanco: ${DATOS_PAGO.banco}\nTeléfono: ${DATOS_PAGO.telefono}\nCédula: ${DATOS_PAGO.cedula}\nMonto: Bs. ${monto}`;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textoACopiar);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = textoACopiar;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        textArea.remove();
      }
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch (err) {
      console.error("Error al copiar", err);
    }
  };

  return (
    <div className="w-full flex flex-col font-sans text-gray-100 px-4 sm:px-6">
      <AnimatePresence mode="wait">
        {loadingBcv ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center justify-center mt-20"
          >
            <div className="flex flex-col items-center pt-35">
              <Loader2 size={60} className="text-blue-500 animate-spin mb-6" />
              <h2 className="text-xl text-white">Cargando</h2>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col max-w-xl mx-auto w-full"
          >
            {/* Header Flotante y Limpio */}
            <div className="flex items-center gap-4 mb-8 pt-4">
              {step === 2 && (
                <button
                  onClick={() => setStep(1)}
                  className="p-3 bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 rounded-full transition-all shadow-lg"
                >
                  <ArrowLeft size={20} className="text-white" />
                </button>
              )}
              <div className="flex-1 overflow-hidden h-10 flex flex-col justify-center relative">
                {/* ✨ ANIMACIÓN DEL TÍTULO */}
                <AnimatePresence mode="popLayout">
                  <motion.h2
                    key={step}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="text-3xl font-bold text-white absolute"
                  >
                    {step === 1 ? "Elige tu Plan" : "Pago Móvil"}
                  </motion.h2>
                </AnimatePresence>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-6 -mt-4">
              <ShieldCheck size={14} className="text-green-400" />
              <p className="text-gray-400 text-sm font-medium">
                {step === 1
                  ? `Tasa BCV: Bs. ${bcvRate.toFixed(2)}`
                  : "Conexión segura"}
              </p>
            </div>

            <div className="pb-12 relative">
              <AnimatePresence mode="wait">
                {/* PASO 1: SELECCIONAR PLAN */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    className="space-y-4"
                  >
                    {PLANES.map((plan) => (
                      <button
                        key={plan.id}
                        onClick={() => handleSelectPlan(plan.id)}
                        className="w-full flex items-center justify-between p-5 bg-[#121212]/40 backdrop-blur-md border border-white/10 rounded-full hover:bg-white/10 hover:border-blue-500/50 transition-all active:scale-95 shadow-lg shadow-black/20 group"
                      >
                        <div className="flex items-center gap-4 pl-2">
                          <div className="bg-blue-500/20 p-3 rounded-full text-blue-400 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all">
                            <Clock size={24} />
                          </div>
                          <div className="text-left">
                            <h3 className="text-xl font-bold text-white">
                              {plan.titulo}
                            </h3>
                          </div>
                        </div>
                        <div className="text-right pr-4">
                          <span className="block text-2xl font-black text-white">
                            ${plan.precio}
                          </span>
                          <span className="text-xs text-gray-400 font-medium">
                            Bs. {(plan.precio * bcvRate).toFixed(2)}
                          </span>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}

                {/* PASO 2: FORMULARIO Y DATOS DE PAGO */}
                {/* PASO 2: FORMULARIO Y DATOS DE PAGO */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 30 }}
                    className="space-y-6"
                  >
                    <div className="bg-[#121212]/40 backdrop-blur-xl border border-white/10 p-6 rounded-[2.5rem] shadow-xl shadow-black/20">
                      <h3 className="text-sm font-bold text-blue-400 mb-4 flex items-center gap-2">
                        <Smartphone size={18} /> Datos para el pago:
                      </h3>

                      <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm mb-4">
                        <p className="text-gray-400">Banco:</p>
                        <p className="font-bold text-white tracking-wide">
                          {DATOS_PAGO.banco}
                        </p>
                        <p className="text-gray-400">Teléfono:</p>
                        <p className="font-bold text-white tracking-wide">
                          {DATOS_PAGO.telefono}
                        </p>
                        <p className="text-gray-400">Cédula:</p>
                        <p className="font-bold text-white tracking-wide">
                          {DATOS_PAGO.cedula}
                        </p>
                        <div className="col-span-2 h-px bg-white/10 my-1"></div>
                        <p className="text-gray-400 flex items-center">
                          Total a pagar:
                        </p>
                        <p className="font-bold text-green-400 text-xl">
                          Bs.{" "}
                          {(
                            (PLANES.find((p) => p.id === selectedPlan)
                              ?.precio || 0) * bcvRate
                          ).toFixed(2)}
                        </p>
                      </div>

                      {/* BOTÓN COPIAR DATOS */}
                      <motion.button
                        type="button"
                        onClick={handleCopy}
                        className={`w-full mb-4 py-3 rounded-full flex items-center justify-center font-semibold text-sm transition-colors duration-300 ${
                          isCopied
                            ? "bg-green-500/20 text-green-400 border border-green-500/50"
                            : "bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10"
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
                              <CheckCircle2 size={16} /> Copiado al portapapeles
                            </motion.div>
                          ) : (
                            <motion.div
                              key="copy"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="flex items-center gap-2"
                            >
                              <Copy size={16} /> Copiar datos
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.button>

                      {/* ACORDEÓN CÓDIGO QR */}
                      <QrAccordion />

                      {/* NUEVO: BOTÓN DIRECTO A BDV (ESTILO GLASSMORPHISM) */}
                      <div className="mt-3 space-y-2">
                        <motion.button
                          onClick={abrirLinkBDV}
                          className="w-full relative overflow-hidden bg-[#00529b]/10 hover:bg-[#00529b]/20 backdrop-blur-md border border-[#00529b]/30 p-4 rounded-4xl flex items-center justify-between "
                        >
                          {/* Brillo sutil de fondo al pasar el mouse */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00529b]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-4xl"></div>

                          <div className="flex items-center gap-4 relative z-10">
                            {/* Contenedor de cristal para el logo */}
                            <div className="bg-white/10 p-2 rounded-4xl border border-white/5 backdrop-blur-sm">
                              <img
                                src="/bdv-logo.webp"
                                alt="BDV"
                                className="h-7 w-auto object-contain drop-shadow-md"
                              />
                            </div>
                            <div className="text-left">
                              <span className="block font-bold text-white text-base leading-tight">
                                Pagar con BDV
                              </span>
                              <span className="text-xs text-blue-200/60 font-medium">
                                Ir directo a Pago Móvil
                              </span>
                            </div>
                          </div>
                          {/* Icono de Lucide reemplazando a Google Fonts */}
                          <ExternalLink
                            size={22}
                            className="text-blue-400/50 group-hover:text-blue-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all relative z-10"
                          />
                        </motion.button>

                        <p className="text-center text-[10px] leading-tight text-gray-500 px-2 pt-1">
                          *Se abrirá la app del Banco de Venezuela con los datos
                          precargados. (Solo Android con app instalada).
                        </p>
                      </div>
                    </div>
                    {/* FORMULARIO */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-gray-400 ml-4 flex items-center gap-2 uppercase tracking-widest">
                          <User size={14} /> Nombre y Apellido
                        </label>
                        <input
                          type="text"
                          name="nombre"
                          required // Validación Nativa
                          onChange={handleInputChange}
                          className="w-full px-6 py-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-white placeholder-gray-500 focus:bg-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-inner"
                          placeholder="Ej: Juan Pérez"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold text-gray-400 ml-4 uppercase tracking-widest">
                            Teléfono
                          </label>
                          <input
                            type="text" // Usamos text para poder aplicar el inputMode
                            inputMode="numeric" // ✨ Saca teclado numérico en móvil
                            pattern="[0-9]*" // ✨ Evita letras
                            minLength={11}
                            name="telefono"
                            required
                            onChange={handleInputChange}
                            className="w-full px-6 py-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-white placeholder-gray-500 focus:bg-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-inner"
                            placeholder="0412..."
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold text-gray-400 ml-4 uppercase tracking-widest">
                            Cédula
                          </label>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={11}
                            minLength={7}
                            name="cedula"
                            required
                            onChange={handleInputChange}
                            className="w-full px-6 py-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-white placeholder-gray-500 focus:bg-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-inner"
                            placeholder="12345678"
                          />
                        </div>
                      </div>

                      <div className="space-y-2 pt-2">
                        <label className="text-[11px] font-bold text-blue-400 ml-4 flex items-center gap-2 uppercase tracking-widest">
                          <CreditCard size={14} /> Referencia (Últimos 4)
                        </label>
                        <input
                          type="text"
                          inputMode="numeric" // ✨ Saca teclado numérico en móvil
                          pattern="[0-9]{4}" // ✨ Obliga a que sean exactamente 4 números
                          name="referencia"
                          maxLength={4}
                          required
                          onChange={handleInputChange}
                          className="w-full px-6 py-4 bg-blue-500/10 backdrop-blur-md border border-blue-500/30 rounded-full text-center text-3xl font-black tracking-[0.5em] text-white placeholder-blue-900/50 focus:bg-blue-500/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400 outline-none transition-all shadow-[0_0_15px_rgba(37,99,235,0.1)]"
                          placeholder="0000"
                        />
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isSubmitting} // 👈 Evita que el usuario haga doble clic
                        className={`w-full mt-6 backdrop-blur-xl font-bold py-4 rounded-full flex items-center justify-center gap-2 transition-all ${
                          isSubmitting
                            ? "bg-blue-800 text-gray-300 cursor-not-allowed border border-blue-800"
                            : "bg-blue-600/90 border border-blue-400/50 hover:bg-blue-500 text-white"
                        }`}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 size={22} className="animate-spin" />{" "}
                            Verificando Pago...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={22} /> Verificar y Conectar
                          </>
                        )}
                      </motion.button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
