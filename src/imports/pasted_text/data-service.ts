**PROJECT TITLE:**
EMBA Connect – Production Data Layer + Smart Fallback System

---

# CONTEXT

I already have a working React application called **EMBA Connect** built with:

* React + React Router (createBrowserRouter)
* Role-based portals:

  * `/student/*`
  * `/admin/*`
  * `/professor/*`
* Layout wrappers:

  * `StudentLayout`
  * `AdminLayout`
  * `ProfessorLayout`
* UI system built with **shadcn/ui components**
* Current data source is **hardcoded mock arrays inside `/src/app/lib/db.ts`**

Existing features include:

Student Portal:

* Dashboard
* Schedule
* Assignments
* Calendar
* Syllabus
* Professors
* Notes
* Settings
* AI Assistant

Admin Portal:

* Dashboard
* Manage Classes
* Manage Schedule

Professor Portal:

* Dashboard

There is **no backend yet**. Data is currently static.

---

# OBJECTIVE

Extend the system so the application becomes **data-driven and production-ready** while **preserving all existing routes, layouts, and UI components**.

The goal is to introduce a **Database + JSON fallback architecture**.

The system must:

1. First check if **PostgreSQL database connection is available**
2. If database connection **fails**, automatically use **local JSON files**
3. JSON files must contain **structured realistic data**
4. The UI must behave exactly the same regardless of data source

---

# DATABASE SPECIFICATION

Use **PostgreSQL**

Database Name:

EMBA_IITR

Tables required:

users
students
professors
courses
enrollments
class_sessions
assignments
resources
announcements
notes

Relationships:

* students.user_id → users.id
* professors.user_id → users.id
* courses.professor_id → professors.id
* enrollments.student_id → students.id
* enrollments.course_id → courses.id
* class_sessions.course_id → courses.id
* assignments.course_id → courses.id
* resources.course_id → courses.id
* notes.student_id → students.id

---

# DATA ACCESS LAYER

Create a new service layer:

```
/src/app/services/dataService.ts
```

Logic:

1️⃣ Try database connection

```
checkDatabaseConnection()
```

2️⃣ If connected

```
use PostgreSQL queries
```

3️⃣ If failed

```
fallback to JSON files
```

---

# JSON FALLBACK STRUCTURE

Create directory:

```
/src/app/data/
```

Files required:

```
students.json
professors.json
courses.json
classSessions.json
assignments.json
resources.json
announcements.json
enrollments.json
notes.json
users.json
```

---

# DATA VOLUME REQUIREMENTS

Generate realistic datasets:

Students: **50 records**
Professors: **20 records**
Courses: **15 records**
Class Sessions: **60 sessions**
Assignments: **80 assignments**
Resources: **100 learning resources**
Announcements: **15 announcements**

Data must look realistic for an **Executive MBA program**.

---

# SAMPLE JSON STRUCTURE

## users.json

```
{
 "id": "u001",
 "name": "Alex Mercer",
 "email": "alex.mercer@iitr.ac.in",
 "role": "student",
 "avatar": "/avatars/alex.png"
}
```

Roles:

student
professor
admin

---

## students.json

```
{
 "id": "s001",
 "userId": "u001",
 "program": "Executive MBA",
 "studentId": "EMBA24001",
 "gpa": 3.8,
 "enrolledYear": 2024
}
```

Generate **50 records**.

---

## professors.json

```
{
 "id": "p001",
 "name": "Dr. Rajesh Sharma",
 "department": "Strategy",
 "bio": "Professor of Strategic Management with 15 years industry experience.",
 "email": "rajesh.sharma@iitr.ac.in",
 "officeHours": "Mon 3pm-5pm",
 "linkedIn": "https://linkedin.com/in/rajeshsharma"
}
```

Generate **20 professors**.

---

## courses.json

```
{
 "id": "c001",
 "code": "STRAT-601",
 "title": "Strategic Leadership",
 "professorId": "p003",
 "credits": 3,
 "description": "Advanced corporate strategy and leadership."
}
```

Generate **15 courses**.

---

## enrollments.json

```
{
 "studentId": "s001",
 "courseId": "c001"
}
```

Each student enrolled in **4–5 courses**.

---

## classSessions.json

```
{
 "id": "cls001",
 "courseId": "c001",
 "topic": "Competitive Strategy",
 "date": "2026-04-02",
 "startTime": "10:00",
 "endTime": "11:30",
 "meetingLink": "https://zoom.us/j/874839274",
 "location": "Online"
}
```

Generate **60 sessions**.

---

## assignments.json

```
{
 "id": "a001",
 "courseId": "c001",
 "title": "Case Study Analysis",
 "description": "Analyze the Tesla strategic case.",
 "dueDate": "2026-04-15",
 "maxPoints": 100,
 "status": "pending"
}
```

---

## resources.json

```
{
 "id": "r001",
 "courseId": "c001",
 "title": "Porter Competitive Strategy",
 "type": "pdf",
 "url": "/resources/porter_strategy.pdf",
 "uploadedDate": "2026-02-01"
}
```

---

## announcements.json

```
{
 "id": "ann001",
 "title": "Guest Lecture",
 "message": "Industry leader session on digital transformation.",
 "priority": "high",
 "date": "2026-03-20"
}
```

---

# PROFESSOR CLASS SCHEDULING FEATURE

Extend the existing **Schedule system**.

Allow professors to create new class sessions.

Inside `/professor/dashboard` or `/professor/schedule` add:

**Schedule Class Modal**

Fields:

Course Dropdown
Topic Input
Date Picker
Start Time
End Time
Meeting Link Textbox (Zoom / Teams / Meet link)
Location (Online / Classroom)

When saved:

1️⃣ New record added to `class_sessions`

2️⃣ Session appears automatically in:

* Student **Schedule page**
* Student **Calendar page**
* Admin **Manage Schedule**

Students should only see classes for **courses they are enrolled in**.

---

# DATA FLOW

Professor creates class session
↓
Saved to DB or JSON
↓
Schedule API updates
↓
Student schedule renders new session
↓
Calendar highlights that day
↓
Join Class button uses saved meetingLink

---

# SYSTEM RULES

DO NOT modify or break:

* Existing React Router routes
* Existing Layout components
* Existing UI components
* Existing page structures

Instead:

Extend logic through:

```
services/
repositories/
hooks/
```

---

# EXPECTED OUTPUT FROM FIGMA AI

Generate:

1️⃣ Database schema diagram
2️⃣ JSON fallback file structure
3️⃣ Scheduling workflow diagram
4️⃣ Updated system architecture
5️⃣ UI flow for professor scheduling classes
6️⃣ Data service architecture (DB + JSON fallback)

---

# GOAL

Transform EMBA Connect from a **mock demo app** into a **production-ready academic platform** with:

* Database-backed architecture
* Offline JSON fallback
* Real scheduling workflows
* Multi-role academic experience
* Scalable data layer
