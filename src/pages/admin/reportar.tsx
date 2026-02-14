'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Hash, DollarSign, Send, CheckCircle, AlertCircle } from 'lucide-react';
import AdminNavbar from '../../components/AdminNavbar';

export default function ReportarPagoPage() {
  const [formData, setFormData] = useState({
    referencia: '',
    monto: '',
    banco: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      // AQUÍ VA TU LÓGICA DE SUPABASE O API:
      // const { data, error } = await supabase.from('transacciones_inju').insert([formData]);
      // if (error) throw error;
      
      // Simulamos una petición de 1.5s
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setStatus('success');
      setFormData({ referencia: '', monto: '', banco: 'MANUAL' });
      
      // Volver al estado normal después de 3 segundos
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      console.error(error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 pt-32 px-4 pb-10 text-white font-sans relative overflow-hidden">
      {/* Fondo estético opcional */}
      <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-gray-950 to-gray-950 -z-10 pointer-events-none" />
      
      <AdminNavbar />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg mx-auto bg-[#121212]/60 backdrop-blur-xl border border-white/10 p-6 sm:p-8 rounded-[2rem] shadow-2xl"
      >
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">Reporte Manual</h2>
          <p className="text-gray-400 text-sm">
            Registra pagos en efectivo o fallos de webhook directamente a <span className="text-purple-400 font-mono text-xs bg-purple-500/10 px-1 py-0.5 rounded">transacciones_inju</span>.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Campo: Referencia */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5 ml-1">Referencia (Completa o 4 dígitos)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Hash size={18} className="text-gray-500" />
              </div>
              <input 
                required
                type="text"
                name="referencia"
                value={formData.referencia}
                onChange={handleChange}
                placeholder="Ej: 1234 o 98765432" 
                className="w-full bg-gray-900/50 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
              />
            </div>
          </div>

          {/* Campo: Monto */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5 ml-1">Monto Pagado</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <DollarSign size={18} className="text-gray-500" />
              </div>
              <input 
                required
                type="number"
                step="0.01"
                name="monto"
                value={formData.monto}
                onChange={handleChange}
                placeholder="Ej: 15.00" 
                className="w-full bg-gray-900/50 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
              />
            </div>
          </div>

          {/* Botón Submit */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            disabled={status === 'loading'}
            type="submit"
            className={`w-full font-bold text-base py-4 px-8 rounded-2xl flex items-center justify-center gap-3 transition-all ${
              status === 'success' ? 'bg-green-600 text-white' : 
              status === 'error' ? 'bg-red-600 text-white' : 
              'bg-purple-600 hover:bg-purple-500 text-white border border-purple-400/30'
            } disabled:opacity-70 disabled:cursor-not-allowed mt-4`}
          >
            {status === 'idle' && <><Send size={20} /> Registrar Pago Manual</>}
            {status === 'loading' && <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> Procesando...</>}
            {status === 'success' && <><CheckCircle size={20} /> Pago Registrado</>}
            {status === 'error' && <><AlertCircle size={20} /> Error al registrar</>}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}