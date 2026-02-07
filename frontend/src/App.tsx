import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthGuard from '@/components/guards/AuthGuard';
import AdminGuard from '@/components/guards/AdminGuard';
import AppLayout from '@/components/layout/AppLayout';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import AdAccountPage from '@/pages/AdAccountPage';
import CampaignGroupPage from '@/pages/CampaignGroupPage';
import AdSetsPage from '@/pages/AdSetsPage';
import AdsPage from '@/pages/AdsPage';
import UsersPage from '@/pages/UsersPage';
import ProfilePage from '@/pages/ProfilePage';
import FacebookCallbackPage from '@/pages/FacebookCallbackPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<AuthGuard />}>
          <Route path="/facebook/callback" element={<FacebookCallbackPage />} />
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/accounts/:accountId" element={<AdAccountPage />} />
            <Route path="/accounts/:accountId/objective/:objective" element={<CampaignGroupPage />} />
            <Route path="/accounts/:accountId/campaigns/:campaignId/adsets" element={<AdSetsPage />} />
            <Route path="/adsets/:adsetId/ads" element={<AdsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route element={<AdminGuard />}>
              <Route path="/users" element={<UsersPage />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
