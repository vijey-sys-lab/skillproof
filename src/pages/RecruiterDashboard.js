// src/pages/RecruiterDashboard.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { StatCard, SkillTag, ScoreBadge, Avatar, EmptyState, Spinner, Modal } from "../components/ui";
import {
  getAllStudents, bookmarkCandidate, unbookmarkCandidate,
  getBookmarkedStudents, getRecruiterJobs, addJob, updateJob, deleteJob
} from "../lib/db";
import toast from "react-hot-toast";
import {
  Users, Bookmark, Search, Star, ExternalLink, X,
  Briefcase, Plus, MapPin, Clock, Trash2, Edit3
} from "lucide-react";

const POPULAR_SKILLS = ["React", "Python", "Node.js", "UI/UX", "TypeScript", "Vue", "Django", "Flutter", "AWS", "ML/AI", "Go", "Rust"];

// ─── Recruiter Home ───────────────────────────────────────────────────────────
export const RecruiterHome = () => {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState({ total: 0, bookmarks: 0, jobs: 0 });

  useEffect(() => {
    Promise.all([
      getAllStudents(),
      getRecruiterJobs(userProfile?.id || ""),
    ]).then(([s, j]) => {
      setStats({ total: s.length, bookmarks: userProfile?.bookmarks?.length || 0, jobs: j.length });
    });
  }, [userProfile]);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Recruiter Dashboard</h1>
        <p className="page-subtitle">Find verified talent and manage your job postings</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Students" value={stats.total} icon={Users} color="blue" />
        <StatCard label="Saved Candidates" value={stats.bookmarks} icon={Bookmark} color="purple" />
        <StatCard label="Active Job Posts" value={stats.jobs} icon={Briefcase} color="green" />
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div className="card p-6 bg-gradient-to-br from-brand-50 to-accent-50 border-brand-100">
          <div className="flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center text-white">
              <Search size={18} />
            </div>
            <h3 className="font-bold text-surface-900 font-display">Browse Talent</h3>
            <p className="text-sm text-surface-500">Filter by skills, view portfolios and resume profiles</p>
            <Link to="/recruiter/browse" className="btn-primary text-sm self-start">Browse Now →</Link>
          </div>
        </div>
        <div className="card p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
          <div className="flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
              <Briefcase size={18} />
            </div>
            <h3 className="font-bold text-surface-900 font-display">Post a Job</h3>
            <p className="text-sm text-surface-500">Post job openings and internships for students</p>
            <Link to="/recruiter/jobs" className="btn-secondary text-sm self-start border-emerald-200 text-emerald-700">Manage Jobs →</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Browse Talent ────────────────────────────────────────────────────────────
export const BrowseTalent = () => {
  const { userProfile, refreshProfile } = useAuth();
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [sortBy, setSortBy] = useState("score");

  useEffect(() => {
    getAllStudents().then((s) => { setStudents(s); setFiltered(s); setLoading(false); });
  }, []);

  useEffect(() => {
    let result = [...students];
    if (search) {
      result = result.filter((s) =>
        s.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.bio?.toLowerCase().includes(search.toLowerCase()) ||
        s.skills?.some((sk) => sk.toLowerCase().includes(search.toLowerCase()))
      );
    }
    if (selectedSkills.length > 0) {
      result = result.filter((s) =>
        selectedSkills.some((sk) =>
          s.skills?.some((skill) => skill.toLowerCase().includes(sk.toLowerCase()))
        )
      );
    }
    if (sortBy === "score") result.sort((a, b) => (b.skillScore || 0) - (a.skillScore || 0));
    else if (sortBy === "name") result.sort((a, b) => a.name?.localeCompare(b.name));
    setFiltered(result);
  }, [search, selectedSkills, sortBy, students]);

  const toggleSkill = (skill) => {
    setSelectedSkills((prev) => prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]);
  };

  const toggleBookmark = async (studentId) => {
    const isBookmarked = userProfile?.bookmarks?.includes(studentId);
    try {
      if (isBookmarked) {
        await unbookmarkCandidate(userProfile.id, studentId);
        toast.success("Removed from saved");
      } else {
        await bookmarkCandidate(userProfile.id, studentId);
        toast.success("Candidate saved! ✓");
      }
      await refreshProfile();
    } catch {
      toast.error("Failed to update bookmark");
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size={28} /></div>;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Browse Talent</h1>
        <p className="page-subtitle">{filtered.length} verified students</p>
      </div>

      <div className="card p-4 mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input type="text" className="input pl-9" placeholder="Search by name, skill, or bio..."
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="input max-w-[160px]" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="score">Sort: Skill Score</option>
            <option value="name">Sort: Name</option>
          </select>
        </div>

        <div>
          <p className="text-xs font-medium text-surface-500 mb-2">Filter by skill:</p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_SKILLS.map((skill) => (
              <button key={skill} onClick={() => toggleSkill(skill)}
                className={`skill-tag cursor-pointer transition-all ${
                  selectedSkills.includes(skill) ? "skill-tag-blue ring-2 ring-brand-400" : "skill-tag-blue opacity-60 hover:opacity-100"
                }`}>
                {skill}
              </button>
            ))}
          </div>
        </div>

        {selectedSkills.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-surface-500">Active filters:</span>
            {selectedSkills.map((s) => (
              <span key={s} className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-50 text-brand-700 rounded-lg text-xs font-medium">
                {s} <button onClick={() => toggleSkill(s)}><X size={10} /></button>
              </span>
            ))}
            <button onClick={() => setSelectedSkills([])} className="text-xs text-red-500">Clear all</button>
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Users} title="No students found" description="Try adjusting your filters" />
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((student) => {
            const isBookmarked = userProfile?.bookmarks?.includes(student.id);
            return (
              <div key={student.id} className="card card-interactive p-5 relative">
                <button onClick={() => toggleBookmark(student.id)}
                  className={`absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    isBookmarked ? "bg-brand-100 text-brand-600" : "bg-surface-50 text-surface-400 hover:bg-brand-50 hover:text-brand-500"
                  }`}>
                  <Bookmark size={15} fill={isBookmarked ? "currentColor" : "none"} />
                </button>

                <div className="flex items-start gap-3 mb-3 pr-8">
                  <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0">
                    {student.photoURL ? (
                      <img src={student.photoURL} alt={student.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-brand-400 to-accent-500 flex items-center justify-center text-white font-bold text-sm font-display">
                        {student.name?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-surface-900 text-sm truncate">{student.name}</h3>
                    <p className="text-xs text-surface-400">@{student.username}</p>
                    {student.location && <p className="text-xs text-surface-400">📍 {student.location}</p>}
                  </div>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${
                    student.skillScore >= 80 ? "bg-emerald-500" :
                    student.skillScore >= 60 ? "bg-sky-500" :
                    student.skillScore >= 40 ? "bg-amber-500" : "bg-rose-400"
                  }`}>
                    {student.skillScore || 0}
                  </div>
                </div>

                {student.bio && <p className="text-xs text-surface-500 line-clamp-2 mb-3">{student.bio}</p>}

                {student.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {student.skills.slice(0, 4).map((s) => <SkillTag key={s} skill={s} size="sm" />)}
                    {student.skills.length > 4 && <span className="text-xs text-surface-400">+{student.skills.length - 4}</span>}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-3 border-t border-surface-100">
                  <Link to={`/user/${student.username}`} target="_blank"
                    className="btn-primary text-xs py-1.5 px-3 flex-1 justify-center">
                    View Resume
                  </Link>
                  {student.github && (
                    <a href={student.github} target="_blank" rel="noreferrer" className="btn-secondary text-xs py-1.5 px-3">
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Saved Candidates ─────────────────────────────────────────────────────────
export const SavedCandidates = () => {
  const { userProfile, refreshProfile } = useAuth();
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBookmarkedStudents(userProfile?.bookmarks || []).then((s) => { setSaved(s); setLoading(false); });
  }, [userProfile]);

  const removeBookmark = async (studentId) => {
    await unbookmarkCandidate(userProfile.id, studentId);
    await refreshProfile();
    setSaved((prev) => prev.filter((s) => s.id !== studentId));
    toast.success("Removed from saved");
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size={28} /></div>;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Saved Candidates</h1>
        <p className="page-subtitle">{saved.length} bookmarked candidates</p>
      </div>

      {saved.length === 0 ? (
        <EmptyState icon={Bookmark} title="No saved candidates"
          description="Browse the talent pool and bookmark candidates"
          action={<Link to="/recruiter/browse" className="btn-primary text-sm">Browse Talent →</Link>} />
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {saved.map((student) => (
            <div key={student.id} className="card p-5 relative">
              <button onClick={() => removeBookmark(student.id)}
                className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center bg-brand-100 text-brand-600">
                <Bookmark size={15} fill="currentColor" />
              </button>
              <div className="flex items-center gap-3 mb-3 pr-8">
                <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0">
                  {student.photoURL ? (
                    <img src={student.photoURL} alt={student.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-brand-400 to-accent-500 flex items-center justify-center text-white font-bold text-sm font-display">
                      {student.name?.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-surface-900 text-sm">{student.name}</p>
                  <p className="text-xs text-surface-400">@{student.username}</p>
                </div>
              </div>
              <Link to={`/user/${student.username}`} target="_blank" className="btn-primary w-full text-xs py-1.5 justify-center flex">
                View Resume →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Manage Jobs ──────────────────────────────────────────────────────────────
export const RecruiterJobs = () => {
  const { userProfile } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editJob, setEditJob] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "", company: "", location: "", type: "full-time",
    description: "", skills: [], salary: "", deadline: ""
  });

  const fetchJobs = async () => {
    const j = await getRecruiterJobs(userProfile?.id);
    setJobs(j);
    setLoading(false);
  };

  useEffect(() => { if (userProfile?.id) fetchJobs(); }, [userProfile]);

  const openAdd = () => {
    setEditJob(null);
    setForm({ title: "", company: userProfile?.company || "", location: "", type: "full-time", description: "", skills: [], salary: "", deadline: "" });
    setModalOpen(true);
  };

  const openEdit = (job) => {
    setEditJob(job);
    setForm({ title: job.title, company: job.company, location: job.location || "", type: job.type || "full-time", description: job.description || "", skills: job.skills || [], salary: job.salary || "", deadline: job.deadline || "" });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title || !form.company) return toast.error("Title and company required");
    setSaving(true);
    try {
      if (editJob) {
        await updateJob(editJob.id, form);
        toast.success("Job updated!");
      } else {
        await addJob({ ...form, recruiterId: userProfile.id, recruiterName: userProfile.name });
        toast.success("Job posted! 🎉");
      }
      setModalOpen(false);
      await fetchJobs();
    } catch {
      toast.error("Failed to save job");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm("Delete this job posting?")) return;
    await deleteJob(jobId);
    await fetchJobs();
    toast.success("Job deleted");
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size={28} /></div>;

  return (
    <div className="animate-fade-in">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">My Job Postings</h1>
          <p className="page-subtitle">{jobs.length} active postings</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus size={16} /> Post a Job
        </button>
      </div>

      <div className="space-y-4">
        {jobs.map((job) => (
          <div key={job.id} className="card p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-bold text-surface-900">{job.title}</h3>
                <p className="text-sm text-surface-600">{job.company}</p>
                <div className="flex flex-wrap gap-3 mt-2 text-xs text-surface-500">
                  {job.location && <span>📍 {job.location}</span>}
                  {job.type && <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">{job.type}</span>}
                  {job.salary && <span className="text-emerald-600">💰 {job.salary}</span>}
                  <span className="text-surface-400">{job.applicants?.length || 0} applicants</span>
                </div>
                {job.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {job.skills.map((s) => <SkillTag key={s} skill={s} size="sm" />)}
                  </div>
                )}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => openEdit(job)} className="btn-secondary text-xs py-1.5 px-3">
                  <Edit3 size={12} /> Edit
                </button>
                <button onClick={() => handleDelete(job.id)} className="btn-danger text-xs py-1.5 px-3">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {jobs.length === 0 && (
          <EmptyState icon={Briefcase} title="No job postings yet"
            description="Post your first job or internship to find the right candidates"
            action={<button onClick={openAdd} className="btn-primary text-sm"><Plus size={14} /> Post a Job</button>} />
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}
        title={editJob ? "Edit Job" : "Post a Job"} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Job Title *</label>
              <input className="input" placeholder="Frontend Developer" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Company *</label>
              <input className="input" placeholder="Acme Corp" value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Location</label>
              <input className="input" placeholder="Chennai / Remote" value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Type</label>
              <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="full-time">Full-time</option>
                <option value="internship">Internship</option>
                <option value="part-time">Part-time</option>
                <option value="remote">Remote</option>
                <option value="contract">Contract</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Salary / Stipend</label>
              <input className="input" placeholder="₹30,000/month or ₹5 LPA" value={form.salary}
                onChange={(e) => setForm({ ...form, salary: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Application Deadline</label>
              <input className="input" type="date" value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Job Description</label>
            <textarea className="input" rows={3} placeholder="Describe the role, responsibilities, requirements..."
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Required Skills</label>
            <div className="border rounded-xl p-3" style={{ border: "1.5px solid #e2e8f0" }}>
              <div className="flex flex-wrap gap-2 mb-2">
                {form.skills.map((s) => (
                  <span key={s} className="skill-tag skill-tag-blue">
                    {s}
                    <button type="button" onClick={() => setForm({ ...form, skills: form.skills.filter((sk) => sk !== s) })}
                      className="ml-1 opacity-60 hover:opacity-100">×</button>
                  </span>
                ))}
              </div>
              <input className="w-full text-sm outline-none bg-transparent placeholder-surface-400"
                placeholder="Type a skill and press Enter..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const val = e.target.value.trim();
                    if (val && !form.skills.includes(val)) setForm({ ...form, skills: [...form.skills, val] });
                    e.target.value = "";
                  }
                }} />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? <Spinner size={14} /> : editJob ? "Save Changes" : "Post Job →"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};