import { createBrowserRouter } from "react-router";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";

// Student Pages
import StudentLayout from "./layouts/StudentLayout";
import StudentDashboard from "./pages/student/Dashboard";
import StudentSchedule from "./pages/student/Schedule";
import StudentAssignments from "./pages/student/Assignments";
import StudentCalendar from "./pages/student/Calendar";
import StudentSyllabus from "./pages/student/Syllabus";
import StudentProfessors from "./pages/student/Professors";
import StudentNotes from "./pages/student/Notes";
import StudentSettings from "./pages/student/Settings";

// Admin Pages
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminManageClasses from "./pages/admin/ManageClasses";
import AdminManageSchedule from "./pages/admin/ManageSchedule";

// Professor Pages
import ProfessorLayout from "./layouts/ProfessorLayout";
import ProfessorDashboard from "./pages/professor/Dashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Login,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/forgot-password",
    Component: ForgotPassword,
  },
  {
    path: "/student",
    Component: StudentLayout,
    children: [
      { path: "dashboard", Component: StudentDashboard },
      { path: "schedule", Component: StudentSchedule },
      { path: "assignments", Component: StudentAssignments },
      { path: "calendar", Component: StudentCalendar },
      { path: "syllabus", Component: StudentSyllabus },
      { path: "professors", Component: StudentProfessors },
      { path: "notes", Component: StudentNotes },
      { path: "settings", Component: StudentSettings },
      { path: "*", Component: StudentDashboard }, // Fallback
    ],
  },
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
        { path: "dashboard", Component: AdminDashboard },
        { path: "classes", Component: AdminManageClasses },
        { path: "schedule", Component: AdminManageSchedule },
        { path: "*", Component: AdminDashboard }, // Fallback
    ],
  },
  {
    path: "/professor",
    Component: ProfessorLayout,
    children: [
        { path: "dashboard", Component: ProfessorDashboard },
        { path: "*", Component: ProfessorDashboard }, // Fallback
    ],
  },
  {
    path: "*",
    Component: Login, // Global Fallback
  }
]);