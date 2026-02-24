'use client';

import { useState, useCallback } from 'react';
import { Upload, X, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { uploadFile, validateFile } from '@/lib/file-upload';
import { cn } from '@/lib/utils';

interface IDUploadProps {
  label: string;
  onUpload: (url: string) => void;
  required?: boolean;
  className?: string;
  value?: string;
}

export function IDUpload({ 
  label, 
  onUpload, 
  required = false, 
  className, 
  value 
}: IDUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);

  const handleFile = useCallback(
    async (file: File) => {
      const validation = validateFile(file);
      if (!validation.valid) {
        setError(validation.error);
        return;
      }

      setError(null);
      setIsUploading(true);

      try {
        const result = await uploadFile(file);
        if (result.success && result.url) {
          setPreviewUrl(URL.createObjectURL(file));
          onUpload(result.url);
        } else {
          setError(result.error || 'Failed to upload file');
        }
      } catch (err) {
        console.error('Upload error:', err);
        setError('An error occurred while uploading');
      } finally {
        setIsUploading(false);
      }
    },
    [onUpload]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewUrl(null);
    onUpload('');
  };

  return (
    <div className={cn('space-y-2', className)}>
      <Label className="flex items-center">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
          isDragging 
            ? 'border-primary bg-primary/5' 
            : 'border-border hover:border-primary/50',
          previewUrl && 'border-green-500 bg-green-50/50',
          error && 'border-destructive/50 bg-destructive/5'
        )}
      >
        <input
          type="file"
          id={`file-upload-${label.toLowerCase().replace(/\s+/g, '-')}`}
          className="hidden"
          onChange={handleChange}
          accept="image/*,.pdf"
          disabled={isUploading}
        />
        
        {isUploading ? (
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">Uploading...</p>
          </div>
        ) : previewUrl ? (
          <div className="relative group">
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 rounded-md transition-opacity flex items-center justify-center">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={removeFile}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4 mr-1" /> Remove
              </Button>
            </div>
            <div className="flex flex-col items-center justify-center p-4">
              {previewUrl.endsWith('.pdf') ? (
                <div className="bg-muted p-4 rounded-md mb-2">
                  <span className="text-sm font-medium">PDF Document</span>
                </div>
              ) : (
                <div className="relative w-32 h-20 mb-2">
                  <img
                    src={previewUrl}
                    alt="Uploaded ID"
                    className="w-full h-full object-contain rounded-md"
                  />
                </div>
              )}
              <div className="flex items-center text-green-600 text-sm">
                <Check className="h-4 w-4 mr-1" />
                <span>Uploaded</span>
              </div>
            </div>
          </div>
        ) : (
          <label
            htmlFor={`file-upload-${label.toLowerCase().replace(/\s+/g, '-')}`}
            className="cursor-pointer flex flex-col items-center justify-center space-y-2"
          >
            <Upload className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">
                <span className="text-primary font-medium">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">
                JPG, PNG, or PDF (max 5MB)
              </p>
            </div>
          </label>
        )}
      </div>
      
      {error && (
        <div className="flex items-center text-destructive text-sm">
          <AlertCircle className="h-4 w-4 mr-1" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
