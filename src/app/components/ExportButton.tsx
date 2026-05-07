import React from 'react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from './ui/dropdown-menu';
import { Download, FileText, Table } from 'lucide-react';
import { toast } from 'sonner';

interface ExportButtonProps {
  onExportPDF: () => void;
  onExportCSV: () => void;
  label?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

export function ExportButton({
  onExportPDF,
  onExportCSV,
  label = 'Export',
  variant = 'outline',
  size = 'default'
}: ExportButtonProps) {
  const handleExportPDF = () => {
    try {
      onExportPDF();
      toast.success('PDF Downloaded', {
        description: 'Your file has been downloaded successfully.'
      });
    } catch (error) {
      toast.error('Export Failed', {
        description: 'Failed to generate PDF. Please try again.'
      });
    }
  };

  const handleExportCSV = () => {
    try {
      onExportCSV();
      toast.success('CSV Downloaded', {
        description: 'Your file has been downloaded successfully.'
      });
    } catch (error) {
      toast.error('Export Failed', {
        description: 'Failed to generate CSV. Please try again.'
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size}>
          <Download className="h-4 w-4 mr-2" />
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Export Format</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleExportPDF}>
          <FileText className="h-4 w-4 mr-2" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportCSV}>
          <Table className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
