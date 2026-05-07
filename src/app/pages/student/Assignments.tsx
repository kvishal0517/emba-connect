import React, { useState, useEffect } from 'react';
import { db, dataService, type Assignment } from '@/app/lib/db';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Progress } from '@/app/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Badge } from '@/app/components/ui/badge';
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Download,
  Calendar,
  Check
} from 'lucide-react';
import { toast } from 'sonner';
import { FileUploadDialog } from '@/app/components/FileUploadDialog';

export default function StudentAssignments() {
  const [activeTab, setActiveTab] = useState('all');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);

  useEffect(() => {
    const loadAssignments = async () => {
      try {
        // Get current user first, then load their specific data
        const userData = await db.getCurrentUser();
        if (!userData) return;
        
        // Get student record to get the studentId
        const studentRecord = await dataService.getStudentByUserId(userData.id);
        if (!studentRecord) return;
        
        const [assignmentData, courseData] = await Promise.all([
          db.getStudentAssignments(studentRecord.id),
          db.getStudentCourses(studentRecord.id)
        ]);
        setAssignments(assignmentData);
        setCourses(courseData);
      } catch (error) {
        console.error('Error loading assignments:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadAssignments();
  }, []);

  const handleFileUpload = async (file: File) => {
    if (!selectedAssignmentId) return;

    try {
      // Submit the assignment
      const updated = await db.submitAssignment(selectedAssignmentId, {
        fileName: file.name,
        fileSize: file.size
      });

      if (updated) {
        // Update local state
        setAssignments(prev =>
          prev.map(a => (a.id === selectedAssignmentId ? updated : a))
        );

        toast.success('Assignment Submitted Successfully!', {
          description: `${file.name} has been uploaded and submitted for review.`
        });

        setUploadDialogOpen(false);
        setSelectedAssignmentId(null);
      }
    } catch (error) {
      console.error('Error uploading assignment:', error);
      toast.error('Upload Failed', {
        description: 'There was an error uploading your file. Please try again.'
      });
    }
  };

  const handleDownloadAll = () => {
    toast.success('Download Started', {
      description: 'All assignment briefs are being downloaded as a ZIP file.'
    });
  };

  const getStatusColor = (status: string) => {
    switch(status) {
        case 'submitted': return 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200';
        case 'graded': return 'bg-blue-100 text-blue-700 hover:bg-blue-200';
        default: return 'bg-amber-100 text-amber-700 hover:bg-amber-200';
    }
  };

  const getCourseById = (courseId: string) => {
    return courses.find(c => c.id === courseId);
  };

  const filteredAssignments = activeTab === 'all' 
    ? assignments 
    : assignments.filter(a => a.status === activeTab);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Assignments</h1>
          <p className="text-slate-500">Track your coursework and submissions.</p>
        </div>
        <Button 
          className="bg-slate-900 text-white hover:bg-slate-800"
          onClick={handleDownloadAll}
        >
            <Download className="mr-2 h-4 w-4" /> Download All Briefs
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4">
            <TabsList>
                <TabsTrigger value="all">All Tasks</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="submitted">Submitted</TabsTrigger>
                <TabsTrigger value="graded">Graded</TabsTrigger>
            </TabsList>
        </div>

        <TabsContent value={activeTab} className="space-y-4">
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                    <Progress className="h-2 w-48" value={50} />
                    <p className="text-lg font-medium">Loading assignments...</p>
                </div>
            ) : filteredAssignments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                    <CheckCircle className="h-12 w-12 mb-4 opacity-20" />
                    <p className="text-lg font-medium">No assignments found</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredAssignments.map((assignment) => {
                        const course = getCourseById(assignment.courseId);
                        const isOverdue = new Date(assignment.dueDate) < new Date() && assignment.status === 'pending';

                        return (
                            <Card key={assignment.id} className={`flex flex-col justify-between border-slate-200 hover:border-slate-300 transition-all ${isOverdue ? 'border-red-200 bg-red-50/30' : ''}`}>
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge variant="outline" className="font-mono text-xs">
                                            {course?.code}
                                        </Badge>
                                        <Badge className={`${getStatusColor(assignment.status)} border-transparent shadow-none capitalize`}>
                                            {assignment.status}
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-lg line-clamp-2 leading-tight min-h-[3rem]">
                                        {assignment.title}
                                    </CardTitle>
                                    <CardDescription className="line-clamp-2 mt-1">
                                        {assignment.description}
                                    </CardDescription>
                                </CardHeader>
                                
                                <CardContent className="pb-3">
                                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                                        <Calendar className="h-4 w-4" />
                                        <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                                    </div>
                                    
                                    {assignment.grade && (
                                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex justify-between items-center">
                                            <span className="text-xs font-medium text-slate-500">Grade Received</span>
                                            <span className="text-lg font-bold text-slate-900">{assignment.grade} <span className="text-xs font-normal text-slate-400">/ {assignment.maxPoints}</span></span>
                                        </div>
                                    )}
                                </CardContent>

                                <CardFooter className="pt-0">
                                    {assignment.status === 'pending' ? (
                                        <Button 
                                            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold border-none"
                                            onClick={() => {
                                                setSelectedAssignmentId(assignment.id);
                                                setUploadDialogOpen(true);
                                            }}
                                        >
                                            <Upload className="mr-2 h-4 w-4" /> Upload Submission
                                        </Button>
                                    ) : (
                                        <Button variant="outline" className="w-full text-slate-500" disabled>
                                            <Check className="mr-2 h-4 w-4" /> Submitted
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            )}
        </TabsContent>
      </Tabs>

      <FileUploadDialog
        isOpen={uploadDialogOpen}
        onClose={() => {
          setUploadDialogOpen(false);
          setSelectedAssignmentId(null);
        }}
        onUpload={handleFileUpload}
        title="Upload Assignment Submission"
        description="Select your completed assignment file to submit."
      />
    </div>
  );
}
