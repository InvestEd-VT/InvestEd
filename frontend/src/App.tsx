import Dashboard from "@/app/dashboard/Dashboard"
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, PublicRoute } from './components/common';
import { ForgotPassword } from './pages';
import { ThemeProvider } from "./components/ui/theme-provider";

// ─── Placeholder pages ────────────────────────────────────────────────────────
// Replace these with real page components as they are built

const Login = () => (
  <div className="min-h-screen bg-gray-100 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">InvestEd</h1>
      <p className="text-gray-600">Login — coming soon</p>
    </div>
  </div>
);
// ─────────────────────────────────────────────────────────────────────────────

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Routes>
        <Route path="/preview-dashboard" element={<Dashboard />} />

        {/* Public routes */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
