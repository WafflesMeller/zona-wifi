import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Revisamos si hay una sesión activa al cargar
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. Nos suscribimos a cambios (ej: si el usuario cierra sesión)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Mientras verificamos con Supabase, mostramos un loader premium
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center">
        <Loader2 size={48} className="text-blue-500 animate-spin mb-4" />
        <p className="text-gray-400 font-medium">Verificando credenciales...</p>
      </div>
    );
  }

  // Si no hay sesión, lo mandamos al login inmediatamente
  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  // Si todo está bien, lo dejamos pasar al Dashboard
  return <>{children}</>;
}