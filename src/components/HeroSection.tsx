import React from 'react';
import { motion } from 'framer-motion';
import { Wifi, MapPin } from 'lucide-react';

export default function HeroSection() {
  return (
    // Contenedor principal sin ocupar el 100% de la pantalla (vh). 
    // Usamos el color oscuro para mantener la coherencia.
    <div className="relative w-full pt-16 pb-8 px-6 flex flex-col items-center justify-center bg-gray-950 overflow-hidden rounded-b-[2.5rem] shadow-2xl z-10">
      
      {/* Destello de fondo (Efecto LED/Glow) */}
      <div className="absolute top-0 w-[150%] h-[150%] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-gray-950 to-gray-950 -z-10"></div>

      {/* Badge de Estado del Servicio (Full redondeado) */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 bg-gray-900/80 border border-gray-800 px-4 py-1.5 rounded-full mb-8 backdrop-blur-sm"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
        </span>
        <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Servicio Activo</span>
      </motion.div>

      {/* Ícono de Wi-Fi Animado (Efecto de ondas emitiendo señal) */}
      <div className="relative flex items-center justify-center mb-6">
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-24 h-24 bg-blue-500/20 rounded-full"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          className="absolute w-16 h-16 bg-blue-500/30 rounded-full"
        />
        <div className="relative z-10 bg-blue-600 p-4 rounded-full shadow-[0_0_30px_rgba(37,99,235,0.5)]">
          <Wifi size={40} className="text-white" />
        </div>
      </div>

      {/* Títulos */}
      <motion.h1 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-4xl font-extrabold text-white tracking-tight mb-2"
      >
        Zona Wi-Fi
      </motion.h1>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-2 text-gray-400 text-sm font-medium"
      >
        <MapPin size={14} className="text-blue-500" />
        <span>Punto de conexión ultrarrápida</span>
      </motion.div>
    </div>
  );
}