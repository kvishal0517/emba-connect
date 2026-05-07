import React, { useState, useEffect } from 'react';
import { db, dataService, type User, type Student, type ClassSession, type Assignment, type Announcement, type Course } from '@/app/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { 
  ArrowRight, 
  Calendar, 
  Clock, 
  BookOpen, 
  AlertTriangle, 
  CheckCircle,
  FileText,
  Users,
  TrendingUp,
  Bell,
  GraduationCap,
  Timer,
  Percent
} from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { DashboardSkeleton } from '@/app/components/LoadingSkeleton';
import { NoClassesEmpty, NoAssignmentsEmpty } from '@/app/components/EmptyState';
import { CopyButton } from '@/app/components/CopyButton';

export default function StudentDashboard() {
  const navigate = useNavigate();
  
  // State for async data
  const [user, setUser] = useState<User | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Get current user first
        const userData = await db.getCurrentUser();
        setUser(userData);
        
        if (!userData) {
          console.error('No user data found');
          setIsLoading(false);
          return;
        }
        
        // Get student record to get the studentId
        const studentRecord = await dataService.getStudentByUserId(userData.id);
        setStudent(studentRecord || null);
        
        if (!studentRecord) {
          console.error('No student record found for user:', userData.id);
          // Try to continue with mock data for demo purposes
          const [announcementData, courseData] = await Promise.all([
            db.getAnnouncements(),
            db.getCourses()
          ]);
          setAnnouncements(announcementData);
          setCourses(courseData);
          setIsLoading(false);
          return;
        }
        
        // Now load student-specific data in parallel - this is much faster!
        const [classData, assignmentData, announcementData, courseData] = await Promise.all([
          db.getStudentClasses(studentRecord.id),
          db.getStudentAssignments(studentRecord.id),
          db.getAnnouncements(),
          db.getStudentCourses(studentRecord.id)
        ]);
        
        setClasses(classData);
        setAssignments(assignmentData);
        setAnnouncements(announcementData);
        setCourses(courseData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Derived data
  const nextClass = classes[0];
  const pendingAssignments = assignments.filter(a => a.status === 'pending');

  // Calculate days until next exam
  const nextExamDate = new Date('2026-03-15'); // Mock date - updated to 2026
  const today = new Date();
  const daysUntilExam = Math.ceil((nextExamDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  // Ensure daysUntilExam is a valid number
  const validDaysUntilExam = isNaN(daysUntilExam) || !isFinite(daysUntilExam) ? 0 : daysUntilExam;

  // Mock attendance percentage
  const attendancePercentage = 92;

  // Helper function to get course by ID
  const getCourseById = (courseId: string) => {
    return courses.find(c => c.id === courseId);
  };

  // Show loading state
  if (isLoading || !user) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Compact Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Welcome back, {user.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">Here's your academic overview for today.</p>
        </div>
        <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="border-slate-200 text-slate-600 hover:bg-slate-50"
              onClick={() => navigate('/student/schedule')}
            >
                <Calendar className="mr-1.5 h-3.5 w-3.5" /> View Calendar
            </Button>
            <Button 
              size="sm"
              className="bg-blue-900 hover:bg-blue-800 text-white font-semibold"
              onClick={() => navigate('/student/assignments')}
            >
                <FileText className="mr-1.5 h-3.5 w-3.5" /> My Assignments
            </Button>
        </div>
      </div>

      {/* Compact Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Upcoming Classes Card */}
        <Card 
          className="border-blue-200 bg-gradient-to-br from-blue-50 to-white hover:shadow-md transition-all cursor-pointer group"
          onClick={() => navigate('/student/schedule')}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium text-slate-600">Upcoming Classes</CardTitle>
              <div className="bg-blue-100 p-1.5 rounded-md group-hover:bg-blue-200 transition-colors">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="text-2xl font-bold text-blue-900">
              {classes.length}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">This week</p>
            {nextClass && (
              <div className="mt-2 pt-2 border-t border-blue-100">
                <p className="text-[11px] font-medium text-slate-700 truncate">Next: {nextClass.topic}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {new Date(nextClass.startTime).toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Assignments Card */}
        <Card 
          className="border-amber-200 bg-gradient-to-br from-amber-50 to-white hover:shadow-md transition-all cursor-pointer group"
          onClick={() => navigate('/student/assignments')}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium text-slate-600">Pending Assignments</CardTitle>
              <div className="bg-amber-100 p-1.5 rounded-md group-hover:bg-amber-200 transition-colors">
                <FileText className="h-4 w-4 text-amber-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="text-2xl font-bold text-amber-600">
              {pendingAssignments.length}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Tasks to complete</p>
            {pendingAssignments.length > 0 && (
              <div className="mt-2 pt-2 border-t border-amber-100">
                <p className="text-[11px] font-medium text-slate-700 truncate">
                  Due: {new Date(pendingAssignments[0].dueDate).toLocaleDateString([], {month: 'short', day: 'numeric'})}
                </p>
                <Badge variant="outline" className="mt-1 bg-amber-50 text-amber-700 border-amber-200 text-[10px] h-4 px-1.5">
                  Action Required
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Next Exam Countdown Card */}
        <Card className="border-red-200 bg-gradient-to-br from-red-50 to-white hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium text-slate-600">Next Exam</CardTitle>
              <div className="bg-red-100 p-1.5 rounded-md">
                <Timer className="h-4 w-4 text-red-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="text-2xl font-bold text-red-600">
              {validDaysUntilExam} days
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Until midterm exams</p>
            <div className="mt-2 pt-2 border-t border-red-100">
              <p className="text-[11px] font-medium text-slate-700">Strategic Management</p>
              <p className="text-[10px] text-slate-500 mt-0.5">March 15, 2026</p>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Percentage Card */}
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium text-slate-600">Attendance</CardTitle>
              <div className="bg-green-100 p-1.5 rounded-md">
                <Percent className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="text-2xl font-bold text-green-600">
              {attendancePercentage}%
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">This semester</p>
            <div className="mt-2 pt-2 border-t border-green-100">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Present:</span>
                <span className="font-semibold text-green-700">44 / 48</span>
              </div>
              <Badge variant="outline" className="mt-1 bg-green-50 text-green-700 border-green-200 text-[10px] h-4 px-1.5">
                Excellent
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        
        {/* Main Column: Schedule & Announcements (2 cols) */}
        <div className="md:col-span-2 space-y-6">
            {/* Compact Upcoming Classes */}
            <Card className="border-slate-200">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Calendar className="h-4 w-4 text-blue-900" />
                          Today's Schedule
                        </CardTitle>
                        <CardDescription className="text-xs">Next 7 days</CardDescription>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => navigate('/student/schedule')}
                        className="text-blue-900 hover:text-blue-800 h-8 text-xs"
                      >
                        View All <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {classes.slice(0, 3).map((session) => {
                            // Safely parse dates - session.date is YYYY-MM-DD and times are HH:MM
                            const sessionDate = new Date(`${session.date}T${session.startTime}`);
                            const endDate = new Date(`${session.date}T${session.endTime}`);
                            
                            // Validate dates
                            if (isNaN(sessionDate.getTime()) || isNaN(endDate.getTime())) {
                              return null; // Skip invalid sessions
                            }
                            
                            return (
                            <div 
                              key={session.id} 
                              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer"
                              onClick={() => navigate('/student/schedule')}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex flex-col items-center justify-center w-11 h-11 bg-white rounded-md shadow-sm border border-slate-200 text-slate-900 flex-shrink-0">
                                        <span className="text-[9px] font-bold uppercase text-slate-400">
                                          {sessionDate.toLocaleDateString([], {weekday: 'short'})}
                                        </span>
                                        <span className="text-lg font-bold">{sessionDate.getDate()}</span>
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-semibold text-sm text-slate-900 truncate">{session.topic}</h4>
                                        <p className="text-xs text-slate-500">
                                            {sessionDate.toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})} - {endDate.toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})}
                                        </p>
                                        <p className="text-[10px] text-slate-400 mt-0.5">{session.location}</p>
                                    </div>
                                </div>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="hidden sm:flex bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-900 h-7 text-xs flex-shrink-0" 
                                  asChild
                                  onClick={(e) => e.stopPropagation()}
                                >
                                    <a href={session.meetingLink} target="_blank" rel="noreferrer">Join</a>
                                </Button>
                            </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Compact Recent Announcements */}
            <Card className="border-slate-200">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Bell className="h-4 w-4 text-blue-900" />
                        Announcements
                    </CardTitle>
                    <CardDescription className="text-xs">Latest updates</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {announcements.slice(0, 3).map((ann) => (
                            <div key={ann.id} className="flex gap-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                                <div className={`w-0.5 h-full min-h-[3rem] rounded-full flex-shrink-0 ${ann.priority === 'high' ? 'bg-red-500' : 'bg-blue-500'}`} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between mb-1 gap-2">
                                      <h4 className="font-semibold text-sm text-slate-900 line-clamp-1">{ann.title}</h4>
                                      {ann.priority === 'high' && (
                                        <Badge variant="destructive" className="text-[10px] h-4 px-1.5 flex-shrink-0">Urgent</Badge>
                                      )}
                                    </div>
                                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{ann.content}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                      <p className="text-[10px] text-slate-400 font-medium">
                                          {new Date(ann.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                      </p>
                                      <span className="text-[10px] text-slate-300">•</span>
                                      <p className="text-[10px] text-slate-500 font-medium">{ann.author}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Academic Progress - moved here for better layout */}
            <Card className="border-slate-200 bg-gradient-to-br from-slate-50 to-white">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <TrendingUp className="h-4 w-4 text-blue-900" />
                      Academic Progress
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-medium text-slate-700">Current GPA</span>
                        <span className="text-base font-bold text-blue-900">{student?.gpa || '3.8'}</span>
                      </div>
                      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400" style={{ width: `${((student?.gpa || 3.8) / 4.0) * 100}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-medium text-slate-700">Course Completion</span>
                        <span className="text-base font-bold text-amber-600">53%</span>
                      </div>
                      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-amber-500 to-amber-400" style={{ width: '53%' }}></div>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-200">
                      24 of 45 credits completed • On track for graduation
                    </p>
                </CardContent>
            </Card>
        </div>

        {/* Side Column: Assignments & Quick Links (1 col) */}
        <div className="space-y-6">
            <Card className="bg-slate-900 text-white border-none">
                <CardHeader className="pb-3">
                    <CardTitle className="text-white flex items-center gap-2 text-base">
                      <FileText className="h-4 w-4 text-amber-400" />
                      Pending Work
                    </CardTitle>
                    <CardDescription className="text-slate-400 text-xs">Tasks requiring attention</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {pendingAssignments.length === 0 ? (
                        <div className="text-center py-6">
                          <CheckCircle className="h-10 w-10 text-green-400 mx-auto mb-2" />
                          <p className="text-slate-400 text-xs">All caught up!</p>
                        </div>
                    ) : (
                        pendingAssignments.slice(0, 4).map((assignment) => (
                            <div key={assignment.id} className="p-3 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-750 transition-colors">
                                <div className="flex justify-between items-start mb-1.5 gap-2">
                                    <h4 className="font-medium text-xs text-white line-clamp-2 leading-tight">{assignment.title}</h4>
                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-400 text-slate-900 flex-shrink-0">
                                        {getCourseById(assignment.courseId)?.code}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-2">
                                    <Clock className="h-3 w-3" />
                                    Due {new Date(assignment.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                </div>
                                <Button 
                                  size="sm" 
                                  className="w-full bg-slate-700 hover:bg-slate-600 h-7 text-[11px]"
                                  onClick={() => navigate('/student/assignments')}
                                >
                                    View Details
                                </Button>
                            </div>
                        ))
                    )}
                    <Button 
                      variant="link" 
                      className="w-full text-amber-400 hover:text-amber-300 text-xs font-semibold h-7" 
                      onClick={() => navigate('/student/assignments')}
                    >
                        View all assignments <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                </CardContent>
            </Card>

            {/* Quick Access */}
            <Card className="border-slate-200">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Quick Access</CardTitle>
                    <CardDescription className="text-xs">Frequently used</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      className="h-20 flex flex-col gap-1.5 hover:bg-blue-50 hover:border-blue-300 border-slate-200 transition-all"
                      onClick={() => navigate('/student/syllabus')}
                    >
                        <BookOpen className="h-5 w-5 text-blue-600" />
                        <span className="text-[11px] font-semibold">Syllabus</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-20 flex flex-col gap-1.5 hover:bg-green-50 hover:border-green-300 border-slate-200 transition-all"
                      onClick={() => navigate('/student/professors')}
                    >
                        <Users className="h-5 w-5 text-green-600" />
                        <span className="text-[11px] font-semibold">Professors</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-20 flex flex-col gap-1.5 hover:bg-purple-50 hover:border-purple-300 border-slate-200 transition-all"
                    >
                        <GraduationCap className="h-5 w-5 text-purple-600" />
                        <span className="text-[11px] font-semibold">Grades</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-20 flex flex-col gap-1.5 hover:bg-amber-50 hover:border-amber-300 border-slate-200 transition-all"
                    >
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                        <span className="text-[11px] font-semibold">Support</span>
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}