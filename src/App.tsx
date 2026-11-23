import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { useApp } from './context/AppContext';
import Admin from './pages/Admin';
import Dashboard from './pages/admin/Dashboard';
import MenuManager from './pages/admin/MenuManager';
import Settings from './pages/admin/Settings';
import StaffManager from './pages/admin/StaffManager';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Menu from './pages/Menu';
import Orders from './pages/Orders';
import WhatsAppSent from './pages/WhatsAppSent';
import { homeFor } from './utils/routes';

export default function App() {
  const { session } = useApp();

  return (
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
        path="/checkout"
        element={
          <ProtectedRoute allow={['cliente']}>
            <Checkout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pedido-whatsapp/:id"
        element={
          <ProtectedRoute allow={['cliente']}>
            <WhatsAppSent />
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
        <Route path="configuracoes" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
