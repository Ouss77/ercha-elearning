# Project Specifications Document

# Najm Academy Platform Specifications Document

## 1. Introduction

### 1.1 Purpose

This document defines the functional and non-functional requirements for the Najm Academy Platform, an online educational system designed to support in-person and free-access learning. The platform enables course management, student progress tracking, evaluations, certificate issuance, and role-based dashboards. It complies with data protection laws (e.g., loi 09-08 for consent and retention) and prioritizes simplicity, security, and usability.

### 1.2 Scope

- **In Scope**: User authentication, course creation and management, manual enrollments, quizzes/exams, progress tracking, certificate generation with QR verification, role-specific dashboards, basic notifications, and compliance features.
- **Out of Scope**: Payment integrations, private appointments, videoconferencing, advanced analytics (e.g., AI-driven insights), mobile apps, forums/social features, and third-party integrations (e.g., external calendars).
- **Assumptions**: Free access for all users (manual enrollment by admins); supports up to 500 concurrent users; developed as an MVP for beta testing with 5-10 users.
- **Constraints**: 12-week timeline; team of 2 developers plus product manager; tech stack limited to Next.js, PostgreSQL, Drizzle ORM, shadcn/ui, TailwindCSS, and supporting tools.

## 2. User Roles and Personas

The platform supports four roles with role-based access control (RBAC):

- **Student**: End-user learner. Accesses assigned courses, takes quizzes, views progress, downloads certificates.
  - Persona: 18-25 year-old in-person student; needs simple, mobile-friendly interface for tracking progress.
- **Trainer**: Content creator and evaluator. Creates and manages courses, grades quizzes, provides feedback.
  - Persona: Educator with basic tech skills; requires tools for uploading materials and monitoring students.
- **Sub-Admin**: Local school manager. Handles manual enrollments, tracks absences and notes, views local dashboards.
  - Persona: Administrative staff; focuses on in-person group management.
- **Admin**: System overseer. Manages users and roles, validates courses, oversees global dashboards, handles compliance (data export and deletion).
  - Persona: IT-savvy manager; needs audit logs and export tools.

## 3. Functional Requirements

- **Trainer**: Content creator and evaluator. Creates and manages courses, grades quizzes, provides feedback.
  - Persona: Educator with basic tech skills; requires tools for uploading materials and monitoring students.
- **Sub-Admin**: Local school manager. Handles manual enrollments, tracks absences and notes, views local dashboards.
  - Persona: Administrative staff; focuses on in-person group management.

### 3.1 User Management and Authentication

- **FR-UM1**: Users can register with email/password; verify via email link (Nodemailer).
- **FR-UM2**: Login with session management (NextAuth.js); optional 2FA if time allows.
- **FR-UM3**: Profile editing (name, photo upload).
- **FR-UM4**: Admins assign/modify roles; all actions logged for audits.
- **FR-UM5**: Consent form during registration for data processing (loi 09-08 compliance).

### 3.2 Navigation and Public Pages

- **FR-NP1**: Role-based sidebar navigation (shadcn/ui NavigationMenu).
- **FR-NP2**: Static public pages: Home, About, Partners, Contact.
- **FR-NP3**: Responsive design for mobile, tablet, and desktop (TailwindCSS breakpoints).

### 3.3 Course Catalogue and Management

- **FR-CM1**: Students browse/search courses (filter by title).
- **FR-CM2**: Trainers create/update/delete courses with chapters (videos/PDF uploads, limited to 10MB).
- **FR-CM3**: Admins validate courses before publishing.
- **FR-CM4**: Free access: Students view content only if enrolled.

### 3.4 Enrollments and Learning

- **FR-EL1**: Manual enrollment by Admin/Sub-Admin (assign users to courses).
- **FR-EL2**: Students access chapters, take quizzes/exams (MCQ auto-grading, open-ended manual).
- **FR-EL3**: Real-time progress tracking (% completion, updated via React Query).
- **FR-EL4**: Trainers provide feedback/comments; Sub-Admins log absences/notes for in-person students.

### 3.5 Certificates and Verification

- **FR-CV1**: Auto-generate certificates (PDF with QR code) on 100% progress + minimum score.
- **FR-CV2**: Public verification page (/verify?hash=...) to validate certificates via QR scan.
- **FR-CV3**: Admins/Trainers can recommend/issue certificates manually.

### 3.6 Dashboards and Reporting

- **FR-DR1**: Admin Dashboard: Global KPIs (active students, completion rates) with Recharts (line/bar charts); CSV exports (PapaParse).
- **FR-DR2**: Sub-Admin Dashboard: Local stats (enrollments, average notes, absences); filter by school/group.
- **FR-DR3**: Trainer Dashboard: Per-course stats (views, quiz results, drop-offs).
- **FR-DR4**: Student Dashboard: Personal progress, results, certificates; basic in-app/email notifications (e.g., completion alerts via Nodemailer).

### 3.7 API Layer

- **FR-API1**: RESTful endpoints (/api/users, /api/courses) with CRUD operations (Drizzle ORM).
- **FR-API2**: Validation with Zod; RBAC guards on all protected routes.
- **FR-API3**: Error handling with standardized responses (e.g., 403 for unauthorized).

## 4. Non-Functional Requirements

### 4.1 Performance

- Page load times < 3 seconds (caching with React Query/Redis if added).
- Support 500 concurrent users (Vercel scaling).
- Database queries optimized with indexes (Drizzle).

### 4.2 Security

- HTTPS/TLS enforcement.
- Password hashing (bcrypt); sensitive data encryption.
- RBAC(Role-Based Access Control) middleware; audit logs for all actions.
- Compliance with loi 09-08: User consent logs, data export/deletion APIs, retention policies (e.g., delete after 24 months).

### 4.3 Reliability and Maintainability

- 99% uptime target; basic monitoring (Sentry for errors).
- Code coverage: 70% unit/E2E tests (Vitest/Playwright).
- Dockerized for easy deployment; CI/CD via GitHub Actions.

### 4.4 Scalability

- Modular design for future additions (e.g., payments in v2).
- Database schema evolutivity (Drizzle migrations).

## 5. Data Model

### 5.1 Key Entities (PostgreSQL Schema via Drizzle)

- **Users**: id (serial), email (varchar), password (varchar hashed), role (enum: 'STUDENT', 'TRAINER', 'SUB_ADMIN', 'ADMIN'), name, photo_url, consent_timestamp.
- **Courses**: id, title, description, trainer_id (fk users), status (enum: 'draft', 'validated'), chapters (jsonb array of {title, video_url, pdf_url}).
- **Enrollments**: id, user_id (fk), course_id (fk), progress (float 0-100), notes (jsonb for absences/grades), feedback (text).
- **Quizzes**: id, course_id (fk), questions (jsonb array), type (enum: 'auto', 'manual').
- **Certificates**: id, enrollment_id (fk), issue_date, hash (uuid for QR), pdf_url.
- **Logs**: id, user_id, action (text), timestamp.

### 5.2 Relationships

- One-to-Many: Trainer to Courses; Course to Quizzes/Enrollments.
- Many-to-One: Enrollment to User/Course/Certificate.

## 6. Technical Stack

- **Frontend/Backend**: Next.js (App Router, TypeScript).
- **Database**: PostgreSQL with Drizzle ORM.
- **UI/Styling**: shadcn/ui, TailwindCSS.
- **Auth**: NextAuth.js.
- **Data Fetching**: React Query.
- **Charts**: Recharts.
- **Emails**: Nodemailer.
- **Validation**: Zod.
- **Testing**: Vitest, Playwright.
- **Deployment**: Vercel, Docker, GitHub Actions.
- **Other**: qrcode for certificates, pdf-lib for generation.

## 7. Testing and Quality Assurance

- **Unit Tests**: Core utils (e.g., grading logic) – 70% coverage.
- **E2E Tests**: Key flows (login, enrollment, quiz submission).
- **Security Testing**: Manual OWASP checks, npm audit.
- **Usability Testing**: Beta with 5-10 users; feedback loop via GitHub Issues.

## 8. Deployment and Maintenance

- **Environment**: Staging (Vercel) for PRs; Production post-beta.
- **CI/CD**: GitHub Actions for lint/test/deploy.
- **Monitoring**: Sentry for errors; Vercel Analytics for performance.
- **Backup**: Manual pg_dump; recovery <4 hours.
- **Post-Launch**: Hotfixes via GitHub; (and for v2 planning for out-of-scope features.)

---

> Appendices :

**Glossary**: KPI (Key Performance Indicator), RBAC (Role-Based Access Control), MVP (Minimum Viable Product).
**Approval**: Pending stakeholder review.

>

-
