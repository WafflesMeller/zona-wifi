import { motion } from "framer-motion";
import type { Transition } from "framer-motion";

import { Wifi, MapPin, ChevronDown } from 'lucide-react';

interface Props {
  isCompact: boolean;
  onBuyClick: () => void;
  onNavbarClick: () => void;
}

export default function HeroNavbar({ isCompact, onBuyClick, onNavbarClick }: Props) {

// Y define la constante así:
const smoothTransition: Transition = { type: "spring", stiffness: 180, damping: 28 };

  return (
    <>
      {/* ✨ 1. DEGRADADO SUPERIOR (La "Máscara") */}
      <div 
        className={`fixed top-0 left-0 right-0 h-20 z-40 pointer-events-none transition-opacity duration-700 bg-gradient-to-b from-gray-950 via-gray-950/90 to-transparent ${
          isCompact ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* 2. CONTENEDOR MÁGICO */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
        
        <motion.div 
          layout
          transition={smoothTransition}
          className={`pointer-events-auto flex ${
            isCompact 
              ? 'mt-4 w-[95%] max-w-3xl flex-row items-center justify-between px-4 py-3 bg-[#121212]/40 backdrop-blur-md border border-white/10 rounded-full cursor-pointer hover:bg-white/5 transition-colors' 
              : 'mt-0 w-full h-screen flex-col items-center justify-center bg-gray-950 rounded-b-[2.5rem] overflow-hidden'
          }`}
          // Si está en modo compacto, al hacer clic en todo el Navbar vuelve al inicio
          onClick={isCompact ? onNavbarClick : undefined}
        >
          
          {/* ==================================================
              ESTADO 1: HERO PANTALLA COMPLETA
          ================================================== */}
          {!isCompact && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center w-full h-full relative pb-20"
            >
              <div className="absolute top-0 w-[150%] h-[150%] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/30 via-gray-950 to-gray-950 -z-10" />
              
              <div className="flex flex-col items-center justify-center flex-1 mt-10">
                <motion.div layoutId="badge" transition={smoothTransition} className="flex items-center gap-2 bg-gray-900/80 border border-gray-800 px-4 py-1.5 rounded-full mb-10 backdrop-blur-sm">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                  </span>
                  <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Servicio Activo</span>
                </motion.div>

                <div className="relative flex items-center justify-center mb-8">
                  <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="absolute w-28 h-28 bg-blue-500/20 rounded-full" />
                  <motion.div layoutId="icon-bg" transition={smoothTransition} className="relative z-10 bg-blue-600 p-5 rounded-full shadow-[0_0_30px_rgba(37,99,235,0.4)]">
                    <Wifi size={48} className="text-white" />
                  </motion.div>
                </div>

                <motion.h1 layoutId="title" transition={smoothTransition} className="text-5xl font-extrabold text-white tracking-tight mb-3">
                  Zona Wi-Fi
                </motion.h1>
                
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-gray-400 text-sm font-medium mt-2">
                  <MapPin size={16} className="text-blue-500" />
                  <span>Punto de conexión ultrarrápida</span>
                </motion.div>
              </div>

              {/* BOTÓN "Presiona para comprar" */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.3 }}
                className="mb-16 mt-auto"
              >
                <motion.button
                  onClick={onBuyClick}
                  whileTap={{ scale: 0.95 }}
                  animate={{ 
                    scale: [1, 1.05, 1],

                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="bg-blue-600 text-white font-bold text-lg py-4 px-8 rounded-full flex items-center gap-3 border border-blue-400/30"
                >
                  Presiona para comprar
                  <motion.div animate={{ y: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}>
                    <ChevronDown size={22} className="text-white" />
                  </motion.div>
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {/* ==================================================
              ESTADO 2: NAVBAR FLOTANTE
          ================================================== */}
          {isCompact && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex justify-between items-center w-full"
            >
              <div className="flex items-center gap-3">
                <motion.div layoutId="icon-bg" transition={smoothTransition} className="bg-blue-600 p-2.5 rounded-full">
                  <Wifi size={20} className="text-white" />
                </motion.div>
                
                <motion.h1 layoutId="title" transition={smoothTransition} className="text-lg font-bold text-white tracking-wide">
                  Zona Wi-Fi
                </motion.h1>
              </div>

              <motion.div layoutId="badge" transition={smoothTransition} className="flex items-center gap-2 bg-[#121212]/60 border border-white/5 px-3 py-1.5 rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">Volver</span>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </>
  );
}