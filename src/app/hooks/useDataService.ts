/**
 * Custom React hooks for EMBA Connect Data Service
 * 
 * Provides easy-to-use hooks for accessing data with loading states
 */

import { useState, useEffect } from 'react';
import dataService from '../services/dataService';
import type {
  User,
  Student,
  Professor,
  Course,
  ClassSession,
  Assignment,
  Resource,
  Announcement,
  Note
} from '../types';

// Generic hook type
interface UseDataResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

interface UseDataListResult<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to get current user
 */
export function useCurrentUser(): UseDataResult<User> {
  const [data, setData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const users = await dataService.getUsersByRole('student');
      setData(users[0] || null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook to get all professors
 */
export function useProfessors(): UseDataListResult<Professor> {
  const [data, setData] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const professors = await dataService.getProfessors();
      setData(professors);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook to get all courses
 */
export function useCourses(): UseDataListResult<Course> {
  const [data, setData] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const courses = await dataService.getCourses();
      setData(courses);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook to get student's courses
 */
export function useStudentCourses(studentId: string): UseDataListResult<Course> {
  const [data, setData] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    if (!studentId) return;
    
    try {
      setLoading(true);
      setError(null);
      const courses = await dataService.getCoursesByStudent(studentId);
      setData(courses);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [studentId]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook to get professor's courses
 */
export function useProfessorCourses(professorId: string): UseDataListResult<Course> {
  const [data, setData] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    if (!professorId) return;
    
    try {
      setLoading(true);
      setError(null);
      const courses = await dataService.getCoursesByProfessor(professorId);
      setData(courses);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [professorId]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook to get all class sessions
 */
export function useClassSessions(): UseDataListResult<ClassSession> {
  const [data, setData] = useState<ClassSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const sessions = await dataService.getClassSessions();
      setData(sessions);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook to get student's class sessions
 */
export function useStudentClassSessions(studentId: string): UseDataListResult<ClassSession> {
  const [data, setData] = useState<ClassSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    if (!studentId) return;
    
    try {
      setLoading(true);
      setError(null);
      const sessions = await dataService.getClassSessionsByStudent(studentId);
      setData(sessions);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [studentId]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook to get professor's class sessions
 */
export function useProfessorClassSessions(professorId: string): UseDataListResult<ClassSession> {
  const [data, setData] = useState<ClassSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    if (!professorId) return;
    
    try {
      setLoading(true);
      setError(null);
      const sessions = await dataService.getClassSessionsByProfessor(professorId);
      setData(sessions);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [professorId]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook to get student's assignments
 */
export function useStudentAssignments(studentId: string): UseDataListResult<Assignment> {
  const [data, setData] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    if (!studentId) return;
    
    try {
      setLoading(true);
      setError(null);
      const assignments = await dataService.getAssignmentsByStudent(studentId);
      setData(assignments);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [studentId]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook to get course resources
 */
export function useCourseResources(courseId: string): UseDataListResult<Resource> {
  const [data, setData] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    if (!courseId) return;
    
    try {
      setLoading(true);
      setError(null);
      const resources = await dataService.getResourcesByCourse(courseId);
      setData(resources);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [courseId]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook to get all announcements
 */
export function useAnnouncements(): UseDataListResult<Announcement> {
  const [data, setData] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const announcements = await dataService.getAnnouncements();
      setData(announcements);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook to get student's notes
 */
export function useStudentNotes(studentId: string): UseDataListResult<Note> {
  const [data, setData] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    if (!studentId) return;
    
    try {
      setLoading(true);
      setError(null);
      const notes = await dataService.getNotesByStudent(studentId);
      setData(notes);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [studentId]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook for class session CRUD operations
 */
export function useClassSessionMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createSession = async (session: Omit<ClassSession, 'id'>) => {
    try {
      setLoading(true);
      setError(null);
      const newSession = await dataService.createClassSession(session);
      return newSession;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSession = async (id: string, updates: Partial<ClassSession>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedSession = await dataService.updateClassSession(id, updates);
      return updatedSession;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteSession = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const success = await dataService.deleteClassSession(id);
      return success;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createSession,
    updateSession,
    deleteSession,
    loading,
    error
  };
}

/**
 * Hook for note CRUD operations
 */
export function useNoteMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createNote = async (note: Omit<Note, 'id'>) => {
    try {
      setLoading(true);
      setError(null);
      const newNote = await dataService.createNote(note);
      return newNote;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateNote = async (id: string, updates: Partial<Note>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedNote = await dataService.updateNote(id, updates);
      return updatedNote;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const success = await dataService.deleteNote(id);
      return success;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createNote,
    updateNote,
    deleteNote,
    loading,
    error
  };
}
