import React, { useState, useEffect } from 'react';
import { db, type User, type Course, type ClassSession, type Assignment } from '@/app/lib/db';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import {
  Users,
  BookOpen,
  FileText,
  TrendingUp,
  Plus,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [userData, courseData, classData, assignmentData] = await Promise.all([
          db.getCurrentUser(),
          db.getCourses(),
          db.getClasses(),
          db.getAssignments()
        ]);
        setUser(userData);
        setCourses(courseData);
        setClasses(classData);
        setAssignments(assignmentData);
      } catch (error) {
        console.error('Error loading admin dashboard data:', error);
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Admin Overview</h1>
          <p className="text-slate-500">System status and key metrics.</p>
        </div>
        <div className="flex gap-2">
            <Button
              className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20"
              onClick={() => toast.info('Add New User', { description: 'User creation form coming soon!' })}
            >
                <Plus className="mr-2 h-4 w-4" /> Add New User
            </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Students</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">142</div>
            <p className="text-xs text-green-600 mt-1 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" /> +12% this semester
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-amber-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Active Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{courses.length}</div>
            <p className="text-xs text-slate-500 mt-1">Across 3 departments</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Scheduled Classes</CardTitle>
            <Calendar className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{classes.length}</div>
            <p className="text-xs text-slate-500 mt-1">Next 7 days</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Pending Assignments</CardTitle>
                <FileText className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-slate-900">{assignments.filter(a => a.status === 'pending').length}</div>
                <p className="text-xs text-slate-500 mt-1">Require grading</p>
            </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Activity / System Health */}
        <Card className="lg:col-span-2 border-slate-200 shadow-sm">
            <CardHeader>
                <CardTitle>System Activity</CardTitle>
                <CardDescription>Recent actions performed across the platform.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center gap-4 pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                {i % 2 === 0 ? <FileText className="h-5 w-5 text-slate-500" /> : <Users className="h-5 w-5 text-blue-500" />}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-slate-900">
                                    {i % 2 === 0 ? "Assignment 'Market Analysis' created" : "New student registration: John Doe"}
                                </p>
                                <p className="text-xs text-slate-500">2 hours ago • by Sarah Jenkins</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs"
                              onClick={() => toast.info('Activity Details', { description: 'Detailed view coming soon!' })}
                            >
                              Details
                            </Button>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-slate-200 shadow-sm bg-slate-50/50">
            <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 bg-white hover:bg-slate-50 hover:border-blue-300 transition-colors"
                  onClick={() => navigate('/admin/schedule')}
                >
                    <Calendar className="mr-3 h-5 w-5 text-blue-500" /> Schedule Class
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 bg-white hover:bg-slate-50 hover:border-amber-300 transition-colors"
                  onClick={() => toast.info('Upload Syllabus', { description: 'Syllabus upload feature coming soon!' })}
                >
                    <FileText className="mr-3 h-5 w-5 text-amber-500" /> Upload Syllabus
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 bg-white hover:bg-slate-50 hover:border-emerald-300 transition-colors"
                  onClick={() => toast.info('Manage Faculty', { description: 'Faculty management coming soon!' })}
                >
                    <Users className="mr-3 h-5 w-5 text-emerald-500" /> Manage Faculty
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 bg-white hover:bg-slate-50 hover:border-red-300 transition-colors"
                  onClick={() => toast.warning('Send Alert', { description: 'Notification system coming soon!' })}
                >
                    <AlertCircle className="mr-3 h-5 w-5 text-red-500" /> Send Alert
                </Button>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}