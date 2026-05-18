# SkillKwiz Backend API

Production-ready Node.js + Express + MongoDB backend for the SkillKwiz skill assessment platform.

---

## 1. Frontend Analysis

The SkillKwiz frontend (Next.js + Tailwind) has the following components mapped to backend needs:

| Frontend Component | Backend Requirement |
|---|---|
| `login-section.tsx` | `POST /api/auth/login`, `POST /api/auth/register`, Google OAuth |
| `employee-registeration.tsx` | `POST /api/candidates/register` + resume upload, OTP send/verify |
| `employer-registeration.tsx` | `POST /api/employers/register`, OTP send/verify |
| `employer-candidate-list.tsx` | `GET /api/candidates` with filters (search, location, gender, skills, jobFamily) |
| `employer-assessment-request.tsx` | `POST /api/employers/assessment-request` + resume upload |
| `schedule-assessment.tsx` | `POST /api/assessments/schedule` |
| `contact/page.tsx` | `POST /api/contact` |
| `blog/page.tsx` | `GET /api/blogs` with pagination + filters |

**User Roles detected:** `employee` (candidate), `employer`, `admin`

**Auth flows detected:** Email/password login, Registration with role selection, Google OAuth, OTP verification (email + phone), Forgot password placeholder

---

## 2. Backend Architecture

```
skillkwiz-backend/
├── server.js               # Entry point
├── config/
│   ├── db.js               # MongoDB connection
│   └── passport.js         # JWT + Google OAuth strategies
├── controllers/
│   ├── auth.controller.js
│   ├── candidate.controller.js
│   ├── employer.controller.js
│   ├── assessment.controller.js
│   └── misc.controller.js  # OTP, Blog, Skill, Contact, Upload
├── middleware/
│   ├── auth.middleware.js   # JWT protect, authorize, optionalAuth
│   ├── validate.middleware.js
│   ├── upload.middleware.js # Multer config
│   └── errorHandler.js
├── models/
│   ├── User.model.js
│   ├── Candidate.model.js
│   ├── Employer.model.js
│   ├── Assessment.model.js  # Assessment + AssessmentRequest
│   ├── Blog.model.js
│   ├── Skill.model.js       # Skill + OTP
│   └── Contact.model.js
├── routes/
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── candidate.routes.js
│   ├── employer.routes.js
│   ├── assessment.routes.js
│   ├── blog.routes.js
│   ├── skill.routes.js
│   ├── otp.routes.js
│   ├── contact.routes.js
│   └── upload.routes.js
├── utils/
│   ├── token.utils.js
│   ├── email.utils.js
│   └── otp.utils.js
└── uploads/
    ├── resumes/
    └── general/
```

---

## 3. Installation

```bash
cd skillkwiz-backend
npm install
```

**Required npm packages:**
```bash
npm install express mongoose bcryptjs jsonwebtoken cors helmet morgan dotenv express-validator express-rate-limit multer nodemailer passport passport-jwt passport-google-oauth20 twilio uuid
npm install --save-dev nodemon jest supertest
```

---

## 4. Environment Setup

```bash
cp .env.example .env
# Edit .env with your values
```

Minimum required for local dev:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/skillkwiz
JWT_SECRET=any_long_random_string_here
JWT_REFRESH_SECRET=another_long_random_string
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

---

## 5. Running the Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Health check: `GET http://localhost:5000/health`

---

## 6. API Reference

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | None | Register new user |
| POST | `/api/auth/login` | None | Login |
| POST | `/api/auth/refresh-token` | None | Refresh access token |
| GET | `/api/auth/me` | Bearer | Get current user |
| POST | `/api/auth/logout` | Bearer | Logout |
| PUT | `/api/auth/change-password` | Bearer | Change password |
| GET | `/api/auth/google` | None | Google OAuth redirect |
| GET | `/api/auth/google/callback` | None | Google OAuth callback |

### OTP
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/otp/send` | Optional | Send email or phone OTP |
| POST | `/api/otp/verify` | Optional | Verify OTP |

### Candidates
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/candidates/register` | employee | Register profile + upload resume |
| GET | `/api/candidates/me` | employee | Get my profile |
| PUT | `/api/candidates/me` | employee | Update my profile |
| GET | `/api/candidates` | employer/admin | Search & filter candidates |
| GET | `/api/candidates/:id` | employer/admin | Get candidate by ID |

### Employers
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/employers/register` | employer | Register employer profile |
| GET | `/api/employers/me` | employer | Get my profile |
| PUT | `/api/employers/me` | employer | Update profile |
| POST | `/api/employers/assessment-request` | employer | Request assessment for candidate |
| GET | `/api/employers/assessment-requests` | employer | List my requests |

### Assessments
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/assessments/schedule` | employee | Schedule assessment |
| GET | `/api/assessments/my` | employee | My assessments |
| GET | `/api/assessments/:id` | employee | Assessment detail |
| PATCH | `/api/assessments/:id/cancel` | employee | Cancel assessment |

### Blogs
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/blogs` | Optional | List published blogs |
| GET | `/api/blogs/:slug` | Optional | Get blog by slug |
| POST | `/api/blogs` | admin | Create blog |
| PATCH | `/api/blogs/:id/publish` | admin | Publish blog |

### Skills
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/skills` | None | List skills catalog |
| POST | `/api/skills` | admin | Add skill |

### Contact
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/contact` | None | Submit contact form |

### Uploads
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/uploads/resume` | Bearer | Upload resume file |

---

## 7. Database Schemas

### User
```js
{ name, email, password (hashed), role: ['employee','employer','admin'],
  googleId, isEmailVerified, isPhoneVerified, isActive, lastLogin, timestamps }
```

### Candidate
```js
{ user (ref), firstName, lastName, email, phone, resume: {filename, path, size},
  skills: [{name, level, verified}], location, jobFamily, experience, education,
  assessments, percentileScore, gender, isProfileComplete, timestamps }
```

### Employer
```js
{ user (ref), firstName, lastName, company, email, phone, department,
  authorized, authorizationDetails, assessmentRequests, isVerified, timestamps }
```

### Assessment
```js
{ candidate (ref), company, skills[], scheduledDate, scheduledTime, centre,
  country, zipCode, status, score, percentile, confirmationSent, timestamps }
```

### AssessmentRequest
```js
{ employer (ref), candidateFirstName, candidateLastName, candidateEmail,
  skills[], resumePath, status, notes, notificationSent, timestamps }
```

### Blog
```js
{ title, slug (auto), excerpt, content, coverImage, author (ref), category,
  tags, status, publishedAt, readTime, views, featured, timestamps }
```

### OTP
```js
{ identifier, type: ['email','phone'], otp, purpose, expiresAt (10min),
  verified, attempts, timestamps } // TTL index auto-deletes expired OTPs
```

---

## 8. Frontend Integration

In your Next.js frontend, set the API base URL:

**`lib/api.ts`** (create this in your frontend):
```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = {
  async request(method: string, path: string, body?: any, token?: string) {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    return res.json();
  }
};
```

**Replace mock functions in `login-section.tsx`:**
```typescript
// Instead of mockLogin:
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});
const data = await response.json();
if (data.success) {
  localStorage.setItem('token', data.data.accessToken);
  // redirect to dashboard
}
```

**Replace mock resume upload in `employee-registeration.tsx`:**
```typescript
const formData = new FormData();
formData.append('resume', file);
formData.append('firstName', formData.firstName);
// ... other fields

const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/candidates/register`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  body: formData,
});
```

**Send OTP:**
```typescript
await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/otp/send`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ identifier: email, type: 'email' }),
});
```

**Add to `next.config.js`:**
```js
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## 9. Request/Response Format

All responses follow this structure:
```json
{
  "success": true | false,
  "message": "Human readable message",
  "data": { ... },
  "errors": [{ "field": "email", "message": "Email is required" }]
}
```

---

## 10. Deployment

### Docker
```bash
# Build
docker build -t skillkwiz-backend .

# Run
docker run -p 5000:5000 --env-file .env skillkwiz-backend
```

### Railway / Render
1. Connect your GitHub repo
2. Set environment variables from `.env.example`
3. Set build command: `npm install`
4. Set start command: `npm start`

### MongoDB Atlas
Replace `MONGO_URI` with your Atlas connection string:
```
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/skillkwiz?retryWrites=true
```

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Use a strong `JWT_SECRET` (32+ random chars)
- [ ] Use MongoDB Atlas (not local)
- [ ] Configure Gmail App Password or SendGrid for email
- [ ] Configure Twilio for SMS OTP
- [ ] Set `CLIENT_URL` to your deployed frontend URL
- [ ] Add Google OAuth credentials in Google Cloud Console
- [ ] Enable HTTPS

---

## 11. Testing

```bash
npm test
```

Manual test with curl:
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Test@1234","role":"employee"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@1234"}'
```
