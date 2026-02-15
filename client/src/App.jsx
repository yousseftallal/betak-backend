import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { lazy } from 'react'; // Added lazy import

import DashboardHome from './pages/DashboardHome';
import UsersPage from './pages/UsersPage';
import CreatorsPage from './pages/CreatorsPage';
import VideosPage from './pages/VideosPage';
const FinancePage = lazy(() => import('./pages/FinancePage'));
const MusicPage = lazy(() => import('./pages/MusicPage'));
const LiveMonitorPage = lazy(() => import('./pages/LiveMonitorPage'));
const AutoModerationPage = lazy(() => import('./pages/AutoModerationPage'));
const VerificationPage = lazy(() => import('./pages/VerificationPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const SupportPage = lazy(() => import('./pages/SupportPage'));
// const VideosPage = () => <div className="text-white">Videos Page (Coming Soon)</div>;
import ReportsPage from './pages/ReportsPage';
import ActivityLogsPage from './pages/ActivityLogsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import RevenuePage from './pages/RevenuePage';
import SettingsPage from './pages/SettingsPage';
import AdminsPage from './pages/AdminsPage';
const AdminRolesPage = lazy(() => import('./pages/AdminRolesPage'));
import UserHome from './pages/UserHome';
import ProfilePage from './pages/ProfilePage';
const GeographicPage = lazy(() => import('./pages/GeographicPage'));
const BadgesPage = lazy(() => import('./pages/BadgesPage'));
const AdsPage = lazy(() => import('./pages/AdsPage'));
const SafetyPage = lazy(() => import('./pages/SafetyPage'));
const CampaignsPage = lazy(() => import('./pages/CampaignsPage'));
const SystemHealthPage = lazy(() => import('./pages/SystemHealthPage'));

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Routes>
          <Route path="/" element={<UserHome />} />
          <Route path="/login" element={<LoginPage />} />

          <Route path="/@:username" element={<ProfilePage />} />

          <Route path="/admin" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<DashboardHome />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="creators" element={<CreatorsPage />} />
            <Route path="videos" element={<VideosPage />} />
            <Route path="live" element={<LiveMonitorPage />} />
            <Route path="moderation" element={<AutoModerationPage />} /> {/* New Route */}
            <Route path="verification" element={<VerificationPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="support" element={<SupportPage />} />
            <Route path="music" element={<MusicPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="logs" element={<ActivityLogsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="revenue" element={<RevenuePage />} />
            <Route path="financial" element={<FinancePage />} />
            <Route path="admins" element={<AdminsPage />} />
            <Route path="roles" element={<AdminRolesPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="geographic" element={<GeographicPage />} />
            <Route path="badges" element={<BadgesPage />} />
            <Route path="ads" element={<AdsPage />} />
            <Route path="safety" element={<SafetyPage />} />
            <Route path="campaigns" element={<CampaignsPage />} />
            <Route path="health" element={<SystemHealthPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
