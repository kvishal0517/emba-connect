import React, { useState, useEffect } from 'react';
import { addDays, format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addMonths, startOfMonth, endOfMonth, eachWeekOfInterval, isAfter, isBefore, parseISO } from 'date-fns';
import { CalendarIcon, ChevronLeft, ChevronRight, Clock, Globe, User, Video, MapPin, CheckCircle, Link as LinkIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Separator } from '@/app/components/ui/separator';
import { db } from '@/app/lib/db';
import dataService from '@/app/services/dataService';
import type { ClassSession as ClassSessionType, Professor, Course, Assignment } from '@/app/types';

type ClassSession = ClassSessionType;

// Student Schedule Component - Fixed React imports
export default function StudentSchedule() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [selectedClass, setSelectedClass] = useState<ClassSession | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joiningClass, setJoiningClass] = useState<ClassSession | null>(null);
  
  const [classes, setClasses] = useState<ClassSessionType[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get current user first, then load their specific data
        const userData = await db.getCurrentUser();
        if (!userData) return;
        
        // Get student record to get the studentId
        const studentRecord = await dataService.getStudentByUserId(userData.id);
        if (!studentRecord) return;
        
        const [classData, profData, courseData, assignmentData] = await Promise.all([
          db.getStudentClasses(studentRecord.id),
          db.getProfessors(),
          db.getStudentCourses(studentRecord.id),
          db.getStudentAssignments(studentRecord.id)
        ]);
        setClasses(classData);
        setProfessors(profData);
        setCourses(courseData);
        setAssignments(assignmentData);
      } catch (error) {
        console.error('Error loading schedule data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Get professors
  const getProfessor = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (course && course.professorId) {
      return professors.find(p => p.id === course.professorId);
    }
    return null;
  };

  // Time conversion helpers
  const formatTimeIST = (dateStr: string) => {
    // Handle both datetime string and separate date/time
    let date;
    if (dateStr.includes('T')) {
      date = new Date(dateStr);
    } else {
      // If startTime doesn't include date, we need to handle it
      date = new Date();
      const [hours, minutes] = dateStr.split(':');
      date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    }
    
    return date.toLocaleTimeString('en-IN', { 
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatTimeEST = (dateStr: string) => {
    // Handle both datetime string and separate date/time
    let date;
    if (dateStr.includes('T')) {
      date = new Date(dateStr);
    } else {
      // If startTime doesn't include date, we need to handle it
      date = new Date();
      const [hours, minutes] = dateStr.split(':');
      date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    }
    
    return date.toLocaleTimeString('en-US', { 
      timeZone: 'America/New_York',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Navigation handlers
  const handlePrevWeek = () => setCurrentDate(addDays(currentDate, -7));
  const handleNextWeek = () => setCurrentDate(addDays(currentDate, 7));
  const handlePrevMonth = () => setCurrentDate(addMonths(currentDate, -1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Get days for weekly view
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Get days for monthly view
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthStartWeek = startOfWeek(monthStart, { weekStartsOn: 0 });
  const monthEndWeek = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const monthDays = eachDayOfInterval({ start: monthStartWeek, end: monthEndWeek });

  const handleClassClick = (classItem: ClassSession) => {
    setSelectedClass(classItem);
    setShowDetailsModal(true);
  };

  const handleJoinMeeting = (classItem: ClassSession) => {
    setJoiningClass(classItem);
    setShowJoinModal(true);
  };

  const confirmJoinMeeting = () => {
    if (joiningClass) {
      window.open(joiningClass.meetingLink, '_blank');
      setShowJoinModal(false);
      setJoiningClass(null);
    }
  };

  // Get upcoming events (classes/exams)
  const getUpcomingEvents = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return classes
      .filter(cls => {
        // Defensive check: ensure date and startTime exist
        if (!cls.date || !cls.startTime) return false;
        
        try {
          const classDate = new Date(`${cls.date}T${cls.startTime}`);
          return !isNaN(classDate.getTime()) && classDate >= today && cls.status !== 'cancelled';
        } catch (e) {
          console.error('Invalid date for class:', cls);
          return false;
        }
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.startTime}`).getTime();
        const dateB = new Date(`${b.date}T${b.startTime}`).getTime();
        return dateA - dateB;
      })
      .slice(0, 5); // Show next 5 upcoming events
  };

  // Get pending assignments sorted by due date
  const getPendingAssignments = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return assignments
      .filter(a => a.status === 'pending')
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5); // Show next 5 pending assignments
  };

  // Check if assignment is due soon (within 3 days)
  const isDueSoon = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3;
  };

  // Check if assignment is overdue
  const isOverdue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  };

  return (
    <div className="flex gap-6">
      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Class Schedule</h1>
            <p className="text-slate-500 mt-2">Manage your academic timeline and join classes</p>
          </div>

          {/* Dual Timezone Display */}
          <div className="flex items-center gap-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-blue-600" />
              <div>
                <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">India (IST)</div>
                <div className="text-lg font-bold text-slate-900">
                  {new Date().toLocaleTimeString('en-IN', { 
                    timeZone: 'Asia/Kolkata',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  })}
                </div>
              </div>
            </div>
            <div className="h-10 w-px bg-blue-300"></div>
            <div>
              <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">USA (EST)</div>
              <div className="text-lg font-bold text-slate-900">
                {new Date().toLocaleTimeString('en-US', { 
                  timeZone: 'America/New_York',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <Card className="shadow-lg">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* View Toggle */}
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                <Button
                  variant={viewMode === 'week' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('week')}
                  className={viewMode === 'week' ? 'bg-blue-900 hover:bg-blue-800 text-white shadow-md' : ''}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Weekly
                </Button>
                <Button
                  variant={viewMode === 'month' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('month')}
                  className={viewMode === 'month' ? 'bg-blue-900 hover:bg-blue-800 text-white shadow-md' : ''}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Monthly
                </Button>
              </div>

              {/* Navigation */}
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={viewMode === 'week' ? handlePrevWeek : handlePrevMonth}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="min-w-[200px] text-center">
                  <div className="text-lg font-bold text-slate-900">
                    {viewMode === 'week' 
                      ? `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`
                      : format(currentDate, 'MMMM yyyy')
                    }
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={viewMode === 'week' ? handleNextWeek : handleNextMonth}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>

                <Button variant="outline" onClick={goToToday}>
                  Today
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly View */}
        {viewMode === 'week' && (
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {weekDays.map((day) => {
              const dayClasses = classes.filter(c => isSameDay(new Date(`${c.date}T${c.startTime}`), day));
              const isToday = isSameDay(day, new Date());
              const isPast = day < new Date() && !isToday;

              return (
                <div 
                  key={day.toISOString()} 
                  className={`
                    flex flex-col rounded-xl border-2 overflow-hidden min-h-[300px] transition-all
                    ${isToday 
                      ? 'bg-blue-50 border-blue-400 shadow-lg' 
                      : isPast 
                      ? 'bg-slate-50 border-slate-200 opacity-60'
                      : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md'
                    }
                  `}
                >
                  {/* Day Header */}
                  <div className={`
                    p-3 text-center border-b-2
                    ${isToday 
                      ? 'bg-blue-900 border-blue-800 text-white' 
                      : isPast
                      ? 'bg-slate-100 border-slate-200 text-slate-500'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                    }
                  `}>
                    <div className="text-xs font-bold uppercase tracking-wider">
                      {format(day, 'EEE')}
                    </div>
                    <div className={`text-2xl font-bold ${isToday ? 'text-amber-400' : ''}`}>
                      {format(day, 'd')}
                    </div>
                  </div>

                  {/* Classes */}
                  <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                    {dayClasses.length === 0 ? (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-xs text-slate-400 italic text-center">No classes</p>
                      </div>
                    ) : (
                      dayClasses.map((cls) => {
                        const professor = getProfessor(cls.courseId);
                        const course = courses.find(c => c.id === cls.courseId);
                        
                        return (
                          <Card 
                            key={cls.id} 
                            className="border-slate-200 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group"
                            onClick={() => handleClassClick(cls)}
                          >
                            <CardContent className="p-3 space-y-2">
                              {/* Course Code */}
                              <Badge className="bg-blue-900 text-white text-[10px] font-bold">
                                {course?.code}
                              </Badge>

                              {/* Topic */}
                              <h4 className="font-semibold text-xs leading-tight line-clamp-2 text-slate-900 group-hover:text-blue-600 transition-colors">
                                {cls.topic}
                              </h4>

                              {/* Professor */}
                              {professor && (
                                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                                  <User className="h-3 w-3" />
                                  <span className="truncate">{professor.name}</span>
                                </div>
                              )}

                              {/* Times */}
                              <div className="space-y-1 text-[10px]">
                                <div className="flex items-center gap-1 text-blue-700 font-medium">
                                  <Clock className="h-3 w-3" />
                                  <span>IST: {formatTimeIST(cls.startTime)}</span>
                                </div>
                                <div className="flex items-center gap-1 text-indigo-700 font-medium pl-4">
                                  <span>EST: {formatTimeEST(cls.startTime)}</span>
                                </div>
                              </div>

                              {/* Join Button */}
                              <Button 
                                size="sm" 
                                className="w-full h-7 text-xs bg-blue-900 hover:bg-blue-800 text-white mt-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleJoinMeeting(cls);
                                }}
                              >
                                <Video className="mr-2 h-3 w-3" />
                                Join
                              </Button>
                            </CardContent>
                          </Card>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Monthly View */}
        {viewMode === 'month' && (
          <Card className="shadow-lg">
            <CardContent className="p-4">
              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-xs font-bold text-slate-500 uppercase tracking-wider py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {monthDays.map((day) => {
                  const dayClasses = classes.filter(c => isSameDay(new Date(`${c.date}T${c.startTime}`), day));
                  const isToday = isSameDay(day, new Date());
                  const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                  const isPast = day < new Date() && !isToday;

                  return (
                    <div
                      key={day.toISOString()}
                      className={`
                        min-h-[100px] border rounded-lg p-2 transition-all cursor-pointer
                        ${isToday 
                          ? 'bg-blue-900 border-blue-800 shadow-lg' 
                          : isPast
                          ? 'bg-slate-50 border-slate-200 opacity-50'
                          : isCurrentMonth
                          ? 'bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50'
                          : 'bg-slate-50 border-slate-100 opacity-30'
                        }
                      `}
                    >
                      <div className={`text-sm font-bold mb-1 ${isToday ? 'text-amber-400' : isCurrentMonth ? 'text-slate-900' : 'text-slate-400'}`}>
                        {format(day, 'd')}
                      </div>
                      
                      <div className="space-y-1">
                        {dayClasses.slice(0, 3).map((cls, idx) => {
                          const course = courses.find(c => c.id === cls.courseId);
                          return (
                            <div
                              key={idx}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleClassClick(cls);
                              }}
                              className={`
                                text-[9px] p-1 rounded truncate font-medium
                                ${isToday 
                                  ? 'bg-amber-400 text-slate-900' 
                                  : 'bg-blue-100 text-blue-900 hover:bg-blue-200'
                                }
                              `}
                            >
                              {course?.code}: {formatTimeIST(cls.startTime)}
                            </div>
                          );
                        })}
                        {dayClasses.length > 3 && (
                          <div className="text-[9px] text-slate-500 font-medium pl-1">
                            +{dayClasses.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Class Details Modal */}
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">Class Details</DialogTitle>
              <DialogDescription>Complete information about this session</DialogDescription>
            </DialogHeader>
            
            {selectedClass && (
              <div className="space-y-6">
                {/* Course and Topic */}
                <div>
                  <Badge className="bg-blue-900 text-white mb-2">
                    {courses.find(c => c.id === selectedClass.courseId)?.code}
                  </Badge>
                  <h3 className="text-xl font-bold text-slate-900">{selectedClass.topic}</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    {courses.find(c => c.id === selectedClass.courseId)?.name}
                  </p>
                </div>

                <Separator />

                {/* Professor Info */}
                {getProfessor(selectedClass.courseId) && (
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                    <div className="h-12 w-12 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-lg">
                      {getProfessor(selectedClass.courseId)?.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-500 uppercase">Professor</div>
                      <div className="font-semibold text-slate-900">{getProfessor(selectedClass.courseId)?.name}</div>
                      <div className="text-sm text-slate-600">{getProfessor(selectedClass.courseId)?.department}</div>
                    </div>
                  </div>
                )}

                {/* Date and Time */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="text-xs font-bold text-blue-600 uppercase">India (IST)</span>
                    </div>
                    <div className="text-lg font-bold text-slate-900">
                      {formatTimeIST(selectedClass.startTime)} - {formatTimeIST(selectedClass.endTime)}
                    </div>
                    <div className="text-sm text-slate-600 mt-1">
                      {format(new Date(`${selectedClass.date}T${selectedClass.startTime}`), 'EEEE, MMMM d, yyyy')}
                    </div>
                  </div>

                  <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-indigo-600" />
                      <span className="text-xs font-bold text-indigo-600 uppercase">USA (EST)</span>
                    </div>
                    <div className="text-lg font-bold text-slate-900">
                      {formatTimeEST(selectedClass.startTime)} - {formatTimeEST(selectedClass.endTime)}
                    </div>
                    <div className="text-sm text-slate-600 mt-1">
                      {format(new Date(`${selectedClass.date}T${selectedClass.startTime}`), 'EEEE, MMMM d, yyyy')}
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                  <MapPin className="h-5 w-5 text-slate-600 mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Location</div>
                    <div className="font-medium text-slate-900">{selectedClass.location}</div>
                  </div>
                </div>

                {/* Meeting Link */}
                {selectedClass.meetingLink && (
                  <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                    <LinkIcon className="h-5 w-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-green-600 uppercase mb-1">Virtual Meeting</div>
                      <div className="text-sm text-slate-600 break-all">{selectedClass.meetingLink}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                Close
              </Button>
              {selectedClass && (
                <Button 
                  className="bg-blue-900 hover:bg-blue-800 text-white"
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleJoinMeeting(selectedClass);
                  }}
                >
                  <Video className="mr-2 h-4 w-4" />
                  Join Meeting
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Join Meeting Confirmation Modal */}
        <Dialog open={showJoinModal} onOpenChange={setShowJoinModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Video className="h-6 w-6 text-blue-600" />
                Join Virtual Class
              </DialogTitle>
              <DialogDescription>You're about to join the class meeting</DialogDescription>
            </DialogHeader>

            {joiningClass && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="font-semibold text-slate-900 mb-1">{joiningClass.topic}</div>
                  <div className="text-sm text-slate-600">
                    {courses.find(c => c.id === joiningClass.courseId)?.code} - {courses.find(c => c.id === joiningClass.courseId)?.name}
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <CheckCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div className="text-sm text-slate-700">
                    <strong>Ready to join?</strong>
                    <p className="mt-1">Make sure your camera and microphone are ready. The meeting will open in a new window.</p>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowJoinModal(false)}>
                Cancel
              </Button>
              <Button 
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={confirmJoinMeeting}
              >
                <Video className="mr-2 h-4 w-4" />
                Join Now
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Sidebar */}
      <div className="w-80 space-y-6">
        {/* Upcoming Events */}
        <Card className="shadow-lg">
          <CardContent className="p-4">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900">Upcoming Events</CardTitle>
              <CardDescription className="text-sm text-slate-500">Next 5 upcoming classes/exams</CardDescription>
            </CardHeader>

            <div className="space-y-4">
              {getUpcomingEvents().length === 0 ? (
                <p className="text-sm text-slate-500 italic text-center py-4">No upcoming events</p>
              ) : (
                getUpcomingEvents().map((cls, idx) => {
                  const course = courses.find(c => c.id === cls.courseId);
                  const classDateTime = new Date(`${cls.date}T${cls.startTime}`);
                  return (
                    <div key={idx} className="flex items-center gap-3">
                      <Badge className="bg-blue-900 text-white text-[10px] font-bold">
                        {course?.code}
                      </Badge>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900">{cls.topic}</div>
                        <div className="text-sm text-slate-600">
                          {format(classDateTime, 'EEEE, MMMM d, yyyy')} - {formatTimeIST(cls.startTime)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pending Assignments */}
        <Card className="shadow-lg">
          <CardContent className="p-4">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900">Pending Assignments</CardTitle>
              <CardDescription className="text-sm text-slate-500">Next 5 pending assignments</CardDescription>
            </CardHeader>

            <div className="space-y-4">
              {getPendingAssignments().map((assignment, idx) => {
                const course = courses.find(c => c.id === assignment.courseId);
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <Badge className="bg-blue-900 text-white text-[10px] font-bold">
                      {course?.code}
                    </Badge>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900">{assignment.title}</div>
                      <div className="text-sm text-slate-600">
                        Due: {format(new Date(assignment.dueDate), 'EEEE, MMMM d, yyyy')}
                        {isDueSoon(assignment.dueDate) && (
                          <Badge className="bg-amber-500 text-white text-[10px] font-bold ml-2">
                            Due Soon
                          </Badge>
                        )}
                        {isOverdue(assignment.dueDate) && (
                          <Badge className="bg-red-500 text-white text-[10px] font-bold ml-2">
                            Overdue
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}