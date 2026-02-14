import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Si el login es exitoso, lo enviamos al panel de control
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError('Credenciales incorrectas. Verifica tu correo y contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-950 flex flex-col items-center justify-center px-4 relative overflow-hidden font-sans">
      
      {/* Fondo con destello sutil de seguridad (Azul/Púrpura) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-gray-950 to-gray-950 -z-10 rounded-full blur-3xl" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md flex flex-col items-center"
      >
        {/* Ícono de Escudo */}
        <div className="w-20 h-20 bg-blue-500/10 border border-blue-500/30 rounded-3xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(37,99,235,0.2)]">
          <Shield size={40} className="text-blue-500" />
        </div>

        <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Acceso Operador</h1>
        <p className="text-gray-400 text-sm mb-8 text-center">
          Panel de control exclusivo para la administración de Zona Wi-Fi.
        </p>

        {/* Formulario Glassmorphism */}
        <div className="w-full bg-[#121212]/60 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] shadow-2xl">
          
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl flex items-start gap-3 text-sm"
              >
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <p>{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-400 ml-4 flex items-center gap-2 uppercase tracking-widest">
                <Mail size={14} /> Correo Electrónico
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-full text-white placeholder-gray-600 focus:bg-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-inner"
                placeholder="admin@zonavip.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-400 ml-4 flex items-center gap-2 uppercase tracking-widest">
                <Lock size={14} /> Contraseña
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-full text-white placeholder-gray-600 focus:bg-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-inner"
                placeholder="••••••••"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className={`w-full mt-4 py-4 rounded-full flex items-center justify-center gap-2 font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] ${
                loading 
                  ? 'bg-blue-800 text-gray-400 cursor-not-allowed border border-blue-800' 
                  : 'bg-blue-600 hover:bg-blue-500 text-white border border-blue-400/50'
              }`}
            >
              {loading ? (
                <><Loader2 size={20} className="animate-spin" /> Autenticando...</>
              ) : (
                'Iniciar Sesión'
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}