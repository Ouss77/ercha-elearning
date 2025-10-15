Connecting to database...
Connected successfully!

=== TABLES IN DATABASE ===

Tables: chapter_progress, chapters, courses, domains, enrollments, final_projects, project_submissions, quiz_attempts, quizzes, users

=== ENUMS IN DATABASE ===

No enums found

=== TABLE STRUCTURES ===


Table: chapter_progress
  - id: integer NOT NULL DEFAULT nextval('chapter_progress_id_seq'::regclass)
  - student_id: integer nullable
  - chapter_id: integer nullable
  - completed_at: timestamp without time zone nullable DEFAULT CURRENT_TIMESTAMP
  Foreign Keys:
    - student_id -> users(id)
    - chapter_id -> chapters(id)

Table: chapters
  - id: integer NOT NULL DEFAULT nextval('chapters_id_seq'::regclass)
  - course_id: integer nullable
  - title: character varying(200) NOT NULL
  - description: text nullable
  - order_index: integer NOT NULL
  - content_type: character varying(20) NOT NULL
  - content_data: jsonb NOT NULL
  - created_at: timestamp without time zone nullable DEFAULT CURRENT_TIMESTAMP
  Foreign Keys:
    - course_id -> courses(id)

Table: courses
  - id: integer NOT NULL DEFAULT nextval('courses_id_seq'::regclass)
  - title: character varying(200) NOT NULL
  - description: text nullable
  - domain_id: integer nullable
  - teacher_id: integer nullable
  - thumbnail_url: text nullable
  - is_active: boolean nullable DEFAULT true
  - created_at: timestamp without time zone nullable DEFAULT CURRENT_TIMESTAMP
  - updated_at: timestamp without time zone nullable DEFAULT CURRENT_TIMESTAMP
  Foreign Keys:
    - domain_id -> domains(id)
    - teacher_id -> users(id)

Table: domains
  - id: integer NOT NULL DEFAULT nextval('domains_id_seq'::regclass)
  - name: character varying(100) NOT NULL
  - description: text nullable
  - color: character varying(7) nullable DEFAULT '#6366f1'::character varying
  - created_at: timestamp without time zone nullable DEFAULT CURRENT_TIMESTAMP

Table: enrollments
  - id: integer NOT NULL DEFAULT nextval('enrollments_id_seq'::regclass)
  - student_id: integer nullable
  - course_id: integer nullable
  - enrolled_at: timestamp without time zone nullable DEFAULT CURRENT_TIMESTAMP
  - completed_at: timestamp without time zone nullable
  Foreign Keys:
    - student_id -> users(id)
    - course_id -> courses(id)

Table: final_projects
  - id: integer NOT NULL DEFAULT nextval('final_projects_id_seq'::regclass)
  - course_id: integer nullable
  - title: character varying(200) NOT NULL
  - description: text NOT NULL
  - requirements: jsonb nullable
  - created_at: timestamp without time zone nullable DEFAULT CURRENT_TIMESTAMP
  Foreign Keys:
    - course_id -> courses(id)

Table: project_submissions
  - id: integer NOT NULL DEFAULT nextval('project_submissions_id_seq'::regclass)
  - student_id: integer nullable
  - final_project_id: integer nullable
  - submission_url: text nullable
  - description: text nullable
  - status: character varying(20) nullable DEFAULT 'submitted'::character varying
  - feedback: text nullable
  - grade: integer nullable
  - submitted_at: timestamp without time zone nullable DEFAULT CURRENT_TIMESTAMP
  - reviewed_at: timestamp without time zone nullable
  Foreign Keys:
    - student_id -> users(id)
    - final_project_id -> final_projects(id)

Table: quiz_attempts
  - id: integer NOT NULL DEFAULT nextval('quiz_attempts_id_seq'::regclass)
  - student_id: integer nullable
  - quiz_id: integer nullable
  - answers: jsonb NOT NULL
  - score: integer NOT NULL
  - passed: boolean NOT NULL
  - attempted_at: timestamp without time zone nullable DEFAULT CURRENT_TIMESTAMP
  Foreign Keys:
    - student_id -> users(id)
    - quiz_id -> quizzes(id)

Table: quizzes
  - id: integer NOT NULL DEFAULT nextval('quizzes_id_seq'::regclass)
  - chapter_id: integer nullable
  - title: character varying(200) NOT NULL
  - questions: jsonb NOT NULL
  - passing_score: integer nullable DEFAULT 70
  - created_at: timestamp without time zone nullable DEFAULT CURRENT_TIMESTAMP
  Foreign Keys:
    - chapter_id -> chapters(id)

Table: users
  - id: integer NOT NULL DEFAULT nextval('users_id_seq'::regclass)
  - email: character varying(255) NOT NULL
  - password: character varying(255) NOT NULL
  - name: character varying(200) NOT NULL
  - role: character varying(20) NOT NULL
  - is_active: boolean nullable DEFAULT true
  - avatar_url: text nullable
  - created_at: timestamp without time zone nullable DEFAULT CURRENT_TIMESTAMP
  - updated_at: timestamp without time zone nullable DEFAULT CURRENT_TIMESTAMP