import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

/**
 * PublicRoute — wraps routes that should only be accessible when logged out.
 * (e.g. /login, /register, /forgot-password)
 *
 * If the user is already authenticated, they are redirected to /dashboard
 * so they don't see the login page again after logging in.
 */
const PublicRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
};

export default PublicRoute;
