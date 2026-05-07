import { addDays, format, subDays } from 'date-fns';
import dataService from '../services/dataService';

// Re-export types from centralized location
export type {
  Role,
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

// --- Backward Compatibility Layer ---
// This maintains the original db interface while using the new data service

export const db = {
  getCurrentUser: async () => {
    // In a real app, get from auth context
    const users = await dataService.getUsersByRole('student');
    
    if (!users || users.length === 0) {
      console.error('No student users found in database');
      // Return a default user for demo purposes
      const allUsers = await dataService.getUsers();
      return allUsers.find(u => u.role === 'student') || null;
    }
    
    return users[0]; // Default mock user
  },
  
  getCourses: async () => {
    return await dataService.getCourses();
  },
  
  getClasses: async () => {
    const classes = await dataService.getClassSessions();
    return classes.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.startTime}`).getTime();
      const dateB = new Date(`${b.date}T${b.startTime}`).getTime();
      return dateA - dateB;
    });
  },
  
  getAssignments: async () => {
    const assignments = await dataService.getAssignments();
    return assignments.sort((a, b) => 
      new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );
  },
  
  getResources: async (courseId?: string) => {
    if (courseId) {
      return await dataService.getResourcesByCourse(courseId);
    }
    return await dataService.getResources();
  },
  
  getAnnouncements: async () => {
    return await dataService.getAnnouncements();
  },
  
  getProfessors: async () => {
    return await dataService.getProfessors();
  },
  
  // Helpers
  getProfessorById: async (id: string) => {
    return await dataService.getProfessorById(id);
  },
  
  getCourseById: async (id: string) => {
    return await dataService.getCourseById(id);
  },

  // New methods using data service
  getStudentCourses: async (studentId: string) => {
    return await dataService.getCoursesByStudent(studentId);
  },

  getStudentClasses: async (studentId: string) => {
    const classes = await dataService.getClassSessionsByStudent(studentId);
    return classes.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.startTime}`).getTime();
      const dateB = new Date(`${b.date}T${b.startTime}`).getTime();
      return dateA - dateB;
    });
  },

  getStudentAssignments: async (studentId: string) => {
    const assignments = await dataService.getAssignmentsByStudent(studentId);
    return assignments.sort((a, b) => 
      new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );
  },

  getProfessorCourses: async (professorId: string) => {
    return await dataService.getCoursesByProfessor(professorId);
  },

  getProfessorClasses: async (professorId: string) => {
    const classes = await dataService.getClassSessionsByProfessor(professorId);
    return classes.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.startTime}`).getTime();
      const dateB = new Date(`${b.date}T${b.startTime}`).getTime();
      return dateA - dateB;
    });
  },

  // Class session management (for professors and admins)
  createClassSession: async (session: Omit<ClassSession, 'id'>) => {
    return await dataService.createClassSession(session);
  },

  updateClassSession: async (id: string, updates: Partial<ClassSession>) => {
    return await dataService.updateClassSession(id, updates);
  },

  deleteClassSession: async (id: string) => {
    return await dataService.deleteClassSession(id);
  },

  // Assignment management
  submitAssignment: async (id: string, submissionData?: { fileName?: string; fileSize?: number }) => {
    return await dataService.submitAssignment(id, submissionData);
  },

  updateAssignment: async (id: string, updates: Partial<Assignment>) => {
    return await dataService.updateAssignment(id, updates);
  },

  // Note management
  createNote: async (note: Omit<Note, 'id' | 'createdDate' | 'updatedDate'>) => {
    return await dataService.createNote(note);
  },

  updateNote: async (id: string, updates: Partial<Omit<Note, 'id' | 'createdDate'>>) => {
    return await dataService.updateNote(id, updates);
  },

  deleteNote: async (id: string) => {
    return await dataService.deleteNote(id);
  },

  // User management
  updateUser: async (id: string, updates: Partial<Omit<User, 'id'>>) => {
    return await dataService.updateUser(id, updates);
  },
};

// Export data service for direct access
export { dataService };