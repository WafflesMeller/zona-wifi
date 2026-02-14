import { motion } from 'framer-motion';
import { Shield, LayoutDashboard, PlusCircle, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function AdminNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const smoothTransition = { type: "spring", stiffness: 180, damping: 28 };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Reportar Pago', path: '/admin/reportar', icon: PlusCircle },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  return (
    <>
      {/* ✨ DEGRADADO SUPERIOR */}
      <div className="fixed top-0 left-0 right-0 h-20 z-40 pointer-events-none bg-gradient-to-b from-gray-950 via-gray-950/90 to-transparent" />

      {/* CONTENEDOR PRINCIPAL */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none mt-4">
        <motion.div 
          layout
          transition={smoothTransition}
          className="pointer-events-auto w-[95%] max-w-4xl flex items-center justify-between px-4 py-3 bg-[#121212]/60 backdrop-blur-md border border-white/10 rounded-full shadow-lg"
        >
          {/* IZQUIERDA — Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-purple-600 p-2.5 rounded-full">
              <Shield size={20} className="text-white" />
            </div>
            <h1 className="text-lg font-bold text-white tracking-wide">
              Admin Panel
            </h1>
          </div>

          {/* CENTRO — Links */}
          <div className="flex items-center gap-1 sm:gap-2 bg-gray-900/50 p-1 rounded-full border border-white/5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              return (
                <Link key={item.path} to={item.path} className="relative z-10 block">
                  <div className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-colors ${
                    isActive ? 'text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}>
                    {isActive && (
                      <motion.div
                        layoutId="active-admin-tab"
                        className="absolute inset-0 bg-white/10 rounded-full -z-10"
                        transition={smoothTransition}
                      />
                    )}
                    <Icon size={16} className={isActive ? 'text-purple-400' : 'text-gray-500'} />
                    <span className="hidden sm:inline">{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* DERECHA — Cerrar Sesión (FUERA del grupo) */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-red-400 hover:text-white hover:bg-red-500/20 transition-colors border border-red-500/20"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </motion.button>

        </motion.div>
      </div>
    </>
  );
}
