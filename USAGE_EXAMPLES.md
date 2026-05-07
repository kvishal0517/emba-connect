# EMBA Connect - Usage Examples

## Quick Start Guide

This document provides practical examples of using the EMBA Connect data service layer in your React components.

## Table of Contents

1. [Basic Data Fetching](#basic-data-fetching)
2. [Using Custom Hooks](#using-custom-hooks)
3. [Professor Scheduling](#professor-scheduling)
4. [Student Dashboard](#student-dashboard)
5. [Managing Notes](#managing-notes)
6. [Filtering and Sorting](#filtering-and-sorting)

---

## Basic Data Fetching

### Example 1: Fetching All Courses

```typescript
import { useEffect, useState } from 'react';
import dataService from '@/app/services/dataService';
import type { Course } from '@/app/types';

function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await dataService.getCourses();
        setCourses(data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>All Courses</h1>
      {courses.map(course => (
        <div key={course.id}>
          <h3>{course.code}: {course.title}</h3>
          <p>{course.description}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## Using Custom Hooks

### Example 2: Student Dashboard with Hooks

```typescript
import { 
  useStudentCourses, 
  useStudentClassSessions, 
  useStudentAssignments 
} from '@/app/hooks/useDataService';

function StudentDashboard({ studentId }: { studentId: string }) {
  const { data: courses, loading: coursesLoading } = useStudentCourses(studentId);
  const { data: classes, loading: classesLoading } = useStudentClassSessions(studentId);
  const { data: assignments, loading: assignmentsLoading } = useStudentAssignments(studentId);

  if (coursesLoading || classesLoading || assignmentsLoading) {
    return <div>Loading dashboard...</div>;
  }

  // Get upcoming classes (next 7 days)
  const upcomingClasses = classes.filter(cls => {
    const classDate = new Date(cls.date);
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return classDate >= today && classDate <= nextWeek;
  });

  // Get pending assignments
  const pendingAssignments = assignments.filter(a => a.status === 'pending');

  return (
    <div className="dashboard">
      <div className="stats-grid">
        <StatCard title="Enrolled Courses" value={courses.length} />
        <StatCard title="Upcoming Classes" value={upcomingClasses.length} />
        <StatCard title="Pending Assignments" value={pendingAssignments.length} />
      </div>

      <div className="upcoming-classes">
        <h2>Next Week's Classes</h2>
        {upcomingClasses.map(cls => (
          <ClassCard key={cls.id} classSession={cls} />
        ))}
      </div>

      <div className="pending-assignments">
        <h2>Pending Assignments</h2>
        {pendingAssignments.map(assignment => (
          <AssignmentCard key={assignment.id} assignment={assignment} />
        ))}
      </div>
    </div>
  );
}
```

### Example 3: Professor Courses List

```typescript
import { useProfessorCourses } from '@/app/hooks/useDataService';

function ProfessorCoursesPage({ professorId }: { professorId: string }) {
  const { data: courses, loading, error, refetch } = useProfessorCourses(professorId);

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage error={error} onRetry={refetch} />;

  return (
    <div>
      <h1>My Courses</h1>
      <div className="courses-grid">
        {courses.map(course => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
}
```

---

## Professor Scheduling

### Example 4: Create Class Session Form

```typescript
import { useState } from 'react';
import { useClassSessionMutations } from '@/app/hooks/useDataService';
import { toast } from 'sonner';

function ScheduleClassModal({ professorId, courseId, onClose }: Props) {
  const { createSession, loading } = useClassSessionMutations();
  const [formData, setFormData] = useState({
    courseId: courseId,
    topic: '',
    date: '',
    startTime: '',
    endTime: '',
    meetingLink: '',
    location: 'Online'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const newSession = await createSession(formData);
      toast.success('Class scheduled successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to schedule class');
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        label="Topic"
        value={formData.topic}
        onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
        required
      />
      
      <Input
        label="Date"
        type="date"
        value={formData.date}
        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
        required
      />

      <div className="time-row">
        <Input
          label="Start Time"
          type="time"
          value={formData.startTime}
          onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
          required
        />
        <Input
          label="End Time"
          type="time"
          value={formData.endTime}
          onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
          required
        />
      </div>

      <Input
        label="Meeting Link"
        placeholder="https://zoom.us/j/123456789"
        value={formData.meetingLink}
        onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
        required
      />

      <Select
        label="Location"
        value={formData.location}
        onChange={(value) => setFormData({ ...formData, location: value })}
      >
        <option value="Online">Online</option>
        <option value="Classroom A">Classroom A</option>
        <option value="Classroom B">Classroom B</option>
        <option value="Auditorium">Auditorium</option>
      </Select>

      <Button type="submit" disabled={loading}>
        {loading ? 'Scheduling...' : 'Schedule Class'}
      </Button>
    </form>
  );
}
```

### Example 5: Edit Class Session

```typescript
import { useClassSessionMutations } from '@/app/hooks/useDataService';
import { toast } from 'sonner';

function EditClassModal({ session, onClose, onUpdate }: Props) {
  const { updateSession, loading } = useClassSessionMutations();
  const [formData, setFormData] = useState({
    topic: session.topic,
    date: session.date,
    startTime: session.startTime,
    endTime: session.endTime,
    meetingLink: session.meetingLink,
    location: session.location
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const updated = await updateSession(session.id, formData);
      toast.success('Class updated successfully!');
      onUpdate(updated);
      onClose();
    } catch (error) {
      toast.error('Failed to update class');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Similar form fields as create */}
      <Button type="submit" disabled={loading}>
        {loading ? 'Updating...' : 'Update Class'}
      </Button>
    </form>
  );
}
```

---

## Student Dashboard

### Example 6: Complete Student Dashboard

```typescript
import { useState, useEffect } from 'react';
import dataService from '@/app/services/dataService';
import { format, isAfter, isBefore, addDays } from 'date-fns';

function CompleteStudentDashboard() {
  const [studentId, setStudentId] = useState('s001'); // From auth context
  const [stats, setStats] = useState({
    upcomingClasses: 0,
    pendingAssignments: 0,
    attendance: 92,
    gpa: 3.8
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      // Get student's classes
      const classes = await dataService.getClassSessionsByStudent(studentId);
      const today = new Date();
      const nextWeek = addDays(today, 7);
      
      const upcoming = classes.filter(cls => {
        const classDate = new Date(cls.date);
        return isAfter(classDate, today) && isBefore(classDate, nextWeek);
      });

      // Get student's assignments
      const assignments = await dataService.getAssignmentsByStudent(studentId);
      const pending = assignments.filter(a => a.status === 'pending');

      // Get student info
      const student = await dataService.getStudentByUserId(studentId);

      setStats({
        upcomingClasses: upcoming.length,
        pendingAssignments: pending.length,
        attendance: 92, // Calculate from attendance records
        gpa: student?.gpa || 0
      });
    };

    fetchDashboardData();
  }, [studentId]);

  return (
    <div className="dashboard">
      <h1>Welcome back!</h1>
      
      <div className="stats-grid grid grid-cols-4 gap-4">
        <StatCard
          icon={<Calendar />}
          title="Upcoming Classes"
          value={stats.upcomingClasses}
          subtitle="Next 7 days"
        />
        <StatCard
          icon={<FileText />}
          title="Pending Assignments"
          value={stats.pendingAssignments}
          subtitle="Due soon"
        />
        <StatCard
          icon={<TrendingUp />}
          title="Attendance"
          value={`${stats.attendance}%`}
          subtitle="This semester"
        />
        <StatCard
          icon={<Award />}
          title="GPA"
          value={stats.gpa.toFixed(2)}
          subtitle="Current"
        />
      </div>

      <AnnouncementsList />
      <UpcomingClassesList studentId={studentId} />
      <PendingAssignmentsList studentId={studentId} />
    </div>
  );
}
```

---

## Managing Notes

### Example 7: Student Notes with CRUD

```typescript
import { useStudentNotes, useNoteMutations } from '@/app/hooks/useDataService';
import { useState } from 'react';

function StudentNotesPage({ studentId }: { studentId: string }) {
  const { data: notes, loading, refetch } = useStudentNotes(studentId);
  const { createNote, updateNote, deleteNote } = useNoteMutations();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateNote = async (noteData: Omit<Note, 'id'>) => {
    try {
      await createNote({
        ...noteData,
        studentId,
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString()
      });
      await refetch();
      setIsCreating(false);
      toast.success('Note created!');
    } catch (error) {
      toast.error('Failed to create note');
    }
  };

  const handleUpdateNote = async (id: string, updates: Partial<Note>) => {
    try {
      await updateNote(id, {
        ...updates,
        updatedDate: new Date().toISOString()
      });
      await refetch();
      toast.success('Note updated!');
    } catch (error) {
      toast.error('Failed to update note');
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (confirm('Delete this note?')) {
      try {
        await deleteNote(id);
        await refetch();
        toast.success('Note deleted!');
      } catch (error) {
        toast.error('Failed to delete note');
      }
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="notes-page">
      <div className="header">
        <h1>My Notes</h1>
        <Button onClick={() => setIsCreating(true)}>
          <Plus /> New Note
        </Button>
      </div>

      {isCreating && (
        <NoteEditor
          onSave={handleCreateNote}
          onCancel={() => setIsCreating(false)}
        />
      )}

      <div className="notes-list">
        {notes.map(note => (
          <NoteCard
            key={note.id}
            note={note}
            onUpdate={(updates) => handleUpdateNote(note.id, updates)}
            onDelete={() => handleDeleteNote(note.id)}
          />
        ))}
      </div>
    </div>
  );
}
```

---

## Filtering and Sorting

### Example 8: Advanced Class Schedule with Filters

```typescript
import { useStudentClassSessions } from '@/app/hooks/useDataService';
import { useState, useMemo } from 'react';
import { format, startOfWeek, endOfWeek } from 'date-fns';

function AdvancedSchedulePage({ studentId }: { studentId: string }) {
  const { data: classes, loading } = useStudentClassSessions(studentId);
  const [view, setView] = useState<'week' | 'month'>('week');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');

  // Get unique courses
  const courses = useMemo(() => {
    const unique = new Set(classes.map(c => c.courseId));
    return Array.from(unique);
  }, [classes]);

  // Filter and sort classes
  const filteredClasses = useMemo(() => {
    let filtered = classes;

    // Filter by course
    if (selectedCourse !== 'all') {
      filtered = filtered.filter(c => c.courseId === selectedCourse);
    }

    // Filter by date range based on view
    const today = new Date();
    if (view === 'week') {
      const weekStart = startOfWeek(today);
      const weekEnd = endOfWeek(today);
      filtered = filtered.filter(c => {
        const classDate = new Date(c.date);
        return classDate >= weekStart && classDate <= weekEnd;
      });
    }

    // Sort by date and time
    return filtered.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.startTime}`);
      const dateB = new Date(`${b.date}T${b.startTime}`);
      return dateA.getTime() - dateB.getTime();
    });
  }, [classes, selectedCourse, view]);

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="filters">
        <Select value={view} onChange={setView}>
          <option value="week">Week View</option>
          <option value="month">Month View</option>
        </Select>

        <Select value={selectedCourse} onChange={setSelectedCourse}>
          <option value="all">All Courses</option>
          {courses.map(courseId => (
            <option key={courseId} value={courseId}>
              {courseId}
            </option>
          ))}
        </Select>
      </div>

      <div className="schedule">
        {filteredClasses.map(cls => (
          <ClassSessionCard key={cls.id} session={cls} />
        ))}
      </div>
    </div>
  );
}
```

---

## Best Practices

### 1. Error Handling

```typescript
try {
  const data = await dataService.getCourses();
  setCourses(data);
} catch (error) {
  console.error('Error fetching courses:', error);
  toast.error('Failed to load courses. Please try again.');
}
```

### 2. Loading States

```typescript
const { data, loading, error } = useStudentCourses(studentId);

if (loading) return <Spinner />;
if (error) return <ErrorMessage error={error} />;
if (!data || data.length === 0) return <EmptyState />;

return <CourseList courses={data} />;
```

### 3. Optimistic Updates

```typescript
const handleDeleteNote = async (id: string) => {
  // Optimistically update UI
  setNotes(prev => prev.filter(n => n.id !== id));

  try {
    await dataService.deleteNote(id);
    toast.success('Note deleted!');
  } catch (error) {
    // Revert on error
    await refetch();
    toast.error('Failed to delete note');
  }
};
```

### 4. Data Refetching

```typescript
const { data, refetch } = useStudentCourses(studentId);

// Refetch after mutation
const handleEnroll = async (courseId: string) => {
  await enrollInCourse(courseId);
  await refetch(); // Refresh the list
};
```

---

## Common Patterns

### Pattern 1: Master-Detail View

```typescript
function CourseDetailPage({ courseId }: { courseId: string }) {
  const [course, setCourse] = useState<Course | null>(null);
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [courseData, sessionsData, resourcesData] = await Promise.all([
        dataService.getCourseById(courseId),
        dataService.getClassSessionsByCourse(courseId),
        dataService.getResourcesByCourse(courseId)
      ]);

      setCourse(courseData!);
      setSessions(sessionsData);
      setResources(resourcesData);
    };

    fetchData();
  }, [courseId]);

  // ... render
}
```

### Pattern 2: Dependent Queries

```typescript
// First get student
const student = await dataService.getStudentByUserId(userId);

// Then get their courses
if (student) {
  const courses = await dataService.getCoursesByStudent(student.id);
}
```

---

For more examples, see the `/src/app/pages/` directory for real implementation patterns used in the application.
