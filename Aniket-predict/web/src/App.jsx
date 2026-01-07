import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Layouts
import MainLayout from './layouts/MainLayout';

// Auth Pages
import { LoginPage, SignUpPage, ForgotPasswordPage } from './pages/auth';

// Onboarding Pages
import { WelcomePage, BirthChartPage, CompleteProfilePage } from './pages/onboarding';

// Main Pages
import { DashboardPage } from './pages/dashboard';

// Placeholder Pages (to be implemented)
import PredictionsPage from './pages/PredictionsPage';
import BirthChartViewPage from './pages/BirthChartViewPage';
import IncomeForecastPage from './pages/IncomeForecastPage';
import HealthPage from './pages/HealthPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';

// Styles
import './styles/index.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, isOnboardingComplete } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="spinner spinner-lg" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If user hasn't completed onboarding, redirect to onboarding
  if (!isOnboardingComplete && !window.location.pathname.startsWith('/onboarding')) {
    return <Navigate to="/onboarding/welcome" replace />;
  }

  return children;
};

// Auth Route Component (redirects to dashboard if already logged in)
const AuthRoute = ({ children }) => {
  const { isAuthenticated, loading, isOnboardingComplete } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="spinner spinner-lg" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    if (!isOnboardingComplete) {
      return <Navigate to="/onboarding/welcome" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Onboarding Route Component
const OnboardingRoute = ({ children }) => {
  const { isAuthenticated, loading, isOnboardingComplete } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="spinner spinner-lg" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isOnboardingComplete) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public/Auth Routes */}
      <Route
        path="/login"
        element={
          <AuthRoute>
            <LoginPage />
          </AuthRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <AuthRoute>
            <SignUpPage />
          </AuthRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <AuthRoute>
            <ForgotPasswordPage />
          </AuthRoute>
        }
      />

      {/* Onboarding Routes */}
      <Route
        path="/onboarding/welcome"
        element={
          <OnboardingRoute>
            <WelcomePage />
          </OnboardingRoute>
        }
      />
      <Route
        path="/onboarding/birth-chart"
        element={
          <OnboardingRoute>
            <BirthChartPage />
          </OnboardingRoute>
        }
      />
      <Route
        path="/onboarding/complete-profile"
        element={
          <OnboardingRoute>
            <CompleteProfilePage />
          </OnboardingRoute>
        }
      />

      {/* Protected App Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="predictions" element={<PredictionsPage />} />
        <Route path="birth-chart" element={<BirthChartViewPage />} />
        <Route path="income" element={<IncomeForecastPage />} />
        <Route path="health" element={<HealthPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
