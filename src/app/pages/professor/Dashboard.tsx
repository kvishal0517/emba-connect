import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { BookOpen, Users, Calendar, FileText, TrendingUp, Clock, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { db, dataService, type User, type Professor, type Course, type ClassSession, type Assignment, type Enrollment } from '@/app/lib/db';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

export default function ProfessorDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [professor, setProfessor] = useState<Professor | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [allAssignments, setAllAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get current user (for now, we'll use the first professor)
        const users = await dataService.getUsersByRole('professor');
        const currentUser = users[0];
        setUser(currentUser);

        if (!currentUser) {
          setIsLoading(false);
          return;
        }

        // Get professor record
        const professorRecord = await dataService.getProfessorByUserId(currentUser.id);
        setProfessor(professorRecord || null);

        if (!professorRecord) {
          setIsLoading(false);
          return;
        }

        // Load professor's courses and classes
        const [courseData, classData, allEnrollments, assignments] = await Promise.all([
          dataService.getCoursesByProfessor(professorRecord.id),
          dataService.getClassSessionsByProfessor(professorRecord.id),
          dataService.getEnrollments(),
          dataService.getAssignments()
        ]);

        setCourses(courseData);
        setClasses(classData);
        setEnrollments(allEnrollments);
        setAllAssignments(assignments);
      } catch (error) {
        console.error('Error loading professor dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalStudents = enrollments.filter(e =>
    courses.some(c => c.id === e.courseId)
  ).length;

  const todaysClasses = classes.filter(c => {
    const classDate = new Date(c.date);
    const today = new Date();
    return (
      classDate.toDateString() === today.toDateString() &&
      c.status !== 'cancelled'
    );
  });

  const upcomingClasses = classes
    .filter(c => {
      const classDateTime = new Date(`${c.date}T${c.startTime}`);
      return classDateTime > new Date() && c.status !== 'cancelled';
    })
    .slice(0, 5);

  const courseIds = courses.map(c => c.id);
  const courseAssignments = allAssignments.filter(a => courseIds.includes(a.courseId));
  const gradedAssignments = courseAssignments.filter(a => a.status === 'graded');
  const gradedPercentage = courseAssignments.length > 0
    ? Math.round((gradedAssignments.length / courseAssignments.length) * 100)
    : 0;

  const pendingTasks = [
    ...courseAssignments
      .filter(a => a.status === 'submitted')
      .slice(0, 2)
      .map(a => {
        const course = courses.find(c => c.id === a.courseId);
        return {
          task: `Grade: ${a.title}`,
          course: course?.name || 'Unknown Course',
          dueDate: new Date(a.dueDate).toLocaleDateString(),
          urgent: new Date(a.dueDate) < new Date()
        };
      }),
    ...upcomingClasses.slice(0, 1).map(c => {
      const course = courses.find(co => co.id === c.courseId);
      return {
        task: `Prepare for: ${c.topic}`,
        course: course?.name || 'Unknown Course',
        dueDate: new Date(c.date).toLocaleDateString(),
        urgent: false
      };
    })
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">
            Welcome back, {professor?.name || user?.name || 'Professor'}
          </h1>
          <p className="text-slate-500 mt-2">Here's what's happening with your courses today</p>
        </div>
        <Button
          className="bg-blue-900 hover:bg-blue-800 text-white"
          onClick={() => toast.info('Create Assignment', { description: 'Assignment creation form coming soon!' })}
        >
          <Plus className="mr-2 h-4 w-4" /> New Assignment
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white hover:shadow-md transition-all">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Active Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-blue-900">{courses.length}</div>
                <p className="text-xs text-slate-500 mt-1">This semester</p>
              </div>
              <BookOpen className="h-10 w-10 text-blue-600 opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-white hover:shadow-md transition-all">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-amber-600">{totalStudents}</div>
                <p className="text-xs text-slate-500 mt-1">Across all courses</p>
              </div>
              <Users className="h-10 w-10 text-amber-500 opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white hover:shadow-md transition-all">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Graded Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-green-600">{gradedPercentage}%</div>
                <p className="text-xs text-slate-500 mt-1">{gradedAssignments.length} of {courseAssignments.length}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-500 opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-gradient-to-br from-red-50 to-white hover:shadow-md transition-all">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Pending Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-red-600">{pendingTasks.length}</div>
                <p className="text-xs text-slate-500 mt-1">Requires attention</p>
              </div>
              <AlertCircle className="h-10 w-10 text-red-500 opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Courses */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-900" />
              My Courses
            </CardTitle>
            <CardDescription>Current semester teaching schedule</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {courses.length === 0 ? (
              <p className="text-center py-8 text-slate-500">No courses assigned</p>
            ) : (
              <>
                {courses.map((course) => {
                  const courseEnrollments = enrollments.filter(e => e.courseId === course.id);
                  const nextClass = classes.find(c => c.courseId === course.id && new Date(`${c.date}T${c.startTime}`) > new Date());

                  return (
                    <div key={course.id} className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-slate-900">{course.name}</h3>
                          <p className="text-xs text-slate-500 mt-0.5">{course.code}</p>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Active
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{courseEnrollments.length} students</span>
                        </div>
                        {nextClass && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{new Date(nextClass.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </CardContent>
        </Card>

        {/* Today's Schedule */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-900" />
              {todaysClasses.length > 0 ? "Today's Schedule" : "Upcoming Classes"}
            </CardTitle>
            <CardDescription>
              {todaysClasses.length > 0 ? 'Classes scheduled for today' : 'Your next classes'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(todaysClasses.length > 0 ? todaysClasses : upcomingClasses.slice(0, 3)).length === 0 ? (
              <p className="text-center py-8 text-slate-500">No upcoming classes</p>
            ) : (
              <>
                {(todaysClasses.length > 0 ? todaysClasses : upcomingClasses.slice(0, 3)).map((classItem) => {
                  const course = courses.find(c => c.id === classItem.courseId);
                  return (
                    <div key={classItem.id} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-blue-900">{classItem.topic}</h3>
                        <Badge className="bg-amber-400 text-blue-900 hover:bg-amber-500">
                          {course?.name || 'Course'}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-700 mb-1">
                        {classItem.startTime} - {classItem.endTime}
                      </p>
                      <p className="text-xs text-slate-500">{classItem.location}</p>
                    </div>
                  );
                })}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/professor/schedule')}
                >
                  View Full Schedule
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pending Tasks */}
      {pendingTasks.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-900" />
              Pending Tasks
            </CardTitle>
            <CardDescription>Tasks that need your attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingTasks.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    {item.urgent && (
                      <div className="bg-red-100 p-2 rounded-full">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-slate-900">{item.task}</h3>
                      <p className="text-sm text-slate-500">{item.course} • Due: {item.dueDate}</p>
                    </div>
                  </div>
                  <Button size="sm" variant={item.urgent ? "default" : "outline"}>
                    {item.urgent ? "Start Now" : "View"}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
