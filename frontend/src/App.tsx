import Dashboard from "@/app/dashboard/Dashboard"
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, PublicRoute } from './components/common';
import { ForgotPassword, Login, Register } from './pages';
import { ThemeProvider } from "./components/ui/theme-provider";

// ─── Placeholder pages ────────────────────────────────────────────────────────
// Replace these with real page components as they are built

// ─────────────────────────────────────────────────────────────────────────────

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Routes>
        <Route path="/preview-dashboard" element={<Dashboard />} />

        {/* Public routes */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
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
