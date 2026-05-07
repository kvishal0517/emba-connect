import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Badge } from '@/app/components/ui/badge';
import { StickyNote, Plus, Search, Trash2, Edit, BookOpen, Star, Clock, Save, X } from 'lucide-react';
import { db, dataService, type Note, type Course } from '@/app/lib/db';
import { toast } from 'sonner';

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentStudentId, setCurrentStudentId] = useState<string>('');
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    courseId: ''
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = await db.getCurrentUser();
        if (!userData) return;
        
        const studentRecord = await dataService.getStudentByUserId(userData.id);
        if (!studentRecord) return;
        
        setCurrentStudentId(studentRecord.id);

        const [notesData, coursesData] = await Promise.all([
          dataService.getNotesByStudent(studentRecord.id),
          db.getStudentCourses(studentRecord.id)
        ]);
        
        setNotes(Array.isArray(notesData) ? notesData : []);
        setCourses(Array.isArray(coursesData) ? coursesData : []);
      } catch (error) {
        console.error('Error loading data:', error);
        setNotes([]);
        setCourses([]);
      }
    };
    loadData();
  }, []);

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateNote = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const newNote = await db.createNote({
        studentId: currentStudentId,
        title: formData.title,
        content: formData.content,
        courseId: formData.courseId || undefined
      });

      setNotes([newNote, ...notes]);
      setFormData({ title: '', content: '', courseId: '' });
      setIsCreating(false);
      setSelectedNote(newNote);
      
      toast.success('Note Created', {
        description: 'Your note has been saved successfully.'
      });
    } catch (error) {
      console.error('Error creating note:', error);
      toast.error('Failed to create note');
    }
  };

  const handleUpdateNote = async () => {
    if (!selectedNote || !formData.title.trim() || !formData.content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const updatedNote = await db.updateNote(selectedNote.id, {
        title: formData.title,
        content: formData.content,
        courseId: formData.courseId || undefined
      });

      if (updatedNote) {
        setNotes(notes.map(n => (n.id === selectedNote.id ? updatedNote : n)));
        setSelectedNote(updatedNote);
        setIsEditing(false);
        
        toast.success('Note Updated', {
          description: 'Your changes have been saved.'
        });
      }
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Failed to update note');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const success = await db.deleteNote(noteId);
      
      if (success) {
        setNotes(notes.filter(note => note.id !== noteId));
        if (selectedNote?.id === noteId) {
          setSelectedNote(null);
        }
        
        toast.success('Note Deleted', {
          description: 'The note has been removed.'
        });
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  const startEditing = (note: Note) => {
    setFormData({
      title: note.title,
      content: note.content,
      courseId: note.courseId || ''
    });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setFormData({ title: '', content: '', courseId: '' });
  };

  const startCreating = () => {
    setFormData({ title: '', content: '', courseId: '' });
    setIsCreating(true);
    setSelectedNote(null);
  };

  const getCourse = (courseId?: string) => {
    if (!courseId) return null;
    return courses.find(course => course.id === courseId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Notes</h1>
          <p className="text-slate-500 mt-2">Organize your study notes and key takeaways</p>
        </div>
        <Button 
          className="bg-blue-900 hover:bg-blue-800 text-white"
          onClick={startCreating}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Note
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notes List */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search notes..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredNotes.length === 0 ? (
                <div className="text-center py-8">
                  <StickyNote className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">No notes found</p>
                </div>
              ) : (
                filteredNotes.map((note) => {
                  const course = getCourse(note.courseId);
                  return (
                    <div
                      key={note.id}
                      onClick={() => {
                        setSelectedNote(note);
                        setIsCreating(false);
                        setIsEditing(false);
                      }}
                      className={`
                        p-4 rounded-lg border cursor-pointer transition-all
                        ${selectedNote?.id === note.id 
                          ? 'bg-blue-50 border-blue-300 shadow-sm' 
                          : 'bg-white border-slate-200 hover:border-blue-200 hover:bg-slate-50'
                        }
                      `}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-sm text-slate-900 line-clamp-1 flex-1 pr-2">
                          {note.title}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 mb-2">
                        {note.content}
                      </p>
                      <div className="flex items-center justify-between">
                        {course && (
                          <Badge variant="outline" className="text-xs bg-blue-50 border-blue-200 text-blue-700">
                            {course.code}
                          </Badge>
                        )}
                        <span className="text-[10px] text-slate-400">
                          {new Date(note.updatedDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Note Detail/Editor */}
        <Card className="lg:col-span-2 shadow-lg">
          {isCreating ? (
            <>
              <CardHeader>
                <CardTitle>Create New Note</CardTitle>
                <CardDescription>Add your study notes and important points</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Title</label>
                  <Input
                    placeholder="Enter note title..."
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="bg-white text-slate-900 placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Course (Optional)</label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.courseId}
                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                  >
                    <option value="" className="text-slate-900 bg-white">No specific course</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id} className="text-slate-900 bg-white">
                        {course.code} - {course.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Content</label>
                  <Textarea
                    placeholder="Start typing your notes..."
                    className="min-h-[300px] bg-white text-slate-900 placeholder:text-slate-400"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  />
                </div>
                <div className="flex gap-2 justify-end pt-4 border-t">
                  <Button variant="outline" onClick={() => setIsCreating(false)}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button 
                    className="bg-blue-900 hover:bg-blue-800 text-white"
                    onClick={handleCreateNote}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Note
                  </Button>
                </div>
              </CardContent>
            </>
          ) : isEditing && selectedNote ? (
            <>
              <CardHeader>
                <CardTitle>Edit Note</CardTitle>
                <CardDescription>Update your note content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Title</label>
                  <Input
                    placeholder="Enter note title..."
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="bg-white text-slate-900 placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Course (Optional)</label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.courseId}
                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                  >
                    <option value="" className="text-slate-900 bg-white">No specific course</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id} className="text-slate-900 bg-white">
                        {course.code} - {course.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Content</label>
                  <Textarea
                    placeholder="Start typing your notes..."
                    className="min-h-[300px] bg-white text-slate-900 placeholder:text-slate-400"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  />
                </div>
                <div className="flex gap-2 justify-end pt-4 border-t">
                  <Button variant="outline" onClick={cancelEditing}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button 
                    className="bg-blue-900 hover:bg-blue-800 text-white"
                    onClick={handleUpdateNote}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </>
          ) : selectedNote ? (
            <>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl">{selectedNote.title}</CardTitle>
                    <CardDescription className="flex items-center gap-3 mt-2">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Updated {new Date(selectedNote.updatedDate).toLocaleDateString()}</span>
                      </span>
                      {getCourse(selectedNote.courseId) && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            <span>{getCourse(selectedNote.courseId)?.name}</span>
                          </span>
                        </>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => startEditing(selectedNote)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteNote(selectedNote.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-slate max-w-none">
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {selectedNote.content}
                  </p>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex flex-col items-center justify-center h-full py-20">
              <StickyNote className="h-16 w-16 text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Note Selected</h3>
              <p className="text-sm text-slate-500 text-center max-w-sm mb-6">
                Select a note from the list or create a new one to get started
              </p>
              <Button 
                className="bg-blue-900 hover:bg-blue-800 text-white"
                onClick={startCreating}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Note
              </Button>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
