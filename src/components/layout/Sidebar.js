// src/components/layout/Sidebar.js
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import {
  LayoutDashboard, User, FolderOpen, Trophy, Bookmark,
  Users, BarChart3, LogOut, Menu, X,
  Star, FileText, ChevronRight, Briefcase
} from "lucide-react";

const NAV = {
  student: [
    { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard" },
    { label: "My Profile", icon: User, to: "/dashboard/profile" },
    { label: "My Projects", icon: FolderOpen, to: "/dashboard/projects" },
    { label: "Submissions", icon: FileText, to: "/dashboard/submissions" },
    { label: "Jobs & Internships", icon: Briefcase, to: "/jobs" },
    { label: "Leaderboard", icon: Trophy, to: "/leaderboard" },
  ],
  recruiter: [
    { label: "Dashboard", icon: LayoutDashboard, to: "/recruiter" },
    { label: "Browse Talent", icon: Users, to: "/recruiter/browse" },
    { label: "Saved Candidates", icon: Bookmark, to: "/recruiter/saved" },
    { label: "My Job Posts", icon: Briefcase, to: "/recruiter/jobs" },
    { label: "Leaderboard", icon: Trophy, to: "/leaderboard" },
  ],
  admin: [
    { label: "Dashboard", icon: LayoutDashboard, to: "/admin" },
    { label: "All Users", icon: Users, to: "/admin/users" },
    { label: "Projects", icon: FolderOpen, to: "/admin/projects" },
    { label: "Submissions", icon: FileText, to: "/admin/submissions" },
    { label: "Skill Scores", icon: Star, to: "/admin/scores" },
    { label: "Analytics", icon: BarChart3, to: "/admin/analytics" },
  ],
};

export const Sidebar = () => {
  const { userProfile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems = NAV[userProfile?.role] || [];

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
      toast.success("Logged out successfully");
    } catch {
      toast.error("Logout failed");
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-surface-100">
        <Link to="/" className="flex items-center gap-2.5 group">
          <img src="/image/favicon.png" alt="SkillProof"
            className="w-9 h-9 rounded-xl object-cover shadow-sm group-hover:shadow-md transition-shadow" />
          <div>
            <span className="font-bold text-surface-900 text-sm font-display">SkillProof</span>
            <div className="text-xs text-surface-400 capitalize">{userProfile?.role} Portal</div>
          </div>
        </Link>
      </div>

      <div className="mx-3 my-3 p-3 rounded-xl bg-gradient-to-br from-surface-50 to-surface-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0">
            {userProfile?.photoURL ? (
              <img src={userProfile.photoURL} alt={userProfile.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-brand-400 to-accent-500 flex items-center justify-center text-white font-bold text-sm">
                {userProfile?.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-surface-800 truncate">{userProfile?.name}</p>
            <p className="text-xs text-surface-400 truncate">@{userProfile?.username}</p>
          </div>
          {userProfile?.role === "student" && userProfile?.skillScore !== undefined && (
            <div className="ml-auto flex-shrink-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold">
                {userProfile.skillScore}
              </div>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map(({ label, icon: Icon, to }) => {
          const isActive = location.pathname === to;
          return (
            <Link key={to} to={to} className={`sidebar-link ${isActive ? "active" : ""}`}
              onClick={() => setMobileOpen(false)}>
              <Icon size={16} />
              <span className="flex-1">{label}</span>
              {isActive && <ChevronRight size={14} className="opacity-50" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-surface-100 space-y-1">
        {userProfile?.role === "student" && (
          <Link to={`/user/${userProfile?.username}`} className="sidebar-link text-xs" target="_blank">
            <User size={14} /><span>View Resume Profile</span>
          </Link>
        )}
        <button onClick={handleLogout} className="sidebar-link w-full text-red-500 hover:bg-red-50">
          <LogOut size={16} /><span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button className="fixed top-4 left-4 z-50 w-10 h-10 rounded-xl bg-white shadow-md flex items-center justify-center md:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}>
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>
      {mobileOpen && <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={() => setMobileOpen(false)} />}
      <aside className={`sidebar ${mobileOpen ? "open" : ""}`} style={{ fontFamily: "'Satoshi', sans-serif" }}>
        <SidebarContent />
      </aside>
    </>
  );
};

export const DashboardLayout = ({ children }) => (
  <div className="dashboard-layout">
    <Sidebar />
    <main className="main-content">
      <div className="max-w-6xl mx-auto">{children}</div>
    </main>
  </div>
);