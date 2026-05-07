# EMBA Connect - Data Relationships & Entity Diagram

## Entity Relationship Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           EMBA CONNECT DATA MODEL                             │
└──────────────────────────────────────────────────────────────────────────────┘

                                  ┌─────────────┐
                                  │    USERS    │
                                  ├─────────────┤
                                  │ • id (PK)   │
                                  │ • name      │
                                  │ • email     │
                                  │ • role      │
                                  │ • avatar    │
                                  └──────┬──────┘
                                         │
                     ┌───────────────────┴───────────────────┐
                     │                                       │
            ┌────────▼─────────┐                   ┌────────▼─────────┐
            │    STUDENTS      │                   │   PROFESSORS     │
            ├──────────────────┤                   ├──────────────────┤
            │ • id (PK)        │                   │ • id (PK)        │
            │ • userId (FK)    │                   │ • userId (FK)    │
            │ • program        │                   │ • name           │
            │ • studentId      │                   │ • department     │
            │ • gpa            │                   │ • bio            │
            │ • enrolledYear   │                   │ • email          │
            └────────┬─────────┘                   │ • officeHours    │
                     │                             │ • linkedIn       │
                     │                             └────────┬─────────┘
                     │                                      │
                     │                                      │
                     │         ┌──────────────┐            │
                     │         │   COURSES    │            │
                     │         ├──────────────┤            │
                     │         │ • id (PK)    │◄───────────┘
                     │         │ • code       │
                     │         │ • title      │
                     │         │ • professorId│
                     │         │   (FK)       │
                     │         │ • credits    │
                     │         │ • description│
                     │         └──────┬───────┘
                     │                │
                     │                │
          ┌──────────▼────────┐       │       ┌──────────────────┐
          │   ENROLLMENTS     │◄──────┘       │  CLASS_SESSIONS  │
          │  (Many-to-Many)   │               ├──────────────────┤
          ├───────────────────┤               │ • id (PK)        │
          │ • studentId (FK)  │               │ • courseId (FK)  │◄──┐
          │ • courseId (FK)   │               │ • topic          │   │
          └───────────────────┘               │ • date           │   │
                                              │ • startTime      │   │
                                              │ • endTime        │   │
                                              │ • meetingLink    │   │
                                              │ • location       │   │
                                              └──────────────────┘   │
                                                                     │
                     ┌───────────────────────────────────────────────┤
                     │                                               │
          ┌──────────▼────────┐              ┌──────────────────┐   │
          │   ASSIGNMENTS     │              │    RESOURCES     │   │
          ├───────────────────┤              ├──────────────────┤   │
          │ • id (PK)         │              │ • id (PK)        │   │
          │ • courseId (FK)   │◄─────────────│ • courseId (FK)  │◄──┘
          │ • title           │              │ • title          │
          │ • description     │              │ • type           │
          │ • dueDate         │              │ • url            │
          │ • maxPoints       │              │ • uploadedDate   │
          │ • status          │              └──────────────────┘
          │ • grade           │
          └───────────────────┘


          ┌──────────────────┐              ┌──────────────────┐
          │  ANNOUNCEMENTS   │              │      NOTES       │
          ├──────────────────┤              ├──────────────────┤
          │ • id (PK)        │              │ • id (PK)        │
          │ • title          │              │ • studentId (FK) │
          │ • message        │              │ • courseId (FK)  │
          │ • priority       │              │ • title          │
          │ • date           │              │ • content        │
          │ • author         │              │ • createdDate    │
          └──────────────────┘              │ • updatedDate    │
                                            └──────────────────┘

Legend:
  • (PK) = Primary Key
  • (FK) = Foreign Key
  • ───► = One-to-Many Relationship
  • ◄──► = Many-to-Many Relationship
```

## Relationships Explained

### 1. Users → Students (One-to-One)
```
One user can be one student
userId in students table references users.id
```

**Example**:
```typescript
// User: u001 → Alex Mercer
// Student: s001 (userId: u001)
```

### 2. Users → Professors (One-to-One)
```
One user can be one professor
userId in professors table references users.id
```

**Example**:
```typescript
// User: u101 → Dr. Rajesh Sharma
// Professor: p001 (userId: u101)
```

### 3. Professors → Courses (One-to-Many)
```
One professor teaches multiple courses
professorId in courses table references professors.id
```

**Example**:
```typescript
// Professor: p001 (Dr. Rajesh Sharma)
// Courses:
//   - c001: Strategic Leadership
//   - c011: Competitive Strategy
```

### 4. Students ↔ Courses (Many-to-Many via Enrollments)
```
One student enrolls in multiple courses
One course has multiple enrolled students
enrollments table manages this relationship
```

**Example**:
```typescript
// Student s001 enrolled in:
//   - c001 (Strategic Leadership)
//   - c002 (Corporate Finance)
//   - c003 (Digital Marketing)
//   - c005 (Digital Innovation)
//   - c009 (Business Analytics)

// Course c001 has students:
//   - s001, s002, s003, s005, s007, ... (multiple)
```

### 5. Courses → Class Sessions (One-to-Many)
```
One course has multiple class sessions
courseId in class_sessions table references courses.id
```

**Example**:
```typescript
// Course: c001 (Strategic Leadership)
// Sessions:
//   - cls001: Competitive Strategy Frameworks (Mar 15)
//   - cls006: Porter's Five Forces (Mar 22)
//   - cls016: Business Model Innovation (Apr 5)
//   - cls031: Global Market Entry (Apr 26)
//   - cls046: Strategic Alliances (May 17)
//   - cls062: Industry Analysis (Jun 28)
```

### 6. Courses → Assignments (One-to-Many)
```
One course has multiple assignments
courseId in assignments table references courses.id
```

**Example**:
```typescript
// Course: c001 (Strategic Leadership)
// Assignments:
//   - a001: Tesla Strategic Analysis (Due: Mar 20)
//   - a002: Business Model Innovation (Due: Apr 10)
//   - a003: Strategic Alliance Case (Due: May 5)
//   - a004: Market Entry Strategy (Due: May 25)
//   - a005: Competitive Positioning (Due: Jun 15)
//   - a062: Industry Analysis Report (Due: Jun 28)
```

### 7. Courses → Resources (One-to-Many)
```
One course has multiple learning resources
courseId in resources table references courses.id
```

**Example**:
```typescript
// Course: c001 (Strategic Leadership)
// Resources:
//   - r001: Strategic Management Textbook (PDF)
//   - r002: Porter's Five Forces Framework (PDF)
//   - r003: Business Model Innovation Guide (PDF)
//   - r004: Global Strategy Case Studies (Video)
//   - r005: Harvard Business Review - Strategy (Link)
//   - r006: Strategic Alliance Templates (Document)
//   - r091: McKinsey Strategy Insights (Link)
```

### 8. Students → Notes (One-to-Many)
```
One student creates multiple notes
studentId in notes table references students.id
Notes can optionally link to specific courses
```

**Example**:
```typescript
// Student: s001
// Notes:
//   - n001: Porter's Five Forces Summary (Course: c001)
//   - n002: DCF Valuation Steps (Course: c002)
//   - n003: Digital Marketing Channels (Course: c003)
//   - n004: Assignment Deadlines (General)
//   - n005: AI Implementation Ideas (Course: c005)
```

### 9. Announcements (Independent)
```
System-wide announcements
Not linked to specific entities
Visible to all users
```

## Data Access Patterns

### Pattern 1: Get Student's Complete Schedule

```typescript
// 1. Get student by user ID
const student = await dataService.getStudentByUserId('u001');

// 2. Get student's enrolled courses
const courses = await dataService.getCoursesByStudent(student.id);

// 3. Get class sessions for those courses
const allSessions = await dataService.getClassSessionsByStudent(student.id);

// Result: All classes student should attend
```

### Pattern 2: Get Course with All Details

```typescript
// 1. Get course
const course = await dataService.getCourseById('c001');

// 2. Get professor
const professor = await dataService.getProfessorById(course.professorId);

// 3. Get all related data
const sessions = await dataService.getClassSessionsByCourse(course.id);
const assignments = await dataService.getAssignmentsByCourse(course.id);
const resources = await dataService.getResourcesByCourse(course.id);

// Result: Complete course package
```

### Pattern 3: Professor's Teaching Load

```typescript
// 1. Get professor
const professor = await dataService.getProfessorById('p001');

// 2. Get courses
const courses = await dataService.getCoursesByProfessor(professor.id);

// 3. Get all sessions
const sessions = await dataService.getClassSessionsByProfessor(professor.id);

// 4. Get enrolled students count
const enrollmentCounts = await Promise.all(
  courses.map(async (course) => {
    const enrollments = await dataService.getEnrollmentsByCourse(course.id);
    return { courseId: course.id, count: enrollments.length };
  })
);

// Result: Complete teaching overview
```

### Pattern 4: Course Enrollment Check

```typescript
// Check if student is enrolled in course
const enrollments = await dataService.getEnrollmentsByStudent('s001');
const isEnrolled = enrollments.some(e => e.courseId === 'c001');

// Get all students in a course
const courseEnrollments = await dataService.getEnrollmentsByCourse('c001');
const studentIds = courseEnrollments.map(e => e.studentId);
```

## Query Optimization Tips

### 1. Batch Queries

```typescript
// ❌ Bad: Multiple sequential queries
for (const courseId of courseIds) {
  const course = await dataService.getCourseById(courseId);
}

// ✅ Good: Single query
const allCourses = await dataService.getCourses();
const myCourses = allCourses.filter(c => courseIds.includes(c.id));
```

### 2. Parallel Fetching

```typescript
// ✅ Fetch related data in parallel
const [courses, sessions, assignments] = await Promise.all([
  dataService.getCoursesByStudent(studentId),
  dataService.getClassSessionsByStudent(studentId),
  dataService.getAssignmentsByStudent(studentId)
]);
```

### 3. Filter After Fetch (JSON Mode)

```typescript
// In JSON mode, filtering happens client-side
const allSessions = await dataService.getClassSessions();

// Filter for upcoming only
const upcoming = allSessions.filter(s => 
  new Date(s.date) > new Date()
);

// Sort by date
const sorted = upcoming.sort((a, b) => 
  new Date(a.date).getTime() - new Date(b.date).getTime()
);
```

## Data Integrity Rules

### 1. Referential Integrity

```typescript
// Cannot delete course if it has:
// - Enrollments
// - Class sessions
// - Assignments
// - Resources

// Must delete children first or use CASCADE
```

### 2. Business Rules

```typescript
// ✅ Student can enroll in 4-5 courses
// ✅ Class session must have valid course
// ✅ Assignment must belong to a course
// ✅ Resource must belong to a course
// ✅ Note can exist without course (general notes)
```

### 3. Validation Rules

```typescript
// Dates
// - Class end time > start time
// - Assignment due date in future
// - Session date >= today

// Enrollment
// - No duplicate enrollments
// - Valid student ID
// - Valid course ID

// Sessions
// - No overlapping times for same professor
// - Valid meeting link format
```

## Common Queries

### Most Active Courses
```typescript
const allEnrollments = await dataService.getEnrollments();
const courseCounts = {};

allEnrollments.forEach(e => {
  courseCounts[e.courseId] = (courseCounts[e.courseId] || 0) + 1;
});

// Sort by enrollment count
```

### Upcoming Deadlines
```typescript
const assignments = await dataService.getAssignmentsByStudent(studentId);
const today = new Date();
const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

const upcoming = assignments.filter(a => {
  const due = new Date(a.dueDate);
  return due >= today && due <= nextWeek && a.status === 'pending';
});
```

### Professor Workload
```typescript
const professor = await dataService.getProfessorById(professorId);
const courses = await dataService.getCoursesByProfessor(professorId);
const sessions = await dataService.getClassSessionsByProfessor(professorId);

const workload = {
  courses: courses.length,
  sessions: sessions.length,
  upcomingSessions: sessions.filter(s => new Date(s.date) >= new Date()).length
};
```

---

This data model supports the complete EMBA Connect workflow from student enrollment through class scheduling, assignment management, and resource distribution.
