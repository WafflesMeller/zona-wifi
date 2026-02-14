import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Importaciones de la Vista Pública
import Home from './pages/public/Home';
import Status from './pages/public/Status';
import AdminLogin from './pages/admin/login';
import AdminDashboard from './pages/admin/dashboard';
import ReportarPagoPage from './pages/admin/reportar';

// Importaciones de la Vista Admin (Fase 4)
// import AdminLogin from './pages/admin/Login';
// import AdminDashboard from './pages/admin/Dashboard';
// import AdminReportar from './pages/admin/Reportar';

function App() {
  return (
    <Router>
      {/* Contenedor principal con tu color de fondo base (Ajusta a tu tema) */}
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
        <Routes>
          {/* ==========================================
              📱 RUTAS PÚBLICAS (El Cliente)
          ========================================== */}
          <Route path="/" element={<Home />} />
          
          {/* Esta será nuestra próxima pantalla */}
          <Route path="/status" element={<Status />} />


          {/* ==========================================
              🛡️ RUTAS ADMINISTRATIVAS (El Operador)
          ========================================== */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
           <Route path="/admin/reportar" element={<ReportarPagoPage />} /> *
          
          {/* Ruta 404 por si alguien entra a un enlace que no existe */}
          <Route 
            path="*" 
            element={
              <div className="flex h-screen items-center justify-center">
                <h1 className="text-2xl font-bold text-gray-400">404 | Página no encontrada</h1>
              </div>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;