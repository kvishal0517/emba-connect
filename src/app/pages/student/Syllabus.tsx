import React, { useState, useEffect } from 'react';
import { db } from '@/app/lib/db';
import type { Course, Resource, Professor } from '@/app/lib/db';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/app/components/ui/accordion';
import { Button } from '@/app/components/ui/button';
import {
  FileText,
  Download,
  ExternalLink,
  BookOpen,
  Video,
  Link as LinkIcon
} from 'lucide-react';
import { DashboardSkeleton } from '@/app/components/LoadingSkeleton';
import { exportSyllabusToPDF } from '@/app/utils/exportUtils';
import { toast } from 'sonner';

export default function StudentSyllabus() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [coursesData, resourcesData, professorsData] = await Promise.all([
          db.getCourses(),
          db.getResources(),
          db.getProfessors()
        ]);

        // Ensure we have arrays, not undefined/null
        setCourses(Array.isArray(coursesData) ? coursesData : []);
        setResources(Array.isArray(resourcesData) ? resourcesData : []);
        setProfessors(Array.isArray(professorsData) ? professorsData : []);

        console.log('Syllabus data loaded:', {
          courses: coursesData?.length || 0,
          resources: resourcesData?.length || 0,
          professors: professorsData?.length || 0
        });
      } catch (error) {
        console.error('Error loading syllabus data:', error);
        // Set empty arrays on error
        setCourses([]);
        setResources([]);
        setProfessors([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleDownloadSyllabus = (course: Course) => {
    const professor = professors.find(p => p.id === course.professorId);
    const courseResources = resources.filter(r => r.courseId === course.id);

    try {
      exportSyllabusToPDF(course, professor || null, courseResources);
      toast.success('Syllabus Downloaded!', {
        description: `${course.code} syllabus has been downloaded as PDF.`
      });
    } catch (error) {
      console.error('Error downloading syllabus:', error);
      toast.error('Download Failed', {
        description: 'There was an error generating the PDF.'
      });
    }
  };

  const handleDownloadResource = (resource: Resource) => {
    toast.success('Download Started', {
      description: `Downloading ${resource.title}...`
    });
    // In a real app, this would trigger actual file download
    window.open(resource.url, '_blank');
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!Array.isArray(courses) || courses.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Syllabus & Resources</h1>
            <p className="text-slate-500">Access course materials and lecture notes.</p>
          </div>
        </div>
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-2 text-sm font-semibold text-slate-900">No courses available</h3>
          <p className="mt-1 text-sm text-slate-500">Course materials will appear here once available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Syllabus & Resources</h1>
          <p className="text-slate-500">Access course materials and lecture notes.</p>
        </div>
      </div>

      <Accordion type="single" collapsible className="w-full space-y-4">
        {courses.map((course) => {
            const courseResources = resources.filter(r => r.courseId === course.id);
            const professor = professors.find(p => p.id === course.professorId);

            return (
                <AccordionItem key={course.id} value={course.id} className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm">
                    <AccordionTrigger className="px-6 py-4 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4 text-left">
                            <div className="h-10 w-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                                {course.code.split('-')[1]}
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900">{course.name}</h3>
                                <p className="text-sm text-slate-500 font-normal">
                                    {professor?.name} • {course.credits} Credits
                                </p>
                            </div>
                        </div>
                    </AccordionTrigger>
                    
                    <AccordionContent className="px-6 py-4 bg-slate-50/50 border-t border-slate-100">
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="md:col-span-2 space-y-4">
                                <h4 className="font-medium text-slate-900 flex items-center gap-2">
                                    <BookOpen className="h-4 w-4 text-slate-500" /> Course Description
                                </h4>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    {course.description}
                                </p>
                                
                                <div className="pt-4">
                                    <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-slate-500" /> Modules
                                    </h4>
                                    <ul className="space-y-2 text-sm text-slate-600 list-disc list-inside ml-2">
                                        <li>Introduction & Core Concepts</li>
                                        <li>Advanced Frameworks</li>
                                        <li>Case Studies & Application</li>
                                        <li>Final Project Guidelines</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm h-fit">
                                <h4 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
                                    <Download className="h-4 w-4 text-slate-500" /> Resources
                                </h4>
                                {courseResources.length === 0 ? (
                                    <p className="text-xs text-slate-400 italic">No resources uploaded yet.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {courseResources.map((res) => (
                                            <div key={res.id} className="flex items-start justify-between group">
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    {res.type === 'pdf' && <FileText className="h-3 w-3 text-red-500 shrink-0" />}
                                                    {res.type === 'video' && <Video className="h-3 w-3 text-blue-500 shrink-0" />}
                                                    {res.type === 'link' && <LinkIcon className="h-3 w-3 text-slate-500 shrink-0" />}
                                                    <a href={res.url} target="_blank" rel="noreferrer" className="text-sm text-slate-600 hover:text-blue-600 truncate transition-colors">
                                                        {res.title}
                                                    </a>
                                                </div>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-6 w-6 text-slate-300 group-hover:text-slate-600"
                                                    onClick={() => handleDownloadResource(res)}
                                                >
                                                    <Download className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <Button
                                    className="w-full mt-6 bg-slate-900 text-white hover:bg-slate-800 h-9 text-xs"
                                    onClick={() => handleDownloadSyllabus(course)}
                                >
                                    <Download className="h-3 w-3 mr-2" />
                                    Download Full Syllabus
                                </Button>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            );
        })}
      </Accordion>
    </div>
  );
}