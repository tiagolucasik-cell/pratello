import { WifiOff } from 'lucide-react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { useApp } from './context/AppContext';
import Admin from './pages/Admin';
import Dashboard from './pages/admin/Dashboard';
import MenuManager from './pages/admin/MenuManager';
import StaffManager from './pages/admin/StaffManager';
import Login from './pages/Login';
import Menu from './pages/Menu';
import Orders from './pages/Orders';
import { homeFor } from './utils/routes';

export default function App() {
  const { session, connectionError } = useApp();

  return (
    <>
      {connectionError && (
        <div role="alert" className="fixed inset-x-0 top-0 z-[60] flex items-center justify-center gap-2 bg-red-600 px-4 py-2 text-center text-sm font-medium text-white">
          <WifiOff size={16} className="shrink-0" /> {connectionError}
        </div>
      )}
      <Routes>
      <Route path="/" element={session ? <Navigate to={homeFor(session)} replace /> : <Login />} />
      <Route
        path="/cardapio"
        element={
          <ProtectedRoute allow={['cliente']}>
            <Menu />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pedidos"
        element={
          <ProtectedRoute allow={['funcionario', 'admin']}>
            <Orders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allow={['admin']}>
            <Admin />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="cardapio" element={<MenuManager />} />
        <Route path="funcionarios" element={<StaffManager />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
