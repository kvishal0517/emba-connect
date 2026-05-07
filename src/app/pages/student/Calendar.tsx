import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, Video, Key, Lock, ExternalLink } from 'lucide-react';
import { db, dataService, type ClassSession, type Assignment, type Course } from '@/app/lib/db';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [classDialogOpen, setClassDialogOpen] = useState(false);
  const [selectedDateClasses, setSelectedDateClasses] = useState<ClassSession[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get current user first, then load their specific data
        const userData = await db.getCurrentUser();
        if (!userData) return;

        // Get student record to get the studentId
        const studentRecord = await dataService.getStudentByUserId(userData.id);
        if (!studentRecord) return;

        const [classData, assignmentData, courseData] = await Promise.all([
          db.getStudentClasses(studentRecord.id),
          db.getStudentAssignments(studentRecord.id),
          db.getStudentCourses(studentRecord.id)
        ]);
        setClasses(classData);
        setAssignments(assignmentData);
        setCourses(courseData);
      } catch (error) {
        console.error('Error loading calendar data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getEventsForDate = (day: number) => {
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateStr = targetDate.toDateString();

    const dayClasses = classes.filter(c => {
      if (!c.date || !c.startTime) return false;
      const classDate = new Date(`${c.date}T${c.startTime}`);
      return classDate.toDateString() === dateStr;
    });
    const dayAssignments = assignments.filter(a => new Date(a.dueDate).toDateString() === dateStr);

    return { classes: dayClasses, assignments: dayAssignments };
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day &&
           today.getMonth() === currentDate.getMonth() &&
           today.getFullYear() === currentDate.getFullYear();
  };

  const handleDateClick = (day: number) => {
    const events = getEventsForDate(day);
    if (events.classes.length > 0) {
      setSelectedDateClasses(events.classes);
      setSelectedDay(day);
      setClassDialogOpen(true);
    }
  };

  const getCourseByClassSession = (classSession: ClassSession) => {
    return courses.find(c => c.id === classSession.courseId);
  };

  const extractMeetingCredentials = (meetingLink: string) => {
    // Extract meeting ID and password from common meeting platforms
    const zoomMatch = meetingLink.match(/zoom\.us\/j\/(\d+)(?:\?pwd=([^&]+))?/);
    const teamsMatch = meetingLink.match(/teams\.microsoft\.com/);
    const meetMatch = meetingLink.match(/meet\.google\.com\/([a-z-]+)/);

    if (zoomMatch) {
      return {
        platform: 'Zoom',
        meetingId: zoomMatch[1],
        password: zoomMatch[2] || 'No password required'
      };
    } else if (teamsMatch) {
      return {
        platform: 'Microsoft Teams',
        meetingId: 'Join via link',
        password: 'No password required'
      };
    } else if (meetMatch) {
      return {
        platform: 'Google Meet',
        meetingId: meetMatch[1],
        password: 'No password required'
      };
    }
    return {
      platform: 'Virtual',
      meetingId: 'See link',
      password: 'No password required'
    };
  };

  const formatTime = (timeStr: string) => {
    // timeStr is in format "19:30"
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const isPM = hour >= 12;
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${isPM ? 'PM' : 'AM'}`;
  };

  const getTodaysClasses = () => {
    const today = new Date();
    return classes.filter(c => {
      if (!c.date || !c.startTime) return false;
      const classDate = new Date(`${c.date}T${c.startTime}`);
      return classDate.toDateString() === today.toDateString();
    });
  };

  const getClassesThisMonth = () => {
    return classes.filter(c => {
      if (!c.date || !c.startTime) return false;
      const classDate = new Date(`${c.date}T${c.startTime}`);
      return classDate.getMonth() === currentDate.getMonth() &&
             classDate.getFullYear() === currentDate.getFullYear();
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Academic Calendar</h1>
        <p className="text-slate-500 mt-2">View your classes, assignments, and important dates</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <Card className="lg:col-span-2 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={previousMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={nextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-semibold text-slate-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {/* Empty cells for days before month starts */}
              {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {/* Actual days of the month */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const events = getEventsForDate(day);
                const hasEvents = events.classes.length > 0 || events.assignments.length > 0;
                const hasClasses = events.classes.length > 0;
                const isTodayWithClasses = isToday(day) && hasClasses;

                return (
                  <div
                    key={day}
                    onClick={() => handleDateClick(day)}
                    className={`
                      aspect-square border rounded-lg p-2 flex flex-col transition-all
                      ${hasClasses ? 'cursor-pointer' : 'cursor-default'}
                      ${isTodayWithClasses
                        ? 'bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white border-blue-900 font-bold shadow-lg ring-2 ring-blue-400 ring-offset-2 animate-pulse'
                        : isToday(day)
                        ? 'bg-blue-900 text-white border-blue-900 font-bold'
                        : hasEvents
                        ? 'bg-blue-50 border-blue-200 hover:bg-blue-100 hover:shadow-md'
                        : 'border-slate-200 hover:bg-slate-50'
                      }
                    `}
                  >
                    <span className={`text-sm ${isToday(day) ? 'text-white font-bold' : 'text-slate-700'}`}>
                      {day}
                    </span>
                    <div className="mt-1 space-y-0.5 flex-1">
                      {events.classes.slice(0, 2).map((c, idx) => (
                        <div key={idx} className={`w-full h-1 ${isTodayWithClasses ? 'bg-white' : 'bg-blue-500'} rounded-full`} />
                      ))}
                      {events.assignments.slice(0, 1).map((a, idx) => (
                        <div key={idx} className={`w-full h-1 ${isTodayWithClasses ? 'bg-amber-300' : 'bg-amber-500'} rounded-full`} />
                      ))}
                    </div>
                    {isTodayWithClasses && (
                      <div className="mt-auto text-[10px] font-semibold text-center bg-white/20 rounded px-1">
                        {events.classes.length} {events.classes.length === 1 ? 'class' : 'classes'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex gap-6 mt-6 pt-4 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <span className="text-xs text-slate-600">Class</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-amber-500 rounded-full" />
                <span className="text-xs text-slate-600">Assignment Due</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-900 rounded-full" />
                <span className="text-xs text-slate-600">Today</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <div className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Today's Events</CardTitle>
              <CardDescription>
                {new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {getTodaysClasses().map((classItem) => {
                const course = getCourseByClassSession(classItem);
                return (
                  <div key={classItem.id} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <Badge className="bg-blue-900 text-white text-xs mb-1">{course?.code}</Badge>
                        <h4 className="font-semibold text-sm text-slate-900">{classItem.topic}</h4>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Clock className="h-3 w-3" />
                        {formatTime(classItem.startTime)} - {formatTime(classItem.endTime)}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <MapPin className="h-3 w-3" />
                        {classItem.location}
                      </div>
                    </div>
                  </div>
                );
              })}

              {assignments.filter(a => {
                const today = new Date();
                const dueDate = new Date(a.dueDate);
                return a.status === 'pending' && dueDate.toDateString() === today.toDateString();
              }).map((assignment) => {
                const course = courses.find(c => c.id === assignment.courseId);
                return (
                  <div key={assignment.id} className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <Badge className="bg-amber-600 text-white text-xs mb-1">{course?.code}</Badge>
                        <h4 className="font-semibold text-sm text-slate-900 line-clamp-2">{assignment.title}</h4>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Clock className="h-3 w-3" />
                      Due Today
                    </div>
                  </div>
                );
              })}

              {getTodaysClasses().length === 0 &&
               assignments.filter(a => {
                 const today = new Date();
                 const dueDate = new Date(a.dueDate);
                 return a.status === 'pending' && dueDate.toDateString() === today.toDateString();
               }).length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">No events today</p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg bg-gradient-to-br from-slate-50 to-white">
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Classes this month</span>
                <span className="text-lg font-bold text-blue-900">{getClassesThisMonth().length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Assignments due</span>
                <span className="text-lg font-bold text-amber-600">
                  {assignments.filter(a => {
                    const dueDate = new Date(a.dueDate);
                    return a.status === 'pending' &&
                           dueDate.getMonth() === currentDate.getMonth() &&
                           dueDate.getFullYear() === currentDate.getFullYear();
                  }).length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Class Details Dialog */}
      <Dialog open={classDialogOpen} onOpenChange={setClassDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl text-slate-900">
              Classes on {selectedDay && `${currentDate.toLocaleString('default', { month: 'long' })} ${selectedDay}, ${currentDate.getFullYear()}`}
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              {selectedDateClasses.length} {selectedDateClasses.length === 1 ? 'class' : 'classes'} scheduled for this day
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {selectedDateClasses.map((classSession, idx) => {
              const course = getCourseByClassSession(classSession);
              const credentials = extractMeetingCredentials(classSession.meetingLink);
              const isOnline = classSession.location.toLowerCase().includes('virtual') ||
                             classSession.location.toLowerCase().includes('zoom') ||
                             classSession.location.toLowerCase().includes('teams') ||
                             classSession.location.toLowerCase().includes('meet');

              return (
                <Card key={classSession.id} className="shadow-md border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg text-slate-900">{classSession.topic}</CardTitle>
                        <CardDescription className="text-sm mt-1 text-slate-600">
                          {course?.code} - {course?.name}
                        </CardDescription>
                      </div>
                      <Badge className="bg-blue-900 text-white">
                        {classSession.status === 'scheduled' ? 'Scheduled' : classSession.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Timings */}
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Clock className="h-5 w-5 text-blue-900" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase">Time</p>
                        <p className="text-sm font-bold text-slate-900">
                          {classSession.startTime} - {classSession.endTime}
                        </p>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                      <div className="p-2 bg-amber-100 rounded-lg">
                        <MapPin className="h-5 w-5 text-amber-700" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase">
                          {isOnline ? 'Virtual Location' : 'Room/Hall'}
                        </p>
                        <p className="text-sm font-bold text-slate-900">{classSession.location}</p>
                      </div>
                    </div>

                    {/* Meeting Link */}
                    {classSession.meetingLink && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Video className="h-5 w-5 text-green-700" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-500 uppercase">Online Meeting Link</p>
                            <a
                              href={classSession.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 break-all"
                            >
                              {credentials.platform} Meeting
                              <ExternalLink className="h-3 w-3 flex-shrink-0" />
                            </a>
                          </div>
                        </div>

                        {/* Meeting Credentials */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <Key className="h-4 w-4 text-purple-700" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase">Meeting ID</p>
                              <p className="text-sm font-mono font-bold text-slate-900">{credentials.meetingId}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                            <div className="p-2 bg-pink-100 rounded-lg">
                              <Lock className="h-4 w-4 text-pink-700" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase">Password</p>
                              <p className="text-sm font-mono font-bold text-slate-900">{credentials.password}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Quick Join Button */}
                    {classSession.meetingLink && (
                      <Button
                        className="w-full bg-blue-900 hover:bg-blue-800 text-white"
                        onClick={() => window.open(classSession.meetingLink, '_blank')}
                      >
                        <Video className="h-4 w-4 mr-2" />
                        Join {credentials.platform} Meeting
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setClassDialogOpen(false)} className="bg-white text-slate-900 border-slate-300">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}