"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { 
  TrendingUp, 
  Calendar, 
  BarChart3, 
  Download,
  Building2,
  FileSpreadsheet,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ReportData {
  totalRevenue: number;
  monthlyRevenue: number;
  totalBookings: number;
  monthlyBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  facilities: number;
  typeStats: Array<{ type: string; count: number; revenue: number }>;
  recentBookings: Array<{
    id: string;
    code: string;
    status: string;
    customerName: string;
    createdAt: string;
    totalAmount: number;
    facility: { name: string };
  }>;
  monthlyTrends: Array<{ month: string; bookings: number; revenue: number }>;
}

export default function AdminReportsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ReportData | null>(null);
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();
  const now = new Date();

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/reports');
      if (response.ok) {
        const reportData = await response.json();
        setData(reportData);
      } else {
        throw new Error('Failed to fetch report data');
      }
    } catch (error) {
      console.error('Report fetch error:', error);
      toast({
        title: "Error",
        description: "Failed to load report data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type: 'bookings' | 'summary' = 'bookings') => {
    setExporting(true);
    try {
      const url = `/api/admin/export${type === 'summary' ? '?type=summary' : ''}`;
      
      // Use fetch with credentials to maintain session
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Export API error:', errorData);
        throw new Error(errorData.error || 'Export failed');
      }

      // Get the blob data
      const blob = await response.blob();
      
      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition
        ? (contentDisposition.split('filename=')[1]?.replace(/"/g, '') || `${type}-export-${new Date().toISOString().split('T')[0]}.csv`)
        : `${type}-export-${new Date().toISOString().split('T')[0]}.csv`;

      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      toast({
        title: "Export Successful",
        description: `Downloaded ${filename}`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Error",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading report data...</p>
        </div>
      </div>
    );
  }

  // Chart configurations
  const monthlyTrendsChart = {
    labels: data.monthlyTrends.map(t => t.month),
    datasets: [
      {
        label: 'Bookings',
        data: data.monthlyTrends.map(t => t.bookings),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y',
      },
      {
        label: 'Revenue (₱)',
        data: data.monthlyTrends.map(t => t.revenue),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y1',
      },
    ],
  };

  const revenueByTypeChart = {
    labels: data.typeStats.map(s => s.type),
    datasets: [
      {
        label: 'Revenue (₱)',
        data: data.typeStats.map(s => s.revenue),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(251, 146, 60, 0.8)',
        ],
      },
    ],
  };

  const bookingsByTypeChart = {
    labels: data.typeStats.map(s => s.type),
    datasets: [
      {
        data: data.typeStats.map(s => s.count),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(251, 146, 60, 0.8)',
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
    },
  };

  const dualAxisOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Bookings',
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Revenue (₱)',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
              <p className="text-muted-foreground mt-1">
                {format(now, "MMMM yyyy")} Overview
              </p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                size="lg"
                className="hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer border-2 font-semibold"
                asChild
              >
                <Link href="/admin">Back to Dashboard</Link>
              </Button>
              <Button 
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer font-bold"
                asChild
              >
                <Link href="/api/admin/export">
                  <Download className="h-5 w-5 mr-2" />
                  Export CSV
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-2 border-purple-200 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-2xl font-bold text-purple-600">₱</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₱{data.totalRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₱{data.monthlyRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {data.monthlyBookings} bookings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalBookings}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {data.confirmedBookings} confirmed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Facilities</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.facilities}</div>
              <p className="text-xs text-muted-foreground mt-1">Available for booking</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly Trends Chart */}
          <Card>
            <CardHeader>
              <CardTitle>6-Month Trends</CardTitle>
              <CardDescription>Bookings and revenue over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <Line data={monthlyTrendsChart} options={dualAxisOptions} />
              </div>
            </CardContent>
          </Card>

          {/* Revenue by Type Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Facility Type</CardTitle>
              <CardDescription>Total earnings by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <Bar data={revenueByTypeChart} options={chartOptions} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Bookings by Type Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Bookings Distribution</CardTitle>
              <CardDescription>Breakdown by facility type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center">
                <div className="w-[280px] h-[280px]">
                  <Doughnut 
                    data={bookingsByTypeChart} 
                    options={{
                      ...chartOptions,
                      plugins: {
                        ...chartOptions.plugins,
                        legend: {
                          display: true,
                          position: 'bottom' as const,
                        },
                      },
                    }} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Type Stats Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Statistics</CardTitle>
              <CardDescription>Bookings and revenue by type</CardDescription>
            </CardHeader>
            <CardContent>
              {data.typeStats.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No data available</p>
              ) : (
                <div className="space-y-4">
                  {data.typeStats.map((stat, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <BarChart3 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{stat.type}</p>
                          <p className="text-sm text-muted-foreground">
                            {stat.count} bookings
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₱{stat.revenue.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Booking Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Status</CardTitle>
              <CardDescription>Current booking distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="default">Confirmed</Badge>
                    <span className="text-sm text-muted-foreground">Active bookings</span>
                  </div>
                  <span className="font-bold">{data.confirmedBookings}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">Cancelled</Badge>
                    <span className="text-sm text-muted-foreground">Cancelled bookings</span>
                  </div>
                  <span className="font-bold">{data.cancelledBookings}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Total</Badge>
                    <span className="text-sm text-muted-foreground">All bookings</span>
                  </div>
                  <span className="font-bold">{data.totalBookings}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export Options */}
          <Card>
            <CardHeader>
              <CardTitle>Export Reports</CardTitle>
              <CardDescription>Download detailed or summary reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button 
                  onClick={() => handleExport('bookings')}
                  disabled={exporting}
                  className="w-full"
                  size="lg"
                >
                  <Download className="h-5 w-5 mr-2" />
                  {exporting ? 'Exporting...' : 'Export Detailed Report (CSV)'}
                </Button>
                <Button 
                  onClick={() => handleExport('summary')}
                  disabled={exporting}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <FileSpreadsheet className="h-5 w-5 mr-2" />
                  Export Summary Report (CSV)
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Detailed report includes 21 fields with reviews and payment data
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>Latest 10 reservations</CardDescription>
          </CardHeader>
          <CardContent>
            {data.recentBookings.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No bookings yet</p>
            ) : (
              <div className="space-y-3">
                {data.recentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between border-b pb-3 last:border-0"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">{booking.code}</p>
                        <Badge
                          variant={
                            booking.status === "CONFIRMED"
                              ? "default"
                              : booking.status === "CANCELLED"
                              ? "destructive"
                              : "outline"
                          }
                        >
                          {booking.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {booking.facility.name} • {booking.customerName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(booking.createdAt, "MMM dd, yyyy")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        ₱{Number(booking.totalAmount).toLocaleString()}
                      </p>
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
