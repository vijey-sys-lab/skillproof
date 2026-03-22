// src/lib/db.js
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "./firebase";

// ─── USER OPERATIONS ────────────────────────────────────────────────────────

export const createUserProfile = async (uid, data) => {
  await setDoc(doc(db, "users", uid), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    skillScore: 0,
    projects: [],
    bookmarks: [],
    isActive: true,
    photoURL: "",
  });
};

export const getUserProfile = async (uid) => {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const getUserByUsername = async (username) => {
  const q = query(collection(db, "users"), where("username", "==", username));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() };
};

export const updateUserProfile = async (uid, data) => {
  await updateDoc(doc(db, "users", uid), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const getAllStudents = async (skillFilter = null) => {
  let q = query(
    collection(db, "users"),
    where("role", "==", "student"),
    where("isActive", "==", true),
    orderBy("skillScore", "desc")
  );
  const snap = await getDocs(q);
  let students = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  if (skillFilter && skillFilter.length > 0) {
    students = students.filter((s) =>
      s.skills?.some((sk) =>
        skillFilter.some((f) => sk.toLowerCase().includes(f.toLowerCase()))
      )
    );
  }
  return students;
};

export const getTopStudents = async (count = 10) => {
  const q = query(
    collection(db, "users"),
    where("role", "==", "student"),
    where("isActive", "==", true),
    orderBy("skillScore", "desc"),
    limit(count)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// ─── PROJECT OPERATIONS ──────────────────────────────────────────────────────

export const addProject = async (projectData) => {
  const ref = await addDoc(collection(db, "projects"), {
    ...projectData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    status: "pending",
    likes: 0,
  });
  return ref.id;
};

export const getUserProjects = async (uid) => {
  const q = query(
    collection(db, "projects"),
    where("authorId", "==", uid),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getAllProjects = async (status = null) => {
  let q = status
    ? query(collection(db, "projects"), where("status", "==", status), orderBy("createdAt", "desc"))
    : query(collection(db, "projects"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const updateProject = async (projectId, data) => {
  await updateDoc(doc(db, "projects", projectId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteProject = async (projectId) => {
  await deleteDoc(doc(db, "projects", projectId));
};

// ─── BOOKMARK OPERATIONS ─────────────────────────────────────────────────────

export const bookmarkCandidate = async (recruiterId, studentId) => {
  await updateDoc(doc(db, "users", recruiterId), {
    bookmarks: arrayUnion(studentId),
  });
};

export const unbookmarkCandidate = async (recruiterId, studentId) => {
  await updateDoc(doc(db, "users", recruiterId), {
    bookmarks: arrayRemove(studentId),
  });
};

export const getBookmarkedStudents = async (recruiterBookmarks) => {
  if (!recruiterBookmarks || recruiterBookmarks.length === 0) return [];
  const students = await Promise.all(
    recruiterBookmarks.map((id) => getUserProfile(id))
  );
  return students.filter(Boolean);
};

// ─── SCORE OPERATIONS ────────────────────────────────────────────────────────

export const setSkillScore = async (studentId, score, adminNote = "") => {
  await updateDoc(doc(db, "users", studentId), {
    skillScore: score,
    scoreNote: adminNote,
    scoreUpdatedAt: serverTimestamp(),
  });
  await addDoc(collection(db, "scores"), {
    studentId,
    score,
    adminNote,
    createdAt: serverTimestamp(),
  });
};

// ─── ADMIN OPERATIONS ────────────────────────────────────────────────────────

export const getAllUsers = async () => {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const toggleUserStatus = async (uid, isActive) => {
  await updateDoc(doc(db, "users", uid), { isActive });
};

// ─── SUBMISSION OPERATIONS ───────────────────────────────────────────────────

export const addSubmission = async (data) => {
  return await addDoc(collection(db, "submissions"), {
    ...data,
    createdAt: serverTimestamp(),
    status: "pending",
  });
};

export const getUserSubmissions = async (uid) => {
  const q = query(
    collection(db, "submissions"),
    where("authorId", "==", uid),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getAllSubmissions = async () => {
  const q = query(collection(db, "submissions"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// ─── JOB OPERATIONS ──────────────────────────────────────────────────────────

export const addJob = async (data) => {
  return await addDoc(collection(db, "jobs"), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    isActive: true,
    applicants: [],
  });
};

export const getAllJobs = async () => {
  const q = query(
    collection(db, "jobs"),
    where("isActive", "==", true),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getRecruiterJobs = async (recruiterId) => {
  const q = query(
    collection(db, "jobs"),
    where("recruiterId", "==", recruiterId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const updateJob = async (jobId, data) => {
  await updateDoc(doc(db, "jobs", jobId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteJob = async (jobId) => {
  await deleteDoc(doc(db, "jobs", jobId));
};

export const applyToJob = async (jobId, studentId, studentName) => {
  await updateDoc(doc(db, "jobs", jobId), {
    applicants: arrayUnion({ studentId, studentName, appliedAt: new Date().toISOString() }),
  });
};