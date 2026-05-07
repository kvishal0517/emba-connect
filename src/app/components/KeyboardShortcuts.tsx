import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Keyboard } from 'lucide-react';

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

const shortcuts: Shortcut[] = [
  // Navigation
  { keys: ['⌘', 'K'], description: 'Open command palette', category: 'Navigation' },
  { keys: ['ESC'], description: 'Close dialogs/modals', category: 'Navigation' },
  
  // General
  { keys: ['?'], description: 'Show keyboard shortcuts', category: 'General' },
  { keys: ['⌘', 'S'], description: 'Save (where applicable)', category: 'General' },
  
  // Theme
  { keys: ['⌘', 'D'], description: 'Toggle dark mode', category: 'Theme' },
];

export function KeyboardShortcutsHelp() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // Listen for '?' key
      if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
        // Only trigger if not in an input field
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          setOpen(true);
        }
      }

      // Listen for Cmd+D or Ctrl+D for dark mode toggle
      if (e.key === 'd' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        const theme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, Shortcut[]>);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Speed up your workflow with these keyboard shortcuts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
                {category}
              </h3>
              <div className="space-y-2">
                {categoryShortcuts.map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {shortcut.description}
                    </span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <React.Fragment key={keyIndex}>
                          <kbd className="pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 px-2 font-mono text-xs font-medium text-slate-700 dark:text-slate-300">
                            {key}
                          </kbd>
                          {keyIndex < shortcut.keys.length - 1 && (
                            <span className="text-slate-400">+</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            <strong className="text-slate-600 dark:text-slate-300">Tip:</strong> Press{' '}
            <kbd className="px-1.5 py-0.5 text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded">?</kbd>
            {' '}anytime to view this help dialog
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper component to show shortcut hints inline
export function KeyboardHint({ keys }: { keys: string[] }) {
  return (
    <div className="flex items-center gap-1 text-xs text-slate-400">
      {keys.map((key, index) => (
        <React.Fragment key={index}>
          <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded font-mono text-[10px]">
            {key}
          </kbd>
          {index < keys.length - 1 && <span>+</span>}
        </React.Fragment>
      ))}
    </div>
  );
}
