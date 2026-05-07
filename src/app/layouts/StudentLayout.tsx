import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { 
  LayoutDashboard, 
  Calendar, 
  BookOpen, 
  Users, 
  FileText, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Bell,
  GraduationCap,
  CalendarDays,
  StickyNote,
  Bot,
  Clock
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { db } from '@/app/lib/db';
import { cn } from '@/app/lib/utils';
import AIChatbot from '@/app/components/AIChatbot';
import { toast } from 'sonner';
import { ThemeToggleCompact } from '@/app/components/ThemeToggle';
import { CommandPalette } from '@/app/components/CommandPalette';
import { KeyboardShortcutsHelp } from '@/app/components/KeyboardShortcuts';

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/student/dashboard' },
  { icon: Calendar, label: 'Schedule', path: '/student/schedule' },
  { icon: FileText, label: 'Assignments', path: '/student/assignments' },
  { icon: CalendarDays, label: 'Calendar', path: '/student/calendar' },
  { icon: BookOpen, label: 'Syllabus', path: '/student/syllabus' },
  { icon: Users, label: 'Professors', path: '/student/professors' },
  { icon: StickyNote, label: 'Notes', path: '/student/notes' },
  { icon: Settings, label: 'Settings', path: '/student/settings' },
];

export default function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [user, setUser] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Load user data
  useEffect(() => {
    async function loadUser() {
      try {
        const userData = await db.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Error loading user:', error);
      }
    }
    loadUser();
  }, []);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    toast.success("Logged out successfully");
    navigate('/login');
  };

  // Format time for IST
  const istTime = currentTime.toLocaleTimeString('en-US', { 
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  // Format time for EST
  const estTime = currentTime.toLocaleTimeString('en-US', { 
    timeZone: 'America/New_York',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100">
      {/* Command Palette */}
      <CommandPalette role="student" />
      
      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp />

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-slate-950 dark:bg-slate-950 text-white transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 border-r border-slate-800",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between h-16 px-6 bg-slate-900/50">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-amber-500">
            <GraduationCap className="h-6 w-6" />
            <span>EMBA Connect</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="px-4 py-6">
            <div className="flex items-center gap-3 mb-8 px-2">
                <Avatar className="h-10 w-10 border-2 border-slate-700">
                    <AvatarImage src={user?.profilePicture || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=150&h=150"} />
                    <AvatarFallback>{user?.name?.split(' ').map(n => n[0]).join('') || 'ST'}</AvatarFallback>
                </Avatar>
                <div className="overflow-hidden">
                    <p className="text-sm font-medium truncate">{user?.name || 'Student'}</p>
                    <p className="text-xs text-slate-400 truncate">Executive MBA</p>
                </div>
            </div>

            <nav className="space-y-1">
                {sidebarItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                isActive 
                                    ? "bg-amber-500 text-slate-900 font-bold shadow-lg shadow-amber-500/20" 
                                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                            )}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <item.icon className={cn("h-5 w-5", isActive ? "text-slate-900" : "text-slate-400")} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-slate-900/50 border-t border-slate-800">
            <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-colors w-full"
            >
                <LogOut className="h-5 w-5" />
                Sign Out
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 lg:px-8 shadow-sm z-30">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Timezone Display */}
          <div className="hidden md:flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="font-medium">IST: {istTime}</span>
            </div>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700"></div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="font-medium">EST: {estTime}</span>
            </div>
          </div>

          <div className="flex-1 flex justify-end items-center gap-4">
            {/* Theme Toggle */}
            <ThemeToggleCompact />

            <Button variant="ghost" size="icon" className="relative text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-white dark:border-slate-800"></span>
            </Button>
            
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
            
            <Avatar className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-slate-900 dark:hover:ring-amber-500 transition-all">
                <AvatarImage src={user?.profilePicture || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=150&h=150"} />
                <AvatarFallback>{user?.name?.split(' ').map(n => n[0]).join('') || 'ST'}</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 p-4 lg:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto space-y-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* AI Chatbot */}
      <AIChatbot />
    </div>
  );
}