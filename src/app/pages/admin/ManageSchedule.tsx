import React, { useState, useEffect } from 'react';
import { db, type ClassSession, type Course, type Professor } from '@/app/lib/db';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MapPin, 
  Video,
  Calendar as CalendarIcon,
  User,
  Plus,
  X,
  Globe,
  BookOpen,
  Link as LinkIcon,
  Save
} from 'lucide-react';
import { addDays, format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addMonths, startOfMonth, endOfMonth } from 'date-fns';
import { toast } from 'sonner';

export default function AdminSchedule() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassSession | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Form state for adding class
  const [formData, setFormData] = useState({
    courseId: '',
    topic: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '09:00',
    endTime: '11:00',
    location: '',
    meetingLink: '',
    notes: ''
  });

  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [classData, courseData, profData] = await Promise.all([
          db.getClasses(),
          db.getCourses(),
          db.getProfessors()
        ]);
        setClasses(classData);
        setCourses(courseData);
        setProfessors(profData);
      } catch (error) {
        console.error('Error loading schedule data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const getProfessor = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (course) {
      return professors.find(p => p.courses.includes(courseId));
    }
    return null;
  };

  const getCourseById = (courseId: string) => {
    return courses.find(c => c.id === courseId);
  };

  const formatTimeIST = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-IN', { 
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatTimeEST = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { 
      timeZone: 'America/New_York',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handlePrevWeek = () => setCurrentDate(addDays(currentDate, -7));
  const handleNextWeek = () => setCurrentDate(addDays(currentDate, 7));
  const handlePrevMonth = () => setCurrentDate(addMonths(currentDate, -1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthStartWeek = startOfWeek(monthStart, { weekStartsOn: 0 });
  const monthEndWeek = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const monthDays = eachDayOfInterval({ start: monthStartWeek, end: monthEndWeek });

  const handleClassClick = (classItem: any) => {
    setSelectedClass(classItem);
    setShowDetailsModal(true);
  };

  const handleAddClass = () => {
    // Validation
    if (!formData.courseId || !formData.topic || !formData.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    // In a real app, this would add to the database
    toast.success('Class scheduled successfully!');
    setShowAddClassModal(false);
    setFormData({
      courseId: '',
      topic: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      startTime: '09:00',
      endTime: '11:00',
      location: '',
      meetingLink: '',
      notes: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Manage Schedule</h1>
          <p className="text-slate-500 mt-2">Create and manage class schedules</p>
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
            const dayClasses = classes.filter(c => isSameDay(new Date(c.startTime), day));
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
                    : 'bg-white border-slate-200'
                  }
                `}
              >
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

                <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                  {dayClasses.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-xs text-slate-400 italic text-center">No classes</p>
                    </div>
                  ) : (
                    dayClasses.map((cls) => {
                      const professor = getProfessor(cls.courseId);
                      const course = getCourseById(cls.courseId);
                      
                      return (
                        <Card 
                          key={cls.id} 
                          className="border-slate-200 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer"
                          onClick={() => handleClassClick(cls)}
                        >
                          <CardContent className="p-3 space-y-2">
                            <Badge className="bg-blue-900 text-white text-[10px] font-bold">
                              {course?.code}
                            </Badge>
                            <h4 className="font-semibold text-xs leading-tight line-clamp-2 text-slate-900">
                              {cls.topic}
                            </h4>
                            {professor && (
                              <div className="flex items-center gap-1 text-[10px] text-slate-500">
                                <User className="h-3 w-3" />
                                <span className="truncate">{professor.name}</span>
                              </div>
                            )}
                            <div className="space-y-1 text-[10px]">
                              <div className="flex items-center gap-1 text-blue-700 font-medium">
                                <Clock className="h-3 w-3" />
                                <span>IST: {formatTimeIST(cls.startTime)}</span>
                              </div>
                              <div className="flex items-center gap-1 text-indigo-700 font-medium pl-4">
                                <span>EST: {formatTimeEST(cls.startTime)}</span>
                              </div>
                            </div>
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
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-bold text-slate-500 uppercase tracking-wider py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {monthDays.map((day) => {
                const dayClasses = classes.filter(c => isSameDay(new Date(c.startTime), day));
                const isToday = isSameDay(day, new Date());
                const isCurrentMonth = day.getMonth() === currentDate.getMonth();

                return (
                  <div
                    key={day.toISOString()}
                    className={`
                      min-h-[100px] border rounded-lg p-2 transition-all
                      ${isToday 
                        ? 'bg-blue-900 border-blue-800 shadow-lg' 
                        : isCurrentMonth
                        ? 'bg-white border-slate-200 hover:border-blue-300'
                        : 'bg-slate-50 border-slate-100 opacity-30'
                      }
                    `}
                  >
                    <div className={`text-sm font-bold mb-1 ${isToday ? 'text-amber-400' : isCurrentMonth ? 'text-slate-900' : 'text-slate-400'}`}>
                      {format(day, 'd')}
                    </div>
                    
                    <div className="space-y-1">
                      {dayClasses.slice(0, 3).map((cls, idx) => {
                        const course = getCourseById(cls.courseId);
                        return (
                          <div
                            key={idx}
                            onClick={() => handleClassClick(cls)}
                            className={`
                              text-[9px] p-1 rounded truncate font-medium cursor-pointer
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

      {/* Floating Add Button */}
      <button
        onClick={() => setShowAddClassModal(true)}
        className="fixed bottom-8 right-8 h-16 w-16 rounded-full bg-blue-900 hover:bg-blue-800 text-white shadow-2xl hover:shadow-3xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-40"
      >
        <Plus className="h-8 w-8" />
      </button>

      {/* Add Class Modal */}
      <Dialog open={showAddClassModal} onOpenChange={setShowAddClassModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Plus className="h-6 w-6 text-blue-600" />
              Schedule New Class
            </DialogTitle>
            <DialogDescription>Create a new class session for students</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Course Selection */}
            <div className="space-y-2">
              <Label htmlFor="course">Course *</Label>
              <select
                id="course"
                className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm"
                value={formData.courseId}
                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
              >
                <option value="">Select a course</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.code} - {course.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Topic */}
            <div className="space-y-2">
              <Label htmlFor="topic">Class Topic *</Label>
              <Input
                id="topic"
                placeholder="e.g., Introduction to Strategic Management"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              />
            </div>

            {/* Date and Time */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time *</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                placeholder="e.g., Zoom Meeting or Room 305"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            {/* Meeting Link */}
            <div className="space-y-2">
              <Label htmlFor="meetingLink">Virtual Meeting Link</Label>
              <Input
                id="meetingLink"
                type="url"
                placeholder="https://zoom.us/j/..."
                value={formData.meetingLink}
                onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional information for students..."
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            {/* Preview Timezone */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-xs font-bold text-blue-600 uppercase mb-2">Time Preview</div>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-slate-700">IST:</span> {formData.startTime} - {formData.endTime}
                </div>
                <div>
                  <span className="font-semibold text-slate-700">EST:</span> (Auto-converted)
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddClassModal(false)}>
              Cancel
            </Button>
            <Button className="bg-blue-900 hover:bg-blue-800 text-white" onClick={handleAddClass}>
              <Save className="mr-2 h-4 w-4" />
              Schedule Class
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Class Details Modal (same as student view) */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Class Details</DialogTitle>
          </DialogHeader>
          
          {selectedClass && (
            <div className="space-y-4">
              <div>
                <Badge className="bg-blue-900 text-white mb-2">
                  {getCourseById(selectedClass.courseId)?.code}
                </Badge>
                <h3 className="text-xl font-bold text-slate-900">{selectedClass.topic}</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-xs font-bold text-blue-600 uppercase mb-1">IST</div>
                  <div className="text-lg font-bold text-slate-900">
                    {formatTimeIST(selectedClass.startTime)} - {formatTimeIST(selectedClass.endTime)}
                  </div>
                </div>
                <div className="p-4 bg-indigo-50 rounded-lg">
                  <div className="text-xs font-bold text-indigo-600 uppercase mb-1">EST</div>
                  <div className="text-lg font-bold text-slate-900">
                    {formatTimeEST(selectedClass.startTime)} - {formatTimeEST(selectedClass.endTime)}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Location</div>
                <div className="font-medium text-slate-900">{selectedClass.location}</div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}