import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { SocketProvider } from "./context/SocketContext.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import SignInPage from "./pages/SignInPage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import DashboardLayout from "./pages/dashboard/DashboardLayout.jsx";
import OverviewPage from "./pages/dashboard/OverviewPage.jsx";
import NewTripPage from "./pages/dashboard/NewTripPage.jsx";
import TripDetailPage from "./pages/dashboard/TripDetailPage.jsx";
import TripsHistoryPage from "./pages/dashboard/TripsHistoryPage.jsx";
import TranslatePage from "./pages/dashboard/TranslatePage.jsx";
import SettingsPage from "./pages/dashboard/SettingsPage.jsx";
import SocialPage from "./pages/dashboard/SocialPage.jsx";
import "./styles/global.css";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/auth/signin" replace />;
  return children;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth">
                <Route path="signin" element={<SignInPage />} />
                <Route path="signup" element={<SignUpPage />} />
              </Route>
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="overview" replace />} />
                <Route path="overview" element={<OverviewPage />} />
                <Route path="trip">
                  <Route path="new" element={<NewTripPage />} />
                  <Route path=":tripId" element={<TripDetailPage />} />
                </Route>
                <Route path="trips">
                  <Route path="history" element={<TripsHistoryPage />} />
                </Route>
                <Route path="social" element={<SocialPage />} />
                <Route path="tools">
                  <Route path="translate" element={<TranslatePage />} />
                </Route>
                <Route path="settings" element={<SettingsPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

