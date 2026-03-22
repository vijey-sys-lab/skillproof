// src/pages/Landing.js
import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Code2, Trophy, Users, CheckCircle, Star, Zap, Shield } from "lucide-react";

const SKILLS = ["React", "Python", "Node.js", "UI/UX", "AWS", "TypeScript", "Figma", "Go", "ML/AI", "GraphQL"];

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white font-body overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-surface-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/image/favicon.png" alt="SkillProof" className="w-8 h-8 rounded-xl object-cover" />
            <span className="font-bold text-surface-900 font-display text-lg">SkillProof</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/leaderboard" className="text-sm text-surface-600 hover:text-surface-900 font-medium hidden sm:block">
              Leaderboard
            </Link>
            <Link to="/login" className="btn-secondary text-sm py-2 px-4">Sign In</Link>
            <Link to="/signup" className="btn-primary text-sm py-2 px-4">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-20 -left-20 w-72 h-72 rounded-full opacity-20 animate-orb"
          style={{ background: "radial-gradient(circle, #38bdf8, transparent)" }} />
        <div className="absolute top-40 -right-20 w-96 h-96 rounded-full opacity-15 animate-orb"
          style={{ background: "radial-gradient(circle, #d946ef, transparent)", animationDelay: "3s" }} />
        <div className="absolute bottom-0 left-1/2 w-64 h-64 rounded-full opacity-10 animate-orb"
          style={{ background: "radial-gradient(circle, #10b981, transparent)", animationDelay: "5s" }} />

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-sm font-medium mb-8 animate-fade-in">
            <Zap size={14} className="text-brand-500" />
            Replace Resumes. Prove Skills.
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-surface-950 leading-tight mb-6 animate-slide-up">
            Hire & Get Hired<br />
            <span className="gradient-text">by What You Build</span>
          </h1>

          <p className="text-lg text-surface-500 max-w-2xl mx-auto mb-10 animate-slide-up delay-100">
            SkillProof eliminates the guesswork. Students showcase real projects and earn Skill Scores. 
            Recruiters find verified talent — no fluff, no empty buzzwords.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center animate-slide-up delay-200">
            <Link to="/signup?role=student" className="btn-primary text-base px-8 py-3.5">
              I'm a Student <ArrowRight size={18} />
            </Link>
            <Link to="/signup?role=recruiter" className="btn-secondary text-base px-8 py-3.5">
              I'm Hiring <Users size={18} />
            </Link>
          </div>

          <div className="mt-14 flex flex-wrap gap-2 justify-center animate-fade-in delay-300">
            {SKILLS.map((skill, i) => (
              <span
                key={skill}
                className="skill-tag skill-tag-blue px-3 py-1.5 text-sm"
                style={{
                  animation: `float ${2 + (i % 3) * 0.5}s ease-in-out infinite`,
                  animationDelay: `${i * 0.15}s`,
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-surface-950">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-8 text-center">
          {[
            { value: "500+", label: "Students Verified" },
            { value: "120+", label: "Recruiters Active" },
            { value: "2,400+", label: "Projects Reviewed" },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="text-4xl font-bold gradient-text mb-1 font-display">{value}</div>
              <div className="text-surface-400 text-sm">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-surface-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-surface-900 mb-4 font-display">
              Built for Real Proof
            </h2>
            <p className="text-surface-500 max-w-xl mx-auto">
              Every feature is designed to surface genuine ability — not polished PDFs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Code2,
                color: "bg-blue-50 text-blue-600",
                title: "Project Portfolios",
                desc: "Upload real projects with GitHub links, tech stacks, and descriptions. Let your code speak.",
              },
              {
                icon: Trophy,
                color: "bg-amber-50 text-amber-600",
                title: "Skill Scores",
                desc: "Verified Skill Scores (0-100) assigned by admins after reviewing actual work. Earned, not claimed.",
              },
              {
                icon: Users,
                color: "bg-purple-50 text-purple-600",
                title: "Smart Discovery",
                desc: "Recruiters filter by skill tags, scores, and tech stacks to find exactly who they need.",
              },
              {
                icon: CheckCircle,
                color: "bg-green-50 text-green-600",
                title: "Project Approval",
                desc: "Admin reviews ensure quality. Only approved projects appear on public profiles.",
              },
              {
                icon: Star,
                color: "bg-pink-50 text-pink-600",
                title: "Bookmarking",
                desc: "Recruiters can save and track candidates across sessions for team collaboration.",
              },
              {
                icon: Shield,
                color: "bg-teal-50 text-teal-600",
                title: "Public Profiles",
                desc: "Every student gets a shareable public profile URL — like a live, verified resume.",
              },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="card p-6 hover:shadow-card-hover transition-shadow">
                <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center mb-4`}>
                  <Icon size={20} />
                </div>
                <h3 className="font-semibold text-surface-900 mb-2 font-display">{title}</h3>
                <p className="text-sm text-surface-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-surface-900 mb-4 font-display">How It Works</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <img src="/image/favicon.png" alt="S" className="w-8 h-8 rounded-lg object-cover" />
                <span className="font-semibold text-surface-700">For Students</span>
              </div>
              {[
                "Sign up and build your profile with skills and bio",
                "Upload your best projects with GitHub links",
                "Get reviewed and earn a Skill Score",
                "Share your public profile with recruiters",
              ].map((step, i) => (
                <div key={i} className="flex gap-3 mb-4">
                  <div className="w-6 h-6 rounded-full bg-brand-500 text-white text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <p className="text-surface-600 text-sm leading-relaxed">{step}</p>
                </div>
              ))}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-accent-100 flex items-center justify-center text-accent-700 font-bold text-sm">R</div>
                <span className="font-semibold text-surface-700">For Recruiters</span>
              </div>
              {[
                "Sign up as a recruiter and access the talent pool",
                "Filter candidates by skill tags and scores",
                "View public profiles and project portfolios",
                "Bookmark candidates and reach out directly",
              ].map((step, i) => (
                <div key={i} className="flex gap-3 mb-4">
                  <div className="w-6 h-6 rounded-full bg-accent-500 text-white text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <p className="text-surface-600 text-sm leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-surface-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30"
          style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(14,165,233,0.3) 0%, transparent 60%)" }} />
        <div className="max-w-2xl mx-auto text-center relative">
          <h2 className="text-4xl font-bold text-white mb-4 font-display">
            Ready to Prove Your Skills?
          </h2>
          <p className="text-surface-400 mb-8">
            Join hundreds of students who already replaced their resumes with real proof.
          </p>
          <Link to="/signup" className="btn-primary text-base px-10 py-4 inline-flex">
            Create Free Account <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-950 border-t border-surface-800 py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/image/favicon.png" alt="SkillProof" className="w-6 h-6 rounded-lg object-cover" />
            <span className="text-surface-400 text-sm">SkillProof © 2026</span>
          </div>
          <div className="flex gap-6">
            <Link to="/leaderboard" className="text-surface-500 hover:text-surface-300 text-sm">Leaderboard</Link>
            <Link to="/login" className="text-surface-500 hover:text-surface-300 text-sm">Login</Link>
            <Link to="/signup" className="text-surface-500 hover:text-surface-300 text-sm">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};