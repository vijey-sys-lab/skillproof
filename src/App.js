// src/App.js
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LoadingPage } from "./components/ui";
import { DashboardLayout } from "./components/layout/Sidebar";
import "./styles/globals.css";

import { LandingPage } from "./pages/Landing";
import { LoginPage, SignupPage } from "./pages/Auth";
import { StudentDashboardHome, StudentProfile, StudentProjects, StudentSubmissions } from "./pages/StudentDashboard";
import { RecruiterHome, BrowseTalent, SavedCandidates, RecruiterJobs } from "./pages/RecruiterDashboard";
import { AdminHome, AdminUsers, AdminProjects, AdminScores, AdminSubmissions, AdminAnalytics } from "./pages/AdminDashboard";
import { PublicProfilePage, LeaderboardPage, JobsPage } from "./pages/PublicProfile";

const Protected = ({ children, roles }) => {
  const { user, userProfile, loading } = useAuth();
  if (loading) return <LoadingPage />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(userProfile?.role)) return <Navigate to="/" replace />;
  return children;
};

const GuestOnly = ({ children }) => {
  const { user, userProfile, loading } = useAuth();
  if (loading) return <LoadingPage />;
  if (user && userProfile) {
    const redirects = { student: "/dashboard", recruiter: "/recruiter", admin: "/admin" };
    return <Navigate to={redirects[userProfile.role] || "/dashboard"} replace />;
  }
  return children;
};

// ── HomeRoute: redirects logged-in users to their dashboard ──
const HomeRoute = () => {
  const { user, userProfile, loading } = useAuth();
  if (loading) return <LoadingPage />;
  if (user && userProfile) {
    const redirects = { student: "/dashboard", recruiter: "/recruiter", admin: "/admin" };
    return <Navigate to={redirects[userProfile.role] || "/dashboard"} replace />;
  }
  return <LandingPage />;
};

const WithSidebar = ({ children }) => <DashboardLayout>{children}</DashboardLayout>;

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeRoute />} />
      <Route path="/user/:username" element={<PublicProfilePage />} />
      <Route path="/leaderboard" element={<LeaderboardPage />} />
      <Route path="/jobs" element={<JobsPage />} />
      <Route path="/login" element={<GuestOnly><LoginPage /></GuestOnly>} />
      <Route path="/signup" element={<GuestOnly><SignupPage /></GuestOnly>} />

      <Route path="/dashboard" element={<Protected roles={["student"]}><WithSidebar><StudentDashboardHome /></WithSidebar></Protected>} />
      <Route path="/dashboard/profile" element={<Protected roles={["student"]}><WithSidebar><StudentProfile /></WithSidebar></Protected>} />
      <Route path="/dashboard/projects" element={<Protected roles={["student"]}><WithSidebar><StudentProjects /></WithSidebar></Protected>} />
      <Route path="/dashboard/submissions" element={<Protected roles={["student"]}><WithSidebar><StudentSubmissions /></WithSidebar></Protected>} />

      <Route path="/recruiter" element={<Protected roles={["recruiter"]}><WithSidebar><RecruiterHome /></WithSidebar></Protected>} />
      <Route path="/recruiter/browse" element={<Protected roles={["recruiter"]}><WithSidebar><BrowseTalent /></WithSidebar></Protected>} />
      <Route path="/recruiter/saved" element={<Protected roles={["recruiter"]}><WithSidebar><SavedCandidates /></WithSidebar></Protected>} />
      <Route path="/recruiter/jobs" element={<Protected roles={["recruiter"]}><WithSidebar><RecruiterJobs /></WithSidebar></Protected>} />

      <Route path="/admin" element={<Protected roles={["admin"]}><WithSidebar><AdminHome /></WithSidebar></Protected>} />
      <Route path="/admin/users" element={<Protected roles={["admin"]}><WithSidebar><AdminUsers /></WithSidebar></Protected>} />
      <Route path="/admin/projects" element={<Protected roles={["admin"]}><WithSidebar><AdminProjects /></WithSidebar></Protected>} />
      <Route path="/admin/scores" element={<Protected roles={["admin"]}><WithSidebar><AdminScores /></WithSidebar></Protected>} />
      <Route path="/admin/submissions" element={<Protected roles={["admin"]}><WithSidebar><AdminSubmissions /></WithSidebar></Protected>} />
      <Route path="/admin/analytics" element={<Protected roles={["admin"]}><WithSidebar><AdminAnalytics /></WithSidebar></Protected>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" toastOptions={{
          style: { fontFamily: "'Satoshi', sans-serif", fontSize: "14px", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", border: "1px solid #f1f5f9" },
          success: { iconTheme: { primary: "#10b981", secondary: "white" } },
          error: { iconTheme: { primary: "#ef4444", secondary: "white" } },
        }} />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
