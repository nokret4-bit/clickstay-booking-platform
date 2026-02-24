"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Activity, ArrowLeft, User, FileText, LogIn, UserPlus, Edit, Trash2, CheckCircle, XCircle, Clock, Download } from "lucide-react";
import { format } from "date-fns";

interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  createdAt: string;
  data: any;
  user: {
    name: string;
    email: string;
  } | null;
}

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");

  useEffect(() => {
    fetchLogs();
    // Set default month to current month
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    setSelectedMonth(currentMonth);
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await fetch("/api/admin/activity-logs");
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!selectedMonth) {
      alert("Please select a month to export");
      return;
    }

    setExporting(true);
    try {
      const response = await fetch(`/api/admin/activity-logs/export?month=${selectedMonth}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const filename = response.headers.get("Content-Disposition")?.split("filename=")[1]?.replace(/"/g, "") || `Activity-Logs-${selectedMonth}.csv`;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert("Failed to export activity logs");
      }
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export activity logs");
    } finally {
      setExporting(false);
    }
  };

  // Generate month options (last 12 months)
  const generateMonthOptions = () => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const label = format(date, "MMMM yyyy");
      options.push({ value, label });
    }
    return options;
  };

  const monthOptions = generateMonthOptions();

  const getActionColor = (action: string): "default" | "secondary" | "destructive" | "outline" => {
    if (action.includes("CHECKIN")) return "default";
    if (action.includes("CHECKOUT")) return "outline";
    if (action.includes("CREATE")) return "default";
    if (action.includes("UPDATE")) return "secondary";
    if (action.includes("DELETE")) return "destructive";
    if (action.includes("LOGIN")) return "outline";
    return "secondary";
  };

  const getActionIcon = (action: string) => {
    if (action.includes("CHECKIN")) return <CheckCircle className="h-4 w-4" />;
    if (action.includes("CHECKOUT")) return <XCircle className="h-4 w-4" />;
    if (action.includes("CREATE")) return <UserPlus className="h-4 w-4" />;
    if (action.includes("UPDATE")) return <Edit className="h-4 w-4" />;
    if (action.includes("DELETE")) return <Trash2 className="h-4 w-4" />;
    if (action.includes("LOGIN")) return <LogIn className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  const getActionBgColor = (action: string) => {
    if (action.includes("CHECKIN")) return "bg-green-50 border-green-200";
    if (action.includes("CHECKOUT")) return "bg-blue-50 border-blue-200";
    if (action.includes("CREATE")) return "bg-emerald-50 border-emerald-200";
    if (action.includes("UPDATE")) return "bg-amber-50 border-amber-200";
    if (action.includes("DELETE")) return "bg-red-50 border-red-200";
    if (action.includes("LOGIN")) return "bg-indigo-50 border-indigo-200";
    return "bg-gray-50 border-gray-200";
  };

  const getIconBgColor = (action: string) => {
    if (action.includes("CHECKIN")) return "bg-green-100 text-green-600";
    if (action.includes("CHECKOUT")) return "bg-blue-100 text-blue-600";
    if (action.includes("CREATE")) return "bg-emerald-100 text-emerald-600";
    if (action.includes("UPDATE")) return "bg-amber-100 text-amber-600";
    if (action.includes("DELETE")) return "bg-red-100 text-red-600";
    if (action.includes("LOGIN")) return "bg-indigo-100 text-indigo-600";
    return "bg-gray-100 text-gray-600";
  };

  const formatAction = (action: string) => {
    return action.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <Activity className="h-6 w-6 text-indigo-600" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Activity Logs</h1>
              </div>
              <p className="text-muted-foreground ml-13">Track all system activities and changes</p>
            </div>
            <Link href="/admin">
              <Button 
                variant="outline" 
                size="lg"
                className="hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer border-2 font-semibold"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <Card className="border-2 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold">System Activity</CardTitle>
                  <CardDescription className="text-sm">
                    Track all admin and staff actions (last 100 entries)
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg font-medium text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {monthOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <Button
                  onClick={handleExport}
                  disabled={exporting || !selectedMonth}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {exporting ? "Exporting..." : "Export CSV"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="text-center py-16">
                <div className="h-20 w-20 rounded-full bg-muted mx-auto flex items-center justify-center mb-4 animate-pulse">
                  <Activity className="h-10 w-10 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">Loading activity logs...</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-16">
                <div className="h-20 w-20 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
                  <FileText className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Activity Logs</h3>
                <p className="text-muted-foreground">Activity logs will appear here once actions are performed</p>
              </div>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className={`flex items-start gap-4 p-4 rounded-xl border-2 hover:shadow-lg transition-all duration-300 ${getActionBgColor(log.action)}`}
                  >
                    <div className="flex-shrink-0">
                      <div className={`h-11 w-11 rounded-xl flex items-center justify-center shadow-md ${getIconBgColor(log.action)}`}>
                        {getActionIcon(log.action)}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={getActionColor(log.action)} className="font-semibold px-3 py-1">
                          {formatAction(log.action)}
                        </Badge>
                        <span className="text-sm font-medium text-gray-600">
                          {log.entity}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-2">
                        {log.user && (
                          <div className="flex items-center gap-2 bg-white/60 px-3 py-1.5 rounded-lg">
                            <User className="h-4 w-4" />
                            <span className="font-medium">{log.user.name}</span>
                            <span className="text-xs">({log.user.email})</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 bg-white/60 px-3 py-1.5 rounded-lg">
                          <Clock className="h-4 w-4" />
                          <span className="font-medium">{format(new Date(log.createdAt), "MMM dd, yyyy")}</span>
                          <span className="text-xs">{format(new Date(log.createdAt), "HH:mm:ss")}</span>
                        </div>
                      </div>

                      {log.data && (
                        <details className="mt-3 group">
                          <summary className="text-sm font-medium text-indigo-600 cursor-pointer hover:text-indigo-700 flex items-center gap-2 select-none">
                            <span>View Details</span>
                            <span className="text-xs text-muted-foreground group-open:hidden">(click to expand)</span>
                            <span className="text-xs text-muted-foreground hidden group-open:inline">(click to collapse)</span>
                          </summary>
                          <div className="mt-3 p-4 bg-white rounded-lg border-2 border-gray-200 shadow-inner">
                            <pre className="text-xs font-mono overflow-auto max-h-64">
                              {JSON.stringify(log.data, null, 2)}
                            </pre>
                          </div>
                        </details>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
