import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { homeFor } from '../utils/routes';
import { useApp } from '../context/AppContext';

type Profile = 'cliente' | 'funcionario' | 'admin';

export default function ProtectedRoute({ allow, children }: { allow: Profile[]; children: ReactNode }) {
  const { session } = useApp();
  if (!session) return <Navigate to="/" replace />;
  const profile: Profile = session.type === 'cliente' ? 'cliente' : session.role;
  if (!allow.includes(profile)) return <Navigate to={homeFor(session)} replace />;
  return <>{children}</>;
}
