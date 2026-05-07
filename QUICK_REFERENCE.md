# EMBA Connect - Quick Reference Card

## 🚀 Quick Start

### Import Data Service
```typescript
import dataService from '@/app/services/dataService';
import { db } from '@/app/lib/db'; // Backward compatible
```

### Import Custom Hooks
```typescript
import {
  useStudentCourses,
  useClassSessionMutations,
  useAnnouncements
} from '@/app/hooks/useDataService';
```

### Import Types
```typescript
import type { 
  User, 
  Course, 
  ClassSession, 
  Assignment 
} from '@/app/types';
```

---

## 📖 Common Operations

### Get User Data
```typescript
// Get all users
const users = await dataService.getUsers();

// Get by ID
const user = await dataService.getUserById('u001');

// Get by email
const user = await dataService.getUserByEmail('alex@iitr.ac.in');

// Get by role
const students = await dataService.getUsersByRole('student');
```

### Get Courses
```typescript
// All courses
const courses = await dataService.getCourses();

// Student's enrolled courses
const myCourses = await dataService.getCoursesByStudent('s001');

// Professor's teaching courses
const teaching = await dataService.getCoursesByProfessor('p001');

// Single course
const course = await dataService.getCourseById('c001');
```

### Get Class Sessions
```typescript
// All sessions
const sessions = await dataService.getClassSessions();

// Student's sessions
const mySessions = await dataService.getClassSessionsByStudent('s001');

// Professor's sessions
const teaching = await dataService.getClassSessionsByProfessor('p001');

// Course sessions
const courseSessions = await dataService.getClassSessionsByCourse('c001');
```

### Create Class Session (Professor/Admin)
```typescript
const newSession = await dataService.createClassSession({
  courseId: 'c001',
  topic: 'Strategic Planning',
  date: '2026-03-25',
  startTime: '10:00',
  endTime: '13:00',
  meetingLink: 'https://zoom.us/j/123',
  location: 'Online'
});
```

### Update Class Session
```typescript
const updated = await dataService.updateClassSession('cls001', {
  topic: 'Updated Topic',
  meetingLink: 'https://zoom.us/j/456'
});
```

### Delete Class Session
```typescript
const success = await dataService.deleteClassSession('cls001');
```

### Get Assignments
```typescript
// Student's assignments
const assignments = await dataService.getAssignmentsByStudent('s001');

// Course assignments
const courseAssignments = await dataService.getAssignmentsByCourse('c001');

// Single assignment
const assignment = await dataService.getAssignmentById('a001');
```

### Get Resources
```typescript
// Course resources
const resources = await dataService.getResourcesByCourse('c001');

// All resources
const allResources = await dataService.getResources();
```

### Get Professors
```typescript
// All professors
const professors = await dataService.getProfessors();

// Single professor
const prof = await dataService.getProfessorById('p001');
```

### Get Announcements
```typescript
const announcements = await dataService.getAnnouncements();
```

### Manage Notes
```typescript
// Get student's notes
const notes = await dataService.getNotesByStudent('s001');

// Create note
const newNote = await dataService.createNote({
  studentId: 's001',
  courseId: 'c001',
  title: 'Class Notes',
  content: 'Today we learned about...',
  createdDate: new Date().toISOString(),
  updatedDate: new Date().toISOString()
});

// Update note
const updated = await dataService.updateNote('n001', {
  content: 'Updated content',
  updatedDate: new Date().toISOString()
});

// Delete note
const deleted = await dataService.deleteNote('n001');
```

---

## 🪝 Using React Hooks

### Basic Hook Usage
```typescript
function MyComponent() {
  const { data, loading, error, refetch } = useStudentCourses('s001');
  
  if (loading) return <Spinner />;
  if (error) return <Error message={error.message} />;
  
  return (
    <div>
      {data.map(course => (
        <div key={course.id}>{course.title}</div>
      ))}
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

### Mutation Hook Usage
```typescript
function ScheduleClassForm() {
  const { createSession, loading, error } = useClassSessionMutations();
  
  const handleSubmit = async (formData) => {
    try {
      const newSession = await createSession(formData);
      toast.success('Class scheduled!');
    } catch (err) {
      toast.error('Failed to schedule class');
    }
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

## 🎯 Common Patterns

### Pattern: Load Related Data
```typescript
// Load course with all related data
const course = await dataService.getCourseById('c001');
const professor = await dataService.getProfessorById(course.professorId);
const sessions = await dataService.getClassSessionsByCourse(course.id);
const assignments = await dataService.getAssignmentsByCourse(course.id);
const resources = await dataService.getResourcesByCourse(course.id);
```

### Pattern: Filter Client-Side
```typescript
const allSessions = await dataService.getClassSessions();

// Upcoming sessions only
const upcoming = allSessions.filter(s => 
  new Date(s.date) >= new Date()
);

// Sort by date
const sorted = upcoming.sort((a, b) => 
  new Date(`${a.date}T${a.startTime}`).getTime() - 
  new Date(`${b.date}T${b.startTime}`).getTime()
);
```

### Pattern: Parallel Loading
```typescript
// Load multiple data sources at once
const [courses, sessions, assignments] = await Promise.all([
  dataService.getCoursesByStudent('s001'),
  dataService.getClassSessionsByStudent('s001'),
  dataService.getAssignmentsByStudent('s001')
]);
```

### Pattern: Conditional Loading
```typescript
// Load data only if needed
const student = await dataService.getStudentByUserId(userId);

if (student) {
  const courses = await dataService.getCoursesByStudent(student.id);
  // ... use courses
}
```

---

## 📊 Data Counts

Quick reference for test data:

| Entity | Count |
|--------|-------|
| Users | 71 |
| Students | 50 |
| Professors | 20 |
| Courses | 15 |
| Enrollments | 220+ |
| Class Sessions | 60 |
| Assignments | 80 |
| Resources | 100 |
| Announcements | 15 |

---

## 🔍 Sample IDs

Use these for testing:

### Users
- `u001` - Alex Mercer (Student)
- `u101` - Dr. Rajesh Sharma (Professor)
- `u201` - Sarah Jenkins (Admin)

### Students
- `s001` - Alex Mercer
- `s002` - Priya Sharma
- `s003` - Rajesh Kumar

### Professors
- `p001` - Dr. Rajesh Sharma (Strategy)
- `p002` - Prof. Anita Desai (Finance)
- `p003` - Dr. Sunil Kumar (Marketing)

### Courses
- `c001` - STRAT-601: Strategic Leadership
- `c002` - FIN-502: Corporate Finance
- `c003` - MKTG-603: Digital Marketing
- `c005` - TECH-703: Digital Innovation

### Class Sessions
- `cls001` - Competitive Strategy Frameworks (Mar 15)
- `cls002` - Financial Statement Analysis (Mar 16)
- `cls003` - Consumer Behavior (Mar 17)

### Assignments
- `a001` - Tesla Strategic Analysis (Due: Mar 20)
- `a002` - Business Model Innovation (Due: Apr 10)
- `a006` - Financial Statement Analysis (Due: Mar 25)

---

## 🎨 Component Examples

### Dashboard Stats Card
```typescript
function StatsCard() {
  const { data: courses } = useStudentCourses('s001');
  const { data: classes } = useStudentClassSessions('s001');
  const { data: assignments } = useStudentAssignments('s001');
  
  const upcomingClasses = classes?.filter(c => 
    new Date(c.date) >= new Date()
  ).length || 0;
  
  const pendingAssignments = assignments?.filter(a => 
    a.status === 'pending'
  ).length || 0;
  
  return (
    <div className="grid grid-cols-3 gap-4">
      <StatCard title="Enrolled Courses" value={courses?.length || 0} />
      <StatCard title="Upcoming Classes" value={upcomingClasses} />
      <StatCard title="Pending Assignments" value={pendingAssignments} />
    </div>
  );
}
```

### Course List
```typescript
function CourseList({ studentId }: { studentId: string }) {
  const { data: courses, loading } = useStudentCourses(studentId);
  
  if (loading) return <Skeleton />;
  
  return (
    <div>
      {courses.map(course => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
```

### Schedule Class Button
```typescript
function ScheduleClassButton({ professorId }: Props) {
  const [open, setOpen] = useState(false);
  const { createSession } = useClassSessionMutations();
  const { refetch } = useProfessorClassSessions(professorId);
  
  const handleSchedule = async (data) => {
    await createSession(data);
    await refetch();
    setOpen(false);
  };
  
  return (
    <>
      <Button onClick={() => setOpen(true)}>Schedule Class</Button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <ScheduleForm onSubmit={handleSchedule} />
      </Modal>
    </>
  );
}
```

---

## ⚡ Performance Tips

### 1. Use Hooks for Components
```typescript
// ✅ Good - automatic caching and updates
const { data } = useStudentCourses(studentId);

// ❌ Avoid - manual state management
const [courses, setCourses] = useState([]);
useEffect(() => {
  dataService.getCoursesByStudent(studentId).then(setCourses);
}, [studentId]);
```

### 2. Batch Requests
```typescript
// ✅ Good - single request
const courses = await dataService.getCourses();
const myCourses = courses.filter(c => enrolledIds.includes(c.id));

// ❌ Avoid - multiple requests
for (const id of enrolledIds) {
  await dataService.getCourseById(id);
}
```

### 3. Memoize Computed Values
```typescript
const upcomingClasses = useMemo(() => 
  classes.filter(c => new Date(c.date) >= new Date()),
  [classes]
);
```

---

## 🐛 Debugging

### Check Data Source
```typescript
console.log('Data source:', dataService.getDataSource());
// Output: "json" or "database"
```

### Verify Data
```typescript
const courses = await dataService.getCourses();
console.log('Total courses:', courses.length);
console.log('First course:', courses[0]);
```

### Check Relationships
```typescript
const enrollments = await dataService.getEnrollmentsByStudent('s001');
console.log('Enrolled courses:', enrollments.map(e => e.courseId));
```

---

## 📱 File Locations

```
Data:          /src/app/data/*.json
Service:       /src/app/services/dataService.ts
Hooks:         /src/app/hooks/useDataService.ts
Types:         /src/app/types/index.ts
DB Wrapper:    /src/app/lib/db.ts
Schema:        /database-schema.sql
```

---

## 🆘 Quick Troubleshooting

**Q: Data not showing?**
```typescript
// Check if data is loading
const { data, loading, error } = useStudentCourses(studentId);
console.log({ data, loading, error });
```

**Q: Wrong student data?**
```typescript
// Verify student ID
const student = await dataService.getStudentByUserId(userId);
console.log('Student ID:', student?.id);
```

**Q: Sessions not appearing?**
```typescript
// Check enrollment
const enrollments = await dataService.getEnrollmentsByStudent(studentId);
const courses = enrollments.map(e => e.courseId);
console.log('Enrolled courses:', courses);

// Check sessions
const sessions = await dataService.getClassSessionsByStudent(studentId);
console.log('Sessions:', sessions.length);
```

---

## 📚 Documentation Links

- **Full API**: `/src/app/services/README.md`
- **Examples**: `/USAGE_EXAMPLES.md`
- **Architecture**: `/ARCHITECTURE.md`
- **Data Model**: `/DATA_RELATIONSHIPS.md`
- **Delivery Summary**: `/DATA_SERVICE_DELIVERY.md`

---

**Version**: 1.0.0  
**Updated**: March 12, 2026
