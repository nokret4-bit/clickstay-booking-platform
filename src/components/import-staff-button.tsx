"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { Upload, X, Download, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface ImportResult {
  success?: boolean;
  error?: string;
  summary?: {
    total: number;
    successful: number;
    failed: number;
  };
  successfulImports?: Array<{
    name: string;
    email: string;
    role: string;
    status: string;
  }>;
  errors?: string[];
}

export function ImportStaffButton() {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  const downloadTemplate = () => {
    // Create a sample template
    const template = `Name,Email,Password,Role,IsActive
John Doe,john@example.com,SecurePass123,STAFF,true
Jane Smith,jane@example.com,SecurePass456,ADMIN,true`;

    const blob = new Blob([template], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "staff-import-template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls") || file.name.endsWith(".csv")) {
        setSelectedFile(file);
      } else {
        toast({
          title: "Invalid file",
          description: "Please upload an Excel or CSV file",
          variant: "destructive",
        });
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a file",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/admin/staff/import", {
        method: "POST",
        body: formData,
      });

      const data: ImportResult = await response.json();

      if (response.ok) {
        setResult(data);
        if (data.summary) {
          toast({
            title: "Import Completed",
            description: `Successfully imported ${data.summary.successful} out of ${data.summary.total} staff members.`,
          });
          
          if (data.summary.successful > 0) {
            setTimeout(() => {
              router.refresh();
            }, 1500);
          }
        }
      } else {
        toast({
          title: "Error",
          description: data?.error || "Failed to import staff",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while importing",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShowForm(false);
    setSelectedFile(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (!showForm) {
    return (
      <Button 
        onClick={() => setShowForm(true)}
        className="bg-green-600 hover:bg-green-700 text-white font-medium"
      >
        <Upload className="h-4 w-4 mr-2" />
        Import from Excel
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-green-900">Import Staff Members</CardTitle>
              <CardDescription className="text-green-700">
                Upload an Excel or CSV file to import multiple staff accounts
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              disabled={loading}
              className="hover:bg-green-200"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {result ? (
            <div className="space-y-6">
              {/* Summary */}
              {result.summary && (
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-600 font-semibold">Total Records</p>
                  <p className="text-2xl font-bold text-blue-900">{result.summary.total}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-600 font-semibold">Successfully Imported</p>
                  <p className="text-2xl font-bold text-green-900">{result.summary.successful}</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm text-red-600 font-semibold">Failed</p>
                  <p className="text-2xl font-bold text-red-900">{result.summary.failed}</p>
                </div>
              </div>
              )}

              {/* Success Messages */}
              {result.successfulImports && result.successfulImports.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold text-green-900">Successfully Created</h3>
                  </div>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {result.successfulImports.map((item, idx) => (
                      <div key={idx} className="p-3 bg-green-50 rounded border border-green-200">
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">{item.email}</p>
                        <p className="text-xs text-green-600 font-semibold">{item.role} • {item.status}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Error Messages */}
              {result.errors && result.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <div className="ml-2">
                    <AlertDescription className="font-semibold">Failed Imports</AlertDescription>
                    <div className="mt-2 space-y-1 text-sm">
                      {result.errors.slice(0, 5).map((error, idx) => (
                        <p key={idx}>{error}</p>
                      ))}
                      {result.errors.length > 5 && (
                        <p className="text-xs text-gray-500 mt-2">
                          ... and {result.errors.length - 5} more errors
                        </p>
                      )}
                    </div>
                  </div>
                </Alert>
              )}

              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={handleClose}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Done
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* File Drop Area */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                  dragActive
                    ? "border-green-500 bg-green-50"
                    : "border-gray-300 bg-gray-50"
                }`}
              >
                <Input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                />
                <Upload className={`h-12 w-12 mx-auto mb-4 ${dragActive ? "text-green-600" : "text-gray-400"}`} />
                <p className="font-semibold text-gray-900 mb-2">
                  {selectedFile ? selectedFile.name : "Drop your file here or click to browse"}
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Supported: Excel (.xlsx, .xls) or CSV files
                </p>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className="font-medium"
                >
                  Select File
                </Button>
              </div>

              {/* Template Help */}
              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="ml-2 text-blue-900">
                  <p className="font-semibold mb-2">File Requirements:</p>
                  <ul className="text-sm space-y-1">
                    <li>• Required columns: Name, Email, Password, Role</li>
                    <li>• Password must be at least 8 characters</li>
                    <li>• Role must be "ADMIN" or "STAFF"</li>
                    <li>• Email must be unique in the system</li>
                  </ul>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadTemplate}
                    className="mt-3 bg-white"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                </AlertDescription>
              </Alert>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={handleSubmit}
                  disabled={!selectedFile || loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 font-semibold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Import Data
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={loading}
                  className="px-6 font-medium"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
