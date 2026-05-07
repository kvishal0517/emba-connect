/**
 * EMBA Connect Data Service
 * 
 * Production-ready data layer with mock data for frontend use
 */

import type {
  User,
  Student,
  Professor,
  Course,
  Enrollment,
  ClassSession,
  Assignment,
  Resource,
  Announcement,
  Note
} from '../types';

// Import mock data directly
import {
  usersData,
  studentsData,
  professorsData,
  coursesData,
  enrollmentsData,
  classSessionsData,
  assignmentsData,
  resourcesData,
  announcementsData,
  notesData
} from './mockData';

// Data source type
type DataSource = 'database' | 'json';

class DataService {
  private dataSource: DataSource = 'json';
  private initialized = false;

  // In-memory storage (mutable for create/update operations)
  private data = {
    users: [...usersData] as User[],
    students: [...studentsData] as Student[],
    professors: [...professorsData] as Professor[],
    courses: [...coursesData] as Course[],
    enrollments: [...enrollmentsData] as Enrollment[],
    classSessions: [...classSessionsData] as ClassSession[],
    assignments: [...assignmentsData] as Assignment[],
    resources: [...resourcesData] as Resource[],
    announcements: [...announcementsData] as Announcement[],
    notes: [...notesData] as Note[],
  };

  constructor() {
    console.log('✅ DataService initialized with mock data:', {
      users: this.data.users.length,
      students: this.data.students.length,
      professors: this.data.professors.length,
      courses: this.data.courses.length,
      enrollments: this.data.enrollments.length,
      classSessions: this.data.classSessions.length,
      assignments: this.data.assignments.length,
      resources: this.data.resources.length,
      announcements: this.data.announcements.length,
      notes: this.data.notes.length,
    });
    this.initialize();
  }

  /**
   * Initialize data service
   */
  private async initialize() {
    if (this.initialized) return;
    
    this.dataSource = 'json';
    console.log('📁 Data Service: Using mock data');
    this.initialized = true;
  }

  /**
   * Get current data source
   */
  getDataSource(): DataSource {
    return this.dataSource;
  }

  // ==================== USER METHODS ====================

  async getUsers(): Promise<User[]> {
    return this.data.users;
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.data.users.find(u => u.id === id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.data.users.find(u => u.email === email);
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return this.data.users.filter(u => u.role === role);
  }

  // ==================== STUDENT METHODS ====================

  async getStudents(): Promise<Student[]> {
    return this.data.students;
  }

  async getStudentById(id: string): Promise<Student | undefined> {
    return this.data.students.find(s => s.id === id);
  }

  async getStudentByUserId(userId: string): Promise<Student | undefined> {
    return this.data.students.find(s => s.userId === userId);
  }

  // ==================== PROFESSOR METHODS ====================

  async getProfessors(): Promise<Professor[]> {
    return this.data.professors;
  }

  async getProfessorById(id: string): Promise<Professor | undefined> {
    return this.data.professors.find(p => p.id === id);
  }

  async getProfessorByUserId(userId: string): Promise<Professor | undefined> {
    return this.data.professors.find(p => p.userId === userId);
  }

  // ==================== COURSE METHODS ====================

  async getCourses(): Promise<Course[]> {
    return this.data.courses;
  }

  async getCourseById(id: string): Promise<Course | undefined> {
    return this.data.courses.find(c => c.id === id);
  }

  async getCoursesByStudent(studentId: string): Promise<Course[]> {
    const enrollments = this.data.enrollments.filter(e => e.studentId === studentId);
    const courseIds = enrollments.map(e => e.courseId);
    return this.data.courses.filter(c => courseIds.includes(c.id));
  }

  async getCoursesByProfessor(professorId: string): Promise<Course[]> {
    return this.data.courses.filter(c => c.professorId === professorId);
  }

  // ==================== ENROLLMENT METHODS ====================

  async getEnrollments(): Promise<Enrollment[]> {
    return this.data.enrollments;
  }

  async getEnrollmentsByStudent(studentId: string): Promise<Enrollment[]> {
    return this.data.enrollments.filter(e => e.studentId === studentId);
  }

  async getEnrollmentsByCourse(courseId: string): Promise<Enrollment[]> {
    return this.data.enrollments.filter(e => e.courseId === courseId);
  }

  // ==================== CLASS SESSION METHODS ====================

  async getClassSessions(): Promise<ClassSession[]> {
    return this.data.classSessions;
  }

  async getClassSessionById(id: string): Promise<ClassSession | undefined> {
    return this.data.classSessions.find(c => c.id === id);
  }

  async getClassSessionsByCourse(courseId: string): Promise<ClassSession[]> {
    return this.data.classSessions.filter(c => c.courseId === courseId);
  }

  async getClassSessionsByStudent(studentId: string): Promise<ClassSession[]> {
    const enrollments = this.data.enrollments.filter(e => e.studentId === studentId);
    const courseIds = enrollments.map(e => e.courseId);
    return this.data.classSessions.filter(c => courseIds.includes(c.courseId));
  }

  async getClassSessionsByProfessor(professorId: string): Promise<ClassSession[]> {
    const courses = await this.getCoursesByProfessor(professorId);
    const courseIds = courses.map(c => c.id);
    return this.data.classSessions.filter(c => courseIds.includes(c.courseId));
  }

  async createClassSession(session: Omit<ClassSession, 'id'>): Promise<ClassSession> {
    const newSession: ClassSession = {
      ...session,
      id: `cls${Date.now()}`,
    };
    this.data.classSessions.push(newSession);
    return newSession;
  }

  async updateClassSession(id: string, updates: Partial<ClassSession>): Promise<ClassSession | undefined> {
    const index = this.data.classSessions.findIndex(c => c.id === id);
    if (index === -1) return undefined;
    
    this.data.classSessions[index] = {
      ...this.data.classSessions[index],
      ...updates,
    };
    return this.data.classSessions[index];
  }

  async deleteClassSession(id: string): Promise<boolean> {
    const index = this.data.classSessions.findIndex(c => c.id === id);
    if (index === -1) return false;
    
    this.data.classSessions.splice(index, 1);
    return true;
  }

  // ==================== ASSIGNMENT METHODS ====================

  async getAssignments(): Promise<Assignment[]> {
    return this.data.assignments;
  }

  async getAssignmentById(id: string): Promise<Assignment | undefined> {
    return this.data.assignments.find(a => a.id === id);
  }

  async getAssignmentsByCourse(courseId: string): Promise<Assignment[]> {
    return this.data.assignments.filter(a => a.courseId === courseId);
  }

  async getAssignmentsByStudent(studentId: string): Promise<Assignment[]> {
    const enrollments = this.data.enrollments.filter(e => e.studentId === studentId);
    const courseIds = enrollments.map(e => e.courseId);
    return this.data.assignments.filter(a => courseIds.includes(a.courseId));
  }

  async updateAssignment(id: string, updates: Partial<Assignment>): Promise<Assignment | undefined> {
    const index = this.data.assignments.findIndex(a => a.id === id);
    if (index === -1) return undefined;
    
    this.data.assignments[index] = {
      ...this.data.assignments[index],
      ...updates,
    };
    return this.data.assignments[index];
  }

  async submitAssignment(id: string, submissionData?: { fileName?: string; fileSize?: number }): Promise<Assignment | undefined> {
    const assignment = this.data.assignments.find(a => a.id === id);
    if (!assignment) return undefined;
    
    const index = this.data.assignments.findIndex(a => a.id === id);
    this.data.assignments[index] = {
      ...assignment,
      status: 'submitted',
      submittedDate: new Date().toISOString(),
    };
    return this.data.assignments[index];
  }

  // ==================== RESOURCE METHODS ====================

  async getResources(): Promise<Resource[]> {
    return this.data.resources;
  }

  async getResourceById(id: string): Promise<Resource | undefined> {
    return this.data.resources.find(r => r.id === id);
  }

  async getResourcesByCourse(courseId: string): Promise<Resource[]> {
    return this.data.resources.filter(r => r.courseId === courseId);
  }

  // ==================== ANNOUNCEMENT METHODS ====================

  async getAnnouncements(): Promise<Announcement[]> {
    return this.data.announcements;
  }

  async getAnnouncementById(id: string): Promise<Announcement | undefined> {
    return this.data.announcements.find(a => a.id === id);
  }

  // ==================== NOTE METHODS ====================

  async getNotes(): Promise<Note[]> {
    return this.data.notes;
  }

  async getNoteById(id: string): Promise<Note | undefined> {
    return this.data.notes.find(n => n.id === id);
  }

  async getNotesByStudent(studentId: string): Promise<Note[]> {
    return this.data.notes.filter(n => n.studentId === studentId);
  }

  async getNotesByCourse(courseId: string): Promise<Note[]> {
    return this.data.notes.filter(n => n.courseId === courseId);
  }

  async createNote(note: Omit<Note, 'id' | 'createdDate' | 'updatedDate'>): Promise<Note> {
    const newNote: Note = {
      ...note,
      id: `note${Date.now()}`,
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
    };
    this.data.notes.push(newNote);
    return newNote;
  }

  async updateNote(id: string, updates: Partial<Omit<Note, 'id' | 'createdDate'>>): Promise<Note | undefined> {
    const index = this.data.notes.findIndex(n => n.id === id);
    if (index === -1) return undefined;
    
    this.data.notes[index] = {
      ...this.data.notes[index],
      ...updates,
      updatedDate: new Date().toISOString(),
    };
    return this.data.notes[index];
  }

  async deleteNote(id: string): Promise<boolean> {
    const index = this.data.notes.findIndex(n => n.id === id);
    if (index === -1) return false;
    
    this.data.notes.splice(index, 1);
    return true;
  }

  // ==================== USER UPDATE METHODS ====================

  async updateUser(id: string, updates: Partial<Omit<User, 'id'>>): Promise<User | undefined> {
    const index = this.data.users.findIndex(u => u.id === id);
    if (index === -1) return undefined;
    
    this.data.users[index] = {
      ...this.data.users[index],
      ...updates,
    };
    return this.data.users[index];
  }
}

// Export singleton instance
const dataService = new DataService();
export default dataService;