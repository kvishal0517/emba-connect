import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { SafeAnchor } from '@/app/components/ui/safe-anchor';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Calendar } from '@/app/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/app/components/ui/alert-dialog';
import { format } from 'date-fns';
import { cn } from '@/app/lib/utils';
import { CalendarIcon, Clock, Link as LinkIcon, Plus, Trash2, User, Edit2, X, Search, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { CopyButton } from '@/app/components/CopyButton';
import { NoSearchResultsEmpty } from '@/app/components/EmptyState';
import { ExportButton } from '@/app/components/ExportButton';
import { exportClassScheduleToPDF, exportClassScheduleToCSV } from '@/app/utils/exportUtils';
import { db, type ClassSession, type Course, type Professor } from '@/app/lib/db';

export default function AdminManageClasses() {
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form State
  const [selectedProfessor, setSelectedProfessor] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [topic, setTopic] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [link, setLink] = useState('');

  // Edit Mode State
  const [editingClassId, setEditingClassId] = useState<string | null>(null);

  // Delete Confirmation State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [timezone, setTimezone] = useState<'IST' | 'EST'>('IST');

  // Filtered courses based on selected professor
  const filteredCourses = selectedProfessor 
    ? courses.filter(c => c.professorId === selectedProfessor)
    : [];

  // Reset course selection when professor changes
  const handleProfessorChange = (professorId: string) => {
    setSelectedProfessor(professorId);
    setSelectedCourse(''); // Reset course when professor changes
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [classData, courseData, professorData] = await Promise.all([
          db.getClasses(),
          db.getCourses(),
          db.getProfessors()
        ]);
        setClasses(classData);
        setCourses(courseData);
        setProfessors(professorData);
      } catch (error) {
        console.error('Error loading class management data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProfessor || !selectedCourse || !topic || !date || !startTime || !endTime) {
        toast.error("Missing Fields", { description: "Please fill in all required fields." });
        return;
    }

    // Validation 1: Check if end time is after start time
    if (endTime <= startTime) {
      toast.error("Invalid Time", { description: "End time must be after start time." });
      return;
    }

    // Validation 2: Prevent scheduling in the past
    const selectedDateTime = new Date(`${format(date, 'yyyy-MM-dd')}T${startTime}`);
    const now = new Date();
    if (selectedDateTime < now) {
      toast.error("Invalid Date", { description: "Cannot schedule classes in the past." });
      return;
    }

    try {
      if (editingClassId) {
        // Update existing class
        const updatedClass = {
          courseId: selectedCourse,
          topic,
          date: format(date, 'yyyy-MM-dd'),
          startTime,
          endTime,
          meetingLink: link || 'https://zoom.us/j/default',
          location: 'Virtual Classroom',
          status: 'scheduled' as const
        };

        await db.updateClassSession(editingClassId, updatedClass);
        const classData = await db.getClasses();
        setClasses(classData);
        
        toast.success("Class Updated", { description: `${topic} has been updated successfully.` });
        setEditingClassId(null);
      } else {
        // Create new class
        const newClass = {
          courseId: selectedCourse,
          topic,
          date: format(date, 'yyyy-MM-dd'),
          startTime,
          endTime,
          meetingLink: link || 'https://zoom.us/j/default',
          location: 'Virtual Classroom',
          status: 'scheduled' as const
        };

        await db.createClassSession(newClass);
        const classData = await db.getClasses();
        setClasses(classData);
        
        toast.success("Class Scheduled", { description: `${topic} has been added to the calendar and will appear for professor and enrolled students.` });
      }
      
      // Reset form
      resetForm();
      
    } catch (error) {
      toast.error(editingClassId ? "Failed to update class" : "Failed to schedule class", { description: "Please try again." });
      console.error(error);
    }
  };

  const resetForm = () => {
    setSelectedProfessor('');
    setSelectedCourse('');
    setTopic('');
    setStartTime('');
    setEndTime('');
    setLink('');
    setDate(new Date());
    setEditingClassId(null);
  };

  const handleEdit = (cls: ClassSession) => {
    // Find the course to get professor info
    const course = getCourseById(cls.courseId);
    if (course) {
      setSelectedProfessor(course.professorId);
      setSelectedCourse(cls.courseId);
    }
    setTopic(cls.topic);
    setDate(new Date(cls.date));
    setStartTime(cls.startTime);
    setEndTime(cls.endTime);
    setLink(cls.meetingLink);
    setEditingClassId(cls.id);
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    resetForm();
    toast.info("Edit Cancelled", { description: "Changes have been discarded." });
  };

  const confirmDelete = (id: string) => {
    setClassToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!classToDelete) return;

    try {
      await db.deleteClassSession(classToDelete);
      
      // Reload classes from database
      const classData = await db.getClasses();
      setClasses(classData);
      
      toast.success("Class Cancelled", { description: "Students and professor will be notified." });
    } catch (error) {
      toast.error("Failed to cancel class", { description: "Please try again." });
      console.error(error);
    } finally {
      setDeleteConfirmOpen(false);
      setClassToDelete(null);
    }
  };

  const getCourseById = (courseId: string) => {
    return courses.find(c => c.id === courseId);
  };

  const getProfessorById = (professorId: string) => {
    return professors.find(p => p.id === professorId);
  };

  // Timezone conversion helper (IST is UTC+5:30, EST is UTC-5:00)
  const convertTime = (time: string, from: 'IST' | 'EST', to: 'IST' | 'EST'): string => {
    if (from === to) return time;
    
    const [hours, minutes] = time.split(':').map(Number);
    let newHours = hours;
    
    if (from === 'IST' && to === 'EST') {
      // IST to EST: -10.5 hours
      newHours = hours - 10.5;
    } else if (from === 'EST' && to === 'IST') {
      // EST to IST: +10.5 hours
      newHours = hours + 10.5;
    }
    
    // Handle day overflow/underflow
    if (newHours < 0) newHours += 24;
    if (newHours >= 24) newHours -= 24;
    
    const finalHours = Math.floor(newHours);
    const finalMinutes = (newHours % 1) * 60 + minutes;
    
    return `${String(finalHours).padStart(2, '0')}:${String(Math.floor(finalMinutes)).padStart(2, '0')}`;
  };

  const formatTimeWithTimezone = (time: string, displayTimezone: 'IST' | 'EST'): string => {
    // Assume all times are stored in IST
    const convertedTime = convertTime(time, 'IST', displayTimezone);
    return `${convertedTime} ${displayTimezone}`;
  };

  // Filter classes based on search query
  const filteredClasses = classes.filter(cls => {
    if (!searchQuery) return true;
    
    const course = getCourseById(cls.courseId);
    const professor = course ? getProfessorById(course.professorId) : null;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      cls.topic.toLowerCase().includes(searchLower) ||
      course?.code.toLowerCase().includes(searchLower) ||
      course?.name.toLowerCase().includes(searchLower) ||
      professor?.name.toLowerCase().includes(searchLower)
    );
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Manage Class Schedule</h1>
          <p className="text-slate-500 mt-2">Schedule new classes and manage existing sessions</p>
        </div>
        <ExportButton
          onExportPDF={() => exportClassScheduleToPDF(filteredClasses, courses, professors, 'Class Schedule')}
          onExportCSV={() => exportClassScheduleToCSV(filteredClasses, courses, professors, 'class_schedule')}
          label="Export Schedule"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
      {/* Creation Form */}
      <div className="lg:col-span-1 space-y-6">
        <Card className={cn("border-slate-200 shadow-md", editingClassId && "border-amber-400 border-2")}>
            <CardHeader>
                <CardTitle>{editingClassId ? 'Edit Class Session' : 'Class Details'}</CardTitle>
                <CardDescription>
                  {editingClassId ? 'Update the class details below.' : 'All fields are required.'}
                </CardDescription>
                {editingClassId && (
                  <div className="flex items-center gap-2 mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-800">
                    <Edit2 className="h-4 w-4" />
                    <span>Editing mode active</span>
                  </div>
                )}
            </CardHeader>
            <CardContent>
                <form onSubmit={handleCreate} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Professor</Label>
                        <Select onValueChange={handleProfessorChange} value={selectedProfessor}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select professor..." />
                            </SelectTrigger>
                            <SelectContent>
                                {professors.map(p => (
                                    <SelectItem key={p.id} value={p.id}>
                                      {p.name} - {p.department}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {selectedProfessor && (
                          <p className="text-xs text-slate-500">
                            {getProfessorById(selectedProfessor)?.department} Department
                          </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Course Subject</Label>
                        <Select 
                          onValueChange={setSelectedCourse} 
                          value={selectedCourse}
                          disabled={!selectedProfessor}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={selectedProfessor ? "Select course..." : "Select professor first"} />
                            </SelectTrigger>
                            <SelectContent>
                                {filteredCourses.length === 0 ? (
                                  <div className="p-2 text-sm text-slate-500 text-center">No courses found for this professor</div>
                                ) : (
                                  filteredCourses.map(c => (
                                    <SelectItem key={c.id} value={c.id}>{c.name} ({c.code})</SelectItem>
                                  ))
                                )}
                            </SelectContent>
                        </Select>
                        {selectedProfessor && filteredCourses.length > 0 && (
                          <p className="text-xs text-slate-500">{filteredCourses.length} course(s) available</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Topic / Title</Label>
                        <Input placeholder="e.g. Market Entry Strategies" value={topic} onChange={e => setTopic(e.target.value)} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date ? format(date, "PPP") : "Pick a date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2">
                            <Label>Start Time</Label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <Input className="pl-9" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>End Time</Label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input className="pl-9" type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Meeting Link (Optional)</Label>
                        <div className="relative">
                            <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input className="pl-9" placeholder="https://zoom.us/..." value={link} onChange={e => setLink(e.target.value)} />
                        </div>
                    </div>

                    {editingClassId ? (
                      <div className="flex gap-2 mt-4">
                        <Button type="submit" className="flex-1 bg-amber-600 text-white hover:bg-amber-700">
                          <Edit2 className="mr-2 h-4 w-4" /> Update Session
                        </Button>
                        <Button type="button" variant="outline" onClick={handleCancelEdit} className="flex-1">
                          <X className="mr-2 h-4 w-4" /> Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button type="submit" className="w-full bg-slate-900 text-white hover:bg-slate-800 mt-4">
                        <Plus className="mr-2 h-4 w-4" /> Schedule Session
                      </Button>
                    )}
                </form>
            </CardContent>
        </Card>
      </div>

      {/* Class List */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Upcoming Sessions</h2>
            <p className="text-slate-500">Manage existing schedule.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant={timezone === 'IST' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setTimezone('IST')}
              className={cn(timezone === 'IST' && 'bg-slate-900')}
            >
              <Globe className="h-4 w-4 mr-1" /> IST
            </Button>
            <Button 
              variant={timezone === 'EST' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setTimezone('EST')}
              className={cn(timezone === 'EST' && 'bg-slate-900')}
            >
              <Globe className="h-4 w-4 mr-1" /> EST
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search by topic, course, or professor..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery('')}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-2"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                    {filteredClasses.length === 0 ? (
                        <div className="p-8">
                          {searchQuery ? (
                            <NoSearchResultsEmpty searchQuery={searchQuery} onClearSearch={() => setSearchQuery('')} />
                          ) : (
                            <div className="text-center text-slate-500 italic">No classes scheduled.</div>
                          )}
                        </div>
                    ) : (
                        filteredClasses
                          .filter(cls => cls.date && cls.startTime) // Filter out invalid entries
                          .sort((a, b) => {
                            const dateA = new Date(`${a.date}T${a.startTime}`);
                            const dateB = new Date(`${b.date}T${b.startTime}`);
                            return dateA.getTime() - dateB.getTime();
                          })
                          .map((cls) => {
                            const classDate = new Date(`${cls.date}T${cls.startTime}`);
                            // Defensive check
                            if (isNaN(classDate.getTime())) {
                              return null;
                            }
                            
                            return (
                            <div key={cls.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col items-center justify-center w-12 h-12 bg-white border border-slate-200 rounded-lg text-slate-600 shrink-0 shadow-sm">
                                        <span className="text-xs font-bold uppercase">{format(classDate, 'MMM')}</span>
                                        <span className="text-lg font-bold text-slate-900">{format(classDate, 'd')}</span>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-slate-900">{cls.topic}</h4>
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            <span className="font-medium text-slate-700">{getCourseById(cls.courseId)?.code}</span>
                                            <span>•</span>
                                            <span>{formatTimeWithTimezone(cls.startTime, timezone)} - {formatTimeWithTimezone(cls.endTime, timezone)}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400">
                                            <User className="h-3 w-3" />
                                            <span>{getProfessorById(getCourseById(cls.courseId)?.professorId || '')?.name || 'Unknown'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="outline" size="sm" asChild>
                                        <SafeAnchor href={cls.meetingLink} target="_blank" rel="noreferrer">Link</SafeAnchor>
                                    </Button>
                                    <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => confirmDelete(cls.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleEdit(cls)}>
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            );
                          })
                    )}
                </div>
            </CardContent>
        </Card>
      </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the class session and notify all students and the professor.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete Class
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}