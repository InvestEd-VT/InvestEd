import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, PublicRoute } from './components/common';
import {
  ForgotPassword,
  Login,
  Register,
  VerifyEmail,
  StockDetail,
  ResetPassword,
  Dashboard,
} from './pages';
import { ThemeProvider } from './components/ui/theme-provider';
import LearnLayout from '@/app/education/LearnLayout';
import EducationDashboard from '@/app/education/EducationDashboard';
import IntroToOptions from '@/components/education/modules/IntroToOptions';

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
          <Route path="/stock/:symbol" element={<StockDetail />} />

          {/* Learn section — all share LearnLayout */}
          <Route element={<LearnLayout />}>
            <Route path="/learn" element={<EducationDashboard />} />
            <Route path="/learn/modules/:id" element={<IntroToOptions />} />
          </Route>
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />

        {/* Other routes, no redirect */}
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
