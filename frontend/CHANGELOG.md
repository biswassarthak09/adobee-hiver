# Adobee Hive Recruitment Portal - Changes Log

All notable changes, implementation tasks, and file updates for the Adobee Hive Talent Intelligence Platform are documented in this file.

## [1.1.0] - 2026-10-31

### Backend API Integration (`cv_analyzer`)
- **FastAPI CORS & Docker Enhancements**:
  - `backend/cv_analyzer/api.py`: Attached `CORSMiddleware` supporting browser requests from `localhost:3000` and container environments.
  - `backend/Dockerfile`: Fixed CMD from `main:app` to `cv_analyzer.api:app`.
  - `backend/requirements.txt`: Populated all production backend dependencies from `environment.yml`.
- **Frontend Reverse Proxy & Environment**:
  - `frontend/vite.config.ts`: Added `/api` proxy targeting `http://127.0.0.1:8000` with rewrite to streamline local dev without CORS blocks.
  - `frontend/src/vite-env.d.ts`: Added TypeScript declarations for `VITE_API_URL`, `VITE_API_KEY`, and `VITE_ADMIN_TOKEN`.
  - `.gitignore`: Created root ignore file covering `node_modules/`, `dist/`, `__pycache__/`, `*.pyc`, and `.env`.
- **API Contracts & Type Definitions**:
  - `frontend/src/types/index.ts`: Added `BackendPosition`, `BackendCandidateBrief`, `BackendFilterResponse`, and `BackendCVDossier` contracts.
- **Service Layer Overhaul**:
  - `frontend/src/services/api.ts`:
    - Implemented `fetchWithAuth<T>()` with automated `x-api-key` header injection.
    - Implemented `bootstrapOrganization()` for zero-friction provisioning of default "Adobee Hive" organization key.
    - Upgraded `useRequisitions()` to fetch active positions from `GET /positions` with robust fallback to `mockRequisitions` if database is unseeded.
    - Upgraded `useCandidates()` to fetch candidate briefs from `GET /positions/{id}/candidates` with data adaptation to `Candidate`.
    - Upgraded `useCandidate()` to fetch deep CV extractions from `GET /cvs/{doc_id}`.
    - Added `useRecruiterFilter()` and `useResetRecruiterFilter()` mutations for the backend LLM Recruiter Agent (`POST /positions/{id}/filter` and `POST /positions/{id}/filter/reset`).
    - Added `useReprocessCandidateCV()` mutation for `POST /cvs/{doc_id}/reprocess`.
- **View Integration**:
  - `JobPostingsView.tsx`: Displays live active positions from `GET /positions` with dynamic headcount, total talent metrics, and live sync badge; excluded requisition creation per user specification.
  - `CopilotChat.tsx`: Connected natural language recruiter queries to `useRecruiterFilter()` mutation, updating candidate roster and criteria tokens with real LLM reasoning; connected reset to `useResetRecruiterFilter()`.
  - `DossierView.tsx`: Connected to `useReprocessCandidateCV()` to queue background re-extraction of CV documents.
  - `SettingsView.tsx`: Added Backend CV Analyzer Connection card with live connection testing, manual API key override, and one-click organization auto-provisioning.

## [1.0.0] - 2026-10-31

### Design & Theme Integration
- **Obsidian Hive Precision Design System**:
  - Implemented authentic Stitch design theme (`projects/17365583965999936411`).
  - Colors: Cosmic obsidian `#090D16` / `#0F131C` / `#181B25` / `#1C1F29` / `#262A34`, Honey Amber primary `#F59E0B`, Electric Cyan secondary `#38BDF8`, Emerald tertiary `#10B981`, and Slate neutral typography.
  - Typography: Loaded `Geist` (headlines/display), `Inter` (body), and `JetBrains Mono` (metrics/labels/tokens), plus Google `Material Symbols Outlined`.

### Core Views Implemented
1. **Job Postings Directory (`JobPostingsView.tsx`)**:
   - Requisition orchestration command center with live KPI metric strip (Open Roles, Total Talent, Shortlisted, In Interview).
   - Department selector tabs: All Departments (18), Engineering (8), Product & Design (4), Sales & Marketing (3), Data & AI (3).
   - Search & Status bar with multi-state filters (Active, Urgent, Draft, Closed) and AI fit index sort.
   - Bento grid with featured lead requisition card (`Lead Full-Stack AI Engineer`, Req #AH-2049) and urgent/active role cards with hiring lead portraits, skill chips with live beacons, pipeline distribution counters, and direct candidate pool routing.
   - Bottom macro-efficiency metrics bar (Mean Time-to-Hire 18.4d, Offer Acceptance 91.8%, Sourcing Yield 2.4x).
2. **Candidate Pool & AI Co-pilot Filter (`CandidatePoolView.tsx`)**:
   - 100vh locked workbench with dual independent scrolling panes.
   - Left Column: `CopilotChat.tsx` with multi-turn prompt interaction, live competency synthesis bars (RAG 4/6, OSS 2/6), dismissible NL criteria vector chips (`Exp: 5+ yrs`, `Domain: RAG / LLM`, `Location: SF Hybrid`, `Match > 85%`), and quick prompt pills.
   - Right Column: Ranked candidate roster featuring Dr. Elena Rostova hero card (98% Overall Fit, Stanford Ph.D., Scale AI/Anthropic, verified check, compensation alignment) and secondary candidate cards.
3. **Candidate Backend Dossier (`DossierView.tsx`)**:
   - Single-source-of-truth technical telemetry view with applicant pool switcher rail and embedding cosine fit meter (0.984).
   - Candidate credentials, work authorization (US Citizen), 2-week notice period, GitHub and LinkedIn links.
   - Algorithmic evaluation breakdown dials: System Architecture (9.8/10), LLM/RAG (9.9/10), TypeScript/Python Async (9.6/10).
   - Automated AI code repository audit: 1,420 commits in 2024, 118 commits/mo, 4.8k stars, 0.02 pristine architecture smell.
   - The Work Number API employment history verification for Scale AI and Stripe.
   - Greenhouse ATS integration metadata, compensation alignment verification ($205k - $225k base), and stage progression workflow.
4. **Talent Intelligence Analytics (`AnalyticsView.tsx`)**:
   - Executive overview KPI cards (Total Active Pipeline 1,280, Avg Time to Fill 18.4d, AI Screening Accuracy 96.2%, Offer Acceptance Rate 91.8%).
   - Requisition Funnel Progression (Sourced 1,280 → AI Filtered 624 → First Round 248 → Technical Loop 94 → Executive Review 28 → Offer Extended 12).
   - Department Quality Distribution percentiles across Engineering, Product, GTM, and Design.
   - Circular SVG Donut chart attributing candidate sourcing channels (Direct 42%, AI Auto Inbound 31%, Referrals 18%, Exec Search 9%).
   - Top AI Natural Language Queries log with retrieval metrics and match accuracy.
5. **Settings & Cluster Configuration (`SettingsView.tsx`)**:
   - ATS platform webhooks (Greenhouse, Checkr, The Work Number).
   - Neural matcher model temperature and algorithmic weight calibration.

### Testing & Verification
- **Vitest Unit & Component Tests**: 5/5 passing tests in `App.test.tsx` and `CopilotChat.test.tsx`.
- **Playwright End-to-End Tests**: 1/1 passing full user journey test in `e2e/recruiter.spec.ts`.
- **Vite Production Bundle**: Zero-error compilation in `dist/`.
