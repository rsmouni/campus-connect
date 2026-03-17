# OpportuNet — AI Student Networking & Opportunity Matcher

A full-stack MERN application that uses Claude AI (Anthropic) for **semantic matching** between student profiles and opportunities — internships, research, competitions, and scholarships.

---

## Architecture

```
opportunet/
├── backend/          ← Express + MongoDB + Mongoose + Anthropic SDK
│   ├── models/       ← User, Profile, Opportunity, Match schemas
│   ├── routes/       ← auth, profile, opportunities, matches
│   ├── middleware/   ← JWT auth
│   ├── utils/        ← AI matcher (Claude), seed data
│   └── server.js
└── frontend/         ← React 18 + React Router v6
    └── src/
        ├── pages/    ← Login, Register, Dashboard, Matches, Opportunities, Profile
        ├── components/ ← Navbar, MatchCard
        ├── context/  ← AuthContext (JWT)
        └── api.js    ← Axios instance
```

---

## Quick Start

### 1. Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Anthropic API key → https://console.anthropic.com

---

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/opportunet
JWT_SECRET=change_this_to_a_long_random_string
ANTHROPIC_API_KEY=sk-ant-...
```

Seed the database with 12 real-world opportunities:
```bash
npm run seed
```

Start the server:
```bash
npm run dev      # development with nodemon
# or
npm start        # production
```

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start        # Runs on http://localhost:3000
```

The frontend proxies `/api/*` to `http://localhost:5000` via `package.json`.

---

## How the AI Matching Works

1. **Student Profile → Rich Text**: The system builds a detailed textual representation of the student including degree, GPA, skills, interests, courses, and project descriptions.

2. **Opportunity Text**: Each opportunity's title, description, requirements, and skills are structured into text.

3. **Claude Semantic Analysis**: The AI prompt instructs Claude to:
   - Understand **semantic relevance**, not just keyword overlap
   - Recognize **domain crossover** (e.g., image classification + healthcare → medical AI internship)
   - Identify **transferable skills** and **growth potential**
   - Score each match 0–100 with a calibrated rubric

4. **Rich Explanations**: For each match, Claude returns:
   - `explanation`: 2–3 sentence paragraph naming the student's **specific** projects/skills
   - `highlights`: 3–4 bullet-point reasons
   - `skillsMatched`: Array of relevant skills
   - `gapAnalysis`: Constructive growth feedback

5. **Results Cached**: Match documents are upserted in MongoDB so repeated views are instant. Re-running matching updates them.

---

## Key API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new student |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/profile/me` | Get student profile |
| PUT | `/api/profile/me` | Update profile |
| GET | `/api/profile/completeness` | Profile fill score |
| GET | `/api/opportunities` | List opportunities (filter, search, paginate) |
| POST | `/api/matches/generate` | **Run AI matching** |
| GET | `/api/matches` | Get cached matches (filter by type/score/saved) |
| PATCH | `/api/matches/:id/save` | Save/unsave a match |
| PATCH | `/api/matches/:id/apply` | Mark as applied |
| GET | `/api/matches/stats` | Dashboard statistics |

---

## Opportunity Update Mechanism

- Opportunities have a `deadline` field. The Mongoose `find` middleware automatically filters out expired listings.
- Run `npm run seed` anytime to reset with fresh data.
- Use `POST /api/opportunities` to add new listings programmatically (can be automated with a cron job hitting internship APIs).

---

## Judging Criteria Addressed

| Criterion | Implementation |
|-----------|---------------|
| **Matching relevance** | Claude performs semantic analysis, not keyword counting |
| **Explanation clarity** | Per-match plain-English explanations + bullet highlights |
| **UI design** | Dark, modern dashboard with score rings, animations, badges |
| **Profile diversity** | Handles any degree/domain — AI adapts to the profile content |
| **Opportunity updates** | Deadline-based auto-expiry + seed/manual add mechanism |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose ODM |
| AI | Anthropic Claude (claude-opus-4-5) via SDK |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Styling | Custom CSS with CSS variables, Google Fonts (Syne + Inter) |
