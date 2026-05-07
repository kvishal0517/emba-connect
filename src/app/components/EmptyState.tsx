import React from 'react';
import { Button } from './ui/button';
import { 
  FileQuestion, 
  Calendar, 
  FileText, 
  Users, 
  BookOpen, 
  Search,
  Inbox,
  AlertCircle,
  LucideIcon
} from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="rounded-full bg-slate-100 p-6 mb-4">
        <Icon className="h-12 w-12 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>
      {(actionLabel || secondaryActionLabel) && (
        <div className="flex gap-3">
          {actionLabel && onAction && (
            <Button onClick={onAction} className="bg-slate-900 hover:bg-slate-800">
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button onClick={onSecondaryAction} variant="outline">
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Preset Empty States for common scenarios
export function NoClassesEmpty({ onScheduleClass }: { onScheduleClass?: () => void }) {
  return (
    <EmptyState
      icon={Calendar}
      title="No Classes Scheduled"
      description="There are no upcoming classes on your schedule. Check back later or contact your administrator."
      actionLabel={onScheduleClass ? "Schedule a Class" : undefined}
      onAction={onScheduleClass}
    />
  );
}

export function NoAssignmentsEmpty({ onCreateAssignment }: { onCreateAssignment?: () => void }) {
  return (
    <EmptyState
      icon={FileText}
      title="No Assignments Yet"
      description="You're all caught up! There are no pending assignments at this time."
      actionLabel={onCreateAssignment ? "Create Assignment" : undefined}
      onAction={onCreateAssignment}
    />
  );
}

export function NoResourcesEmpty({ onUploadResource }: { onUploadResource?: () => void }) {
  return (
    <EmptyState
      icon={BookOpen}
      title="No Resources Available"
      description="Course materials and resources will appear here once your professor uploads them."
      actionLabel={onUploadResource ? "Upload Resource" : undefined}
      onAction={onUploadResource}
    />
  );
}

export function NoProfessorsEmpty() {
  return (
    <EmptyState
      icon={Users}
      title="No Professors Found"
      description="There are no professors assigned to your courses yet."
    />
  );
}

export function NoSearchResultsEmpty({ searchQuery, onClearSearch }: { searchQuery?: string; onClearSearch?: () => void }) {
  return (
    <EmptyState
      icon={Search}
      title="No Results Found"
      description={searchQuery ? `No results match "${searchQuery}". Try adjusting your search.` : "No results found for your search."}
      actionLabel={onClearSearch ? "Clear Search" : undefined}
      onAction={onClearSearch}
    />
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <EmptyState
      icon={AlertCircle}
      title="Something Went Wrong"
      description={message || "We encountered an error loading this content. Please try again."}
      actionLabel={onRetry ? "Try Again" : undefined}
      onAction={onRetry}
    />
  );
}
