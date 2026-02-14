import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HeroNavbar from '../../components/HeroNavbar';
import PaymentFlow from '../../components/PaymentFlow';

export default function Home() {
  const [showPayment, setShowPayment] = useState(false);

  // Asegurarnos de que cuando cambie a la vista de pago, inicie arriba del todo
  useEffect(() => {
    if (showPayment) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [showPayment]);

  return (
    // Quitamos el h-[100dvh] y overflow-hidden. Ahora usa min-h-screen para scroll natural.
    <div className="min-h-screen w-full bg-gray-950 font-sans relative">
      
      {/* El Navbar fijo en la parte superior (z-50) */}
      <HeroNavbar 
        isCompact={showPayment} 
        onBuyClick={() => setShowPayment(true)} 
        onNavbarClick={() => setShowPayment(false)}
      />

      {/* Contenido principal de la página (El scroll pasará por debajo del Navbar) */}
      <AnimatePresence>
        {showPayment && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            // pt-20 es crucial: Deja el espacio exacto para que el Navbar flotante no tape
            // el título al inicio. Al hacer scroll, este contenido pasará por debajo.
            className="pt-20 relative z-10 w-full"
          >
            <PaymentFlow />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}