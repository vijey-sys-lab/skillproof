// src/pages/AdminDashboard.js
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  StatCard, SkillTag, ScoreBadge, Avatar, EmptyState,
  Spinner, StatusBadge, Modal
} from "../components/ui";
import {
  getAllUsers, getAllProjects, updateProject, setSkillScore,
  toggleUserStatus, getAllSubmissions
} from "../lib/db";
import toast from "react-hot-toast";
import {
  Users, FolderOpen, Star, CheckCircle, XCircle,
  Edit3, BarChart3, FileText, Shield
} from "lucide-react";

// ─── Admin Home ───────────────────────────────────────────────────────────────
export const AdminHome = () => {
  const [stats, setStats] = useState({ users: 0, projects: 0, pending: 0, approved: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAllUsers(), getAllProjects()]).then(([users, projects]) => {
      setStats({
        users: users.length,
        projects: projects.length,
        pending: projects.filter((p) => p.status === "pending").length,
        approved: projects.filter((p) => p.status === "approved").length,
      });
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size={28} /></div>;

  return (
    <div className="animate-fade-in">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Admin Panel</h1>
          <p className="page-subtitle">Manage users, projects, and scores</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg">
          <Shield size={14} className="text-red-500" />
          <span className="text-xs font-semibold text-red-600">Admin Access</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Users" value={stats.users} icon={Users} color="blue" />
        <StatCard label="Total Projects" value={stats.projects} icon={FolderOpen} color="purple" />
        <StatCard label="Pending Review" value={stats.pending} icon={Star} color="orange" />
        <StatCard label="Approved" value={stats.approved} icon={CheckCircle} color="green" />
      </div>

      {stats.pending > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
            <Star size={18} />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-amber-800 text-sm">{stats.pending} projects waiting for review</p>
            <p className="text-xs text-amber-600">Review and approve or reject student project submissions</p>
          </div>
          <a href="/admin/projects" className="btn-primary text-xs py-2 px-3">Review Now</a>
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { icon: Users, color: "bg-blue-50 text-blue-600", label: "Manage Users", to: "/admin/users", desc: "View and manage all user accounts" },
          { icon: FolderOpen, color: "bg-purple-50 text-purple-600", label: "Review Projects", to: "/admin/projects", desc: "Approve or reject project submissions" },
          { icon: Star, color: "bg-amber-50 text-amber-600", label: "Assign Scores", to: "/admin/scores", desc: "Set Skill Scores for students" },
        ].map(({ icon: Icon, color, label, to, desc }) => (
          <a key={to} href={to} className="card card-interactive p-5 block">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
              <Icon size={18} />
            </div>
            <h3 className="font-semibold text-surface-800 text-sm mb-1">{label}</h3>
            <p className="text-xs text-surface-500">{desc}</p>
          </a>
        ))}
      </div>
    </div>
  );
};

// ─── Users Management ─────────────────────────────────────────────────────────
export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    getAllUsers().then((u) => { setUsers(u); setLoading(false); });
  }, []);

  const handleToggle = async (user) => {
    try {
      await toggleUserStatus(user.id, !user.isActive);
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, isActive: !u.isActive } : u));
      toast.success(`User ${user.isActive ? "deactivated" : "activated"}`);
    } catch { toast.error("Failed to update user"); }
  };

  const filtered = users.filter((u) => {
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const matchSearch = !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  if (loading) return <div className="flex justify-center py-20"><Spinner size={28} /></div>;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">All Users</h1>
        <p className="page-subtitle">{filtered.length} users</p>
      </div>

      <div className="card mb-5">
        <div className="p-4 border-b border-surface-100 flex gap-3 flex-wrap">
          <input className="input flex-1 min-w-[200px]" placeholder="Search by name or email..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="input w-[140px]" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="recruiter">Recruiters</option>
            <option value="admin">Admins</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-50 border-b border-surface-100">
                {["User", "Role", "Skills", "Score", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wide px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-surface-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl overflow-hidden flex-shrink-0">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-brand-400 to-accent-500 flex items-center justify-center text-white font-bold text-xs">
                            {user.name?.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-surface-900">{user.name}</p>
                        <p className="text-xs text-surface-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`status-badge ${
                      user.role === "admin" ? "status-rejected" :
                      user.role === "recruiter" ? "status-pending" : "status-approved"
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1 max-w-[160px]">
                      {user.skills?.slice(0, 2).map((s) => (
                        <SkillTag key={s} skill={s} size="sm" />
                      ))}
                      {(user.skills?.length || 0) > 2 && (
                        <span className="text-xs text-surface-400">+{user.skills.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {user.role === "student" && <ScoreBadge score={user.skillScore || 0} size="sm" />}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`status-badge ${user.isActive ? "status-approved" : "status-rejected"}`}>
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {user.role === "student" && (
                        <a href={`/user/${user.username}`} target="_blank" rel="noreferrer"
                          className="text-xs text-brand-500 hover:text-brand-700 font-medium">
                          View
                        </a>
                      )}
                      <button
                        onClick={() => handleToggle(user)}
                        className={`text-xs font-medium ${user.isActive ? "text-red-500 hover:text-red-700" : "text-green-600 hover:text-green-800"}`}
                      >
                        {user.isActive ? "Disable" : "Enable"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-surface-400 text-sm">No users found</div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Projects Review ──────────────────────────────────────────────────────────
export const AdminProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");

  useEffect(() => {
    getAllProjects().then((p) => { setProjects(p); setLoading(false); });
  }, []);

  const handleAction = async (projectId, status) => {
    try {
      await updateProject(projectId, { status });
      setProjects((prev) => prev.map((p) => p.id === projectId ? { ...p, status } : p));
      toast.success(status === "approved" ? "Project approved ✓" : "Project rejected");
    } catch { toast.error("Failed to update"); }
  };

  const filtered = filter === "all" ? projects : projects.filter((p) => p.status === filter);

  if (loading) return <div className="flex justify-center py-20"><Spinner size={28} /></div>;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Project Review</h1>
        <p className="page-subtitle">Review and approve student project submissions</p>
      </div>

      <div className="flex gap-2 mb-5 flex-wrap">
        {["all", "pending", "approved", "rejected"].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              filter === f ? "bg-brand-500 text-white" : "bg-white border border-surface-200 text-surface-600 hover:bg-surface-50"
            }`}>
            {f} ({f === "all" ? projects.length : projects.filter((p) => p.status === f).length})
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((project) => (
          <div key={project.id} className="card p-5">
            <div className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-surface-900">{project.title}</h3>
                  <StatusBadge status={project.status} />
                </div>
                <p className="text-sm text-surface-600 mb-2">{project.description}</p>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {project.techStack?.map((t) => <SkillTag key={t} skill={t} size="sm" />)}
                </div>
                <div className="flex items-center gap-4 text-xs text-surface-400">
                  <span>By: <strong className="text-surface-600">{project.authorName}</strong></span>
                  {project.link && (
                    <a href={project.link} target="_blank" rel="noreferrer" className="text-brand-500 hover:underline">
                      Live Demo ↗
                    </a>
                  )}
                  {project.github && (
                    <a href={project.github} target="_blank" rel="noreferrer" className="text-surface-500 hover:underline">
                      GitHub ↗
                    </a>
                  )}
                </div>
              </div>

              {project.status === "pending" && (
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => handleAction(project.id, "approved")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-xs font-semibold hover:bg-green-100 transition-colors border border-green-200">
                    <CheckCircle size={13} /> Approve
                  </button>
                  <button onClick={() => handleAction(project.id, "rejected")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors border border-red-200">
                    <XCircle size={13} /> Reject
                  </button>
                </div>
              )}

              {project.status !== "pending" && (
                <button onClick={() => handleAction(project.id, "pending")}
                  className="text-xs text-surface-400 hover:text-surface-600 flex-shrink-0">
                  Reset to Pending
                </button>
              )}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <EmptyState icon={FolderOpen} title={`No ${filter} projects`} description="Nothing here right now" />
        )}
      </div>
    </div>
  );
};

// ─── Skill Scores ─────────────────────────────────────────────────────────────
export const AdminScores = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(null);
  const [scoreForm, setScoreForm] = useState({ score: 0, note: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAllUsers().then((u) => {
      setStudents(u.filter((u) => u.role === "student"));
      setLoading(false);
    });
  }, []);

  const openEdit = (student) => {
    setEditModal(student);
    setScoreForm({ score: student.skillScore || 0, note: student.scoreNote || "" });
  };

  const handleSaveScore = async () => {
    if (scoreForm.score < 0 || scoreForm.score > 100) return toast.error("Score must be 0-100");
    setSaving(true);
    try {
      await setSkillScore(editModal.id, Number(scoreForm.score), scoreForm.note);
      setStudents((prev) =>
        prev.map((s) => s.id === editModal.id
          ? { ...s, skillScore: Number(scoreForm.score), scoreNote: scoreForm.note }
          : s)
      );
      toast.success(`Score updated to ${scoreForm.score}! ✓`);
      setEditModal(null);
    } catch { toast.error("Failed to update score"); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size={28} /></div>;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Skill Scores</h1>
        <p className="page-subtitle">Assign and manage student Skill Scores</p>
      </div>

      <div className="card p-4 mb-5 bg-blue-50 border-blue-100 text-sm text-blue-700">
        💡 Skill Scores (0–100) are manually assigned after reviewing a student's projects and submissions.
        Score ranges: <strong>80-100</strong> = Exceptional, <strong>60-79</strong> = Good, <strong>40-59</strong> = Average, <strong>0-39</strong> = Beginner
      </div>

      <div className="space-y-3">
        {students
          .sort((a, b) => (b.skillScore || 0) - (a.skillScore || 0))
          .map((student) => (
            <div key={student.id} className="card p-4 flex items-center gap-4">
              <ScoreBadge score={student.skillScore || 0} />
              <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
                {student.photoURL ? (
                  <img src={student.photoURL} alt={student.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-brand-400 to-accent-500 flex items-center justify-center text-white font-bold text-sm">
                    {student.name?.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-surface-900 text-sm">{student.name}</p>
                <p className="text-xs text-surface-400">@{student.username}</p>
                {student.skills?.length > 0 && (
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {student.skills.slice(0, 3).map((s) => <SkillTag key={s} skill={s} size="sm" />)}
                  </div>
                )}
              </div>
              {student.scoreNote && (
                <div className="hidden sm:block max-w-xs">
                  <p className="text-xs text-surface-500 line-clamp-2 italic">"{student.scoreNote}"</p>
                </div>
              )}
              <button onClick={() => openEdit(student)} className="btn-secondary text-xs py-2 px-3 flex-shrink-0">
                <Edit3 size={13} /> Edit Score
              </button>
            </div>
          ))}
      </div>

      <Modal isOpen={!!editModal} onClose={() => setEditModal(null)}
        title={`Set Score — ${editModal?.name}`} size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-2">Skill Score (0–100)</label>
            <input type="number" min={0} max={100} className="input text-center text-2xl font-bold font-display"
              value={scoreForm.score} onChange={(e) => setScoreForm({ ...scoreForm, score: e.target.value })} />
            <div className="flex justify-between mt-2">
              {[0, 25, 50, 75, 100].map((v) => (
                <button key={v} type="button" onClick={() => setScoreForm({ ...scoreForm, score: v })}
                  className="text-xs px-2 py-1 rounded-lg bg-surface-100 hover:bg-surface-200 text-surface-600 transition-colors">
                  {v}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Admin Note (optional)</label>
            <textarea className="input" rows={3} placeholder="Feedback for the student..."
              value={scoreForm.note} onChange={(e) => setScoreForm({ ...scoreForm, note: e.target.value })} />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setEditModal(null)} className="btn-secondary text-sm">Cancel</button>
            <button onClick={handleSaveScore} className="btn-primary" disabled={saving}>
              {saving ? <Spinner size={14} /> : `Save Score: ${scoreForm.score}`}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ─── Admin Submissions ────────────────────────────────────────────────────────
export const AdminSubmissions = () => {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllSubmissions().then((s) => { setSubs(s); setLoading(false); });
  }, []);

  const handleAction = async (subId, status) => {
    setSubs((prev) => prev.map((s) => s.id === subId ? { ...s, status } : s));
    toast.success(status === "approved" ? "Submission approved" : "Submission rejected");
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size={28} /></div>;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Submissions</h1>
        <p className="page-subtitle">{subs.length} task submissions</p>
      </div>

      <div className="space-y-3">
        {subs.map((sub) => (
          <div key={sub.id} className="card p-5 flex items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-surface-900 text-sm">{sub.title}</h3>
                <StatusBadge status={sub.status} />
              </div>
              <p className="text-xs text-surface-500 mb-1">By: {sub.authorName}</p>
              {sub.taskDescription && <p className="text-xs text-surface-600">{sub.taskDescription}</p>}
              {sub.submissionUrl && (
                <a href={sub.submissionUrl} target="_blank" rel="noreferrer"
                  className="text-xs text-brand-500 hover:underline mt-1 block">
                  View Submission ↗
                </a>
              )}
            </div>
            {sub.status === "pending" && (
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => handleAction(sub.id, "approved")}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-xs font-semibold border border-green-200">
                  <CheckCircle size={12} /> Approve
                </button>
                <button onClick={() => handleAction(sub.id, "rejected")}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold border border-red-200">
                  <XCircle size={12} /> Reject
                </button>
              </div>
            )}
          </div>
        ))}
        {subs.length === 0 && <EmptyState icon={FileText} title="No submissions yet" description="Students haven't submitted any tasks yet" />}
      </div>
    </div>
  );
};

// ─── Analytics ────────────────────────────────────────────────────────────────
export const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAllUsers(), getAllProjects()]).then(([users, projects]) => {
      const students = users.filter((u) => u.role === "student");
      const recruiters = users.filter((u) => u.role === "recruiter");

      const scoreDist = { "0-20": 0, "21-40": 0, "41-60": 0, "61-80": 0, "81-100": 0 };
      students.forEach((s) => {
        const score = s.skillScore || 0;
        if (score <= 20) scoreDist["0-20"]++;
        else if (score <= 40) scoreDist["21-40"]++;
        else if (score <= 60) scoreDist["41-60"]++;
        else if (score <= 80) scoreDist["61-80"]++;
        else scoreDist["81-100"]++;
      });

      const skillCount = {};
      students.forEach((s) => {
        s.skills?.forEach((sk) => { skillCount[sk] = (skillCount[sk] || 0) + 1; });
      });
      const topSkills = Object.entries(skillCount).sort((a, b) => b[1] - a[1]).slice(0, 8);

      const approved = projects.filter((p) => p.status === "approved").length;
      const pending = projects.filter((p) => p.status === "pending").length;
      const rejected = projects.filter((p) => p.status === "rejected").length;
      const avgScore = students.length
        ? Math.round(students.reduce((sum, s) => sum + (s.skillScore || 0), 0) / students.length)
        : 0;

      setData({ students, recruiters, scoreDist, topSkills, approved, pending, rejected, avgScore, total: users.length });
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size={28} /></div>;

  const maxSkillCount = data.topSkills[0]?.[1] || 1;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">Platform overview and insights</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Users" value={data.total} icon={Users} color="blue" />
        <StatCard label="Students" value={data.students.length} icon={Star} color="purple" />
        <StatCard label="Recruiters" value={data.recruiters.length} icon={Users} color="green" />
        <StatCard label="Avg Skill Score" value={data.avgScore} icon={BarChart3} color="orange" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Score Distribution */}
        <div className="card p-6">
          <h3 className="font-bold text-surface-900 mb-4 font-display">Score Distribution</h3>
          <div className="space-y-3">
            {Object.entries(data.scoreDist).map(([range, count]) => {
              const pct = data.students.length ? Math.round((count / data.students.length) * 100) : 0;
              const colors = { "0-20": "bg-rose-400", "21-40": "bg-orange-400", "41-60": "bg-amber-400", "61-80": "bg-sky-400", "81-100": "bg-emerald-500" };
              return (
                <div key={range}>
                  <div className="flex justify-between text-xs text-surface-600 mb-1">
                    <span className="font-medium">Score {range}</span>
                    <span>{count} students ({pct}%)</span>
                  </div>
                  <div className="h-2.5 bg-surface-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${colors[range]}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Project Stats */}
        <div className="card p-6">
          <h3 className="font-bold text-surface-900 mb-4 font-display">Project Overview</h3>
          <div className="space-y-4">
            {[
              { label: "Approved", count: data.approved, color: "bg-emerald-500", textColor: "text-emerald-700", bg: "bg-emerald-50" },
              { label: "Pending Review", count: data.pending, color: "bg-amber-400", textColor: "text-amber-700", bg: "bg-amber-50" },
              { label: "Rejected", count: data.rejected, color: "bg-rose-400", textColor: "text-rose-700", bg: "bg-rose-50" },
            ].map(({ label, count, color, textColor, bg }) => {
              const total = data.approved + data.pending + data.rejected || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={label} className={`p-3 rounded-xl ${bg} flex items-center gap-3`}>
                  <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center text-white font-bold text-sm`}>
                    {count}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${textColor}`}>{label}</p>
                    <div className="h-1.5 bg-white/60 rounded-full mt-1 overflow-hidden">
                      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${textColor}`}>{pct}%</span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-surface-100">
            <p className="text-xs text-surface-500 text-center">
              Total: {data.approved + data.pending + data.rejected} projects submitted
            </p>
          </div>
        </div>
      </div>

      {/* Top Skills */}
      <div className="card p-6 mb-6">
        <h3 className="font-bold text-surface-900 mb-4 font-display">Most Popular Skills</h3>
        {data.topSkills.length === 0 ? (
          <p className="text-sm text-surface-400 text-center py-4">No skills data yet — students need to add skills to their profiles</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.topSkills.map(([skill, count], i) => {
              const pct = Math.round((count / maxSkillCount) * 100);
              const colors = ["bg-sky-500", "bg-violet-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500", "bg-indigo-500", "bg-teal-500", "bg-orange-500"];
              return (
                <div key={skill} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${colors[i % colors.length]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                    #{i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-surface-800 font-mono">{skill}</span>
                      <span className="text-xs text-surface-500">{count} students</span>
                    </div>
                    <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${colors[i % colors.length]} opacity-70`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          {
            label: "Platform Health",
            value: data.students.length > 0 ? "Active" : "New",
            desc: `${data.students.length} students, ${data.recruiters.length} recruiters`,
            color: "text-emerald-600", bg: "bg-emerald-50",
          },
          {
            label: "Avg Skill Score",
            value: `${data.avgScore}/100`,
            desc: data.avgScore >= 60 ? "Above average talent pool" : "Talent pool growing",
            color: "text-sky-600", bg: "bg-sky-50",
          },
          {
            label: "Approval Rate",
            value: data.approved + data.rejected > 0
              ? `${Math.round((data.approved / (data.approved + data.rejected)) * 100)}%`
              : "N/A",
            desc: `${data.approved} approved of ${data.approved + data.rejected} reviewed`,
            color: "text-violet-600", bg: "bg-violet-50",
          },
        ].map(({ label, value, desc, color, bg }) => (
          <div key={label} className={`card p-5 ${bg} border-0`}>
            <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1">{label}</p>
            <p className={`text-2xl font-bold font-display ${color}`}>{value}</p>
            <p className="text-xs text-surface-500 mt-1">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};