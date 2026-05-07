import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Upload, File, X, CheckCircle } from 'lucide-react';
import { Progress } from '@/app/components/ui/progress';

interface FileUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
  title?: string;
  description?: string;
  acceptedTypes?: string;
}

export function FileUploadDialog({
  isOpen,
  onClose,
  onUpload,
  title = 'Upload Submission',
  description = 'Select a file to upload for your assignment submission.',
  acceptedTypes = '.pdf,.doc,.docx,.zip'
}: FileUploadDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 100);

    try {
      await onUpload(selectedFile);
      setUploadProgress(100);
      
      // Wait a bit to show completion
      setTimeout(() => {
        handleClose();
      }, 500);
    } catch (error) {
      console.error('Upload failed:', error);
      clearInterval(progressInterval);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setIsUploading(false);
    onClose();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver
                ? 'border-blue-500 bg-blue-50'
                : 'border-slate-300 bg-slate-50'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {!selectedFile ? (
              <>
                <Upload className="h-12 w-12 mx-auto mb-3 text-slate-400" />
                <p className="text-sm text-slate-600 mb-2">
                  Drag & drop your file here, or click to browse
                </p>
                <p className="text-xs text-slate-400">
                  Accepted formats: {acceptedTypes.replace(/\./g, '').toUpperCase()}
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept={acceptedTypes}
                  onChange={handleFileSelect}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Select File
                </Button>
              </>
            ) : (
              <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <File className="h-8 w-8 text-blue-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>
                {!isUploading && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                    className="flex-shrink-0 ml-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Uploading...</span>
                <span className="text-slate-900 font-medium">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {/* Success Message */}
          {uploadProgress === 100 && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <p className="text-sm text-green-700 font-medium">
                File uploaded successfully!
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="bg-blue-900 hover:bg-blue-800"
          >
            {isUploading ? 'Uploading...' : 'Upload Submission'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
