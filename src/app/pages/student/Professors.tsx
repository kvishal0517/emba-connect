import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { SafeAnchor } from '@/app/components/ui/safe-anchor';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import {
    Search,
    Mail,
    MessageSquare,
    BookOpen,
    Award,
    Linkedin,
    GraduationCap,
    Loader2,
    Clock,
    Send,
    X
} from 'lucide-react';
import { toast } from 'sonner';
import { db, type Professor, type Course } from '@/app/lib/db';

export default function StudentProfessors() {
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Message dialog state
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [selectedProfessor, setSelectedProfessor] = useState<Professor | null>(null);
  const [messageSubject, setMessageSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [profsData, coursesData] = await Promise.all([
          db.getProfessors(),
          db.getCourses()
        ]);
        setProfessors(profsData);
        setCourses(coursesData);
      } catch (error) {
        console.error('Failed to load professors:', error);
        toast.error('Failed to load faculty data');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleOpenMessageDialog = (professor: Professor) => {
    setSelectedProfessor(professor);
    setMessageSubject('');
    setMessageBody('');
    setMessageDialogOpen(true);
  };

  const handleSendMessage = async () => {
    if (!messageSubject.trim() || !messageBody.trim()) {
      toast.error('Missing Information', {
        description: 'Please fill in both subject and message.'
      });
      return;
    }

    if (!selectedProfessor) return;

    setSendingMessage(true);

    // Simulate sending message
    setTimeout(() => {
      setSendingMessage(false);
      setMessageDialogOpen(false);

      toast.success(`Message Sent to ${selectedProfessor.name}!`, {
        description: "They typically respond within 24 hours."
      });

      // Reset form
      setMessageSubject('');
      setMessageBody('');
      setSelectedProfessor(null);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          <p className="text-slate-500">Loading faculty directory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Faculty Directory</h1>
          <p className="text-slate-500">Connect with your professors and advisors.</p>
        </div>
        <div>
          <Input
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-64"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {professors
          .filter((prof) =>
            prof.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((prof) => {
            const profCourses = courses.filter(c => c.professorId === prof.id);

            return (
                <Card key={prof.id} className="border-slate-200 hover:border-amber-400 transition-all hover:shadow-md group">
                    <CardHeader className="flex flex-row items-center gap-4 pb-2">
                        <Avatar className="h-16 w-16 border-2 border-slate-100 group-hover:border-amber-500 transition-colors">
                            <AvatarImage src={prof.avatar} />
                            <AvatarFallback>{prof.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-lg font-bold text-slate-900">{prof.name}</CardTitle>
                            <CardDescription className="text-slate-500 font-medium">{prof.department}</CardDescription>
                        </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                        <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                            {prof.bio}
                        </p>
                        
                        <div className="space-y-2 pt-2 border-t border-slate-100">
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Clock className="h-3 w-3 text-amber-500" />
                                <span className="font-semibold text-slate-700">Office Hours:</span> {prof.officeHours}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <BookOpen className="h-3 w-3 text-blue-500" />
                                <span className="font-semibold text-slate-700">Teaching:</span> 
                                <span className="truncate max-w-[180px]">
                                    {profCourses.map(c => c.name).join(', ')}
                                </span>
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="pt-0 gap-2">
                        <Button variant="outline" size="sm" className="flex-1 text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-blue-600" asChild>
                            <SafeAnchor href={`mailto:${prof.email}`}>
                                <Mail className="mr-2 h-3 w-3" /> Email
                            </SafeAnchor>
                        </Button>
                        <Button size="sm" className="flex-1 bg-slate-900 text-white hover:bg-slate-800" onClick={() => handleOpenMessageDialog(prof)}>
                            <MessageSquare className="mr-2 h-3 w-3" /> Message
                        </Button>
                        {prof.linkedIn && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-700 hover:bg-blue-50" asChild>
                                <SafeAnchor href={prof.linkedIn} target="_blank" rel="noreferrer">
                                    <Linkedin className="h-4 w-4" />
                                </SafeAnchor>
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            );
        })}
      </div>

      {/* Message Dialog */}
      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              Send Message to <span className="font-bold text-slate-900 underline decoration-blue-500 decoration-2 underline-offset-2">{selectedProfessor?.name}</span>
            </DialogTitle>
            <DialogDescription className="text-slate-700 text-base">
              Compose your message to <span className="font-bold text-slate-900">{selectedProfessor?.name}</span> from {selectedProfessor?.department}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Professor Info Card */}
            <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-lg border-2 border-amber-300">
              <Avatar className="h-14 w-14 border-2 border-amber-400">
                <AvatarImage src={selectedProfessor?.avatar} />
                <AvatarFallback className="bg-blue-900 text-white font-bold text-lg">
                  {selectedProfessor?.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold text-slate-900 text-lg">{selectedProfessor?.name}</p>
                <p className="text-sm text-slate-700 font-semibold">{selectedProfessor?.department}</p>
                <p className="text-sm text-slate-600 mt-0.5">{selectedProfessor?.email}</p>
              </div>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject" className="text-slate-700 font-semibold">Subject</Label>
              <Input
                id="subject"
                placeholder="e.g., Question about Assignment 3"
                value={messageSubject}
                onChange={(e) => setMessageSubject(e.target.value)}
                className="border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"
              />
            </div>

            {/* Message Body */}
            <div className="space-y-2">
              <Label htmlFor="message" className="text-slate-700 font-semibold">Message</Label>
              <Textarea
                id="message"
                placeholder="Type your message here..."
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                className="min-h-[150px] border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 resize-none"
              />
              <p className="text-xs text-slate-500">
                Please be clear and concise. Expected response time: 24-48 hours.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setMessageDialogOpen(false)}
              disabled={sendingMessage}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={sendingMessage || !messageSubject.trim() || !messageBody.trim()}
              className="bg-blue-900 hover:bg-blue-800 text-white"
            >
              {sendingMessage ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}