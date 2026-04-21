"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { 
  TrendingUp, 
  TrendingDown,
  Calendar, 
  Download,
  Building2,
  FileSpreadsheet,
  Loader2,
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
  Home,
  Palmtree,
  Landmark,
  ArrowUpRight,
  ArrowLeft,
} from "lucide-react";
import { format } from "date-fns";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface FacilityStat {
  facilityId: string;
  facilityName: string;
  type: string;
  count: number;
  revenue: number;
}

interface ReportData {
  totalRevenue: number;
  monthlyRevenue: number;
  totalBookings: number;
  monthlyBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  facilities: number;
  typeStats: Array<{ type: string; count: number; revenue: number }>;
  facilityStats: FacilityStat[];
  recentBookings: Array<{
    id: string;
    code: string;
    status: string;
    customerName: string;
    createdAt: string;
    totalAmount: number;
    facility: { name: string; kind: string };
  }>;
  monthlyTrends: Array<{ month: string; bookings: number; revenue: number }>;
}

const typeLabels: Record<string, string> = {
  ROOM: "Room",
  COTTAGE: "Cottage",
  HALL: "Function Hall",
};

const typeIcons: Record<string, typeof Home> = {
  ROOM: Home,
  COTTAGE: Palmtree,
  HALL: Landmark,
};

const typeColors: Record<string, string> = {
  ROOM: "bg-blue-100 text-blue-700 border-blue-200",
  COTTAGE: "bg-emerald-100 text-emerald-700 border-emerald-200",
  HALL: "bg-amber-100 text-amber-700 border-amber-200",
};

const typeAccentColors: Record<string, string> = {
  ROOM: "bg-blue-500",
  COTTAGE: "bg-emerald-500",
  HALL: "bg-amber-500",
};

export default function AdminReportsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ReportData | null>(null);
  const [exporting, setExporting] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [reportType, setReportType] = useState<'month' | 'year'>('month');
  const { toast } = useToast();
  const now = new Date();

  useEffect(() => {
    fetchReportData();
    // Set default month to current month
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    setSelectedMonth(currentMonth);
    setSelectedYear(now.getFullYear().toString());
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

  // Generate month options (last 12 months)
  const generateMonthOptions = () => {
    const options = [];
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const label = format(date, "MMMM yyyy");
      options.push({ value, label });
    }
    return options;
  };

  // Generate year options (last 5 years)
  const generateYearOptions = () => {
    const options = [];
    for (let i = 0; i < 5; i++) {
      const year = now.getFullYear() - i;
      options.push({ value: year.toString(), label: year.toString() });
    }
    return options;
  };

  const monthOptions = generateMonthOptions();
  const yearOptions = generateYearOptions();

  const handleExport = async (type: 'bookings' | 'summary' | 'report' = 'bookings') => {
    if (type === 'report' && reportType === 'month' && !selectedMonth) {
      toast({
        title: "Error",
        description: "Please select a month to export",
        variant: "destructive",
      });
      return;
    }
    
    if (type === 'report' && reportType === 'year' && !selectedYear) {
      toast({
        title: "Error",
        description: "Please select a year to export",
        variant: "destructive",
      });
      return;
    }

    setExporting(true);
    try {
      let url = '/api/admin/export-excel';
      
      if (type === 'report') {
        if (reportType === 'month') {
          url = `/api/admin/reports/export?month=${selectedMonth}`;
        } else {
          url = `/api/admin/reports/export?year=${selectedYear}`;
        }
      } else {
        url = `${url}${type === 'summary' ? '?type=summary' : ''}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Export API error:', errorData);
        throw new Error(errorData.error || 'Export failed');
      }

      const blob = await response.blob();
      
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition
        ? (contentDisposition.split('filename=')[1]?.replace(/"/g, '') || `Manuel-Resort-Report-${new Date().toISOString().split('T')[0]}.xlsx`)
        : `Manuel-Resort-Report-${new Date().toISOString().split('T')[0]}.xlsx`;

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

  // Line chart configuration
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

  // Group facility stats by type for the detailed breakdown
  const facilityStatsByType = (data?.facilityStats || []).reduce((acc, stat) => {
    if (!acc[stat.type]) {
      acc[stat.type] = [];
    }
    (acc[stat.type] as FacilityStat[]).push(stat);
    return acc;
  }, {} as Record<string, FacilityStat[]>);

  // Calculate totals for facility stats
  const totalFacilityRevenue = (data?.facilityStats || []).reduce((sum, s) => sum + s.revenue, 0);
  const totalFacilityBookings = (data?.facilityStats || []).reduce((sum, s) => sum + s.count, 0);

  // Determine revenue trend
  const monthlyTrends = data?.monthlyTrends || [];
  const previousMonthData = monthlyTrends.length >= 2 ? monthlyTrends[monthlyTrends.length - 2] : null;
  const lastMonthRevenue = previousMonthData?.revenue || 0;
  const currentMonthRevenue = data?.monthlyRevenue || 0;
  const revenueTrend = lastMonthRevenue > 0 ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <nav className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 mb-1">
              <Link href="/admin" className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition">
                <ArrowLeft className="h-5 w-5 text-gray-700" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Reports & Analytics</h1>
                <p className="text-sm text-gray-500 mt-0.5">Monthly and yearly business performance and detailed insights</p>
              </div>
            </div>
          </div>

          {/* Report Type Selector and Period Selection */}
          <div className="pt-4 border-t space-y-4">
            {/* Toggle between Month and Year */}
            <div className="flex gap-2">
              <button
                onClick={() => setReportType('month')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                  reportType === 'month'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Calendar className="h-4 w-4 inline mr-2" />
                Monthly Report
              </button>
              <button
                onClick={() => setReportType('year')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                  reportType === 'year'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FileSpreadsheet className="h-4 w-4 inline mr-2" />
                Yearly Report
              </button>
            </div>

            {/* Month/Year Selector and Export */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center flex-1">
                {reportType === 'month' ? (
                  <>
                    <label htmlFor="month-select" className="text-sm font-medium text-gray-700 self-center whitespace-nowrap">
                      Select Month:
                    </label>
                    <select
                      id="month-select"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="flex h-9 rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {monthOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </>
                ) : (
                  <>
                    <label htmlFor="year-select" className="text-sm font-medium text-gray-700 self-center whitespace-nowrap">
                      Select Year:
                    </label>
                    <select
                      id="year-select"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="flex h-9 rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {yearOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </>
                )}
              </div>
              <Button
                onClick={() => handleExport('report')}
                disabled={exporting || (reportType === 'month' && !selectedMonth) || (reportType === 'year' && !selectedYear)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium whitespace-nowrap"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                {exporting ? 'Exporting...' : `Export ${reportType === 'month' ? 'Report' : 'Annual Report'}`}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-6 space-y-6">

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-500">Total Revenue</span>
                <div className="h-9 w-9 rounded-lg bg-purple-100 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">₱{data.totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-1">Lifetime earnings</p>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-500">This Month</span>
                <div className="h-9 w-9 rounded-lg bg-green-100 flex items-center justify-center">
                  {revenueTrend >= 0 ? (
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">₱{data.monthlyRevenue.toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-1">
                <span className={`text-xs font-medium ${revenueTrend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {revenueTrend >= 0 ? '+' : ''}{revenueTrend.toFixed(1)}%
                </span>
                <span className="text-xs text-gray-400">vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-500">Total Bookings</span>
                <div className="h-9 w-9 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{data.totalBookings}</p>
              <p className="text-xs text-gray-400 mt-1">{data.monthlyBookings} this month</p>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-500">Active Facilities</span>
                <div className="h-9 w-9 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-orange-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{data.facilities}</p>
              <p className="text-xs text-gray-400 mt-1">Available for booking</p>
            </CardContent>
          </Card>
        </div>

        {/* Booking Status Summary + Monthly Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Booking Status */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-gray-900">Booking Status Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Confirmed</span>
                </div>
                <span className="text-lg font-bold text-green-700">{data.confirmedBookings}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                <div className="flex items-center gap-2.5">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span className="text-sm font-medium text-red-800">Cancelled</span>
                </div>
                <span className="text-lg font-bold text-red-600">{data.cancelledBookings}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2.5">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Pending / Other</span>
                </div>
                <span className="text-lg font-bold text-gray-600">
                  {data.totalBookings - data.confirmedBookings - data.cancelledBookings}
                </span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Total Bookings</span>
                  <span className="text-lg font-bold text-gray-900">{data.totalBookings}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Trends Chart */}
          <Card className="lg:col-span-2 border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-gray-900">6-Month Performance Trends</CardTitle>
              <CardDescription className="text-xs">Bookings count and revenue over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[260px]">
                <Line data={monthlyTrendsChart} options={dualAxisOptions} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Summary Cards */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Revenue by Category</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {data.typeStats.map((stat) => {
              const Icon = typeIcons[stat.type] || Building2;
              const colorClass = typeColors[stat.type] || "bg-gray-100 text-gray-700 border-gray-200";
              const accentColor = typeAccentColors[stat.type] || "bg-gray-500";
              const revenueShare = totalFacilityRevenue > 0 ? (stat.revenue / totalFacilityRevenue * 100) : 0;

              return (
                <Card key={stat.type} className="border shadow-sm overflow-hidden">
                  <div className={`h-1.5 ${accentColor}`} />
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center border ${colorClass}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{typeLabels[stat.type] || stat.type}s</p>
                        <p className="text-xs text-gray-500">{stat.count} {stat.count === 1 ? 'booking' : 'bookings'}</p>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-gray-900">₱{stat.revenue.toLocaleString()}</p>
                    <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${accentColor}`}
                        style={{ width: `${Math.min(revenueShare, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{revenueShare.toFixed(1)}% of total revenue</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Detailed Facility Breakdown */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-gray-900">Facility Performance Breakdown</CardTitle>
                <CardDescription className="text-xs">Individual facility bookings and revenue, grouped by category</CardDescription>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">₱{totalFacilityRevenue.toLocaleString()}</p>
                <p className="text-xs text-gray-500">{totalFacilityBookings} total bookings</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {Object.keys(facilityStatsByType).length === 0 ? (
              <p className="text-gray-400 text-center py-8">No booking data available yet</p>
            ) : (
              <div className="space-y-6">
                {Object.entries(facilityStatsByType).map(([type, facilities]) => {
                  const Icon = typeIcons[type] || Building2;
                  const colorClass = typeColors[type] || "bg-gray-100 text-gray-700 border-gray-200";
                  const accentColor = typeAccentColors[type] || "bg-gray-500";
                  const categoryTotal = facilities.reduce((sum, f) => sum + f.revenue, 0);
                  const categoryBookings = facilities.reduce((sum, f) => sum + f.count, 0);

                  return (
                    <div key={type}>
                      {/* Category Header */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`h-8 w-8 rounded-md flex items-center justify-center border ${colorClass}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-gray-900">
                            {typeLabels[type] || type}s
                          </h3>
                          <p className="text-xs text-gray-500">
                            {facilities.length} {facilities.length === 1 ? 'facility' : 'facilities'} — {categoryBookings} {categoryBookings === 1 ? 'booking' : 'bookings'} — ₱{categoryTotal.toLocaleString()} revenue
                          </p>
                        </div>
                      </div>

                      {/* Facility Table */}
                      <div className="overflow-hidden rounded-lg border border-gray-200">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                              <th className="text-left py-2.5 px-4 font-medium text-gray-500 text-xs uppercase tracking-wider">Facility Name</th>
                              <th className="text-center py-2.5 px-4 font-medium text-gray-500 text-xs uppercase tracking-wider">Bookings</th>
                              <th className="text-right py-2.5 px-4 font-medium text-gray-500 text-xs uppercase tracking-wider">Revenue</th>
                              <th className="text-right py-2.5 px-4 font-medium text-gray-500 text-xs uppercase tracking-wider">Avg / Booking</th>
                              <th className="text-right py-2.5 px-4 font-medium text-gray-500 text-xs uppercase tracking-wider">Share</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {facilities.map((facility, idx) => {
                              const avgPerBooking = facility.count > 0 ? facility.revenue / facility.count : 0;
                              const shareOfCategory = categoryTotal > 0 ? (facility.revenue / categoryTotal * 100) : 0;

                              return (
                                <tr key={facility.facilityId || idx} className="hover:bg-gray-50/50 transition-colors">
                                  <td className="py-3 px-4">
                                    <div className="flex items-center gap-2.5">
                                      <div className={`h-2 w-2 rounded-full ${accentColor}`} />
                                      <span className="font-medium text-gray-900">{facility.facilityName}</span>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    <span className="inline-flex items-center justify-center bg-gray-100 text-gray-700 text-xs font-semibold rounded-full px-2.5 py-0.5">
                                      {facility.count}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-right font-semibold text-gray-900">
                                    ₱{facility.revenue.toLocaleString()}
                                  </td>
                                  <td className="py-3 px-4 text-right text-gray-600">
                                    ₱{avgPerBooking.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                  </td>
                                  <td className="py-3 px-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <div className="w-16 bg-gray-100 rounded-full h-1.5">
                                        <div
                                          className={`h-1.5 rounded-full ${accentColor}`}
                                          style={{ width: `${Math.min(shareOfCategory, 100)}%` }}
                                        />
                                      </div>
                                      <span className="text-xs text-gray-500 w-10 text-right">{shareOfCategory.toFixed(0)}%</span>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Bookings + Export */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Recent Bookings */}
          <Card className="lg:col-span-2 border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-gray-900">Recent Bookings</CardTitle>
              <CardDescription className="text-xs">Latest 10 reservations</CardDescription>
            </CardHeader>
            <CardContent>
              {data.recentBookings.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No bookings yet</p>
              ) : (
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left py-2.5 px-4 font-medium text-gray-500 text-xs uppercase tracking-wider">Booking</th>
                        <th className="text-left py-2.5 px-4 font-medium text-gray-500 text-xs uppercase tracking-wider">Guest</th>
                        <th className="text-left py-2.5 px-4 font-medium text-gray-500 text-xs uppercase tracking-wider">Facility</th>
                        <th className="text-left py-2.5 px-4 font-medium text-gray-500 text-xs uppercase tracking-wider">Status</th>
                        <th className="text-right py-2.5 px-4 font-medium text-gray-500 text-xs uppercase tracking-wider">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {data.recentBookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-2.5 px-4">
                            <p className="font-semibold text-gray-900 text-xs">{booking.code}</p>
                            <p className="text-xs text-gray-400">{format(booking.createdAt, "MMM dd, yyyy")}</p>
                          </td>
                          <td className="py-2.5 px-4">
                            <p className="text-gray-700">{booking.customerName}</p>
                          </td>
                          <td className="py-2.5 px-4">
                            <p className="text-gray-700">{booking.facility.name}</p>
                          </td>
                          <td className="py-2.5 px-4">
                            <Badge
                              variant={
                                booking.status === "CONFIRMED"
                                  ? "default"
                                  : booking.status === "CANCELLED"
                                  ? "destructive"
                                  : booking.status === "COMPLETED" || booking.status === "CHECKED_OUT"
                                  ? "secondary"
                                  : "outline"
                              }
                              className="text-xs"
                            >
                              {booking.status.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="py-2.5 px-4 text-right font-semibold text-gray-900">
                            ₱{Number(booking.totalAmount).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Export Options */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-gray-900">Export Reports</CardTitle>
              <CardDescription className="text-xs">Download comprehensive reports in Excel format</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {reportType === 'month' ? (
                <Button 
                  onClick={() => handleExport('report')}
                  disabled={exporting || !selectedMonth}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white h-auto py-4"
                >
                  <Calendar className="h-5 w-5 mr-3 flex-shrink-0" />
                  <div className="text-left flex-1">
                    <p className="font-semibold text-sm leading-tight">{exporting ? 'Exporting...' : `Export ${selectedMonth ? format(new Date(selectedMonth + '-01'), 'MMMM yyyy') : 'Current Month'}`}</p>
                    <p className="text-xs opacity-90 font-normal leading-tight">Summary • Bookings • Facilities • Activity Logs</p>
                  </div>
                </Button>
              ) : (
                <Button 
                  onClick={() => handleExport('report')}
                  disabled={exporting || !selectedYear}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white h-auto py-4"
                >
                  <FileSpreadsheet className="h-5 w-5 mr-3 flex-shrink-0" />
                  <div className="text-left flex-1">
                    <p className="font-semibold text-sm leading-tight">{exporting ? 'Exporting...' : `Export ${selectedYear} Annual Report`}</p>
                    <p className="text-xs opacity-90 font-normal leading-tight">12-Month Summary • Monthly Breakdown • Facilities • Trends</p>
                  </div>
                </Button>
              )}
              
              <div className="border-t pt-3">
                <p className="text-xs font-medium text-gray-600 mb-2">All-Time Reports</p>
                <Button 
                  onClick={() => handleExport('bookings')}
                  disabled={exporting}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-auto py-3 mb-2"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-3 flex-shrink-0" />
                  <div className="text-left flex-1">
                    <p className="font-semibold text-sm leading-tight">Detailed Booking Report</p>
                    <p className="text-xs opacity-90 font-normal leading-tight">All bookings since inception</p>
                  </div>
                </Button>
                
                <Button 
                  onClick={() => handleExport('summary')}
                  disabled={exporting}
                  variant="outline"
                  className="w-full border-2 hover:bg-gray-50 h-auto py-3"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-3 flex-shrink-0" />
                  <div className="text-left flex-1">
                    <p className="font-semibold text-sm leading-tight">Summary Report</p>
                    <p className="text-xs opacity-70 font-normal leading-tight">All-time aggregated metrics</p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

      </main>
    </div>
  );
}
