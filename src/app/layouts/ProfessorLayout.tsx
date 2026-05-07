import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { BookOpen, Home, Calendar, Users, FileText, LogOut, MessageSquare, GraduationCap } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { toast } from 'sonner';

export default function ProfessorLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    toast.success("Logged out successfully");
    navigate('/login');
  };

  const navItems = [
    { path: '/professor/dashboard', label: 'Dashboard', icon: Home },
    { path: '/professor/courses', label: 'My Courses', icon: BookOpen },
    { path: '/professor/schedule', label: 'Schedule', icon: Calendar },
    { path: '/professor/students', label: 'Students', icon: Users },
    { path: '/professor/grades', label: 'Grades', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-900 text-white flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-blue-800">
          <div className="flex items-center gap-3">
            <div className="bg-amber-400 p-2 rounded-lg">
              <BookOpen className="h-5 w-5 text-blue-900" />
            </div>
            <div>
              <h1 className="font-bold text-lg">EMBA Connect</h1>
              <p className="text-xs text-blue-200">Professor Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-amber-400 text-blue-900 font-semibold shadow-lg'
                    : 'text-blue-100 hover:bg-blue-800'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-blue-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="bg-blue-800 p-2 rounded-full">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">Dr. Sarah Johnson</p>
              <p className="text-xs text-blue-200">Professor</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full bg-transparent border-blue-700 text-white hover:bg-blue-800 hover:text-white"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
