-- Seed initial data for the e-learning platform

-- Insert default domains
INSERT INTO domains (name, description, color) VALUES
('Informatique', 'Cours de programmation, développement web, bases de données', '#3b82f6'),
('Marketing', 'Marketing digital, stratégies commerciales, communication', '#10b981'),
('Design', 'Design graphique, UX/UI, création visuelle', '#8b5cf6'),
('Gestion', 'Management, leadership, gestion de projet', '#f59e0b')
ON CONFLICT DO NOTHING;

-- Updated to use simplified schema with 'name' and 'password' fields
-- Insert default admin user (password: admin123)
INSERT INTO users (email, password, name, role, is_active) VALUES
('admin@elearning.com', 'admin123', 'Admin System', 'admin', true)
ON CONFLICT (email) DO NOTHING;

-- Insert sample teacher
INSERT INTO users (email, password, name, role, is_active) VALUES
('prof.martin@elearning.com', 'teacher123', 'Jean Martin', 'teacher', true)
ON CONFLICT (email) DO NOTHING;

-- Insert sample students
INSERT INTO users (email, password, name, role, is_active) VALUES
('marie.dupont@student.com', 'student123', 'Marie Dupont', 'student', true),
('pierre.bernard@student.com', 'student123', 'Pierre Bernard', 'student', true)
ON CONFLICT (email) DO NOTHING;
