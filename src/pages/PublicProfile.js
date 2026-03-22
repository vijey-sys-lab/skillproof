// src/pages/PublicProfile.js
import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { getUserByUsername, getUserProjects, getAllJobs, applyToJob } from "../lib/db";
import { SkillTag, Spinner, EmptyState } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import {
  Github, Globe, ExternalLink, ArrowLeft, Trophy,
  MapPin, Phone, Linkedin, Mail, Briefcase, GraduationCap,
  Code2, Star, CheckCircle, Clock, Download, Building2, Calendar
} from "lucide-react";
import toast from "react-hot-toast";

// ─── Public Profile (Resume) ──────────────────────────────────────────────────
export const PublicProfilePage = () => {
  const { username } = useParams();
  const { userProfile } = useAuth();
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const u = await getUserByUsername(username);
      if (!u || u.role !== "student") { setNotFound(true); setLoading(false); return; }
      setUser(u);
      const p = await getUserProjects(u.id);
      setProjects(p.filter((proj) => proj.status === "approved"));
      setLoading(false);
    };
    fetchData();
  }, [username]);

  const handleDownload = () => {
    window.print();
    toast.success("Select 'Save as PDF' in the print dialog!");
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50"><Spinner size={32} /></div>
  );

  if (notFound) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
      <div className="text-6xl">🔍</div>
      <h1 className="text-2xl font-bold text-surface-900 font-display">Profile not found</h1>
      <p className="text-surface-500">No student with username @{username}</p>
      <Link to="/" className="btn-primary">← Back to SkillProof</Link>
    </div>
  );

  const scoreLabel = user.skillScore >= 80 ? "Exceptional" :
    user.skillScore >= 60 ? "Proficient" :
    user.skillScore >= 40 ? "Intermediate" : "Beginner";

  const scoreColor = user.skillScore >= 80 ? "bg-emerald-500" :
    user.skillScore >= 60 ? "bg-sky-500" :
    user.skillScore >= 40 ? "bg-amber-500" : "bg-rose-500";

  // Support both old string experience and new array experiences
  const experiences = user.experiences?.length > 0
    ? user.experiences
    : user.experience
    ? [{ role: "Experience", company: "", duration: "", type: "", description: user.experience }]
    : [];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 print:hidden">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm transition-colors">
            <ArrowLeft size={14} /> SkillProof
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 hidden sm:block">/user/{username}</span>
            <button onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-950 text-white text-sm font-semibold hover:bg-surface-800 transition-colors">
              <Download size={14} /> Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* Resume */}
      <div className="max-w-4xl mx-auto px-4 py-8 print:py-0 print:px-0">
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden print:shadow-none print:rounded-none">

          {/* Header */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-700 px-8 py-8 print:py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Photo */}
              <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 ring-4 ring-white/20">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-sky-400 to-violet-500 flex items-center justify-center text-white font-bold text-4xl font-display">
                    {user.name?.charAt(0)?.toUpperCase()}
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-white font-display tracking-tight">{user.name}</h1>
                    <p className="text-sky-300 text-sm mt-0.5">@{user.username}</p>
                    {/* Show latest role as subtitle */}
                    {experiences.length > 0 && experiences[0].role && (
                      <p className="text-gray-300 text-sm mt-1 font-medium">
                        {experiences[0].role}{experiences[0].company ? ` @ ${experiences[0].company}` : ""}
                      </p>
                    )}
                    {user.bio && <p className="text-gray-300 text-sm mt-2 max-w-lg leading-relaxed">{user.bio}</p>}
                  </div>
                  {/* Score Badge */}
                  <div className="flex flex-col items-center bg-white/10 rounded-2xl px-4 py-3 backdrop-blur-sm">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl font-display ${scoreColor}`}>
                      {user.skillScore || 0}
                    </div>
                    <span className="text-white/70 text-xs mt-1 font-medium">{scoreLabel}</span>
                    <span className="text-white/50 text-xs">Skill Score</span>
                  </div>
                </div>

                {/* Contact row */}
                <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4">
                  {user.email && (
                    <span className="flex items-center gap-1.5 text-gray-300 text-xs">
                      <Mail size={11} className="text-sky-400" /> {user.email}
                    </span>
                  )}
                  {user.phone && (
                    <span className="flex items-center gap-1.5 text-gray-300 text-xs">
                      <Phone size={11} className="text-sky-400" /> {user.phone}
                    </span>
                  )}
                  {user.location && (
                    <span className="flex items-center gap-1.5 text-gray-300 text-xs">
                      <MapPin size={11} className="text-sky-400" /> {user.location}
                    </span>
                  )}
                  {user.github && (
                    <a href={user.github} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1.5 text-sky-300 hover:text-sky-100 text-xs transition-colors">
                      <Github size={11} /> GitHub
                    </a>
                  )}
                  {user.linkedin && (
                    <a href={user.linkedin} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1.5 text-sky-300 hover:text-sky-100 text-xs transition-colors">
                      <Linkedin size={11} /> LinkedIn
                    </a>
                  )}
                  {user.portfolio && (
                    <a href={user.portfolio} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1.5 text-sky-300 hover:text-sky-100 text-xs transition-colors">
                      <Globe size={11} /> Portfolio
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-8 print:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* Left Column */}
              <div className="lg:col-span-1 space-y-6">

                {/* Skills */}
                {user.skills?.length > 0 && (
                  <div>
                    <SectionTitle icon={<Code2 size={13} />} label="Skills" color="sky" />
                    <div className="flex flex-wrap gap-1.5">
                      {user.skills.map((s) => (
                        <span key={s} className="px-2.5 py-1 bg-sky-50 text-sky-700 border border-sky-200 rounded-lg text-xs font-medium font-mono">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {user.education && (
                  <div>
                    <SectionTitle icon={<GraduationCap size={13} />} label="Education" color="violet" />
                    <p className="text-sm text-gray-600 leading-relaxed">{user.education}</p>
                  </div>
                )}

                {/* Verification */}
                <div>
                  <SectionTitle icon={<Star size={13} />} label="Verification" color="emerald" />
                  <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle size={13} className="text-emerald-600" />
                      <span className="text-xs font-semibold text-emerald-700">SkillProof Verified</span>
                    </div>
                    <p className="text-xs text-emerald-600">
                      Score <strong>{user.skillScore || 0}/100</strong> — {scoreLabel}
                    </p>
                    {user.scoreNote && (
                      <p className="text-xs text-emerald-600 mt-1 italic">"{user.scoreNote}"</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="lg:col-span-2 space-y-6">

                {/* Experience — structured entries */}
                {experiences.length > 0 && (
                  <div>
                    <SectionTitle icon={<Briefcase size={13} />} label="Work Experience" color="amber" />
                    <div className="space-y-4">
                      {experiences.map((exp, i) => (
                        <div key={i} className="relative pl-4 border-l-2 border-gray-200">
                          <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-amber-400 border-2 border-white" />
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-semibold text-gray-900 text-sm">{exp.role}</h4>
                              {exp.company && (
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <Building2 size={11} className="text-gray-400" />
                                  <span className="text-xs text-gray-600 font-medium">{exp.company}</span>
                                  {exp.type && (
                                    <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">{exp.type}</span>
                                  )}
                                </div>
                              )}
                            </div>
                            {exp.duration && (
                              <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
                                <Calendar size={11} />
                                {exp.duration}
                              </div>
                            )}
                          </div>
                          {exp.description && (
                            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed whitespace-pre-line">
                              {exp.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects */}
                <div>
                  <SectionTitle
                    icon={<Code2 size={13} />}
                    label={`Projects (${projects.length} verified)`}
                    color="rose"
                  />
                  {projects.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">No approved projects yet</p>
                  ) : (
                    <div className="space-y-3">
                      {projects.map((p) => (
                        <div key={p.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-sm transition-all">
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <h3 className="font-semibold text-gray-900 text-sm">{p.title}</h3>
                            <div className="flex gap-2 flex-shrink-0 print:hidden">
                              {p.link && (
                                <a href={p.link} target="_blank" rel="noreferrer"
                                  className="text-xs text-sky-600 hover:text-sky-800 font-medium flex items-center gap-0.5">
                                  <ExternalLink size={10} /> Live
                                </a>
                              )}
                              {p.github && (
                                <a href={p.github} target="_blank" rel="noreferrer"
                                  className="text-xs text-gray-500 hover:text-gray-700 font-medium flex items-center gap-0.5">
                                  <Github size={10} /> Code
                                </a>
                              )}
                            </div>
                            {p.github && <span className="hidden print:inline text-xs text-gray-400">{p.github}</span>}
                          </div>
                          <p className="text-xs text-gray-500 mb-2 leading-relaxed">{p.description}</p>
                          {p.techStack?.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {p.techStack.map((t) => (
                                <span key={t} className="px-2 py-0.5 bg-white border border-gray-200 rounded text-xs text-gray-600 font-mono">{t}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-400 text-xs">
              <img src="/image/favicon.png" alt="SkillProof" className="w-4 h-4 rounded object-cover print:hidden" />
              Verified by SkillProof · skillproof.app/user/{username}
            </div>
            <span className="text-xs text-gray-400 print:hidden">
              {projects.length} verified project{projects.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print\\:hidden { display: none !important; }
          .print\\:inline { display: inline !important; }
          @page { margin: 0.5cm; }
        }
      `}</style>
    </div>
  );
};

// ─── Section Title Helper ─────────────────────────────────────────────────────
const SectionTitle = ({ icon, label, color }) => {
  const colorMap = {
    sky: "border-sky-500 text-sky-600",
    violet: "border-violet-500 text-violet-600",
    emerald: "border-emerald-500 text-emerald-600",
    amber: "border-amber-500 text-amber-600",
    rose: "border-rose-500 text-rose-600",
  };
  const [borderColor, textColor] = (colorMap[color] || "border-gray-400 text-gray-500").split(" ");
  return (
    <h2 className={`flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-widest mb-3 pb-2 border-b-2 ${borderColor}`}>
      <span className={textColor}>{icon}</span>
      {label}
    </h2>
  );
};

// ─── Leaderboard ──────────────────────────────────────────────────────────────
export const LeaderboardPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import("../lib/db").then(({ getTopStudents }) => {
      getTopStudents(20).then((s) => { setStudents(s); setLoading(false); });
    });
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size={32} /></div>;

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="glass border-b border-surface-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-surface-500 hover:text-surface-800 text-sm">
            <ArrowLeft size={14} /> Home
          </Link>
          <div className="flex items-center gap-2">
            <Trophy size={15} className="text-amber-500" />
            <span className="text-sm font-semibold text-surface-700">Leaderboard</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-surface-900 font-display mb-2">Top Skill Scores 🏆</h1>
          <p className="text-surface-500">Students ranked by verified Skill Score</p>
        </div>

        {students.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[students[1], students[0], students[2]].map((student, displayIdx) => {
              const rank = displayIdx === 0 ? 2 : displayIdx === 1 ? 1 : 3;
              const isFirst = rank === 1;
              return (
                <Link key={student.id} to={`/user/${student.username}`}
                  className={`card p-4 text-center transition-all hover:shadow-card-hover ${isFirst ? "ring-2 ring-amber-400 shadow-md -translate-y-2" : ""}`}>
                  <div className="text-2xl mb-2">{medals[rank - 1]}</div>
                  <div className={`rounded-xl overflow-hidden mx-auto mb-2 ${isFirst ? "w-16 h-16" : "w-12 h-12"}`}>
                    {student.photoURL ? (
                      <img src={student.photoURL} alt={student.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-brand-400 to-accent-500 flex items-center justify-center text-white font-bold font-display text-lg">
                        {student.name?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <p className="font-semibold text-surface-900 text-sm truncate">{student.name}</p>
                  <p className="text-xs text-surface-400 mb-2">@{student.username}</p>
                  <div className={`w-9 h-9 rounded-lg mx-auto flex items-center justify-center text-white text-sm font-bold ${
                    student.skillScore >= 80 ? "bg-emerald-500" : student.skillScore >= 60 ? "bg-sky-500" : "bg-amber-500"
                  }`}>
                    {student.skillScore || 0}
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <div className="space-y-2">
          {students.map((student, i) => (
            <Link key={student.id} to={`/user/${student.username}`}
              className="card p-4 flex items-center gap-4 hover:shadow-card-hover transition-all block">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                i < 3 ? "bg-amber-100 text-amber-700" : "bg-surface-100 text-surface-500"
              }`}>
                {i < 3 ? medals[i] : `#${i + 1}`}
              </div>
              <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
                {student.photoURL ? (
                  <img src={student.photoURL} alt={student.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-brand-400 to-accent-500 flex items-center justify-center text-white font-bold text-sm font-display">
                    {student.name?.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-surface-900 text-sm">{student.name}</p>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {student.skills?.slice(0, 3).map((s) => <SkillTag key={s} skill={s} size="sm" />)}
                </div>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm ${
                student.skillScore >= 80 ? "bg-emerald-500" :
                student.skillScore >= 60 ? "bg-sky-500" :
                student.skillScore >= 40 ? "bg-amber-500" : "bg-rose-400"
              }`}>
                {student.skillScore || 0}
              </div>
              <ExternalLink size={13} className="text-surface-300" />
            </Link>
          ))}
        </div>

        {students.length === 0 && (
          <EmptyState icon={Trophy} title="No scores yet" description="The leaderboard will populate as students earn Skill Scores" />
        )}
      </div>
    </div>
  );
};

// ─── Jobs Board ───────────────────────────────────────────────────────────────
export const JobsPage = () => {
  const { userProfile } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    getAllJobs().then((j) => { setJobs(j); setLoading(false); });
  }, []);

  const handleApply = async (job) => {
    if (!userProfile) return toast.error("Please login to apply");
    if (userProfile.role !== "student") return toast.error("Only students can apply");
    const alreadyApplied = job.applicants?.some((a) => a.studentId === userProfile.id);
    if (alreadyApplied) return toast.error("You already applied to this job!");
    try {
      await applyToJob(job.id, userProfile.id, userProfile.name);
      toast.success("Application sent! 🎉");
      setJobs((prev) => prev.map((j) => j.id === job.id
        ? { ...j, applicants: [...(j.applicants || []), { studentId: userProfile.id }] }
        : j
      ));
    } catch {
      toast.error("Failed to apply");
    }
  };

  const filtered = jobs.filter((j) => {
    const matchType = typeFilter === "all" || j.type?.toLowerCase() === typeFilter;
    const matchSearch = !search ||
      j.title?.toLowerCase().includes(search.toLowerCase()) ||
      j.company?.toLowerCase().includes(search.toLowerCase()) ||
      j.skills?.some((s) => s.toLowerCase().includes(search.toLowerCase()));
    return matchType && matchSearch;
  });

  if (loading) return <div className="flex justify-center py-20"><Spinner size={28} /></div>;

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="glass border-b border-surface-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-surface-500 hover:text-surface-800 text-sm">
            <ArrowLeft size={14} /> Home
          </Link>
          <div className="flex items-center gap-2">
            <Briefcase size={15} className="text-brand-500" />
            <span className="text-sm font-semibold text-surface-700">Jobs & Internships</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-surface-900 font-display mb-2">Jobs & Internships 💼</h1>
          <p className="text-surface-500">Opportunities posted by verified recruiters</p>
        </div>

        <div className="card p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 text-sm">🔍</span>
            <input className="input pl-9" placeholder="Search jobs, companies, skills..."
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["all", "full-time", "internship", "part-time", "remote"].map((t) => (
              <button key={t} onClick={() => setTypeFilter(t)}
                className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-colors ${
                  typeFilter === t ? "bg-brand-500 text-white" : "bg-white border border-surface-200 text-surface-600 hover:bg-surface-50"
                }`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filtered.map((job) => {
            const alreadyApplied = job.applicants?.some((a) => a.studentId === userProfile?.id);
            return (
              <div key={job.id} className="card p-6 hover:shadow-card-hover transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 flex-shrink-0">
                      <Briefcase size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-surface-900">{job.title}</h3>
                      <p className="text-sm text-surface-600 mt-0.5">{job.company}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-surface-500">
                        {job.location && <span className="flex items-center gap-1"><MapPin size={11} /> {job.location}</span>}
                        {job.type && (
                          <span className={`px-2 py-0.5 rounded-full font-medium ${
                            job.type === "internship" ? "bg-purple-50 text-purple-700" :
                            job.type === "remote" ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"
                          }`}>{job.type}</span>
                        )}
                        {job.salary && <span className="text-emerald-600 font-medium">💰 {job.salary}</span>}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleApply(job)}
                    disabled={alreadyApplied || !userProfile || userProfile?.role !== "student"}
                    className={`flex-shrink-0 text-sm font-semibold px-4 py-2 rounded-xl transition-all ${
                      alreadyApplied ? "bg-green-50 text-green-600 border border-green-200 cursor-default" :
                      userProfile?.role === "student" ? "btn-primary" : "btn-secondary opacity-60 cursor-not-allowed"
                    }`}
                  >
                    {alreadyApplied ? "✓ Applied" : !userProfile ? "Login to Apply" : userProfile?.role !== "student" ? "Students Only" : "Apply Now"}
                  </button>
                </div>

                {job.description && <p className="text-sm text-surface-500 mt-3 leading-relaxed">{job.description}</p>}

                {job.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {job.skills.map((s) => <SkillTag key={s} skill={s} size="sm" />)}
                  </div>
                )}

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-surface-100">
                  <span className="text-xs text-surface-400">
                    Posted by {job.recruiterName} · {job.applicants?.length || 0} applicants
                  </span>
                  {job.deadline && (
                    <span className="flex items-center gap-1 text-xs text-amber-600">
                      <Clock size={11} /> Deadline: {job.deadline}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <EmptyState icon={Briefcase} title="No jobs found" description="No opportunities match your search. Check back later!" />
          )}
        </div>
      </div>
    </div>
  );
};