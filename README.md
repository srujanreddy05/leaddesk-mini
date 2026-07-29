# LeadDesk Mini

A small lead-capture product: a public landing page with a lead form, and a
password-protected admin dashboard for reviewing and managing submissions.

Built for the Digital Heroes Internship — Full Stack Development, Task A + Task B.

**Live landing page:** _add your Vercel URL here_
**Live admin dashboard:** _add your Vercel URL + /admin here_
**Backend API:** _add your Render URL here_

---

## Tech stack

- **Frontend:** React 18, Vite, Tailwind CSS, React Router, Axios
- **Backend:** Node.js, Express, MongoDB Atlas, Mongoose
- **Auth:** JWT stored in an httpOnly cookie, bcrypt password hashing
- **Deployment:** Frontend on Vercel, backend on Render

## Why bcryptjs instead of bcrypt

The brief mentions `bcrypt`. This project uses **bcryptjs** instead — it's a
pure-JavaScript implementation with an identical API, so nothing about the
hashing approach changes. The difference is that `bcrypt` compiles native
C++ bindings during install, which is a common source of broken deploys on
free-tier hosts like Render. `bcryptjs` avoids that risk entirely with no
downside for a project at this scale.

---

## Data model

**Lead**
```
name:      String, required, 2-100 chars
email:     String, required, valid email format
budget:    String, enum ["Under $1k", "$1k-5k", "$5k-20k", "$20k+"], required
message:   String, required, max 1000 chars
status:    String, enum ["New", "Contacted", "Closed"], default "New"
createdAt: Date, default now
```

**Admin**
```
username:     String, required, unique
passwordHash: String, required (bcrypt-style hash, 10 salt rounds)
createdAt:    Date, default now
```

There is no admin signup UI on purpose. The only admin account is created by
`npm run seed:admin`, which reads credentials from environment variables and
hashes the password before storing it. This means no admin credentials ever
appear anywhere in source control.

---

## Auth approach

Admin login issues a JWT (24h expiry) and sends it to the browser as an
**httpOnly cookie** — not in the response body, and never stored in
localStorage. This matters for two reasons:

1. **JavaScript on the page can never read the token**, which closes off an
   entire class of XSS-based token theft.
2. **It survives a fresh/incognito browser correctly** — the cookie is set
   once at login and the browser sends it automatically on every request to
   the API, so there's no client-side "is there a token in storage?" logic
   to get wrong or reset accidentally.

`GET /api/auth/me` lets the frontend ask "am I logged in?" on page load
without needing to store or inspect anything itself — `ProtectedRoute` just
calls it and redirects to `/admin/login` on a 401.

Login attempts are rate-limited (10 per 15 minutes per IP) to slow down
brute-force guessing against the single admin account.

---

## API reference

| Method | Route                  | Auth | Description |
|--------|--------------------------|------|--------------|
| POST   | `/api/leads`              | No   | Create a lead |
| GET    | `/api/leads`               | Yes  | List leads — supports `?search=`, `?status=`, `?page=`, `?limit=` |
| PUT    | `/api/leads/:id/status`     | Yes  | Update a lead's status |
| POST   | `/api/auth/login`           | No   | Log in, sets auth cookie |
| POST   | `/api/auth/logout`          | Yes  | Clears auth cookie |
| GET    | `/api/auth/me`              | Yes  | Returns the logged-in admin's identity |
| GET    | `/api/health`               | No   | Health check |

All responses use the shape `{ success: boolean, message?: string, data?: ... }`.

### Example: create a lead
```bash
curl -X POST http://localhost:5000/api/leads \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com","budget":"$1k-5k","message":"Need a landing page."}'
```
```json
{
  "success": true,
  "message": "Thanks! We'll be in touch soon.",
  "data": { "_id": "...", "name": "Jane Doe", "status": "New", "...": "..." }
}
```

### Example: log in (then list leads using the returned cookie)
```bash
curl -c cookies.txt -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"yourpassword"}'

curl -b cookies.txt "http://localhost:5000/api/leads?search=jane&status=New&page=1&limit=10"
```

---

## Local setup

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env
# Fill in MONGODB_URI, JWT_SECRET, ADMIN_SEED_USERNAME, ADMIN_SEED_PASSWORD
npm run seed:admin
npm run dev
```
Backend runs on `http://localhost:5000`.

### 2. Frontend
```bash
cd frontend
npm install
cp .env.example .env
# VITE_API_BASE_URL=http://localhost:5000/api
npm run dev
```
Frontend runs on `http://localhost:5173`.

---

## Deployment

### Backend → Render
1. Push this repo to GitHub.
2. On Render: **New → Web Service**, connect the repo, set:
   - Root directory: `backend`
   - Build command: `npm install`
   - Start command: `npm start`
3. Add environment variables (same keys as `backend/.env.example`):
   `MONGODB_URI`, `JWT_SECRET`, `ADMIN_SEED_USERNAME`, `ADMIN_SEED_PASSWORD`,
   `NODE_ENV=production`, `CORS_ORIGIN=<your Vercel URL>`.
4. After the first deploy, run `npm run seed:admin` once via Render's shell
   (or temporarily via a local connection to the Atlas cluster) to create
   the admin account.

### Frontend → Vercel
1. Import the repo on Vercel.
2. Root directory: `frontend`
3. Framework preset: Vite
4. Environment variable: `VITE_API_BASE_URL=<your Render URL>/api`
5. Deploy.

### Fix CORS
`CORS_ORIGIN` on the backend must exactly match the deployed Vercel URL
(including `https://`, no trailing slash), or the browser will silently
block the admin login cookie.

### Verify it actually works
Open the deployed frontend URL in an **incognito window** and:
1. Submit a lead on the landing page.
2. Go to `/admin/login`, log in with the seeded admin credentials.
3. Confirm the lead you just submitted appears, and change its status.

---

## Project structure
```
leaddesk-mini/
├── backend/
│   ├── src/
│   │   ├── config/db.js
│   │   ├── models/{Lead,Admin}.js
│   │   ├── controllers/{leadController,authController}.js
│   │   ├── middleware/{auth,errorHandler}.js
│   │   ├── routes/{leadRoutes,authRoutes}.js
│   │   ├── utils/validators.js
│   │   └── server.js
│   ├── scripts/seedAdmin.js
│   └── .env.example
└── frontend/
    └── src/
        ├── api/axios.js
        ├── components/{LeadForm,Footer,ProtectedRoute,StatusBadge}.jsx
        ├── pages/{Landing,AdminLogin,AdminDashboard}.jsx
        ├── App.jsx
        └── main.jsx
```

---

## AI usage disclosure

_Replace this paragraph with your own before submitting — it needs to be
true and specific to you, not copy-pasted._

I used Claude to scaffold the initial backend and frontend structure,
generate the Mongoose schemas, and implement the JWT/cookie auth flow. I
changed [specific things you adjusted — e.g. the budget range values, the
color scheme, added/removed a field, changed the search behavior] and made
the following judgment calls myself: [state at least one real decision you
made and why].
