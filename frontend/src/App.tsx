import Dashboard from '@/app/dashboard/Dashboard';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, PublicRoute } from './components/common';
import {
  ForgotPassword,
  Login,
  Register,
  VerifyEmail,
  StockDetail,
  ResetPassword,
  Portfolio,
  PositionDetail,
  Transactions,
  Notifications,
  Welcome,
  Profile,
  Settings,
  Watchlist,
  Help,
  Leaderboard,
} from './pages';
import { ThemeProvider } from './components/ui/theme-provider';
import { Toaster } from './components/ui/sonner';
import { PageShell } from './components/layout/PageShell';
import { StockSearch } from './components/trading/StockSearch';
import LearnLayout from '@/app/education/LearnLayout';
import EducationDashboard from '@/app/education/EducationDashboard';
import ModuleRouter from '@/components/education/ModuleRouter';
import LockedModuleGuard from '@/components/education/LockedModuleGuard';
import NotFound from '@/pages/NotFound';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Routes>
        {/* Dev-only preview route so designers/devs can view the Welcome screen without logging in */}
        {import.meta.env.DEV && <Route path="/preview/welcome" element={<Welcome />} />}

        {/* Public routes */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* Unprotected utility routes */}
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/stock/:symbol" element={<StockDetail />} />
          <Route path="/stocks/:symbol" element={<StockDetail />} />
          <Route
            path="/search"
            element={
              <PageShell>
                <div className="max-w-2xl mx-auto space-y-6">
                  <div>
                    <h1 className="text-2xl font-bold">Search Stocks</h1>
                    <p className="text-sm text-gray-500 mt-1">Find stocks and trade options</p>
                  </div>
                  <StockSearch />
                </div>
              </PageShell>
            }
          />
          <Route path="/trade" element={<Navigate to="/stock/AAPL" replace />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/portfolio/positions/:positionId" element={<PositionDetail />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />
          {/* Learn section — uses LearnLayout with education header */}
          <Route element={<LearnLayout />}>
            <Route path="/learn" element={<EducationDashboard />} />
            <Route
              path="/learn/modules/:id"
              element={
                <LockedModuleGuard>
                  <ModuleRouter />
                </LockedModuleGuard>
              }
            />
          </Route>
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/help" element={<Help />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
