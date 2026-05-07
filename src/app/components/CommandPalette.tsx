import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from './ui/command';
import {
  LayoutDashboard,
  Calendar,
  FileText,
  BookOpen,
  Users,
  Settings,
  CalendarDays,
  StickyNote,
  Search,
  Moon,
  Sun,
} from 'lucide-react';

interface CommandItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path?: string;
  action?: () => void;
  keywords?: string[];
}

interface CommandPaletteProps {
  role?: 'student' | 'admin' | 'professor';
}

export function CommandPalette({ role = 'student' }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Define commands based on role
  const getCommands = (): CommandItem[] => {
    const baseCommands: CommandItem[] = [];

    if (role === 'student') {
      return [
        {
          id: 'dashboard',
          label: 'Go to Dashboard',
          icon: LayoutDashboard,
          path: '/student/dashboard',
          keywords: ['home', 'overview']
        },
        {
          id: 'schedule',
          label: 'View Schedule',
          icon: Calendar,
          path: '/student/schedule',
          keywords: ['classes', 'timetable']
        },
        {
          id: 'assignments',
          label: 'View Assignments',
          icon: FileText,
          path: '/student/assignments',
          keywords: ['homework', 'tasks', 'submissions']
        },
        {
          id: 'calendar',
          label: 'Open Calendar',
          icon: CalendarDays,
          path: '/student/calendar',
          keywords: ['dates', 'events']
        },
        {
          id: 'syllabus',
          label: 'View Syllabus',
          icon: BookOpen,
          path: '/student/syllabus',
          keywords: ['courses', 'curriculum']
        },
        {
          id: 'professors',
          label: 'View Professors',
          icon: Users,
          path: '/student/professors',
          keywords: ['faculty', 'instructors', 'teachers']
        },
        {
          id: 'notes',
          label: 'My Notes',
          icon: StickyNote,
          path: '/student/notes',
          keywords: ['write', 'notebook']
        },
        {
          id: 'settings',
          label: 'Settings',
          icon: Settings,
          path: '/student/settings',
          keywords: ['preferences', 'account']
        },
      ];
    } else if (role === 'admin') {
      return [
        {
          id: 'dashboard',
          label: 'Admin Dashboard',
          icon: LayoutDashboard,
          path: '/admin/dashboard',
          keywords: ['home', 'overview']
        },
        {
          id: 'classes',
          label: 'Manage Classes',
          icon: Calendar,
          path: '/admin/classes',
          keywords: ['schedule', 'sessions']
        },
        {
          id: 'assignments',
          label: 'Manage Assignments',
          icon: FileText,
          path: '/admin/assignments',
          keywords: ['homework', 'tasks']
        },
        {
          id: 'users',
          label: 'User Management',
          icon: Users,
          path: '/admin/users',
          keywords: ['students', 'professors', 'accounts']
        },
        {
          id: 'settings',
          label: 'System Settings',
          icon: Settings,
          path: '/admin/settings',
          keywords: ['preferences', 'configuration']
        },
      ];
    }

    return baseCommands;
  };

  const commands = getCommands();

  // Listen for Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = (command: CommandItem) => {
    setOpen(false);
    if (command.action) {
      command.action();
    } else if (command.path) {
      navigate(command.path);
    }
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          {commands.map((command) => {
            const Icon = command.icon;
            return (
              <CommandItem
                key={command.id}
                value={command.label + ' ' + (command.keywords?.join(' ') || '')}
                onSelect={() => runCommand(command)}
              >
                <Icon className="mr-2 h-4 w-4" />
                <span>{command.label}</span>
                {command.path === location.pathname && (
                  <span className="ml-auto text-xs text-slate-500">Current</span>
                )}
              </CommandItem>
            );
          })}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem
            onSelect={() => {
              setOpen(false);
              const theme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
              if (theme === 'dark') {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
              localStorage.setItem('theme', theme);
            }}
          >
            {document.documentElement.classList.contains('dark') ? (
              <>
                <Sun className="mr-2 h-4 w-4" />
                <span>Switch to Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="mr-2 h-4 w-4" />
                <span>Switch to Dark Mode</span>
              </>
            )}
          </CommandItem>
        </CommandGroup>
      </CommandList>
      <div className="border-t border-slate-200 dark:border-slate-800 p-2 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
        <span>Press ESC to close</span>
        <span className="flex items-center gap-1">
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 px-1.5 font-mono text-[10px] font-medium text-slate-600 dark:text-slate-300">
            <span className="text-xs">⌘</span>K
          </kbd>
          <span>to toggle</span>
        </span>
      </div>
    </CommandDialog>
  );
}

// Hook to trigger command palette programmatically
export function useCommandPalette() {
  const triggerCommand = () => {
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
      bubbles: true,
    });
    document.dispatchEvent(event);
  };

  return { triggerCommand };
}
