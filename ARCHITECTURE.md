# EMBA Connect - System Architecture

## Overview

EMBA Connect is a production-ready academic management platform for Executive MBA programs, featuring role-based authentication, class scheduling, assignment tracking, and comprehensive data management.

## Technology Stack

- **Frontend**: React 18.3 + TypeScript
- **Routing**: React Router v7 (Data Mode)
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI + Custom Components
- **Data Layer**: PostgreSQL with JSON Fallback
- **Date Handling**: date-fns
- **Icons**: Lucide React

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐               │
│  │  Student   │  │  Professor │  │   Admin    │               │
│  │  Portal    │  │   Portal   │  │   Portal   │               │
│  └────────────┘  └────────────┘  └────────────┘               │
│       │               │                 │                       │
│       └───────────────┴─────────────────┘                       │
│                       │                                         │
│              ┌────────▼────────┐                               │
│              │  React Router   │                               │
│              │  (Data Mode)    │                               │
│              └────────┬────────┘                               │
│                       │                                         │
│       ┌───────────────┼───────────────┐                       │
│       │               │               │                       │
│  ┌────▼────┐   ┌─────▼─────┐   ┌────▼────┐                 │
│  │ Student │   │ Professor │   │  Admin  │                 │
│  │ Layout  │   │  Layout   │   │ Layout  │                 │
│  └─────────┘   └───────────┘   └─────────┘                 │
└─────────────────────────────────────────────────────────────────┘
                             │
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  Custom React Hooks                       │  │
│  │  - useCurrentUser      - useStudentCourses               │  │
│  │  - useProfessors       - useClassSessions                │  │
│  │  - useAnnouncements    - useClassSessionMutations        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                             │                                   │
│  ┌──────────────────────────▼───────────────────────────────┐  │
│  │                    Business Logic                         │  │
│  │  - Authentication      - Scheduling                       │  │
│  │  - Authorization       - Assignment Management            │  │
│  │  - Data Validation     - Resource Management              │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                             │
┌─────────────────────────────────────────────────────────────────┐
│                        DATA ACCESS LAYER                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │               Data Service (dataService.ts)               │  │
│  │                                                            │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │  Connection Check                                    │ │  │
│  │  │  • Attempts PostgreSQL connection                    │ │  │
│  │  │  • Falls back to JSON if unavailable                 │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  │                                                            │  │
│  │  API Methods:                                             │  │
│  │  • User Management      • Enrollment Management          │  │
│  │  • Student Management   • Class Session CRUD             │  │
│  │  • Professor Management • Assignment Queries             │  │
│  │  • Course Management    • Resource Management            │  │
│  │  • Note CRUD            • Announcements                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                             │                                   │
│                 ┌───────────┴───────────┐                      │
│                 │                       │                      │
└─────────────────┼───────────────────────┼──────────────────────┘
                  │                       │
┌─────────────────▼─────────┐  ┌─────────▼──────────────┐
│    PostgreSQL Database     │  │    JSON Data Files     │
│      (Production)          │  │    (Development/       │
│                            │  │     Fallback)          │
│  • users                   │  │                        │
│  • students                │  │  • users.json          │
│  • professors              │  │  • students.json       │
│  • courses                 │  │  • professors.json     │
│  • enrollments             │  │  • courses.json        │
│  • class_sessions          │  │  • enrollments.json    │
│  • assignments             │  │  • classSessions.json  │
│  • resources               │  │  • assignments.json    │
│  • announcements           │  │  • resources.json      │
│  • notes                   │  │  • announcements.json  │
│                            │  │  • notes.json          │
└────────────────────────────┘  └────────────────────────┘
```

## Application Structure

```
/src/app/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Button, Card, etc.)
│   └── [feature]/      # Feature-specific components
├── layouts/            # Layout wrappers
│   ├── StudentLayout.tsx
│   ├── ProfessorLayout.tsx
│   └── AdminLayout.tsx
├── pages/              # Route pages
│   ├── student/        # Student portal pages
│   ├── professor/      # Professor portal pages
│   └── admin/          # Admin portal pages
├── services/           # Data services
│   └── dataService.ts  # Main data access layer
├── hooks/              # Custom React hooks
│   └── useDataService.ts
├── lib/                # Utilities and helpers
│   ├── db.ts          # Backward-compatible wrapper
│   └── utils.ts       # Helper functions
├── types/              # TypeScript type definitions
│   └── index.ts
├── data/               # JSON fallback data
│   ├── users.json
│   ├── students.json
│   ├── professors.json
│   ├── courses.json
│   ├── enrollments.json
│   ├── classSessions.json
│   ├── assignments.json
│   ├── resources.json
│   ├── announcements.json
│   └── notes.json
├── styles/             # Global styles
│   ├── theme.css
│   └── fonts.css
├── routes.ts           # React Router configuration
└── App.tsx             # Root component
```

## User Roles & Permissions

### Student Portal
- ✅ View dashboard with stats
- ✅ View class schedule (weekly/monthly)
- ✅ Join virtual classes
- ✅ View and submit assignments
- ✅ Access course resources
- ✅ View announcements
- ✅ Manage personal notes
- ✅ View professor directory
- ✅ Access AI assistant

### Professor Portal
- ✅ View dashboard
- ✅ View teaching schedule
- ✅ **Create/Edit/Delete class sessions**
- ✅ Manage course materials
- ✅ Post announcements
- ⏳ Grade assignments (future)
- ⏳ View student roster (future)

### Admin Portal
- ✅ System dashboard
- ✅ Manage all classes
- ✅ Manage schedules
- ⏳ User management (future)
- ⏳ Reports & analytics (future)

## Data Flow: Professor Scheduling

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Professor Opens Schedule Page                             │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│ 2. Clicks "Schedule New Class" Button                        │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│ 3. Modal Opens with Form Fields:                             │
│    • Course Dropdown (professor's courses only)              │
│    • Topic Input                                             │
│    • Date Picker                                             │
│    • Start Time                                              │
│    • End Time                                                │
│    • Meeting Link (Zoom/Teams/Meet)                          │
│    • Location (Online/Classroom)                             │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│ 4. Professor Submits Form                                    │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│ 5. Frontend Validation                                       │
│    • All required fields filled                              │
│    • Start time < End time                                   │
│    • Valid meeting link format                               │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│ 6. Call dataService.createClassSession()                     │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴───────────┐
        │                        │
┌───────▼────────┐     ┌─────────▼────────┐
│   PostgreSQL   │     │   JSON Storage   │
│   INSERT INTO  │     │   Array.push()   │
│ class_sessions │     │                  │
└───────┬────────┘     └─────────┬────────┘
        │                        │
        └────────────┬───────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│ 7. New Session Automatically Appears In:                     │
│    ✅ Student Schedule Page (enrolled students only)         │
│    ✅ Student Calendar Page (highlighted date)               │
│    ✅ Admin Schedule Management                              │
│    ✅ Professor Dashboard/Schedule                           │
└─────────────────────────────────────────────────────────────┘
```

## Database Schema (PostgreSQL)

### Core Tables

**users**
- Primary authentication table
- Stores: id, name, email, role, avatar

**students**
- Links to users via user_id
- Stores: student_id, program, gpa, enrolled_year

**professors**
- Faculty information
- Stores: department, bio, office_hours, linkedin

**courses**
- Course catalog
- Links to professors
- Stores: code, title, credits, description

**enrollments**
- Many-to-many relationship
- Links students to courses

**class_sessions**
- Scheduled classes
- Links to courses
- Stores: topic, date, time, meeting_link, location

**assignments**
- Course assignments
- Links to courses
- Stores: title, description, due_date, max_points, status

**resources**
- Learning materials
- Links to courses
- Stores: title, type, url, uploaded_date

**announcements**
- System-wide announcements
- Stores: title, message, priority, date

**notes**
- Student personal notes
- Links to students and courses

## Data Volume

| Entity | Count | Description |
|--------|-------|-------------|
| Users | 71 | 50 students + 20 professors + 1 admin |
| Students | 50 | Executive MBA students |
| Professors | 20 | Faculty across 10 departments |
| Courses | 15 | MBA course catalog |
| Enrollments | 220+ | 4-5 courses per student |
| Class Sessions | 60 | Scheduled from March-June 2026 |
| Assignments | 80 | Distributed across courses |
| Resources | 100 | PDFs, videos, links, documents |
| Announcements | 15 | Recent announcements |
| Notes | 5+ | Student notes (expandable) |

## Key Features

### Dual Timezone Support
- IST (Indian Standard Time)
- EST (Eastern Standard Time)
- Automatic conversion in UI

### Class Scheduling Workflow
1. Professor/Admin creates class session
2. Session saved to database/JSON
3. Enrolled students see it in schedule
4. Calendar automatically updates
5. Join Meeting button uses saved link

### Data Service Benefits
- ✅ Automatic fallback mechanism
- ✅ Consistent API across data sources
- ✅ Type-safe operations
- ✅ Easy testing with JSON data
- ✅ Production-ready for PostgreSQL
- ✅ No code changes needed for source switch

### React Hooks Pattern
- Custom hooks abstract data fetching
- Built-in loading states
- Error handling
- Automatic refetch capability
- Clean component code

## Environment Variables

```env
# PostgreSQL Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=EMBA_IITR
DB_USER=postgres
DB_PASSWORD=your_password

# Application
NODE_ENV=development
```

## Deployment Considerations

### Database Setup
1. Create PostgreSQL database: `EMBA_IITR`
2. Run schema: `psql -d EMBA_IITR -f database-schema.sql`
3. Import data or use JSON fallback
4. Configure connection in environment variables

### Frontend Build
```bash
npm run build
```

### Production Checklist
- [ ] Database credentials secured
- [ ] Connection pooling configured
- [ ] Error logging implemented
- [ ] Performance monitoring setup
- [ ] Backup strategy in place
- [ ] SSL/TLS for database connection

## Future Enhancements

### Phase 1 (Current)
- ✅ Data service with DB + JSON fallback
- ✅ Student, Professor, Admin portals
- ✅ Class scheduling by professors
- ✅ Assignment and resource management
- ✅ Announcements system

### Phase 2 (Planned)
- ⏳ Real-time updates (WebSocket)
- ⏳ Assignment submission & grading
- ⏳ Student attendance tracking
- ⏳ Email notifications
- ⏳ Advanced analytics & reports

### Phase 3 (Future)
- ⏳ Mobile app (React Native)
- ⏳ Video conferencing integration
- ⏳ Discussion forums
- ⏳ Exam management
- ⏳ Payment integration

## Performance Optimization

- React Router data loading
- Component code splitting
- Memoization of expensive computations
- Virtual scrolling for large lists
- Image lazy loading
- Database query optimization
- Connection pooling

## Security Considerations

- Role-based access control (RBAC)
- SQL injection prevention (parameterized queries)
- XSS protection
- CSRF tokens
- Secure session management
- Password hashing (bcrypt)
- API rate limiting

## Support & Documentation

- **Technical Docs**: `/src/app/services/README.md`
- **Database Schema**: `/database-schema.sql`
- **API Reference**: See dataService.ts JSDoc comments
- **Hook Usage**: See useDataService.ts examples

## Contributing

1. Follow TypeScript best practices
2. Maintain type safety
3. Document new features
4. Write tests for critical paths
5. Update architecture docs
6. Follow existing code patterns

---

**Version**: 1.0.0  
**Last Updated**: March 12, 2026  
**Maintained By**: EMBA Connect Development Team
