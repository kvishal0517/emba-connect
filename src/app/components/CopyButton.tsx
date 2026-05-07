import React, { useState } from 'react';
import { Button } from './ui/button';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from './ui/utils';

interface CopyButtonProps {
  text: string;
  label?: string;
  successMessage?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function CopyButton({ 
  text, 
  label = 'Copy',
  successMessage = 'Copied to clipboard!',
  variant = 'outline',
  size = 'sm',
  className 
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(successMessage);
      
      // Reset after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      toast.error('Failed to copy', {
        description: 'Please try selecting and copying manually.'
      });
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      className={cn(
        'transition-all',
        copied && 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100',
        className
      )}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 mr-1" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="h-4 w-4 mr-1" />
          {label}
        </>
      )}
    </Button>
  );
}

// Inline copy button (just icon, no text)
export function CopyIconButton({ text, successMessage }: { text: string; successMessage?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(successMessage || 'Copied!');
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={cn(
        'inline-flex items-center justify-center p-1 rounded hover:bg-slate-100 transition-colors',
        copied && 'text-green-600'
      )}
      title="Copy to clipboard"
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
    </button>
  );
}
