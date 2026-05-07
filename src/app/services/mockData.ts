/**
 * Mock data for EMBA Connect
 * This file contains hardcoded data to bypass JSON import issues
 */

import type { User, Student, Professor, Course, Enrollment, ClassSession, Assignment, Resource, Announcement, Note } from '../types';

export const usersData: User[] = [
  {
    id: "u001",
    name: "Alex Mercer",
    email: "alex.mercer@iitr.ac.in",
    role: "student",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=150&h=150"
  },
  {
    id: "u002",
    name: "Sarah Johnson",
    email: "sarah.johnson@iitr.ac.in",
    role: "student",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?fit=crop&w=150&h=150"
  },
  {
    id: "u003",
    name: "Michael Chen",
    email: "michael.chen@iitr.ac.in",
    role: "student",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?fit=crop&w=150&h=150"
  },
  {
    id: "u059",
    name: "Dr. Ramesh S Iyyer",
    email: "ramesh.iyyer@iitr.ac.in",
    role: "professor",
    avatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?fit=crop&w=150&h=150"
  }
];

export const studentsData: Student[] = [
  { id: "s001", userId: "u001", program: "Executive MBA", studentId: "EMBA24001", gpa: 3.8, enrolledYear: 2024 },
  { id: "s002", userId: "u002", program: "Executive MBA", studentId: "EMBA24002", gpa: 3.9, enrolledYear: 2024 },
  { id: "s003", userId: "u003", program: "Executive MBA", studentId: "EMBA24003", gpa: 3.7, enrolledYear: 2024 }
];

export const professorsData: Professor[] = [
  {
    id: "p001",
    userId: "u051",
    name: "Dr. Robert Williams",
    email: "robert.williams@iitr.ac.in",
    department: "Strategy",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?fit=crop&w=150&h=150",
    officeHours: "Mon, Wed 2-4 PM",
    bio: "Professor of Strategic Management with 20+ years of experience in corporate strategy."
  },
  {
    id: "p002",
    userId: "u052",
    name: "Dr. Jennifer Martinez",
    email: "jennifer.martinez@iitr.ac.in",
    department: "Finance",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?fit=crop&w=150&h=150",
    officeHours: "Tue, Thu 3-5 PM",
    bio: "Expert in Corporate Finance, Investment Banking, and Financial Modeling with 15+ years of industry experience."
  },
  {
    id: "p003",
    userId: "u053",
    name: "Dr. Michael Thompson",
    email: "michael.thompson@iitr.ac.in",
    department: "Marketing",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?fit=crop&w=150&h=150",
    officeHours: "Mon, Fri 1-3 PM",
    bio: "Marketing strategy expert specializing in Digital Marketing, Brand Management, and Consumer Behavior."
  },
  {
    id: "p004",
    userId: "u054",
    name: "Dr. Emily Chen",
    email: "emily.chen@iitr.ac.in",
    department: "Operations",
    avatar: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?fit=crop&w=150&h=150",
    officeHours: "Wed, Thu 2-4 PM",
    bio: "Operations Management specialist with expertise in Supply Chain, Lean Six Sigma, and Process Optimization."
  },
  {
    id: "p005",
    userId: "u055",
    name: "Dr. David Kumar",
    email: "david.kumar@iitr.ac.in",
    department: "Leadership",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?fit=crop&w=150&h=150",
    officeHours: "Tue, Wed 4-6 PM",
    bio: "Organizational Behavior and Leadership Development expert with focus on Executive Coaching and Team Dynamics."
  },
  {
    id: "p006",
    userId: "u056",
    name: "Dr. Sarah Anderson",
    email: "sarah.anderson@iitr.ac.in",
    department: "Economics",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?fit=crop&w=150&h=150",
    officeHours: "Mon, Thu 10-12 PM",
    bio: "Managerial Economics and Global Business Strategy expert with focus on international markets."
  },
  {
    id: "p007",
    userId: "u057",
    name: "Dr. James Patterson",
    email: "james.patterson@iitr.ac.in",
    department: "Analytics",
    avatar: "https://images.unsplash.com/photo-1556157382-97eda2d62296?fit=crop&w=150&h=150",
    officeHours: "Tue, Fri 2-4 PM",
    bio: "Business Analytics and Data Science expert specializing in Predictive Modeling and AI-driven decision making."
  },
  {
    id: "p008",
    userId: "u058",
    name: "Dr. Lisa Rodriguez",
    email: "lisa.rodriguez@iitr.ac.in",
    department: "Entrepreneurship",
    avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?fit=crop&w=150&h=150",
    officeHours: "Mon, Wed 11-1 PM",
    bio: "Entrepreneurship and Innovation expert with experience in startup ecosystems and venture capital."
  },
  {
    id: "p009",
    userId: "u059",
    name: "Dr. Ramesh S Iyyer",
    email: "ramesh.iyyer@iitr.ac.in",
    department: "Strategy",
    avatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?fit=crop&w=150&h=150",
    officeHours: "Sat 5-7 PM",
    bio: "Advanced Strategic Management expert with 25+ years of experience in corporate strategy, business transformation, and executive leadership."
  }
];

export const coursesData: Course[] = [
  {
    id: "c001",
    code: "EMBA601",
    name: "Strategic Management",
    professorId: "p001",
    credits: 3,
    schedule: "Mon, Wed 6:00-9:00 PM IST",
    description: "Advanced course in strategic planning and execution"
  },
  {
    id: "c002",
    code: "EMBA602",
    name: "Competitive Strategy",
    professorId: "p001",
    credits: 3,
    schedule: "Tue, Thu 6:00-9:00 PM IST",
    description: "Deep dive into competitive analysis and positioning"
  },
  {
    id: "c003",
    code: "EMBA611",
    name: "Corporate Finance",
    professorId: "p002",
    credits: 3,
    schedule: "Mon, Wed 6:00-9:00 PM IST",
    description: "Advanced corporate finance topics including valuation, capital structure, and M&A"
  },
  {
    id: "c004",
    code: "EMBA612",
    name: "Financial Modeling",
    professorId: "p002",
    credits: 2,
    schedule: "Sat 9:00-12:00 PM IST",
    description: "Hands-on Excel-based financial modeling for business decisions"
  },
  {
    id: "c005",
    code: "EMBA621",
    name: "Marketing Strategy",
    professorId: "p003",
    credits: 3,
    schedule: "Tue, Thu 6:00-9:00 PM IST",
    description: "Strategic marketing planning and brand management"
  },
  {
    id: "c006",
    code: "EMBA622",
    name: "Digital Marketing",
    professorId: "p003",
    credits: 2,
    schedule: "Sat 2:00-5:00 PM IST",
    description: "Modern digital marketing channels, SEO, SEM, and social media strategy"
  },
  {
    id: "c007",
    code: "EMBA631",
    name: "Operations Management",
    professorId: "p004",
    credits: 3,
    schedule: "Mon, Wed 6:00-9:00 PM IST",
    description: "Core operations principles including capacity planning and quality management"
  },
  {
    id: "c008",
    code: "EMBA632",
    name: "Supply Chain Strategy",
    professorId: "p004",
    credits: 2,
    schedule: "Fri 6:00-9:00 PM IST",
    description: "Strategic supply chain design and logistics optimization"
  },
  {
    id: "c009",
    code: "EMBA641",
    name: "Leadership & Organizational Behavior",
    professorId: "p005",
    credits: 3,
    schedule: "Tue, Thu 6:00-9:00 PM IST",
    description: "Leadership theories, team dynamics, and organizational culture"
  },
  {
    id: "c010",
    code: "EMBA642",
    name: "Executive Coaching",
    professorId: "p005",
    credits: 2,
    schedule: "Sun 10:00-1:00 PM IST",
    description: "Personal leadership development and executive coaching techniques"
  },
  {
    id: "c011",
    code: "EMBA651",
    name: "Managerial Economics",
    professorId: "p006",
    credits: 3,
    schedule: "Mon, Wed 6:00-9:00 PM IST",
    description: "Economic analysis for business decision making"
  },
  {
    id: "c012",
    code: "EMBA652",
    name: "Global Business Strategy",
    professorId: "p006",
    credits: 3,
    schedule: "Tue, Thu 6:00-9:00 PM IST",
    description: "International business strategy and cross-cultural management"
  },
  {
    id: "c013",
    code: "EMBA661",
    name: "Business Analytics",
    professorId: "p007",
    credits: 3,
    schedule: "Mon, Wed 6:00-9:00 PM IST",
    description: "Data-driven decision making using statistical analysis and visualization"
  },
  {
    id: "c014",
    code: "EMBA662",
    name: "Predictive Modeling & AI",
    professorId: "p007",
    credits: 2,
    schedule: "Sat 10:00-1:00 PM IST",
    description: "Machine learning and AI applications in business"
  },
  {
    id: "c015",
    code: "EMBA671",
    name: "Entrepreneurship & Innovation",
    professorId: "p008",
    credits: 3,
    schedule: "Tue, Thu 6:00-9:00 PM IST",
    description: "Building and scaling startups, innovation frameworks"
  },
  {
    id: "c016",
    code: "EMBA672",
    name: "Venture Capital & Private Equity",
    professorId: "p008",
    credits: 2,
    schedule: "Sun 2:00-5:00 PM IST",
    description: "Investment strategies, due diligence, and startup funding"
  },
  {
    id: "c017",
    code: "EMBA603",
    name: "Strategic Management II",
    professorId: "p009",
    credits: 3,
    schedule: "Sat 7:30-9:00 PM IST",
    description: "Advanced strategic management covering competitive dynamics, strategic innovation, and business transformation"
  }
];

export const enrollmentsData: Enrollment[] = [
  { id: "e001", studentId: "s001", courseId: "c001", enrolledDate: "2024-01-15", grade: "A" },
  { id: "e002", studentId: "s002", courseId: "c001", enrolledDate: "2024-01-15", grade: "A+" },
  { id: "e003", studentId: "s003", courseId: "c001", enrolledDate: "2024-01-15", grade: "A-" },
  { id: "e004", studentId: "s001", courseId: "c017", enrolledDate: "2024-01-15" },
  { id: "e005", studentId: "s002", courseId: "c017", enrolledDate: "2024-01-15" },
  { id: "e006", studentId: "s003", courseId: "c017", enrolledDate: "2024-01-15" }
];

export const classSessionsData: ClassSession[] = [
  {
    id: "cls001",
    courseId: "c001",
    topic: "Competitive Strategy Analysis",
    date: "2026-03-15",
    startTime: "18:00",
    endTime: "21:00",
    location: "Virtual - Zoom",
    meetingLink: "https://zoom.us/j/123456789",
    status: "scheduled"
  },
  {
    id: "cls002",
    courseId: "c001",
    topic: "Blue Ocean Strategy",
    date: "2026-03-17",
    startTime: "18:00",
    endTime: "21:00",
    location: "Virtual - Zoom",
    meetingLink: "https://zoom.us/j/123456789",
    status: "scheduled"
  },
  {
    id: "cls003",
    courseId: "c001",
    topic: "Strategic Planning Workshop",
    date: "2026-03-12",
    startTime: "18:00",
    endTime: "21:00",
    location: "Virtual - Zoom",
    meetingLink: "https://zoom.us/j/123456789",
    status: "completed"
  },
  {
    id: "cls004",
    courseId: "c001",
    topic: "Market Entry Strategies",
    date: "2026-03-19",
    startTime: "18:00",
    endTime: "21:00",
    location: "Virtual - Zoom",
    meetingLink: "https://zoom.us/j/123456789",
    status: "scheduled"
  },
  {
    id: "cls005",
    courseId: "c001",
    topic: "Corporate Restructuring",
    date: "2026-03-22",
    startTime: "18:00",
    endTime: "21:00",
    location: "Virtual - Zoom",
    meetingLink: "https://zoom.us/j/123456789",
    status: "postponed",
    cancellationReason: "Professor attending international conference",
    originalDate: "2026-03-20",
    modifiedBy: "p001",
    modifiedAt: "2026-03-10T10:30:00Z"
  },
  {
    id: "cls006",
    courseId: "c001",
    topic: "Midterm Examination",
    date: "2026-03-24",
    startTime: "18:00",
    endTime: "21:00",
    location: "Virtual - Zoom",
    meetingLink: "https://zoom.us/j/123456789",
    status: "scheduled"
  },
  {
    id: "cls007",
    courseId: "c001",
    topic: "Innovation Strategy",
    date: "2026-03-26",
    startTime: "18:00",
    endTime: "21:00",
    location: "Virtual - Zoom",
    meetingLink: "https://zoom.us/j/123456789",
    status: "cancelled",
    cancellationReason: "University holiday - Spring Break",
    modifiedBy: "admin",
    modifiedAt: "2026-03-08T14:00:00Z"
  },
  {
    id: "cls008",
    courseId: "c001",
    topic: "Strategic Alliances",
    date: "2026-03-29",
    startTime: "18:00",
    endTime: "21:00",
    location: "Virtual - Zoom",
    meetingLink: "https://zoom.us/j/123456789",
    status: "scheduled"
  },
  {
    id: "cls009",
    courseId: "c001",
    topic: "Final Project Presentations",
    date: "2026-03-31",
    startTime: "18:00",
    endTime: "21:00",
    location: "Virtual - Zoom",
    meetingLink: "https://zoom.us/j/123456789",
    status: "scheduled"
  },
  // Today's classes (April 14, 2026)
  {
    id: "cls101",
    courseId: "c001",
    topic: "Advanced Strategic Management",
    date: "2026-04-14",
    startTime: "09:00",
    endTime: "12:00",
    location: "Room 301, Management Building",
    meetingLink: "https://zoom.us/j/987654321?pwd=aBc123XyZ",
    status: "scheduled"
  },
  {
    id: "cls102",
    courseId: "c003",
    topic: "Corporate Finance Workshop",
    date: "2026-04-14",
    startTime: "14:00",
    endTime: "17:00",
    location: "Virtual - MS Teams",
    meetingLink: "https://teams.microsoft.com/l/meetup-join/19%3ameeting_abc123def456",
    status: "scheduled"
  },
  {
    id: "cls103",
    courseId: "c005",
    topic: "Marketing Analytics Lab",
    date: "2026-04-14",
    startTime: "18:00",
    endTime: "21:00",
    location: "Lab 205, Computer Center",
    meetingLink: "https://meet.google.com/xyz-abcd-efg",
    status: "scheduled"
  },
  // Strategic Management II - Saturday Evening Classes (7:30-9:00 PM IST)
  {
    id: "cls201",
    courseId: "c017",
    topic: "Introduction to Advanced Strategic Thinking",
    date: "2026-04-18",
    startTime: "19:30",
    endTime: "21:00",
    location: "Auditorium Hall A, Main Building",
    meetingLink: "https://zoom.us/j/555123456?pwd=StratMgmt2024",
    status: "scheduled"
  },
  {
    id: "cls202",
    courseId: "c017",
    topic: "Competitive Dynamics and Industry Analysis",
    date: "2026-04-25",
    startTime: "19:30",
    endTime: "21:00",
    location: "Auditorium Hall A, Main Building",
    meetingLink: "https://zoom.us/j/555123456?pwd=StratMgmt2024",
    status: "scheduled"
  },
  {
    id: "cls203",
    courseId: "c017",
    topic: "Strategic Positioning and Value Creation",
    date: "2026-05-02",
    startTime: "19:30",
    endTime: "21:00",
    location: "Auditorium Hall A, Main Building",
    meetingLink: "https://zoom.us/j/555123456?pwd=StratMgmt2024",
    status: "scheduled"
  },
  {
    id: "cls204",
    courseId: "c017",
    topic: "Business Model Innovation",
    date: "2026-05-09",
    startTime: "19:30",
    endTime: "21:00",
    location: "Auditorium Hall A, Main Building",
    meetingLink: "https://zoom.us/j/555123456?pwd=StratMgmt2024",
    status: "scheduled"
  },
  {
    id: "cls205",
    courseId: "c017",
    topic: "Digital Transformation Strategy",
    date: "2026-05-16",
    startTime: "19:30",
    endTime: "21:00",
    location: "Auditorium Hall A, Main Building",
    meetingLink: "https://zoom.us/j/555123456?pwd=StratMgmt2024",
    status: "scheduled"
  },
  {
    id: "cls206",
    courseId: "c017",
    topic: "Strategic Leadership and Change Management",
    date: "2026-05-23",
    startTime: "19:30",
    endTime: "21:00",
    location: "Auditorium Hall A, Main Building",
    meetingLink: "https://zoom.us/j/555123456?pwd=StratMgmt2024",
    status: "scheduled"
  },
  {
    id: "cls207",
    courseId: "c017",
    topic: "Corporate Strategy and Portfolio Management",
    date: "2026-05-30",
    startTime: "19:30",
    endTime: "21:00",
    location: "Auditorium Hall A, Main Building",
    meetingLink: "https://zoom.us/j/555123456?pwd=StratMgmt2024",
    status: "scheduled"
  },
  {
    id: "cls208",
    courseId: "c017",
    topic: "Global Strategy and International Markets",
    date: "2026-06-06",
    startTime: "19:30",
    endTime: "21:00",
    location: "Auditorium Hall A, Main Building",
    meetingLink: "https://zoom.us/j/555123456?pwd=StratMgmt2024",
    status: "scheduled"
  },
  {
    id: "cls209",
    courseId: "c017",
    topic: "Mergers, Acquisitions, and Strategic Alliances",
    date: "2026-06-13",
    startTime: "19:30",
    endTime: "21:00",
    location: "Auditorium Hall A, Main Building",
    meetingLink: "https://zoom.us/j/555123456?pwd=StratMgmt2024",
    status: "scheduled"
  },
  {
    id: "cls210",
    courseId: "c017",
    topic: "Platform Strategy and Ecosystem Management",
    date: "2026-06-20",
    startTime: "19:30",
    endTime: "21:00",
    location: "Auditorium Hall A, Main Building",
    meetingLink: "https://zoom.us/j/555123456?pwd=StratMgmt2024",
    status: "scheduled"
  },
  {
    id: "cls211",
    courseId: "c017",
    topic: "Sustainability and ESG in Strategy",
    date: "2026-06-27",
    startTime: "19:30",
    endTime: "21:00",
    location: "Auditorium Hall A, Main Building",
    meetingLink: "https://zoom.us/j/555123456?pwd=StratMgmt2024",
    status: "scheduled"
  },
  {
    id: "cls212",
    courseId: "c017",
    topic: "Strategic Innovation and Disruptive Technologies",
    date: "2026-07-04",
    startTime: "19:30",
    endTime: "21:00",
    location: "Auditorium Hall A, Main Building",
    meetingLink: "https://zoom.us/j/555123456?pwd=StratMgmt2024",
    status: "scheduled"
  },
  {
    id: "cls213",
    courseId: "c017",
    topic: "Scenario Planning and Strategic Foresight",
    date: "2026-07-11",
    startTime: "19:30",
    endTime: "21:00",
    location: "Auditorium Hall A, Main Building",
    meetingLink: "https://zoom.us/j/555123456?pwd=StratMgmt2024",
    status: "scheduled"
  },
  {
    id: "cls214",
    courseId: "c017",
    topic: "Strategic Risk Management",
    date: "2026-07-18",
    startTime: "19:30",
    endTime: "21:00",
    location: "Auditorium Hall A, Main Building",
    meetingLink: "https://zoom.us/j/555123456?pwd=StratMgmt2024",
    status: "scheduled"
  },
  {
    id: "cls215",
    courseId: "c017",
    topic: "Strategy Implementation and Performance Measurement",
    date: "2026-07-25",
    startTime: "19:30",
    endTime: "21:00",
    location: "Auditorium Hall A, Main Building",
    meetingLink: "https://zoom.us/j/555123456?pwd=StratMgmt2024",
    status: "scheduled"
  },
  {
    id: "cls216",
    courseId: "c017",
    topic: "Case Studies: Strategic Turnarounds",
    date: "2026-08-01",
    startTime: "19:30",
    endTime: "21:00",
    location: "Auditorium Hall A, Main Building",
    meetingLink: "https://zoom.us/j/555123456?pwd=StratMgmt2024",
    status: "scheduled"
  },
  {
    id: "cls217",
    courseId: "c017",
    topic: "Final Project Presentations and Course Review",
    date: "2026-08-08",
    startTime: "19:30",
    endTime: "21:00",
    location: "Auditorium Hall A, Main Building",
    meetingLink: "https://zoom.us/j/555123456?pwd=StratMgmt2024",
    status: "scheduled"
  }
];

export const assignmentsData: Assignment[] = [
  {
    id: "a001",
    courseId: "c001",
    title: "Strategic Analysis Report",
    description: "Analyze a Fortune 500 company's competitive strategy",
    dueDate: "2026-03-20",
    totalPoints: 100,
    maxPoints: 100,
    status: "pending"
  },
  {
    id: "a002",
    courseId: "c001",
    title: "Case Study Presentation",
    description: "Present findings on market positioning strategies",
    dueDate: "2026-03-25",
    totalPoints: 100,
    maxPoints: 100,
    status: "pending"
  },
  {
    id: "a003",
    courseId: "c001",
    title: "Market Analysis Assignment",
    description: "Conduct comprehensive market analysis for a startup",
    dueDate: "2026-03-18",
    totalPoints: 50,
    maxPoints: 50,
    status: "pending"
  },
  {
    id: "a004",
    courseId: "c001",
    title: "Strategic Planning Document",
    description: "Develop a 5-year strategic plan for a mid-size company",
    dueDate: "2026-03-30",
    totalPoints: 150,
    maxPoints: 150,
    status: "pending"
  },
  {
    id: "a005",
    courseId: "c001",
    title: "Industry Research Paper",
    description: "Research paper on emerging industry trends",
    dueDate: "2026-03-14",
    totalPoints: 75,
    maxPoints: 75,
    status: "submitted",
    submittedDate: "2026-03-13"
  }
];

export const resourcesData: Resource[] = [
  {
    id: "r001",
    courseId: "c001",
    title: "Strategic Management Textbook",
    type: "pdf",
    url: "https://example.com/textbook.pdf",
    uploadedDate: "2024-01-10"
  }
];

export const announcementsData: Announcement[] = [
  {
    id: "ann001",
    title: "Welcome to EMBA Connect",
    content: "We're excited to have you join our Executive MBA program. Check your schedule for upcoming classes.",
    author: "Dr. Robert Williams",
    date: "2026-03-10",
    priority: "normal"
  },
  {
    id: "ann002",
    title: "Midterm Exam Schedule",
    content: "Midterm examinations will be held from March 15-20. Please review the detailed schedule in your course syllabus.",
    author: "Admin Team",
    date: "2026-03-11",
    priority: "high"
  }
];

export const notesData: Note[] = [];