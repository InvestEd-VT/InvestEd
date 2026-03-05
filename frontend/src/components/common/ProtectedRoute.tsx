import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

/**
 * ProtectedRoute — wraps routes that require authentication.
 *
 * If the user is not authenticated, they are redirected to /login.
 * The `replace` prop replaces the current history entry so the user
 * can't press the back button to get back to the protected page.
 *
 * Usage in router:
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/dashboard" element={<Dashboard />} />
 *     <Route path="/portfolio" element={<Portfolio />} />
 *   </Route>
 */
const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Renders the matched child route
  return <Outlet />;
};

export default ProtectedRoute;
