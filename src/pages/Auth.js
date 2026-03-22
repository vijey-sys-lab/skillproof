// src/pages/Auth.js
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { getUserProfile, createUserProfile } from "../lib/db";
import toast from "react-hot-toast";
import { Eye, EyeOff, ArrowLeft, Loader2, Mail, KeyRound, AlertCircle } from "lucide-react";

// ─── Free email domains (blocked for recruiters) ──────────────────────────────
const FREE_EMAIL_DOMAINS = [
  "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "live.com",
  "icloud.com", "me.com", "aol.com", "protonmail.com", "zoho.com",
  "ymail.com", "mail.com", "inbox.com", "rediffmail.com", "gmx.com",
  "tutanota.com", "guerrillamail.com", "tempmail.com", "throwam.com",
];

const isBusinessEmail = (email) => {
  const domain = email.split("@")[1]?.toLowerCase();
  return domain && !FREE_EMAIL_DOMAINS.includes(domain);
};

// ─── Google Icon ──────────────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
    <path d="M47.532 24.552c0-1.636-.132-3.2-.384-4.704H24v9.02h13.216c-.572 3.064-2.296 5.656-4.892 7.396v6.148h7.916c4.632-4.268 7.292-10.556 7.292-17.86z" fill="#4285F4"/>
    <path d="M24 48c6.648 0 12.22-2.204 16.292-5.972l-7.916-6.148c-2.2 1.476-5.012 2.348-8.376 2.348-6.44 0-11.9-4.348-13.852-10.192H1.96v6.348C6.012 42.628 14.38 48 24 48z" fill="#34A853"/>
    <path d="M10.148 28.036A14.86 14.86 0 019.4 24c0-1.4.24-2.76.668-4.036v-6.348H1.96A23.97 23.97 0 000 24c0 3.876.928 7.54 2.572 10.816l7.576-6.78z" fill="#FBBC05"/>
    <path d="M24 9.528c3.624 0 6.872 1.248 9.432 3.692l7.08-7.08C36.212 2.196 30.64 0 24 0 14.38 0 6.012 5.372 1.96 13.168l8.188 6.348C12.1 13.876 17.56 9.528 24 9.528z" fill="#EA4335"/>
  </svg>
);

// ─── Auth Layout ──────────────────────────────────────────────────────────────
const AuthLayout = ({ children, title, subtitle }) => (
  <div className="min-h-screen bg-surface-50 flex">
    <div className="hidden lg:flex lg:w-1/2 bg-surface-950 relative overflow-hidden flex-col justify-between p-12">
      <div className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at 30% 50%, rgba(14,165,233,0.2) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(217,70,239,0.15) 0%, transparent 50%)" }} />
      <Link to="/" className="flex items-center gap-2.5 relative">
        <img src="/image/favicon.png" alt="SkillProof" className="w-9 h-9 rounded-xl object-cover" />
        <span className="text-white font-bold text-xl font-display">SkillProof</span>
      </Link>
      <div className="relative">
        <h2 className="text-4xl font-bold text-white leading-tight font-display mb-4">
          Prove What You<br /><span className="gradient-text">Can Actually Do</span>
        </h2>
        <p className="text-surface-400 leading-relaxed max-w-sm">
          Real projects. Verified skills. Genuine opportunities. No more resume gatekeeping.
        </p>
        <div className="mt-10 space-y-3">
          {["🎯 Upload real projects and get skill-verified", "🏆 Earn a Skill Score based on actual work", "🔗 Share your resume profile with recruiters"].map((item) => (
            <div key={item} className="text-surface-300 text-sm">{item}</div>
          ))}
        </div>
      </div>
      <p className="text-surface-600 text-sm relative">© 2026 SkillProof. All rights reserved.</p>
    </div>

    <div className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-surface-500 hover:text-surface-700 text-sm mb-8 transition-colors">
          <ArrowLeft size={14} /> Back to home
        </Link>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-surface-900 font-display mb-2">{title}</h1>
          <p className="text-surface-500 text-sm">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  </div>
);

const OrDivider = () => (
  <div className="flex items-center gap-3 my-5">
    <div className="flex-1 h-px bg-surface-200" />
    <span className="text-xs text-surface-400 font-medium">OR</span>
    <div className="flex-1 h-px bg-surface-200" />
  </div>
);

const GoogleButton = ({ onClick, loading, label = "Continue with Google" }) => (
  <button type="button" onClick={onClick} disabled={loading}
    className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border-2 border-surface-200 bg-white hover:bg-surface-50 hover:border-surface-300 transition-all font-semibold text-surface-700 text-sm disabled:opacity-60">
    {loading ? <Loader2 size={16} className="animate-spin" /> : <GoogleIcon />}
    {label}
  </button>
);

// ─── Forgot Password Modal ────────────────────────────────────────────────────
const ForgotPasswordModal = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email");
    setSending(true);
    setNotFound(false);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSent(true);
    } catch (err) {
      if (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") {
        setNotFound(true);
      } else if (err.code === "auth/invalid-email") {
        toast.error("Invalid email address format");
      } else {
        toast.error("Failed to send reset email. Please try again.");
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-scale-in"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
            <KeyRound size={18} />
          </div>
          <div>
            <h2 className="font-bold text-surface-900">Reset Password</h2>
            <p className="text-xs text-surface-500">We'll email you a secure reset link</p>
          </div>
        </div>

        {sent ? (
          <div className="text-center py-2">
            <div className="text-5xl mb-3">📬</div>
            <p className="font-semibold text-surface-800 mb-2">Check your inbox!</p>
            <p className="text-sm text-surface-500 mb-3 leading-relaxed">
              We sent a password reset link to <strong>{email}</strong>. Click it to set a new password.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 text-left">
              <p className="text-xs text-amber-700 font-semibold mb-1">📁 Can't find the email?</p>
              <ul className="text-xs text-amber-600 space-y-1 leading-relaxed">
                <li>• Check your <strong>Spam</strong> or <strong>Junk</strong> folder</li>
                <li>• Gmail users: check the <strong>Promotions</strong> tab</li>
                <li>• Search for <em>noreply@firebase</em> in your inbox</li>
                <li>• Wait up to 2 minutes for delivery</li>
              </ul>
            </div>
            <button onClick={onClose} className="btn-primary w-full py-2.5">Done</button>
          </div>
        ) : notFound ? (
          <div className="text-center py-2">
            <div className="text-5xl mb-3">🔍</div>
            <p className="font-semibold text-surface-800 mb-2">No account found</p>
            <p className="text-sm text-surface-500 mb-4 leading-relaxed">
              We couldn't find any account with <strong>{email}</strong>. This email is not registered on SkillProof.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-5 text-left">
              <p className="text-xs text-blue-700 font-semibold mb-2">What would you like to do?</p>
              <ul className="text-xs text-blue-600 space-y-1.5">
                <li>• <strong>Try a different email</strong> — you may have signed up with another address</li>
                <li>• <strong>Create a new account</strong> — if you're new to SkillProof</li>
                <li>• <strong>Sign in with Google</strong> — if you used Google to sign up</li>
              </ul>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setNotFound(false); setEmail(""); }} className="btn-secondary flex-1 py-2 text-sm">
                Try Again
              </button>
              <Link to="/signup" onClick={onClose} className="btn-primary flex-1 py-2 text-sm text-center">
                Create Account
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Your Email Address</label>
              <input type="email" className="input" placeholder="you@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
            </div>
            <p className="text-xs text-surface-400 leading-relaxed">
              Enter the email you used when creating your SkillProof account.
            </p>
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="btn-secondary flex-1 py-2.5 text-sm">Cancel</button>
              <button type="submit" className="btn-primary flex-1 py-2.5 text-sm" disabled={sending}>
                {sending ? <Loader2 size={15} className="animate-spin" /> : "Send Reset Link"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// ─── Google Auth Handler ──────────────────────────────────────────────────────
const handleGoogleSignIn = async (navigate, defaultRole = "student") => {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    // Try popup first, fall back to redirect if blocked
    let result;
    try {
      result = await signInWithPopup(auth, provider);
    } catch (popupErr) {
      if (
        popupErr.code === "auth/popup-blocked" ||
        popupErr.code === "auth/popup-closed-by-user" ||
        popupErr.code === "auth/cancelled-popup-request"
      ) {
        if (popupErr.code === "auth/popup-blocked") {
          toast("Popup blocked — redirecting to Google...", { icon: "🔄" });
          await signInWithRedirect(auth, provider);
          return; // page will reload after redirect
        }
        return; // user closed popup
      }
      throw popupErr;
    }

    const firebaseUser = result.user;
    let profile = await getUserProfile(firebaseUser.uid);

    if (!profile) {
      // New Google user — create profile
      const rawUsername = firebaseUser.email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "");
      const username = rawUsername + Math.floor(Math.random() * 999);
      await createUserProfile(firebaseUser.uid, {
        name: firebaseUser.displayName || "User",
        email: firebaseUser.email,
        role: defaultRole,
        username,
        bio: "",
        skills: [],
        github: "",
        portfolio: "",
        photoURL: firebaseUser.photoURL || "",
        isActive: true,
      });
      profile = await getUserProfile(firebaseUser.uid);
      toast.success("Account created with Google! Welcome 🎉");
    } else {
      toast.success(`Welcome back, ${profile.name?.split(" ")[0]}! 👋`);
    }

    // Redirect based on role
    const routes = { student: "/dashboard", recruiter: "/recruiter", admin: "/admin" };
    navigate(routes[profile.role] || "/dashboard", { replace: true });

  } catch (err) {
    console.error("Google auth error:", err);
    if (err.code !== "auth/popup-closed-by-user" && err.code !== "auth/cancelled-popup-request") {
      toast.error(err.message || "Google sign-in failed. Please try again.");
    }
  }
};

// ─── Login Page ───────────────────────────────────────────────────────────────
export const LoginPage = () => {
  const { login, userProfile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  // Handle redirect result from Google (when popup was blocked)
  useEffect(() => {
    getRedirectResult(auth).then(async (result) => {
      if (result?.user) {
        let profile = await getUserProfile(result.user.uid);
        if (!profile) {
          const username = result.user.email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "") + Math.floor(Math.random() * 999);
          await createUserProfile(result.user.uid, {
            name: result.user.displayName || "User",
            email: result.user.email,
            role: "student",
            username,
            bio: "", skills: [], github: "", portfolio: "",
            photoURL: result.user.photoURL || "",
            isActive: true,
          });
          profile = await getUserProfile(result.user.uid);
        }
        const routes = { student: "/dashboard", recruiter: "/recruiter", admin: "/admin" };
        navigate(routes[profile?.role] || "/dashboard", { replace: true });
      }
    }).catch(() => {});
  }, []);

  // ── FIXED: Redirect when userProfile loads ──
  useEffect(() => {
    if (!authLoading && userProfile) {
      const routes = { student: "/dashboard", recruiter: "/recruiter", admin: "/admin" };
      navigate(routes[userProfile.role] || "/dashboard", { replace: true });
    }
  }, [userProfile, authLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await login(form.email.trim(), form.password);
      toast.success("Welcome back!");
      // Navigate immediately using profile from login
      const routes = { student: "/dashboard", recruiter: "/recruiter", admin: "/admin" };
      const role = result?.profile?.role || "student";
      navigate(routes[role] || "/dashboard", { replace: true });
    } catch (err) {
      console.log("LOGIN ERROR:", err.code);

      if (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") {
        toast((t) => (
          <div className="space-y-1.5">
            <p className="font-semibold text-sm text-gray-900">No account found</p>
            <p className="text-xs text-gray-500">
              <strong>{form.email}</strong> is not registered on SkillProof.
            </p>
            <p className="text-xs text-gray-500">
              New here?{" "}
              <a href="/signup" className="text-blue-600 font-semibold hover:underline" onClick={() => toast.dismiss(t.id)}>
                Create a free account →
              </a>
            </p>
            <button onClick={() => toast.dismiss(t.id)} className="text-xs text-gray-400">dismiss</button>
          </div>
        ), { duration: 8000, style: { maxWidth: "320px" } });

      } else if (err.code === "auth/wrong-password") {
        toast.error("Wrong password. Try again or click 'Forgot password?' to reset it.", { duration: 5000 });
      } else if (err.code === "auth/too-many-requests") {
        toast.error("Account temporarily locked due to too many attempts. Please reset your password.", { duration: 6000 });
      } else if (err.code === "auth/network-request-failed") {
        toast.error("Network error. Please check your internet connection.");
      } else {
        toast.error(err.message || "Login failed. Please try again.");
      }
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    await handleGoogleSignIn(navigate, "student");
    setGoogleLoading(false);
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your SkillProof account">
      <GoogleButton onClick={handleGoogle} loading={googleLoading} />
      <OrDivider />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1.5 flex items-center gap-1.5">
            <Mail size={13} /> Email Address
          </label>
          <input type="email" className="input" placeholder="you@example.com"
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            required autoComplete="email" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-surface-700">Password</label>
            <button type="button" onClick={() => setShowForgot(true)}
              className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
              <KeyRound size={11} /> Forgot password?
            </button>
          </div>
          <div className="relative">
            <input type={showPwd ? "text" : "password"} className="input pr-10"
              placeholder="Enter your password" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required autoComplete="current-password" />
            <button type="button" onClick={() => setShowPwd(!showPwd)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600">
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : "Sign In →"}
        </button>
      </form>

      <p className="text-center text-sm text-surface-500 mt-6">
        Don't have an account?{" "}
        <Link to="/signup" className="text-brand-600 hover:text-brand-700 font-medium">Create one free</Link>
      </p>

      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}
    </AuthLayout>
  );
};

// ─── Signup Page ──────────────────────────────────────────────────────────────
export const SignupPage = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get("role") || "student";

  const [form, setForm] = useState({ name: "", email: "", password: "", username: "", role: defaultRole });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailWarning, setEmailWarning] = useState("");

  // Validate email when recruiter types it
  const handleEmailChange = (email) => {
    setForm((prev) => ({ ...prev, email }));
    if (form.role === "recruiter" && email.includes("@")) {
      if (!isBusinessEmail(email)) {
        setEmailWarning("⚠️ Recruiters must use a business email (e.g. name@company.com). Personal emails like Gmail are not allowed.");
      } else {
        setEmailWarning("");
      }
    } else {
      setEmailWarning("");
    }
  };

  // Re-validate when role changes
  useEffect(() => {
    if (form.email.includes("@")) {
      if (form.role === "recruiter" && !isBusinessEmail(form.email)) {
        setEmailWarning("⚠️ Recruiters must use a business email (e.g. name@company.com).");
      } else {
        setEmailWarning("");
      }
    }
  }, [form.role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Please enter your name");
    if (form.username.length < 3) return toast.error("Username must be at least 3 characters");
    if (!/^[a-zA-Z0-9_]+$/.test(form.username)) return toast.error("Username: only letters, numbers, underscores");
    if (form.password.length < 6) return toast.error("Password must be at least 6 characters");

    // Block recruiters with personal emails
    if (form.role === "recruiter" && !isBusinessEmail(form.email)) {
      return toast.error("Recruiters must use a business email address. Personal emails (Gmail, Yahoo, etc.) are not allowed.", { duration: 5000 });
    }

    setLoading(true);
    try {
      await signup(form.email.trim(), form.password, form.name.trim(), form.role, form.username.toLowerCase().trim());
      toast.success("Account created! Welcome to SkillProof 🎉");
      const routes = { student: "/dashboard", recruiter: "/recruiter", admin: "/admin" };
      navigate(routes[form.role] || "/dashboard", { replace: true });
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        toast((t) => (
          <div className="space-y-1.5">
            <p className="font-semibold text-sm text-gray-900">Email already registered</p>
            <p className="text-xs text-gray-500"><strong>{form.email}</strong> already has an account.</p>
            <a href="/login" className="text-xs text-blue-600 font-semibold hover:underline block"
              onClick={() => toast.dismiss(t.id)}>→ Sign in instead</a>
            <button onClick={() => toast.dismiss(t.id)} className="text-xs text-gray-400">dismiss</button>
          </div>
        ), { duration: 8000, style: { maxWidth: "320px" } });
      } else {
        const msgs = {
          "auth/weak-password": "Password too weak. Use at least 6 characters.",
          "auth/invalid-email": "Invalid email address format.",
          "auth/network-request-failed": "Network error. Check your internet connection.",
          "auth/too-many-requests": "Too many attempts. Please wait and try again.",
        };
        toast.error(msgs[err.code] || err.message || "Failed to create account", { duration: 6000 });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    // Block Google signup for recruiters (can't verify business email)
    if (form.role === "recruiter") {
      toast.error("Recruiters must sign up with a business email, not Google.", { duration: 4000 });
      return;
    }
    setGoogleLoading(true);
    await handleGoogleSignIn(navigate, form.role);
    setGoogleLoading(false);
  };

  return (
    <AuthLayout title="Create an account" subtitle="Start proving your skills today — it's free">
      {/* Role selector */}
      <div className="flex gap-3 mb-5">
        {[
          { value: "student", label: "🎓 Student", desc: "Showcase my work" },
          { value: "recruiter", label: "🏢 Recruiter", desc: "Find talent" },
        ].map(({ value, label, desc }) => (
          <button key={value} type="button" onClick={() => setForm({ ...form, role: value })}
            className={`flex-1 p-3 rounded-xl border-2 text-left transition-all ${
              form.role === value ? "border-brand-400 bg-brand-50" : "border-surface-200 hover:border-surface-300"
            }`}>
            <div className="text-sm font-semibold text-surface-800">{label}</div>
            <div className="text-xs text-surface-500">{desc}</div>
          </button>
        ))}
      </div>

      {/* Google — only for students */}
      {form.role === "student" ? (
        <>
          <GoogleButton onClick={handleGoogle} loading={googleLoading} label="Sign up with Google" />
          <OrDivider />
        </>
      ) : (
        <div className="mb-5 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2">
          <AlertCircle size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 leading-relaxed">
            <strong>Recruiters must use a business email.</strong> Personal emails (Gmail, Yahoo, Outlook, etc.) are not accepted. Use your company email address.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Full Name *</label>
            <input className="input" placeholder="Jane Doe" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Username *</label>
            <input className="input" placeholder="janedoe" value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })} required />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Mail size={13} />
              {form.role === "recruiter" ? "Business Email *" : "Email Address *"}
            </span>
          </label>
          <input type="email" className={`input ${emailWarning ? "border-amber-400 focus:border-amber-500" : ""}`}
            placeholder={form.role === "recruiter" ? "you@yourcompany.com" : "you@example.com"}
            value={form.email} onChange={(e) => handleEmailChange(e.target.value)}
            required autoComplete="email" />
          {emailWarning && (
            <p className="text-xs text-amber-600 mt-1.5 flex items-start gap-1.5">
              <AlertCircle size={12} className="flex-shrink-0 mt-0.5" />
              {emailWarning}
            </p>
          )}
        </div>

        {form.role === "recruiter" && (
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Company Name</label>
            <input className="input" placeholder="Acme Corp" value={form.company || ""}
              onChange={(e) => setForm({ ...form, company: e.target.value })} />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1.5">Password * (min 6 chars)</label>
          <div className="relative">
            <input type={showPwd ? "text" : "password"} className="input pr-10"
              placeholder="Min 6 characters" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required autoComplete="new-password" />
            <button type="button" onClick={() => setShowPwd(!showPwd)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600">
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button type="submit" className="btn-primary w-full py-3"
          disabled={loading || (form.role === "recruiter" && !!emailWarning)}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : "Create Account →"}
        </button>
      </form>

      <p className="text-center text-sm text-surface-500 mt-6">
        Already have an account?{" "}
        <Link to="/login" className="text-brand-600 hover:text-brand-700 font-medium">Sign in</Link>
      </p>
    </AuthLayout>
  );
};
