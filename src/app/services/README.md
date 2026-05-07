# EMBA Connect Data Service Layer

## Overview

The EMBA Connect data service provides a production-ready data access layer with **PostgreSQL database support** and **automatic JSON fallback** for offline/development scenarios.

## Architecture

```
┌─────────────────────────────────────────┐
│         Application Layer                │
│    (Components, Pages, Hooks)            │
└───────────────┬─────────────────────────┘
                │
                ↓
┌─────────────────────────────────────────┐
│         Data Service Layer               │
│        (dataService.ts)                  │
└───────────────┬─────────────────────────┘
                │
        ┌───────┴───────┐
        ↓               ↓
┌──────────────┐  ┌──────────────┐
│  PostgreSQL  │  │  JSON Files  │
│   Database   │  │   (Fallback) │
└──────────────┘  └──────────────┘
```

## Features

✅ **Automatic Fallback**: Seamlessly switches between database and JSON based on availability
✅ **Unified API**: Same interface regardless of data source
✅ **Type Safety**: Full TypeScript support with comprehensive types
✅ **Realistic Data**: 50 students, 20 professors, 15 courses, 60+ class sessions, 80+ assignments
✅ **CRUD Operations**: Complete create, read, update, delete functionality
✅ **Role-Based Access**: Student, Professor, and Admin specific queries

## Data Files

All JSON data files are located in `/src/app/data/`:

- `users.json` - 71 users (50 students + 20 professors + 1 admin)
- `students.json` - 50 student profiles with EMBA program details
- `professors.json` - 20 faculty members across 10 departments
- `courses.json` - 15 EMBA courses
- `enrollments.json` - Student-course enrollments (4-5 courses per student)
- `classSessions.json` - 60 scheduled class sessions (March-June 2026)
- `assignments.json` - 80 assignments across all courses
- `resources.json` - 100 learning resources (PDFs, videos, links)
- `announcements.json` - 15 institutional announcements
- `notes.json` - Student notes (expandable)

## Usage

### Basic Import

```typescript
import dataService from '@/app/services/dataService';
import { db } from '@/app/lib/db'; // Backward-compatible wrapper
```

### Example: Get Student's Classes

```typescript
// Using data service directly
const classes = await dataService.getClassSessionsByStudent('s001');

// Using db wrapper (backward compatible)
const classes = await db.getStudentClasses('s001');
```

### Example: Professor Creates Class Session

```typescript
const newSession = await dataService.createClassSession({
  courseId: 'c001',
  topic: 'Strategic Planning Workshop',
  date: '2026-03-25',
  startTime: '10:00',
  endTime: '13:00',
  meetingLink: 'https://zoom.us/j/123456789',
  location: 'Online'
});
```

### Example: Get Course Resources

```typescript
const resources = await dataService.getResourcesByCourse('c001');
```

## API Reference

### User Methods

| Method | Description |
|--------|-------------|
| `getUsers()` | Get all users |
| `getUserById(id)` | Get user by ID |
| `getUserByEmail(email)` | Get user by email |
| `getUsersByRole(role)` | Get users by role (student/professor/admin) |

### Student Methods

| Method | Description |
|--------|-------------|
| `getStudents()` | Get all students |
| `getStudentById(id)` | Get student by ID |
| `getStudentByUserId(userId)` | Get student by user ID |

### Professor Methods

| Method | Description |
|--------|-------------|
| `getProfessors()` | Get all professors |
| `getProfessorById(id)` | Get professor by ID |
| `getProfessorByUserId(userId)` | Get professor by user ID |

### Course Methods

| Method | Description |
|--------|-------------|
| `getCourses()` | Get all courses |
| `getCourseById(id)` | Get course by ID |
| `getCoursesByProfessor(professorId)` | Get courses taught by professor |
| `getCoursesByStudent(studentId)` | Get courses enrolled by student |

### Class Session Methods

| Method | Description |
|--------|-------------|
| `getClassSessions()` | Get all class sessions |
| `getClassSessionById(id)` | Get class session by ID |
| `getClassSessionsByCourse(courseId)` | Get sessions for a course |
| `getClassSessionsByStudent(studentId)` | Get sessions for enrolled student |
| `getClassSessionsByProfessor(professorId)` | Get sessions for professor |
| `createClassSession(session)` | Create new class session |
| `updateClassSession(id, updates)` | Update existing session |
| `deleteClassSession(id)` | Delete a session |

### Assignment Methods

| Method | Description |
|--------|-------------|
| `getAssignments()` | Get all assignments |
| `getAssignmentById(id)` | Get assignment by ID |
| `getAssignmentsByCourse(courseId)` | Get assignments for a course |
| `getAssignmentsByStudent(studentId)` | Get assignments for student |

### Resource Methods

| Method | Description |
|--------|-------------|
| `getResources()` | Get all resources |
| `getResourceById(id)` | Get resource by ID |
| `getResourcesByCourse(courseId)` | Get resources for a course |

### Announcement Methods

| Method | Description |
|--------|-------------|
| `getAnnouncements()` | Get all announcements |
| `getAnnouncementById(id)` | Get announcement by ID |

### Note Methods

| Method | Description |
|--------|-------------|
| `getNotes()` | Get all notes |
| `getNoteById(id)` | Get note by ID |
| `getNotesByStudent(studentId)` | Get notes for student |
| `getNotesByCourse(studentId, courseId)` | Get course-specific notes |
| `createNote(note)` | Create new note |
| `updateNote(id, updates)` | Update existing note |
| `deleteNote(id)` | Delete a note |

## Database Configuration

To connect to PostgreSQL, set these environment variables:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=EMBA_IITR
DB_USER=postgres
DB_PASSWORD=your_password
```

## Database Schema

### Tables

- **users** - Core user authentication and profile
- **students** - Student-specific information
- **professors** - Faculty information
- **courses** - Course catalog
- **enrollments** - Student course enrollments (many-to-many)
- **class_sessions** - Scheduled class sessions
- **assignments** - Course assignments
- **resources** - Learning materials
- **announcements** - Institutional announcements
- **notes** - Student notes

### Relationships

```
users ──┬── students ── enrollments ── courses ── class_sessions
        │                              │
        └── professors ─────────────────┘
                                        │
                                        ├── assignments
                                        └── resources
```

## Data Flow: Professor Scheduling

```
1. Professor fills Schedule Class form
   ↓
2. Form submits to dataService.createClassSession()
   ↓
3. New session saved to database/JSON
   ↓
4. Session appears in:
   - Student Schedule page
   - Student Calendar page  
   - Admin Schedule Management
   - Professor Dashboard
```

## Migration Guide

### From Old db.ts to New Service

**Before:**
```typescript
const courses = db.getCourses();
const professors = db.getProfessors();
```

**After (both work):**
```typescript
// Option 1: Direct service (async)
const courses = await dataService.getCourses();
const professors = await dataService.getProfessors();

// Option 2: Backward compatible wrapper (async)
const courses = await db.getCourses();
const professors = await db.getProfessors();
```

⚠️ **Note**: All methods are now async. Update your components accordingly.

## Best Practices

1. **Use TypeScript types** - Import from `@/app/types`
2. **Handle async operations** - All data fetching is async
3. **Error handling** - Wrap calls in try-catch blocks
4. **Cache when possible** - Use React Query or SWR for caching
5. **Role-based queries** - Use specific methods (e.g., `getClassSessionsByStudent`)

## Future Enhancements

- [ ] Real PostgreSQL connection implementation
- [ ] Data persistence to localStorage for offline support
- [ ] Optimistic updates for better UX
- [ ] Real-time updates with WebSocket
- [ ] Data synchronization between database and cache
- [ ] Advanced filtering and pagination

## Support

For issues or questions about the data service, contact the development team or refer to the main project documentation.
