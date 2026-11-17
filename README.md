# SkillMatch AI 🎯

> **Privacy-First, Transparent Résumé & Job Description Match Intelligence**  
> Built with the **MERN Stack** (MongoDB, Express.js, React, Node.js) and integrated with **Google Gemini 1.5/2.0 API** alongside a resilient deterministic semantic NLP fallback engine.

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue.svg)](https://reactjs.org/)
[![AI-Powered](https://img.shields.io/badge/AI-Google%20Gemini%20API-orange.svg)](https://ai.google.dev/)
[![Privacy Guard](https://img.shields.io/badge/Privacy-Sanitized%20PII%20%2B%20Zero%20Training-emerald.svg)]()
[![Tests](https://img.shields.io/badge/Tests-15%20Passed%20(100%25)-green.svg)]()

---

## 🌟 Key Highlights & Features

1. **Secure Account & Profile Management**
   - JWT-based authentication with bcrypt-hashed credentials.
   - Profile settings, privacy controls, and GDPR one-click account deletion ("Right to be Forgotten").
   - One-click instant demo login for reviewers and evaluators.

2. **Dual-Mode Résumé Ingestion**
   - **Upload File:** Direct in-memory parsing of `.pdf` (via `pdf-parse`), `.docx` (via `mammoth`), and `.txt` documents without saving unencrypted files to disk.
   - **Paste Text:** Clean text area with real-time character/word metrics and sample data pre-loaders.

3. **Transparent, Multi-Attribute Scoring Engine**
   - Eliminates arbitrary AI black-box numbers.
   - Deterministic 100-point weighted breakdown:
     - **Core Technical Competencies (40%):** Required vs verified languages, frameworks, databases, and DevOps tools.
     - **Professional Experience Depth (30%):** Tenure chronology comparison against requested seniority.
     - **Domain Knowledge & Soft Skills (20%):** Cross-functional collaboration, mentorship, code reviews, and leadership.
     - **Education & Certifications (10%):** Academic prerequisites and accredited cloud credentials.

4. **Actionable, Grounded Recommendations**
   - Grounded strictly in the candidate's genuine background (anti-hallucination guardrail).
   - Suggestions categorized by **STAR/XYZ Impact Quantification**, **Key Skill Gaps**, and **Role Framing**.
   - Clear ethical disclaimer: does not promise or guarantee hiring outcomes.

5. **Saved Analyses & History Management**
   - Searchable, filterable list of all previous evaluations.
   - Revisit full interactive dashboards at any time.
   - Single-click report export to formatted JSON or print-ready PDF.
   - Automated 90-day TTL (Time-To-Live) database deletion index.

6. **Privacy-By-Design Guarantee**
   - Automated PII sanitizer masks phone numbers, emails, physical addresses, and government IDs prior to AI processing or logging.
   - Zero model training: user resumes and job descriptions are never fed into public foundation model pools.
   - Zero sensitive information in server logs.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Client ["Client Layer (React 18 + Vite + Tailwind CSS)"]
        UI[User Interface & Studio]
        Radial[Score Radial & Breakdown Modal]
        SkillsComp[Competencies & Gaps Grid]
        ExpComp[Tenure & Seniority Analysis]
        ActionsComp[Actionable Grounded Suggestions]
        AuthCtx[Auth Context & JWT Storage]
    end

    subgraph Server ["Server Layer (Node.js & Express)"]
        Router[REST API Router]
        AuthMW[JWT Verification & Rate Limiters]
        MulterMW[Memory-Buffer Upload Middleware]
        Parser[Document Parser (PDF / DOCX / TXT)]
        PIISanitizer[PII Sanitizer & Redactor]
        Scoring[Transparent Scoring Engine]
        AISvc[AI Match Service]
        Logger[Privacy-Preserving Safe Logger]
    end

    subgraph AI ["AI Intelligence Layer"]
        Gemini[Google Gemini 1.5/2.0 API]
        NLPFallback[Deterministic Semantic NLP Engine]
    end

    subgraph DB ["Data Layer"]
        Mongo[(MongoDB / Atlas)]
        MemFallback[(Resilient Memory Fallback Store)]
    end

    UI -->|Upload or Paste| Router
    Router --> AuthMW
    Router --> MulterMW
    MulterMW --> Parser
    Parser --> PIISanitizer
    PIISanitizer --> AISvc
    AISvc -->|If API Key Present| Gemini
    AISvc -->|Offline / Fallback| NLPFallback
    AISvc --> Scoring
    Scoring --> Mongo
    Scoring -.->|Offline Mode| MemFallback
    Router -->|JSON Analysis Payload| UI
```

---

## 🗄️ MongoDB Data Models

### 1. User Schema (`User.js`)
| Field | Type | Attributes | Description |
|---|---|---|---|
| `name` | String | required, trim, min: 2 | Candidate full name |
| `email` | String | required, unique, indexed | Account login email |
| `password` | String | required, bcrypt hash, `select: false` | Hashed password (12 rounds) |
| `headline` | String | optional, trim | Current role / headline |
| `privacyConsent` | Object | timestamps, booleans | Explicit data processing consent |
| `createdAt` | Date | auto | Account registration timestamp |

### 2. Analysis Schema (`Analysis.js`)
| Field | Type | Description |
|---|---|---|
| `user` | ObjectId (Ref: User) | Indexed owner of the analysis |
| `jobTitle` | String | Target role title |
| `jobCompany` | String | Hiring company name (optional) |
| `jobDescriptionSummary` | String | Sanitized excerpt of target job |
| `resumeSource` | String (`file_upload` \| `text_paste`) | Origin mode of résumé input |
| `resumeFormat` | String (`pdf` \| `docx` \| `txt`) | Document format |
| `overallScore` | Number (0-100) | Weighted multi-attribute score |
| `tier` | String | Score tier ('Strong', 'Good', 'Partial', 'Low') |
| `formulaExplanation` | String | Mathematical breakdown explanation |
| `categoryBreakdown` | Object | Scores for Tech (40), Exp (30), Soft (20), Edu (10) |
| `matchedSkills` | Array<{ name, category, verifiedInResume }> | Detected matching keywords |
| `missingSkills` | Array<{ name, category, required }> | Detected gap competencies |
| `experienceAnalysis` | Object | Candidate tenure vs requested target |
| `suggestions` | Array<{ category, action, rationale, priority }> | Grounded recommendations |
| `sanitizationReport` | Object | Counts of redacted emails, phones, and addresses |
| `expiresAt` | Date (TTL Index) | Auto-deleted by MongoDB after retention period |

---

## 🔌 API Endpoints Specification

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | None (Rate Limited) | Create new user account |
| `POST` | `/api/auth/login` | None (Rate Limited) | Authenticate & receive JWT token |
| `GET` | `/api/auth/me` | Bearer Token | Fetch current profile |
| `PUT` | `/api/auth/profile` | Bearer Token | Update name or headline |
| `DELETE` | `/api/auth/account` | Bearer Token | Permanently delete account and all analyses |
| `GET` | `/api/auth/privacy` | None | Privacy policy and data handling details |
| `POST` | `/api/analyses` | Bearer Token (Rate Limited) | Analyze résumé (file upload or raw text) vs JD |
| `GET` | `/api/analyses` | Bearer Token | Fetch user's saved analyses list (with search & sort) |
| `GET` | `/api/analyses/:id` | Bearer Token | Fetch full analysis report by ID |
| `DELETE` | `/api/analyses/:id` | Bearer Token | Delete specific saved analysis report |
| `DELETE` | `/api/analyses/clear-all` | Bearer Token | Clear all analysis history for user |
| `GET` | `/api/analyses/:id/export` | Bearer Token | Download analysis as formatted JSON file |
| `POST` | `/api/resumes/preview` | Bearer Token | Preview parsed text & detected skills without scoring |
| `GET` | `/api/health` | None | System status and database readiness check |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** v18.0.0 or higher
- **npm** v9.0.0 or higher
- **MongoDB** (Local instance or MongoDB Atlas URI; *an automatic in-memory fallback will activate if MongoDB is not running*)

### 1. Installation
Clone or navigate to the repository directory and install all dependencies:

```bash
# Install root, server, and client dependencies
npm run install:all
```

*(Alternatively, install each folder individually: `cd server && npm install`, `cd ../client && npm install`)*

### 2. Configure Environment Variables
Copy the `.env.example` file in `server/` to `server/.env`:

```bash
# In server/
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/skillmatch
JWT_SECRET=skillmatch_dev_secret_key_change_in_production
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
DATA_RETENTION_DAYS=90

# Optional: Add your Google Gemini API key for deep LLM analysis.
# If left empty, SkillMatch AI's deterministic NLP engine will handle matching seamlessly!
GEMINI_API_KEY=
```

### 3. Run Development Servers
Start both the backend API and frontend client concurrently:

```bash
npm run dev
```

- **Frontend Client:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000](http://localhost:5000)
- **Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

### 4. Running the Test Suite
Execute the automated test suite covering unit scoring, PII sanitization, and full REST integration:

```bash
npm test
```

---

## 🔒 Security & Privacy Implementation

- **In-Memory File Buffers:** Uploaded PDF and DOCX files are extracted directly in RAM using `multer.memoryStorage()`. No unencrypted files touch the server file system.
- **PII Scrubbing:** Before text is analyzed by AI or logged, email addresses, phone numbers, government IDs, and street addresses are replaced with privacy tokens (`[CANDIDATE_EMAIL]`, `[CANDIDATE_PHONE]`).
- **Safe Logging:** The internal `logger.js` strips JWT tokens, passwords, and sensitive expressions from console output.
- **Anti-Hallucination Grounding:** Prompts instruct the AI to only evaluate and reference details explicitly present in the résumé. Recommendations focus on clarifying genuine background, and never invent qualifications or promise hiring selection.
- **Automated Retention Purge:** Records are indexed with MongoDB TTL indices to automatically purge after 90 days.
