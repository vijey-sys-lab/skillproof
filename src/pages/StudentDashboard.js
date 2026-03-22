// src/pages/StudentDashboard.js
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import {
  StatCard, SkillTag, ScoreBadge, ProjectCard, Modal,
  EmptyState, SkillInput, Spinner, StatusBadge
} from "../components/ui";
import {
  getUserProjects, addProject, updateProject, deleteProject,
  updateUserProfile, getUserSubmissions, addSubmission, getAllJobs
} from "../lib/db";
import toast from "react-hot-toast";
import {
  FolderOpen, Star, Clock, Plus, Link2,
  Save, Upload, Camera, Briefcase, ExternalLink,
  Trash2, Building2, Calendar, ChevronDown, ChevronUp
} from "lucide-react";

// ─── Overview Dashboard ───────────────────────────────────────────────────────
export const StudentDashboardHome = () => {
  const { userProfile } = useAuth();
  const [projects, setProjects] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile?.id) {
      Promise.all([getUserProjects(userProfile.id), getAllJobs()]).then(([p, j]) => {
        setProjects(p);
        setJobs(j.slice(0, 3));
        setLoading(false);
      });
    }
  }, [userProfile]);

  if (loading) return <div className="flex justify-center py-20"><Spinner size={28} /></div>;

  const approved = projects.filter((p) => p.status === "approved").length;
  const pending = projects.filter((p) => p.status === "pending").length;

  return (
    <div className="animate-fade-in">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Welcome back, {userProfile?.name?.split(" ")[0]}! 👋</h1>
          <p className="page-subtitle">Here's your SkillProof overview</p>
        </div>
        <ScoreBadge score={userProfile?.skillScore || 0} size="lg" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Skill Score" value={userProfile?.skillScore || 0} icon={Star} color="orange" />
        <StatCard label="Total Projects" value={projects.length} icon={FolderOpen} color="blue" />
        <StatCard label="Approved" value={approved} icon={Star} color="green" />
        <StatCard label="Pending Review" value={pending} icon={Clock} color="purple" />
      </div>

      {userProfile?.skillScore === 0 && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <div className="text-amber-500 text-lg">💡</div>
          <div>
            <p className="text-sm font-semibold text-amber-800">Your Skill Score is 0</p>
            <p className="text-xs text-amber-600 mt-0.5">
              Complete your profile, upload projects and submit for review. An admin will assign your Skill Score.
            </p>
          </div>
        </div>
      )}

      {userProfile?.scoreNote && (
        <div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-200">
          <p className="text-xs font-semibold text-blue-700 mb-1">Admin Note on Your Score</p>
          <p className="text-sm text-blue-600">{userProfile.scoreNote}</p>
        </div>
      )}

      {/* Latest Jobs */}
      {jobs.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-surface-800">Latest Opportunities</h2>
            <a href="/jobs" className="text-xs text-brand-500 hover:text-brand-700 font-medium">View all →</a>
          </div>
          <div className="space-y-2">
            {jobs.map((job) => (
              <div key={job.id} className="card p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 flex-shrink-0">
                  <Briefcase size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-surface-900 text-sm">{job.title}</p>
                  <p className="text-xs text-surface-500">{job.company} · {job.type} · {job.location}</p>
                </div>
                {job.skills?.slice(0, 2).map((s) => <SkillTag key={s} skill={s} size="sm" />)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {userProfile?.skills?.length > 0 && (
        <div className="card p-5 mb-6">
          <h2 className="font-semibold text-surface-800 mb-3 text-sm uppercase tracking-wide">Your Skills</h2>
          <div className="flex flex-wrap gap-2">
            {userProfile.skills.map((s) => <SkillTag key={s} skill={s} />)}
          </div>
        </div>
      )}

      {/* Public profile link */}
      <div className="card p-5 flex items-center gap-4 bg-gradient-to-r from-brand-50 to-accent-50 border-brand-100">
        <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center text-brand-600">
          <Link2 size={18} />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-surface-800 text-sm">Your Public Resume Profile</p>
          <p className="text-xs text-surface-500">/user/{userProfile?.username}</p>
        </div>
        <a href={`/user/${userProfile?.username}`} target="_blank" rel="noreferrer"
          className="btn-secondary text-xs py-2 px-3">
          View Resume →
        </a>
      </div>
    </div>
  );
};

// ─── Experience Entry Component ───────────────────────────────────────────────
const ExperienceEntry = ({ entry, index, onChange, onRemove }) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="border border-surface-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-surface-50 cursor-pointer hover:bg-surface-100 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center text-brand-600 flex-shrink-0">
            <Building2 size={14} />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-surface-900 text-sm truncate">
              {entry.role || "New Experience"}
            </p>
            <p className="text-xs text-surface-500 truncate">
              {entry.company || "Company"}{entry.duration ? ` · ${entry.duration}` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRemove(index); }}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-surface-400 hover:text-red-500 hover:bg-red-50 transition-all"
          >
            <Trash2 size={13} />
          </button>
          {expanded ? <ChevronUp size={15} className="text-surface-400" /> : <ChevronDown size={15} className="text-surface-400" />}
        </div>
      </div>

      {/* Fields */}
      {expanded && (
        <div className="p-4 space-y-3 bg-white">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-surface-600 mb-1">Job Title / Role *</label>
              <input
                className="input text-sm"
                placeholder="e.g. Frontend Developer"
                value={entry.role}
                onChange={(e) => onChange(index, "role", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-600 mb-1">Company / Organization *</label>
              <input
                className="input text-sm"
                placeholder="e.g. Acme Corp"
                value={entry.company}
                onChange={(e) => onChange(index, "company", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-surface-600 mb-1">
                <span className="flex items-center gap-1"><Calendar size={11} /> Duration</span>
              </label>
              <input
                className="input text-sm"
                placeholder="e.g. Jan 2023 – Present"
                value={entry.duration}
                onChange={(e) => onChange(index, "duration", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-600 mb-1">Employment Type</label>
              <select
                className="input text-sm"
                value={entry.type}
                onChange={(e) => onChange(index, "type", e.target.value)}
              >
                <option value="">Select type</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Internship">Internship</option>
                <option value="Freelance">Freelance</option>
                <option value="Contract">Contract</option>
                <option value="Volunteer">Volunteer</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-surface-600 mb-1">Description</label>
            <textarea
              className="input text-sm"
              rows={3}
              placeholder="What did you do? Key responsibilities, achievements, technologies used..."
              value={entry.description}
              onChange={(e) => onChange(index, "description", e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const EMPTY_EXPERIENCE = { role: "", company: "", duration: "", type: "", description: "" };

// ─── Profile Editor ───────────────────────────────────────────────────────────
export const StudentProfile = () => {
  const { userProfile, refreshProfile } = useAuth();
  const [form, setForm] = useState({
    name: "", bio: "", github: "", portfolio: "", skills: [],
    photoURL: "", phone: "", location: "", linkedin: "",
    education: "", experiences: [],
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef();

  useEffect(() => {
    if (userProfile) {
      setForm({
        name: userProfile.name || "",
        bio: userProfile.bio || "",
        github: userProfile.github || "",
        portfolio: userProfile.portfolio || "",
        skills: userProfile.skills || [],
        photoURL: userProfile.photoURL || "",
        phone: userProfile.phone || "",
        location: userProfile.location || "",
        linkedin: userProfile.linkedin || "",
        education: userProfile.education || "",
        experiences: userProfile.experiences || [],
      });
      if (userProfile.photoURL) setPhotoPreview(userProfile.photoURL);
    }
  }, [userProfile]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 500000) {
      toast.error("Image too large! Please use an image under 500KB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
      setForm((prev) => ({ ...prev, photoURL: reader.result }));
      toast.success("Photo ready! Click Save Profile to apply.");
    };
    reader.readAsDataURL(file);
  };

  // ── Experience handlers ──
  const addExperience = () => {
    setForm((prev) => ({
      ...prev,
      experiences: [{ ...EMPTY_EXPERIENCE }, ...prev.experiences],
    }));
    toast("New experience added — fill in the details below", { icon: "💼" });
  };

  const updateExperience = (index, field, value) => {
    setForm((prev) => {
      const updated = [...prev.experiences];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, experiences: updated };
    });
  };

  const removeExperience = (index) => {
    setForm((prev) => ({
      ...prev,
      experiences: prev.experiences.filter((_, i) => i !== index),
    }));
    toast.success("Experience removed");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateUserProfile(userProfile.id, form);
      await refreshProfile();
      setSaved(true);
      toast.success("Profile updated!");
      setTimeout(() => setSaved(false), 2000);
    } catch {
      toast.error("Failed to save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Edit Profile</h1>
        <p className="page-subtitle">This information appears on your public resume profile</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Preview card */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-6">
            <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-4">Preview</h3>
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-3">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-brand-400 to-accent-500">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-2xl font-display">
                      {form.name?.charAt(0) || "?"}
                    </div>
                  )}
                </div>
                <button type="button" onClick={() => fileInputRef.current.click()}
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center text-white shadow-md hover:bg-brand-600 transition-colors">
                  <Camera size={13} />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*"
                  onChange={handlePhotoChange} className="hidden" />
              </div>

              <ScoreBadge score={userProfile?.skillScore || 0} size="sm" />
              <h3 className="font-bold text-surface-900 mt-2 font-display">{form.name || "Your Name"}</h3>
              <p className="text-xs text-surface-500 mt-0.5">@{userProfile?.username}</p>
              {form.location && <p className="text-xs text-surface-400 mt-0.5">📍 {form.location}</p>}
              {form.bio && <p className="text-xs text-surface-600 mt-2 leading-relaxed line-clamp-3">{form.bio}</p>}
              {form.skills.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3 justify-center">
                  {form.skills.slice(0, 5).map((s) => <SkillTag key={s} skill={s} size="sm" />)}
                </div>
              )}
              {form.experiences.length > 0 && (
                <div className="mt-3 text-xs text-surface-500">
                  💼 {form.experiences.length} experience{form.experiences.length !== 1 ? "s" : ""}
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-surface-100">
              <a href={`/user/${userProfile?.username}`} target="_blank" rel="noreferrer"
                className="btn-secondary w-full text-xs py-2 justify-center flex items-center gap-1">
                <ExternalLink size={11} /> View Resume Profile
              </a>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSave} className="space-y-5">

            {/* Basic Info Card */}
            <div className="card p-6 space-y-4">
              <h2 className="font-bold text-surface-900 text-sm uppercase tracking-wide border-b border-surface-100 pb-3">
                Basic Information
              </h2>

              {/* Photo upload */}
              <div className="p-4 rounded-xl bg-surface-50 border border-dashed border-surface-300 text-center">
                <p className="text-sm font-medium text-surface-700 mb-2">Profile Photo</p>
                {photoPreview ? (
                  <div className="flex items-center justify-center gap-3">
                    <img src={photoPreview} alt="Preview" className="w-12 h-12 rounded-xl object-cover" />
                    <div>
                      <p className="text-xs text-green-600 font-medium">✓ Photo ready</p>
                      <button type="button" onClick={() => fileInputRef.current.click()}
                        className="text-xs text-brand-500 hover:text-brand-700 mt-0.5 block">
                        Change photo
                      </button>
                    </div>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileInputRef.current.click()}
                    className="btn-secondary text-xs py-2 px-4 mx-auto">
                    <Camera size={13} /> Upload Photo (max 500KB)
                  </button>
                )}
                <input ref={fileInputRef} type="file" accept="image/*"
                  onChange={handlePhotoChange} className="hidden" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">Full Name *</label>
                  <input className="input" value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">Location</label>
                  <input className="input" placeholder="Chennai, India" value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Professional Bio</label>
                <textarea className="input" rows={3} placeholder="Tell recruiters what you're about..."
                  value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Skills</label>
                <SkillInput skills={form.skills} onChange={(skills) => setForm({ ...form, skills })} />
                <p className="text-xs text-surface-400 mt-1">Press Enter or comma to add a skill</p>
              </div>
            </div>

            {/* Experience Card */}
            <div className="card p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-surface-100 pb-3">
                <div>
                  <h2 className="font-bold text-surface-900 text-sm uppercase tracking-wide">Work Experience</h2>
                  <p className="text-xs text-surface-400 mt-0.5">Add internships, jobs, and freelance work</p>
                </div>
                <button
                  type="button"
                  onClick={addExperience}
                  className="btn-primary text-xs py-2 px-3 flex-shrink-0"
                >
                  <Plus size={13} /> Add Experience
                </button>
              </div>

              {form.experiences.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-xl bg-surface-100 flex items-center justify-center mx-auto mb-3">
                    <Briefcase size={22} className="text-surface-400" />
                  </div>
                  <p className="text-sm font-medium text-surface-600">No experience added yet</p>
                  <p className="text-xs text-surface-400 mt-1">Click "Add Experience" to get started</p>
                  <button type="button" onClick={addExperience}
                    className="btn-secondary text-xs py-2 px-4 mt-3 mx-auto">
                    <Plus size={12} /> Add Your First Experience
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {form.experiences.map((entry, index) => (
                    <ExperienceEntry
                      key={index}
                      entry={entry}
                      index={index}
                      onChange={updateExperience}
                      onRemove={removeExperience}
                    />
                  ))}
                  <button type="button" onClick={addExperience}
                    className="w-full py-3 rounded-xl border-2 border-dashed border-surface-300 text-surface-500 hover:border-brand-400 hover:text-brand-500 hover:bg-brand-50 transition-all text-sm font-medium flex items-center justify-center gap-2">
                    <Plus size={15} /> Add Another Experience
                  </button>
                </div>
              )}
            </div>

            {/* Education & Links Card */}
            <div className="card p-6 space-y-4">
              <h2 className="font-bold text-surface-900 text-sm uppercase tracking-wide border-b border-surface-100 pb-3">
                Education & Links
              </h2>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Education</label>
                <input className="input" placeholder="B.Tech Computer Science, Anna University (2024)"
                  value={form.education} onChange={(e) => setForm({ ...form, education: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">Phone</label>
                  <input className="input" placeholder="+91 9876543210" value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">LinkedIn URL</label>
                  <input className="input" type="url" placeholder="https://linkedin.com/in/..."
                    value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">GitHub URL</label>
                  <input className="input" type="url" placeholder="https://github.com/username"
                    value={form.github} onChange={(e) => setForm({ ...form, github: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">Portfolio URL</label>
                  <input className="input" type="url" placeholder="https://yourportfolio.com"
                    value={form.portfolio} onChange={(e) => setForm({ ...form, portfolio: e.target.value })} />
                </div>
              </div>
            </div>

            <button type="submit" className="btn-primary py-3 px-8 w-full" disabled={loading}>
              {loading ? <Spinner size={16} /> : saved ? "✓ Profile Saved!" : <><Save size={15} /> Save Profile</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// ─── Projects Page ────────────────────────────────────────────────────────────
export const StudentProjects = () => {
  const { userProfile } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [delProject, setDelProject] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", techStack: [], link: "", github: "" });
  const [saving, setSaving] = useState(false);

  const fetchProjects = async () => {
    if (userProfile?.id) {
      const p = await getUserProjects(userProfile.id);
      setProjects(p);
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, [userProfile]);

  const openAdd = () => {
    setEditProject(null);
    setForm({ title: "", description: "", techStack: [], link: "", github: "" });
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditProject(p);
    setForm({ title: p.title, description: p.description, techStack: p.techStack || [], link: p.link || "", github: p.github || "" });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("Title is required");
    setSaving(true);
    try {
      if (editProject) {
        await updateProject(editProject.id, form);
        toast.success("Project updated!");
      } else {
        await addProject({ ...form, authorId: userProfile.id, authorName: userProfile.name });
        toast.success("Project submitted for review! 🎉");
      }
      setModalOpen(false);
      await fetchProjects();
    } catch {
      toast.error("Failed to save project");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProject(delProject.id);
      setDelProject(null);
      await fetchProjects();
      toast.success("Project deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size={28} /></div>;

  return (
    <div className="animate-fade-in">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">My Projects</h1>
          <p className="page-subtitle">{projects.length} projects in your portfolio</p>
        </div>
        <button onClick={openAdd} className="btn-primary"><Plus size={16} /> Add Project</button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {projects.map((p) => (
          <ProjectCard key={p.id} project={p} onEdit={openEdit} onDelete={setDelProject} />
        ))}
      </div>

      {projects.length === 0 && (
        <EmptyState icon={FolderOpen} title="No projects yet"
          description="Add your first project — it'll be reviewed and added to your public portfolio"
          action={<button onClick={openAdd} className="btn-primary text-sm"><Plus size={14} /> Add Project</button>} />
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}
        title={editProject ? "Edit Project" : "Add New Project"} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Project Title *</label>
            <input className="input" placeholder="e.g. E-commerce Platform" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Description *</label>
            <textarea className="input" rows={3} placeholder="What does this project do?"
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Tech Stack</label>
            <SkillInput skills={form.techStack} onChange={(techStack) => setForm({ ...form, techStack })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Live URL</label>
              <input className="input" type="url" placeholder="https://..." value={form.link}
                onChange={(e) => setForm({ ...form, link: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">GitHub URL</label>
              <input className="input" type="url" placeholder="https://github.com/..." value={form.github}
                onChange={(e) => setForm({ ...form, github: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? <Spinner size={14} /> : editProject ? "Save Changes" : "Submit Project"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!delProject} onClose={() => setDelProject(null)} title="Delete Project?" size="sm">
        <p className="text-sm text-surface-600 mb-5">
          Are you sure you want to delete <strong>{delProject?.title}</strong>?
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setDelProject(null)} className="btn-secondary text-sm">Cancel</button>
          <button onClick={handleDelete} className="btn-danger">Delete</button>
        </div>
      </Modal>
    </div>
  );
};

// ─── Submissions Page ─────────────────────────────────────────────────────────
export const StudentSubmissions = () => {
  const { userProfile } = useAuth();
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: "", taskDescription: "", submissionUrl: "", notes: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userProfile?.id) {
      getUserSubmissions(userProfile.id).then((s) => { setSubs(s); setLoading(false); });
    }
  }, [userProfile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await addSubmission({ ...form, authorId: userProfile.id, authorName: userProfile.name });
      toast.success("Submission sent for review!");
      setModalOpen(false);
      setForm({ title: "", taskDescription: "", submissionUrl: "", notes: "" });
      const s = await getUserSubmissions(userProfile.id);
      setSubs(s);
    } catch {
      toast.error("Failed to submit");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size={28} /></div>;

  return (
    <div className="animate-fade-in">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Task Submissions</h1>
          <p className="page-subtitle">Submit assignments or challenges for review</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          <Upload size={16} /> New Submission
        </button>
      </div>

      <div className="space-y-3">
        {subs.map((s) => (
          <div key={s.id} className="card p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 flex-shrink-0">
              <Upload size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-surface-900 text-sm">{s.title}</h3>
                <StatusBadge status={s.status} />
              </div>
              <p className="text-xs text-surface-500 mt-0.5 truncate">{s.taskDescription}</p>
            </div>
            {s.submissionUrl && (
              <a href={s.submissionUrl} target="_blank" rel="noreferrer"
                className="text-xs text-brand-500 hover:text-brand-700 font-medium flex-shrink-0">
                View →
              </a>
            )}
          </div>
        ))}
        {subs.length === 0 && (
          <EmptyState icon={Upload} title="No submissions yet"
            description="Submit a task or challenge to show your problem-solving skills"
            action={<button onClick={() => setModalOpen(true)} className="btn-primary text-sm"><Plus size={14} /> New Submission</button>} />
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Submission" size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Submission Title *</label>
            <input className="input" placeholder="e.g. DSA Challenge Round 1" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Task Description</label>
            <textarea className="input" rows={2} placeholder="What was the task?"
              value={form.taskDescription} onChange={(e) => setForm({ ...form, taskDescription: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Submission URL *</label>
            <input className="input" type="url" placeholder="Link to your solution"
              value={form.submissionUrl} onChange={(e) => setForm({ ...form, submissionUrl: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Additional Notes</label>
            <textarea className="input" rows={2} placeholder="Any notes for the reviewer?"
              value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? <Spinner size={14} /> : "Submit →"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};