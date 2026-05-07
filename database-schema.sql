-- EMBA Connect Database Schema
-- PostgreSQL Database: EMBA_IITR

-- Create database
CREATE DATABASE EMBA_IITR;

-- Connect to database
\c EMBA_IITR;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================
-- USERS TABLE
-- Core user authentication and profile
-- ==============================================
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'professor', 'admin')),
    avatar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ==============================================
-- STUDENTS TABLE
-- Student-specific information
-- ==============================================
CREATE TABLE students (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    program VARCHAR(100) NOT NULL,
    student_id VARCHAR(50) UNIQUE NOT NULL,
    gpa DECIMAL(3, 2) CHECK (gpa >= 0 AND gpa <= 4.0),
    enrolled_year INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_students_student_id ON students(student_id);

-- ==============================================
-- PROFESSORS TABLE
-- Faculty information
-- ==============================================
CREATE TABLE professors (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    bio TEXT,
    email VARCHAR(255) NOT NULL,
    office_hours VARCHAR(100),
    linkedin_url TEXT,
    avatar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_professors_user_id ON professors(user_id);
CREATE INDEX idx_professors_department ON professors(department);

-- ==============================================
-- COURSES TABLE
-- Course catalog
-- ==============================================
CREATE TABLE courses (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    professor_id VARCHAR(50) NOT NULL REFERENCES professors(id) ON DELETE RESTRICT,
    credits INTEGER NOT NULL CHECK (credits > 0),
    description TEXT,
    semester VARCHAR(50),
    syllabus_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_courses_professor_id ON courses(professor_id);
CREATE INDEX idx_courses_code ON courses(code);

-- ==============================================
-- ENROLLMENTS TABLE
-- Student-course enrollments (many-to-many)
-- ==============================================
CREATE TABLE enrollments (
    student_id VARCHAR(50) NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_id VARCHAR(50) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (student_id, course_id)
);

CREATE INDEX idx_enrollments_student_id ON enrollments(student_id);
CREATE INDEX idx_enrollments_course_id ON enrollments(course_id);

-- ==============================================
-- CLASS_SESSIONS TABLE
-- Scheduled class sessions
-- ==============================================
CREATE TABLE class_sessions (
    id VARCHAR(50) PRIMARY KEY,
    course_id VARCHAR(50) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    topic VARCHAR(255) NOT NULL,
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    meeting_link TEXT,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_class_sessions_course_id ON class_sessions(course_id);
CREATE INDEX idx_class_sessions_date ON class_sessions(session_date);

-- ==============================================
-- ASSIGNMENTS TABLE
-- Course assignments
-- ==============================================
CREATE TABLE assignments (
    id VARCHAR(50) PRIMARY KEY,
    course_id VARCHAR(50) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMP NOT NULL,
    max_points INTEGER NOT NULL CHECK (max_points > 0),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'graded')),
    grade VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_assignments_course_id ON assignments(course_id);
CREATE INDEX idx_assignments_due_date ON assignments(due_date);
CREATE INDEX idx_assignments_status ON assignments(status);

-- ==============================================
-- RESOURCES TABLE
-- Learning materials and resources
-- ==============================================
CREATE TABLE resources (
    id VARCHAR(50) PRIMARY KEY,
    course_id VARCHAR(50) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('pdf', 'video', 'link', 'document')),
    url TEXT NOT NULL,
    uploaded_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_resources_course_id ON resources(course_id);
CREATE INDEX idx_resources_type ON resources(type);

-- ==============================================
-- ANNOUNCEMENTS TABLE
-- Institutional announcements
-- ==============================================
CREATE TABLE announcements (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(10) DEFAULT 'low' CHECK (priority IN ('low', 'medium', 'high')),
    announcement_date DATE NOT NULL,
    author VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_announcements_date ON announcements(announcement_date);
CREATE INDEX idx_announcements_priority ON announcements(priority);

-- ==============================================
-- NOTES TABLE
-- Student notes
-- ==============================================
CREATE TABLE notes (
    id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_id VARCHAR(50) REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notes_student_id ON notes(student_id);
CREATE INDEX idx_notes_course_id ON notes(course_id);

-- ==============================================
-- TRIGGERS
-- Auto-update updated_at timestamps
-- ==============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_professors_updated_at BEFORE UPDATE ON professors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_class_sessions_updated_at BEFORE UPDATE ON class_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON resources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- VIEWS
-- Convenient data access patterns
-- ==============================================

-- Student dashboard view
CREATE VIEW student_dashboard AS
SELECT 
    s.id as student_id,
    s.student_id as enrollment_number,
    u.name as student_name,
    u.email,
    s.gpa,
    COUNT(DISTINCT e.course_id) as enrolled_courses,
    COUNT(DISTINCT cs.id) as upcoming_classes
FROM students s
JOIN users u ON s.user_id = u.id
LEFT JOIN enrollments e ON s.id = e.student_id
LEFT JOIN courses c ON e.course_id = c.id
LEFT JOIN class_sessions cs ON c.id = cs.course_id AND cs.session_date >= CURRENT_DATE
GROUP BY s.id, s.student_id, u.name, u.email, s.gpa;

-- Professor schedule view
CREATE VIEW professor_schedule AS
SELECT 
    p.id as professor_id,
    p.name as professor_name,
    c.code as course_code,
    c.title as course_title,
    cs.topic,
    cs.session_date,
    cs.start_time,
    cs.end_time,
    cs.meeting_link
FROM professors p
JOIN courses c ON p.id = c.professor_id
JOIN class_sessions cs ON c.id = cs.course_id
ORDER BY cs.session_date, cs.start_time;

-- ==============================================
-- SAMPLE QUERIES
-- ==============================================

-- Get all students enrolled in a specific course
-- SELECT u.name, s.student_id, s.gpa
-- FROM enrollments e
-- JOIN students s ON e.student_id = s.id
-- JOIN users u ON s.user_id = u.id
-- WHERE e.course_id = 'c001';

-- Get upcoming classes for a student
-- SELECT c.code, c.title, cs.topic, cs.session_date, cs.start_time, cs.meeting_link
-- FROM enrollments e
-- JOIN courses c ON e.course_id = c.id
-- JOIN class_sessions cs ON c.id = cs.course_id
-- WHERE e.student_id = 's001' AND cs.session_date >= CURRENT_DATE
-- ORDER BY cs.session_date, cs.start_time;

-- Get pending assignments for a student
-- SELECT c.code, a.title, a.due_date, a.max_points
-- FROM enrollments e
-- JOIN courses c ON e.course_id = c.id
-- JOIN assignments a ON c.id = a.course_id
-- WHERE e.student_id = 's001' AND a.status = 'pending'
-- ORDER BY a.due_date;

COMMENT ON DATABASE EMBA_IITR IS 'EMBA Connect - Executive MBA Academic Management Platform';
