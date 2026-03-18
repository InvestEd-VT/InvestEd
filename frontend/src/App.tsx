import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, PublicRoute } from './components/common';
import { ForgotPassword, Login, Register } from './pages';

// ─── Placeholder pages ────────────────────────────────────────────────────────
// Replace these with real page components as they are built
const Dashboard = () => (
  <div className="min-h-screen bg-gray-100 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">InvestEd</h1>
      <p className="text-gray-600">Dashboard — coming soon</p>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────

function App() {
  return (
    <Routes>
      {/* Public routes — redirect to /dashboard if already authenticated */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* Protected routes — redirect to /login if not authenticated */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>

      {/* Catch-all: redirect unknown paths to dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
