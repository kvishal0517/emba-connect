// Core type definitions for EMBA Connect

export type Role = 'student' | 'admin' | 'professor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
}

export interface Student {
  id: string;
  userId: string;
  program: string;
  studentId: string;
  gpa: number;
  enrolledYear: number;
}

export interface Professor {
  id: string;
  userId?: string;
  name: string;
  department: string;
  bio: string;
  email: string;
  officeHours: string;
  linkedIn?: string;
  avatar?: string;
}

export interface Course {
  id: string;
  code: string;
  name: string; // Changed from "title" to match mockData
  title?: string; // Keeping for backward compatibility
  professorId: string;
  credits: number;
  description: string;
  semester?: string;
  syllabusUrl?: string;
  schedule?: string; // For displaying schedule info
  courses?: string[]; // For professors (backward compatibility)
}

export interface Enrollment {
  id?: string;
  studentId: string;
  courseId: string;
  enrolledDate?: string;
  grade?: string;
}

export interface ClassSession {
  id: string;
  courseId: string;
  topic: string;
  date: string;
  startTime: string;
  endTime: string;
  meetingLink: string;
  location: string;
  status?: 'scheduled' | 'postponed' | 'cancelled' | 'completed';
  cancellationReason?: string;
  originalDate?: string; // For postponed classes
  modifiedBy?: string; // Professor/Admin who made the change
  modifiedAt?: string; // Timestamp of modification
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  dueDate: string;
  maxPoints: number;
  status: 'pending' | 'submitted' | 'graded';
  grade?: string;
  submittedDate?: string;
}

export interface Resource {
  id: string;
  courseId: string;
  title: string;
  type: 'pdf' | 'video' | 'link' | 'document';
  url: string;
  uploadedDate: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  date: string;
  author?: string;
}

export interface Note {
  id: string;
  studentId: string;
  courseId?: string;
  title: string;
  content: string;
  createdDate: string;
  updatedDate: string;
}