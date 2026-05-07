"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: 'bg-white border-slate-200 shadow-lg',
          title: 'text-slate-900 font-semibold',
          description: 'text-slate-600',
          actionButton: 'bg-blue-900 text-white',
          cancelButton: 'bg-slate-100 text-slate-900',
          closeButton: 'bg-white border-slate-200 text-slate-500 hover:text-slate-900',
          success: 'bg-white border-green-200 shadow-lg',
          error: 'bg-white border-red-200 shadow-lg',
          warning: 'bg-white border-amber-200 shadow-lg',
          info: 'bg-white border-blue-200 shadow-lg',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
