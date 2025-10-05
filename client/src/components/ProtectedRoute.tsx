import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: 'ADMIN' | 'USER' }) {
  const { user } = useAuth();
  const loc = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  }
  if (role && user.role !== role) {
    return <Navigate to="/places" replace />;
  }
  return <>{children}</>;
}
