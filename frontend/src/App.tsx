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
  Transactions,
  // Welcome page shown once after first login
  Welcome,
} from './pages';
import { ThemeProvider } from './components/ui/theme-provider';
import { PageShell } from './components/layout/PageShell';
import { StockSearch } from './components/trading/StockSearch';
import { SettingsIcon, HelpCircleIcon } from 'lucide-react';
import LearnLayout from '@/app/education/LearnLayout';
import EducationDashboard from '@/app/education/EducationDashboard';
import IntroToOptions from '@/components/education/modules/IntroToOptions';

function PlaceholderPage({
  title,
  icon: Icon,
  description,
}: {
  title: string;
  icon: React.ElementType;
  description: string;
}) {
  return (
    <PageShell>
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Icon className="size-12 text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-500 text-sm max-w-md">{description}</p>
      </div>
    </PageShell>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Routes>
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
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/transactions" element={<Transactions />} />
          {/* Learn section — uses LearnLayout with education header */}
          <Route element={<LearnLayout />}>
            <Route path="/learn" element={<EducationDashboard />} />
            <Route path="/learn/modules/:id" element={<IntroToOptions />} />
          </Route>
          <Route
            path="/settings"
            element={
              <PlaceholderPage
                title="Settings"
                icon={SettingsIcon}
                description="Account settings and preferences will be available here."
              />
            }
          />
          <Route
            path="/help"
            element={
              <PlaceholderPage
                title="Help"
                icon={HelpCircleIcon}
                description="Need help? Contact your team or check the documentation."
              />
            }
          />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
