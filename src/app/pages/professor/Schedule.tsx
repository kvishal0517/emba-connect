import React, { useState, useEffect } from 'react';
import { db, dataService, type ClassSession, type Professor, type Course } from '@/app/lib/db';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MapPin, 
  Video,
  Calendar as CalendarIcon,
  Plus,
  X,
  Globe,
  BookOpen,
  Link as LinkIcon,
  Save,
  AlertCircle,
  Ban,
  CalendarX,
  Edit
} from 'lucide-react';
import { addDays, format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addMonths, startOfMonth, endOfMonth } from 'date-fns';
import { toast } from 'sonner';

export default function ProfessorSchedule() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [selectedClass, setSelectedClass] = useState<ClassSession | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showPostponeModal, setShowPostponeModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [newDate, setNewDate] = useState('');
  
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form state for adding class
  const [formData, setFormData] = useState({
    courseId: '',
    topic: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '18:00',
    endTime: '21:00',
    location: 'Virtual - Zoom',
    meetingLink: 'https://zoom.us/j/123456789',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get current user (professor)
        const userData = await db.getCurrentUser();
        if (!userData) return;
        
        // Get professor record
        const professors = await db.getProfessors();
        const professor = professors.find(p => p.userId === userData.id);
        if (!professor) return;
        
        // Load professor's classes and courses
        const [classData, courseData] = await Promise.all([
          db.getProfessorClasses(professor.id),
          db.getProfessorCourses(professor.id)
        ]);
        setClasses(classData);
        setCourses(courseData);
      } catch (error) {
        console.error('Error loading schedule data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Time conversion helpers
  const formatTimeIST = (dateStr: string) => {
    let date;
    if (dateStr.includes('T')) {
      date = new Date(dateStr);
    } else {
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
    let date;
    if (dateStr.includes('T')) {
      date = new Date(dateStr);
    } else {
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

  const handleAddClass = async () => {
    try {
      await db.createClassSession({
        courseId: formData.courseId,
        topic: formData.topic,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        location: formData.location,
        meetingLink: formData.meetingLink,
        status: 'scheduled'
      });
      
      toast.success('Class scheduled successfully!');
      setShowAddClassModal(false);
      
      // Reload classes
      const userData = await db.getCurrentUser();
      if (userData) {
        const professors = await db.getProfessors();
        const professor = professors.find(p => p.userId === userData.id);
        if (professor) {
          const classData = await db.getProfessorClasses(professor.id);
          setClasses(classData);
        }
      }
    } catch (error) {
      toast.error('Failed to schedule class');
      console.error(error);
    }
  };

  const handleCancelClass = async () => {
    if (!selectedClass || !cancellationReason.trim()) {
      toast.error('Please provide a cancellation reason');
      return;
    }

    try {
      const userData = await db.getCurrentUser();
      await db.updateClassSession(selectedClass.id, {
        status: 'cancelled',
        cancellationReason: cancellationReason,
        modifiedBy: userData?.id || 'professor',
        modifiedAt: new Date().toISOString()
      });

      toast.success('Class cancelled successfully');
      setShowCancelModal(false);
      setShowDetailsModal(false);
      setCancellationReason('');

      // Reload classes
      if (userData) {
        const professors = await db.getProfessors();
        const professor = professors.find(p => p.userId === userData.id);
        if (professor) {
          const classData = await db.getProfessorClasses(professor.id);
          setClasses(classData);
        }
      }
    } catch (error) {
      toast.error('Failed to cancel class');
      console.error(error);
    }
  };

  const handlePostponeClass = async () => {
    if (!selectedClass || !newDate || !cancellationReason.trim()) {
      toast.error('Please provide both new date and reason');
      return;
    }

    try {
      const userData = await db.getCurrentUser();
      await db.updateClassSession(selectedClass.id, {
        status: 'postponed',
        originalDate: selectedClass.date,
        date: newDate,
        cancellationReason: cancellationReason,
        modifiedBy: userData?.id || 'professor',
        modifiedAt: new Date().toISOString()
      });

      toast.success('Class postponed successfully');
      setShowPostponeModal(false);
      setShowDetailsModal(false);
      setCancellationReason('');
      setNewDate('');

      // Reload classes
      if (userData) {
        const professors = await db.getProfessors();
        const professor = professors.find(p => p.userId === userData.id);
        if (professor) {
          const classData = await db.getProfessorClasses(professor.id);
          setClasses(classData);
        }
      }
    } catch (error) {
      toast.error('Failed to postpone class');
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Manage Class Schedule</h1>
          <p className="text-slate-500 mt-2">Schedule, postpone, or cancel your classes</p>
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

              <Button 
                className="bg-blue-900 hover:bg-blue-800 text-white ml-4"
                onClick={() => setShowAddClassModal(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Class
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly View */}
      {viewMode === 'week' && (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {weekDays.map((day) => {
            const dayClasses = classes.filter(c => {
              const classDate = new Date(c.date);
              return isSameDay(classDate, day);
            });
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
                      const course = courses.find(c => c.id === cls.courseId);
                      const statusColor = 
                        cls.status === 'cancelled' ? 'bg-red-100 border-red-300' :
                        cls.status === 'postponed' ? 'bg-amber-100 border-amber-300' :
                        'border-slate-200';
                      
                      return (
                        <Card 
                          key={cls.id} 
                          className={`${statusColor} shadow-sm hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group`}
                          onClick={() => handleClassClick(cls)}
                        >
                          <CardContent className="p-3 space-y-2">
                            {/* Course Code & Status */}
                            <div className="flex items-center justify-between">
                              <Badge className="bg-blue-900 text-white text-[10px] font-bold">
                                {course?.code}
                              </Badge>
                              {cls.status === 'cancelled' && (
                                <Badge className="bg-red-600 text-white text-[10px] font-bold">
                                  Cancelled
                                </Badge>
                              )}
                              {cls.status === 'postponed' && (
                                <Badge className="bg-amber-600 text-white text-[10px] font-bold">
                                  Postponed
                                </Badge>
                              )}
                            </div>

                            {/* Topic */}
                            <h4 className="font-semibold text-xs leading-tight line-clamp-2 text-slate-900 group-hover:text-blue-600 transition-colors">
                              {cls.topic}
                            </h4>

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

                            {/* Cancellation Reason */}
                            {cls.cancellationReason && (
                              <div className="text-[10px] text-red-600 italic mt-2">
                                {cls.cancellationReason}
                              </div>
                            )}
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
                const dayClasses = classes.filter(c => {
                  const classDate = new Date(c.date);
                  return isSameDay(classDate, day);
                });
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
                        const bgColor = 
                          cls.status === 'cancelled' ? 'bg-red-100 text-red-900' :
                          cls.status === 'postponed' ? 'bg-amber-100 text-amber-900' :
                          isToday ? 'bg-amber-400 text-slate-900' :
                          'bg-blue-100 text-blue-900';
                        
                        return (
                          <div
                            key={idx}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleClassClick(cls);
                            }}
                            className={`text-[9px] p-1 rounded truncate font-medium hover:opacity-80 ${bgColor}`}
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
            <DialogDescription>Manage this class session</DialogDescription>
          </DialogHeader>
          
          {selectedClass && (
            <div className="space-y-6">
              {/* Course and Topic */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-blue-900 text-white">
                    {courses.find(c => c.id === selectedClass.courseId)?.code}
                  </Badge>
                  {selectedClass.status === 'cancelled' && (
                    <Badge className="bg-red-600 text-white">Cancelled</Badge>
                  )}
                  {selectedClass.status === 'postponed' && (
                    <Badge className="bg-amber-600 text-white">Postponed</Badge>
                  )}
                </div>
                <h3 className="text-xl font-bold text-slate-900">{selectedClass.topic}</h3>
                <p className="text-sm text-slate-600 mt-1">
                  {courses.find(c => c.id === selectedClass.courseId)?.name}
                </p>
              </div>

              {/* Cancellation Reason */}
              {selectedClass.cancellationReason && (
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-amber-600 uppercase mb-1">
                        {selectedClass.status === 'cancelled' ? 'Cancellation' : 'Postponement'} Reason
                      </div>
                      <div className="text-sm text-slate-700">{selectedClass.cancellationReason}</div>
                      {selectedClass.originalDate && (
                        <div className="text-xs text-slate-600 mt-1">
                          Original date: {format(new Date(selectedClass.originalDate), 'MMMM d, yyyy')}
                        </div>
                      )}
                    </div>
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
                    {format(new Date(selectedClass.date), 'EEEE, MMMM d, yyyy')}
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
                    {format(new Date(selectedClass.date), 'EEEE, MMMM d, yyyy')}
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

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
              Close
            </Button>
            {selectedClass && selectedClass.status !== 'cancelled' && selectedClass.status !== 'completed' && (
              <>
                <Button 
                  variant="outline"
                  className="text-amber-600 border-amber-600 hover:bg-amber-50"
                  onClick={() => {
                    setShowPostponeModal(true);
                    setNewDate(selectedClass.date);
                  }}
                >
                  <CalendarX className="mr-2 h-4 w-4" />
                  Postpone
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => setShowCancelModal(true)}
                >
                  <Ban className="mr-2 h-4 w-4" />
                  Cancel Class
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Class Modal */}
      <Dialog open={showAddClassModal} onOpenChange={setShowAddClassModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Schedule New Class</DialogTitle>
            <DialogDescription>Add a new class session to your schedule</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="course">Course</Label>
              <Select 
                value={formData.courseId} 
                onValueChange={(value) => setFormData({...formData, courseId: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map(course => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.code} - {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                value={formData.topic}
                onChange={(e) => setFormData({...formData, topic: e.target.value})}
                placeholder="e.g., Strategic Planning Workshop"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="e.g., Virtual - Zoom or Room 301"
              />
            </div>

            <div>
              <Label htmlFor="meetingLink">Meeting Link</Label>
              <Input
                id="meetingLink"
                value={formData.meetingLink}
                onChange={(e) => setFormData({...formData, meetingLink: e.target.value})}
                placeholder="https://zoom.us/j/..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddClassModal(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-blue-900 hover:bg-blue-800 text-white"
              onClick={handleAddClass}
              disabled={!formData.courseId || !formData.topic || !formData.date}
            >
              <Save className="mr-2 h-4 w-4" />
              Schedule Class
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Class Modal */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Ban className="h-6 w-6" />
              Cancel Class
            </DialogTitle>
            <DialogDescription>
              This will notify all students about the cancellation
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="cancellationReason">Cancellation Reason *</Label>
              <Textarea
                id="cancellationReason"
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Explain why this class is being cancelled..."
                rows={4}
              />
            </div>

            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-sm text-slate-700">
                <strong>Note:</strong> All enrolled students and administrators will be notified of this cancellation.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCancelModal(false);
              setCancellationReason('');
            }}>
              Keep Class
            </Button>
            <Button 
              variant="destructive"
              onClick={handleCancelClass}
              disabled={!cancellationReason.trim()}
            >
              <Ban className="mr-2 h-4 w-4" />
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Postpone Class Modal */}
      <Dialog open={showPostponeModal} onOpenChange={setShowPostponeModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <CalendarX className="h-6 w-6" />
              Postpone Class
            </DialogTitle>
            <DialogDescription>
              Reschedule this class to a different date
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="newDate">New Date *</Label>
              <Input
                id="newDate"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="postponeReason">Reason for Postponement *</Label>
              <Textarea
                id="postponeReason"
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Explain why this class is being postponed..."
                rows={4}
              />
            </div>

            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-sm text-slate-700">
                <strong>Note:</strong> All enrolled students and administrators will be notified of the new date.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowPostponeModal(false);
              setCancellationReason('');
              setNewDate('');
            }}>
              Cancel
            </Button>
            <Button 
              className="bg-amber-600 hover:bg-amber-700 text-white"
              onClick={handlePostponeClass}
              disabled={!newDate || !cancellationReason.trim()}
            >
              <CalendarX className="mr-2 h-4 w-4" />
              Confirm Postponement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const Separator = () => <div className="h-px bg-slate-200" />;