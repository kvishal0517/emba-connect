import React from 'react';
import { Link, useLocation } from 'react-router';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from './ui/utils';

interface BreadcrumbItem {
  label: string;
  path: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const location = useLocation();
  
  // Auto-generate breadcrumbs from URL if not provided
  const generatedItems: BreadcrumbItem[] = items || generateBreadcrumbs(location.pathname);

  return (
    <nav className={cn('flex items-center space-x-2 text-sm text-slate-500', className)} aria-label="Breadcrumb">
      <Link 
        to="/" 
        className="flex items-center hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {generatedItems.map((item, index) => {
        const isLast = index === generatedItems.length - 1;
        
        return (
          <React.Fragment key={item.path}>
            <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-700" />
            {isLast ? (
              <span className="font-medium text-slate-900 dark:text-slate-100" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link 
                to={item.path} 
                className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

// Auto-generate breadcrumbs from pathname
function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const paths = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  let currentPath = '';
  
  paths.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Capitalize and format the label
    const label = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    breadcrumbs.push({
      label,
      path: currentPath
    });
  });

  return breadcrumbs;
}

// Helper function to create custom breadcrumbs
export function createBreadcrumbs(...items: Array<[string, string]>): BreadcrumbItem[] {
  return items.map(([label, path]) => ({ label, path }));
}
