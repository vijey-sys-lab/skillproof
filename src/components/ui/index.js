// src/components/ui/index.js
import React from "react";
import { Loader2 } from "lucide-react";

// ─── Spinner ────────────────────────────────────────────────────────────────
export const Spinner = ({ size = 20, className = "" }) => (
  <Loader2 size={size} className={`animate-spin text-brand-500 ${className}`} />
);

// ─── Loading Page ────────────────────────────────────────────────────────────
export const LoadingPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-surface-50">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center animate-pulse">
        <span className="text-white font-bold text-xl font-display">S</span>
      </div>
      <Spinner size={24} />
      <p className="text-surface-500 text-sm font-medium">Loading SkillProof…</p>
    </div>
  </div>
);

// ─── Skill Tag ────────────────────────────────────────────────────────────────
const TAG_COLORS = [
  "skill-tag-blue", "skill-tag-purple", "skill-tag-green",
  "skill-tag-orange", "skill-tag-pink", "skill-tag-teal", "skill-tag-yellow"
];

export const SkillTag = ({ skill, onRemove, size = "md" }) => {
  const colorIdx = skill.charCodeAt(0) % TAG_COLORS.length;
  const colorClass = TAG_COLORS[colorIdx];
  return (
    <span className={`skill-tag ${colorClass} ${size === "sm" ? "text-xs px-2 py-0.5" : ""}`}>
      {skill}
      {onRemove && (
        <button
          onClick={() => onRemove(skill)}
          className="ml-1 opacity-60 hover:opacity-100 text-current"
          type="button"
        >
          ×
        </button>
      )}
    </span>
  );
};

// ─── Score Badge ──────────────────────────────────────────────────────────────
export const ScoreBadge = ({ score, size = "md" }) => {
  const scoreClass =
    score >= 80 ? "score-excellent" :
    score >= 60 ? "score-good" :
    score >= 40 ? "score-average" : "score-low";
  
  const sizeClass = size === "lg"
    ? "w-16 h-16 text-xl"
    : size === "sm"
    ? "w-9 h-9 text-sm"
    : "w-12 h-12 text-base";

  return (
    <div className={`score-badge ${scoreClass} ${sizeClass}`}>
      {score}
    </div>
  );
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
export const StatusBadge = ({ status }) => {
  const map = {
    approved: "status-approved",
    pending: "status-pending",
    rejected: "status-rejected",
  };
  const labels = { approved: "✓ Approved", pending: "⏳ Pending", rejected: "✗ Rejected" };
  return (
    <span className={`status-badge ${map[status] || "status-pending"}`}>
      {labels[status] || status}
    </span>
  );
};

// ─── Avatar ───────────────────────────────────────────────────────────────────
export const Avatar = ({ src, name, size = 40 }) => {
  const initials = name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

  if (src && !src.includes("dicebear")) {
    return (
      <img
        src={src}
        alt={name}
        className="rounded-full object-cover flex-shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="rounded-full bg-gradient-to-br from-brand-400 to-accent-500 flex items-center justify-center text-white font-bold flex-shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials}
    </div>
  );
};

// ─── Empty State ──────────────────────────────────────────────────────────────
export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    {Icon && (
      <div className="w-16 h-16 rounded-2xl bg-surface-100 flex items-center justify-center mb-4">
        <Icon size={28} className="text-surface-400" />
      </div>
    )}
    <h3 className="text-lg font-semibold text-surface-700 mb-1">{title}</h3>
    <p className="text-sm text-surface-400 max-w-xs">{description}</p>
    {action && <div className="mt-5">{action}</div>}
  </div>
);

// ─── Modal ────────────────────────────────────────────────────────────────────
export const Modal = ({ isOpen, onClose, title, children, size = "md" }) => {
  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full ${sizes[size]} animate-scale-in`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-surface-100">
          <h2 className="text-lg font-bold text-surface-900">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-surface-400 hover:bg-surface-100 hover:text-surface-700 transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

// ─── Confirmation Dialog ──────────────────────────────────────────────────────
export const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, danger = false }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
    <p className="text-sm text-surface-600 mb-6">{message}</p>
    <div className="flex gap-3 justify-end">
      <button onClick={onClose} className="btn-secondary text-sm py-2 px-4">Cancel</button>
      <button
        onClick={onConfirm}
        className={danger ? "btn-danger" : "btn-primary text-sm py-2 px-4"}
      >
        Confirm
      </button>
    </div>
  </Modal>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────
export const StatCard = ({ label, value, icon: Icon, color = "blue", trend }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
    pink: "bg-pink-50 text-pink-600",
  };

  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color]}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-2xl font-bold text-surface-900 font-display">{value}</p>
        <p className="text-sm text-surface-500">{label}</p>
        {trend && (
          <p className={`text-xs mt-0.5 font-medium ${trend > 0 ? "text-green-600" : "text-red-500"}`}>
            {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}% this week
          </p>
        )}
      </div>
    </div>
  );
};

// ─── Search Bar ───────────────────────────────────────────────────────────────
export const SearchBar = ({ value, onChange, placeholder = "Search…" }) => (
  <div className="relative">
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 text-sm">🔍</span>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="input pl-9 pr-4"
    />
  </div>
);

// ─── Skill Input ──────────────────────────────────────────────────────────────
export const SkillInput = ({ skills, onChange }) => {
  const [input, setInput] = React.useState("");

  const addSkill = (skill) => {
    const trimmed = skill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      onChange([...skills, trimmed]);
    }
    setInput("");
  };

  const handleKey = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill(input);
    } else if (e.key === "Backspace" && !input && skills.length > 0) {
      onChange(skills.slice(0, -1));
    }
  };

  const removeSkill = (skill) => onChange(skills.filter((s) => s !== skill));

  return (
    <div className="border-1.5 border-surface-200 rounded-xl p-3 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100 transition-all"
      style={{ border: "1.5px solid #e2e8f0" }}>
      <div className="flex flex-wrap gap-2 mb-2">
        {skills.map((s) => (
          <SkillTag key={s} skill={s} onRemove={removeSkill} />
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKey}
        onBlur={() => input && addSkill(input)}
        placeholder={skills.length === 0 ? "Type a skill and press Enter…" : "Add more…"}
        className="w-full text-sm text-surface-700 placeholder-surface-400 outline-none bg-transparent"
      />
    </div>
  );
};

// ─── Project Card ─────────────────────────────────────────────────────────────
export const ProjectCard = ({ project, onEdit, onDelete, showStatus = true }) => (
  <div className="card card-interactive p-5 cursor-default">
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-surface-900 text-sm leading-tight">{project.title}</h3>
          {showStatus && <StatusBadge status={project.status} />}
        </div>
        <p className="text-xs text-surface-500 line-clamp-2">{project.description}</p>
      </div>
    </div>
    
    {project.techStack?.length > 0 && (
      <div className="flex flex-wrap gap-1.5 mb-3">
        {project.techStack.slice(0, 4).map((t) => (
          <SkillTag key={t} skill={t} size="sm" />
        ))}
        {project.techStack.length > 4 && (
          <span className="text-xs text-surface-400">+{project.techStack.length - 4}</span>
        )}
      </div>
    )}

    <div className="flex items-center gap-3 pt-3 border-t border-surface-100">
      {project.link && (
        <a
          href={project.link}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-brand-500 hover:text-brand-700 font-medium flex items-center gap-1"
        >
          🔗 View Project
        </a>
      )}
      {project.github && (
        <a
          href={project.github}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-surface-500 hover:text-surface-700 font-medium flex items-center gap-1"
        >
          ⌥ GitHub
        </a>
      )}
      <div className="ml-auto flex gap-2">
        {onEdit && (
          <button onClick={() => onEdit(project)} className="text-xs text-surface-400 hover:text-brand-500 transition-colors">Edit</button>
        )}
        {onDelete && (
          <button onClick={() => onDelete(project)} className="text-xs text-surface-400 hover:text-red-500 transition-colors">Delete</button>
        )}
      </div>
    </div>
  </div>
);
