# SkillProof — Complete Setup Guide

A full-stack SaaS hiring platform where students prove skills through projects, 
and recruiters hire based on verified work — not resumes.

---

## 📁 Project File Structure

```
skillproof/
├── public/
│   └── index.html                  # HTML entry point
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   └── Sidebar.js          # Sidebar + DashboardLayout wrapper
│   │   └── ui/
│   │       └── index.js            # All reusable UI components
│   ├── context/
│   │   └── AuthContext.js          # Firebase Auth + user profile state
│   ├── lib/
│   │   ├── firebase.js             # Firebase app initialization
│   │   └── db.js                   # All Firestore CRUD operations
│   ├── pages/
│   │   ├── Landing.js              # Public landing page
│   │   ├── Auth.js                 # Login + Signup pages
│   │   ├── StudentDashboard.js     # Student: home, profile, projects, submissions
│   │   ├── RecruiterDashboard.js   # Recruiter: home, browse, saved candidates
│   │   ├── AdminDashboard.js       # Admin: users, projects, scores, submissions
│   │   └── PublicProfile.js        # Public /user/:username + Leaderboard
│   ├── styles/
│   │   └── globals.css             # Global CSS, fonts, design tokens
│   ├── App.js                      # Router + all routes
│   └── index.js                    # React DOM entry
├── firestore.rules                 # Firestore security rules
├── firestore.indexes.json          # Composite indexes for queries
├── firebase.json                   # Firebase hosting config
├── vercel.json                     # Vercel deployment config
├── tailwind.config.js              # Tailwind CSS config
├── package.json                    # Dependencies
├── .env.example                    # Environment variable template
└── .gitignore
```

---

## 🚀 Step-by-Step Setup Instructions

### STEP 1 — Prerequisites

Make sure you have these installed:

```bash
node --version    # Need v16+ (v18+ recommended)
npm --version     # Need v8+
```

If Node is not installed, download from https://nodejs.org

---

### STEP 2 — Create a Firebase Project

1. Go to https://console.firebase.google.com
2. Click **"Add project"**
3. Enter project name: `skillproof` (or any name)
4. Disable Google Analytics (optional for MVP)
5. Click **"Create project"**

---

### STEP 3 — Enable Firebase Authentication

1. In Firebase Console → your project → **Build → Authentication**
2. Click **"Get started"**
3. Under **Sign-in method**, click **"Email/Password"**
4. Toggle **Enable** to ON
5. Click **Save**

---

### STEP 4 — Create Firestore Database

1. In Firebase Console → **Build → Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in test mode"** (we'll add security rules later)
4. Select your preferred region (e.g. `us-central` or closest to your users)
5. Click **"Enable"**

---

### STEP 5 — Get Firebase Config Keys

1. In Firebase Console → **Project Settings** (gear icon ⚙️ in left sidebar)
2. Scroll down to **"Your apps"** section
3. Click the **Web icon** `</>`
4. Register your app name: `skillproof-web`
5. **Do NOT check** "Firebase Hosting" here (we'll do it later)
6. Click **"Register app"**
7. You'll see a config object like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "skillproof-xxxx.firebaseapp.com",
  projectId: "skillproof-xxxx",
  storageBucket: "skillproof-xxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

**Copy all these values** — you'll need them in the next step.

---

### STEP 6 — Set Up the Project Locally

```bash
# 1. Clone or download this project folder
cd skillproof

# 2. Install dependencies
npm install

# 3. Copy the environment file
cp .env.example .env
```

Now open `.env` and fill in your Firebase values:

```env
REACT_APP_FIREBASE_API_KEY=AIzaSy...
REACT_APP_FIREBASE_AUTH_DOMAIN=skillproof-xxxx.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=skillproof-xxxx
REACT_APP_FIREBASE_STORAGE_BUCKET=skillproof-xxxx.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef
```

---

### STEP 7 — Install Tailwind CSS

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Then add this to your `src/index.js` or `src/App.js` — it's already included via `globals.css`.

Make sure `src/styles/globals.css` starts with:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

### STEP 8 — Run the Development Server

```bash
npm start
```

Your app will open at http://localhost:3000

You should see the SkillProof landing page. ✅

---

### STEP 9 — Create Your First Admin Account

1. Go to http://localhost:3000/signup
2. Sign up as a **Student** first (to test the flow)
3. Then go to Firebase Console → **Firestore Database**
4. Find your user document under the `users` collection
5. Click the document → **Edit** the `role` field
6. Change `"student"` → `"admin"`
7. Log out and log back in — you now have Admin access!

**Alternative:** Sign up directly with role "admin" by temporarily 
modifying `src/pages/Auth.js` to add an "Admin" option in the role selector.

---

### STEP 10 — Set Up Firestore Security Rules

1. In Firebase Console → **Firestore Database → Rules**
2. Replace all existing content with the contents of `firestore.rules`
3. Click **"Publish"**

---

### STEP 11 — Create Firestore Indexes

Some queries need composite indexes. Either:

**Option A — Let Firebase auto-create them:**
Run the app, trigger each page (browse talent, admin panels), and Firebase 
will show error links in the browser console. Click each link to auto-create indexes.

**Option B — Deploy indexes manually:**
```bash
npm install -g firebase-tools
firebase login
firebase init firestore     # Select your project
firebase deploy --only firestore:indexes
```

---

## 🌐 Deployment Options

### Option A — Deploy to Vercel (Recommended — Easiest)

1. Push your code to GitHub
2. Go to https://vercel.com → **New Project**
3. Import your GitHub repo
4. In **Environment Variables**, add all 6 Firebase keys from your `.env`
5. Click **Deploy**

Done! Vercel will auto-deploy on every git push. ✅

### Option B — Deploy to Firebase Hosting (Free)

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize (select your project, hosting, build folder)
firebase init hosting

# Build the app
npm run build

# Deploy
firebase deploy
```

Your app will be live at: `https://your-project-id.web.app`

---

## 👥 User Roles & Test Accounts

After setting up, create these accounts manually through the signup page:

| Role      | Go to                   | Action              |
|-----------|-------------------------|---------------------|
| Student   | `/signup`               | Choose "Student"    |
| Recruiter | `/signup`               | Choose "Recruiter"  |
| Admin     | Firestore → edit `role` | Set to `"admin"`    |

### Role Capabilities

**Student** (`/dashboard`)
- Edit profile: name, bio, skills, GitHub, portfolio
- Upload projects with tech stack + links
- Submit assignments for admin review
- View their Skill Score and admin feedback
- Share public profile: `/user/username`

**Recruiter** (`/recruiter`)
- Browse all students
- Filter by skills, sort by score
- View full public profiles
- Bookmark / save candidates
- Access saved candidates list

**Admin** (`/admin`)
- View all users (students, recruiters)
- Approve / reject project submissions
- Assign Skill Scores (0–100) with written notes
- Review task submissions
- Enable / disable user accounts

---

## 🗄️ Firestore Database Schema

### `users` collection
```
users/{uid}
  name: string
  email: string
  username: string          # unique, used in /user/:username
  role: "student" | "recruiter" | "admin"
  bio: string
  skills: string[]          # ["React", "Python", ...]
  github: string            # URL
  portfolio: string         # URL
  skillScore: number        # 0–100, set by admin
  scoreNote: string         # admin's written feedback
  bookmarks: string[]       # recruiter's saved student UIDs
  isActive: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
```

### `projects` collection
```
projects/{projectId}
  title: string
  description: string
  techStack: string[]       # ["React", "Firebase", ...]
  link: string              # live demo URL
  github: string            # GitHub URL
  authorId: string          # UID of student
  authorName: string        # denormalized for display
  status: "pending" | "approved" | "rejected"
  createdAt: Timestamp
  updatedAt: Timestamp
```

### `submissions` collection
```
submissions/{submissionId}
  title: string
  taskDescription: string
  submissionUrl: string
  notes: string
  authorId: string
  authorName: string
  status: "pending" | "approved" | "rejected"
  createdAt: Timestamp
```

### `scores` collection (audit log)
```
scores/{scoreId}
  studentId: string
  score: number
  adminNote: string
  createdAt: Timestamp
```

---

## 🎨 Design System Reference

### Color Palette
- **Primary**: `#0ea5e9` (sky blue) — brand actions, highlights
- **Accent**: `#d946ef` (fuchsia) — gradients, score badges
- **Surface**: `#f8fafc` to `#0f172a` — backgrounds and text
- **Green**: Approved / active states
- **Amber**: Pending / warning states
- **Red**: Rejected / danger states

### Typography
- **Display**: Clash Display (headings, titles, scores)
- **Body**: Satoshi (paragraphs, UI text)
- **Mono**: JetBrains Mono (skill tags, code)

### Skill Score Ranges
| Score | Label       | Color  |
|-------|-------------|--------|
| 80–100 | Exceptional | Green  |
| 60–79  | Proficient  | Blue   |
| 40–59  | Intermediate| Amber  |
| 0–39   | Beginner    | Red    |

---

## 🔧 Common Issues & Fixes

### "Firebase: Error (auth/invalid-credential)"
→ Double-check your `.env` values. Make sure there are no extra spaces.

### "Missing or insufficient permissions"
→ Your Firestore rules are too strict. Temporarily set to test mode in Firebase Console.

### "The query requires an index"
→ Click the link in the browser console error — it auto-creates the index in Firebase.

### Blank page after deploy
→ Ensure `vercel.json` or `firebase.json` has SPA routing configured (rewrites all to `/index.html`).

### Fonts not loading
→ Check internet connection. Fonts load from `api.fontshare.com` and `fonts.googleapis.com`.

---

## 📈 Scaling Beyond MVP

When ready to grow:

1. **Image uploads**: Add Firebase Storage for profile photos and project screenshots
2. **Email notifications**: Use Firebase Functions + SendGrid for score notifications
3. **Real-time updates**: Replace `getDocs` with `onSnapshot` for live data
4. **Search**: Integrate Algolia for full-text search across student profiles
5. **Analytics**: Add Firebase Analytics or Mixpanel for usage tracking
6. **Certificates**: Use `jsPDF` or Puppeteer to generate downloadable skill certificates
7. **Messaging**: Build recruiter-to-student messaging with Firestore subcollections

---

## 🛡️ Security Checklist Before Going Live

- [ ] Replace Firestore test mode rules with `firestore.rules` content
- [ ] Deploy indexes via `firebase deploy --only firestore:indexes`
- [ ] Ensure `.env` is in `.gitignore` (never commit API keys)
- [ ] Set environment variables in Vercel / Firebase Hosting dashboard
- [ ] Enable **App Check** in Firebase Console for production
- [ ] Audit admin accounts — only trusted team members should have `role: "admin"`

---

## 📦 All Dependencies

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.20.0",
  "firebase": "^10.7.0",
  "react-hot-toast": "^2.4.1",
  "lucide-react": "^0.294.0",
  "date-fns": "^2.30.0",
  "tailwindcss": "^3.x (devDependency)",
  "postcss": "^8.x (devDependency)",
  "autoprefixer": "^10.x (devDependency)"
}
```

---

Built with ❤️ using React, Firebase, and Tailwind CSS.
