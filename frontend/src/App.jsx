import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout
import MainLayout from './components/layout/MainLayout';

// Páginas
import Login from './pages/Login';

// Admin
import AdminDashboard from './pages/admin/Dashboard';
import RestaurantConfig from './pages/admin/RestaurantConfig';
import UserManagement from './pages/admin/UserManagement';
import MenuManagement from './pages/admin/MenuManagement';
import AreaTableSetup from './pages/admin/AreaTableSetup';
import PrinterManagement from './pages/admin/PrinterManagement';

// Mesero
import TableView from './pages/waiter/TableView';
import OrderManagement from './pages/waiter/OrderManagement';

// Cajero
import CashRegister from './pages/cashier/CashRegister';
import PaymentProcessing from './pages/cashier/PaymentProcessing';
import Reports from './pages/cashier/Reports';
import KitchenDisplay from './pages/kitchen/KitchenDisplay';

// Componente de ruta protegida
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.rol)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Componente de redirección según rol
const RoleBasedRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) return null; // Esperar a que cargue el usuario

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.rol) {
    case 'admin':
      return <Navigate to="/admin/dashboard" replace />;
    case 'cajero':
      return <Navigate to="/cajero/caja" replace />;
    case 'mesero':
      return <Navigate to="/mesero/mesas" replace />;
    case 'cocinero':
      return <Navigate to="/cocina" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Ruta pública */}
          <Route path="/login" element={<Login />} />

          {/* Redirección inicial */}
          <Route path="/" element={<RoleBasedRedirect />} />

          {/* Rutas Protegidas envueltas en MainLayout */}
          <Route element={<MainLayout />}>
            {/* Rutas de Admin */}
            <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/configuracion" element={<ProtectedRoute roles={['admin']}><RestaurantConfig /></ProtectedRoute>} />
            <Route path="/admin/usuarios" element={<ProtectedRoute roles={['admin']}><UserManagement /></ProtectedRoute>} />
            <Route path="/admin/menu" element={<ProtectedRoute roles={['admin']}><MenuManagement /></ProtectedRoute>} />
            <Route path="/admin/areas-mesas" element={<ProtectedRoute roles={['admin']}><AreaTableSetup /></ProtectedRoute>} />
            <Route path="/admin/impresoras" element={<ProtectedRoute roles={['admin']}><PrinterManagement /></ProtectedRoute>} />

            {/* Rutas de Mesero */}
            <Route path="/mesero/mesas" element={<ProtectedRoute roles={['mesero', 'admin']}><TableView /></ProtectedRoute>} />
            <Route path="/mesero/pedidos/nuevo" element={<ProtectedRoute roles={['mesero', 'admin']}><OrderManagement /></ProtectedRoute>} />
            <Route path="/mesero/pedidos/:id" element={<ProtectedRoute roles={['mesero', 'admin']}><OrderManagement /></ProtectedRoute>} />

            {/* Rutas de Cajero */}
            <Route path="/cajero/caja" element={<ProtectedRoute roles={['cajero', 'admin']}><CashRegister /></ProtectedRoute>} />
            <Route path="/cajero/pagos" element={<ProtectedRoute roles={['cajero', 'admin']}><PaymentProcessing /></ProtectedRoute>} />
            <Route path="/cajero/reportes" element={<ProtectedRoute roles={['cajero', 'admin']}><Reports /></ProtectedRoute>} />

            {/* Rutas de Cocina */}
            <Route path="/cocina" element={<ProtectedRoute roles={['cocinero', 'admin']}><KitchenDisplay /></ProtectedRoute>} />
          </Route>

          {/* Ruta 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
