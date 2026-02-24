"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Star, 
  Users,
  BarChart3,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface AnalyticsData {
  kpis: {
    totalBookings: { value: number; change: number; previous: number };
    totalRevenue: { value: number; change: number; previous: number };
    averageRating: { value: number; total: number };
    occupancyRate: { value: number; bookedDays: number; availableDays: number };
    totalReviews: { value: number };
  };
  charts: {
    bookingTrends: Array<{ month: number; monthName: string; bookings: number; revenue: number }>;
    mostBookedFacilities: Array<{ name: string; kind: string; bookings: number; revenue: number }>;
    ratingDistribution: Array<{ rating: number; count: number }>;
    categoryDistribution: Array<{ category: string; count: number; percentage: number }>;
    paymentDistribution: Array<{ status: string; count: number; amount: number }>;
  };
  insights: {
    peakMonth: { month: string; bookings: number; revenue: number };
    lowPerformingFacilities: Array<{ name: string; bookings: number }>;
    lowRatings: Array<{ facilityName: string; customerName: string; rating: number; comment: string | null; createdAt: string }>;
    cancellationRate: number;
    cancelledBookings: number;
  };
  period: {
    year: number;
    month: number | null;
    start: string;
    end: string;
  };
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState<'bookings' | 'revenue'>('bookings');
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, [year]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/analytics?year=${year}`);
      if (response.ok) {
        const analyticsData = await response.json();
        setData(analyticsData);
      } else {
        throw new Error('Failed to fetch analytics');
      }
    } catch (error) {
      console.error('Analytics fetch error:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Chart configurations
  const bookingTrendData = {
    labels: data.charts.bookingTrends.map(t => t.monthName),
    datasets: [
      {
        label: viewMode === 'bookings' ? 'Bookings' : 'Revenue (₱)',
        data: data.charts.bookingTrends.map(t => viewMode === 'bookings' ? t.bookings : t.revenue),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const mostBookedData = {
    labels: data.charts.mostBookedFacilities.slice(0, 8).map(f => f.name),
    datasets: [
      {
        label: 'Bookings',
        data: data.charts.mostBookedFacilities.slice(0, 8).map(f => f.bookings),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(168, 85, 247, 0.8)',
        ],
      },
    ],
  };

  const ratingDistData = {
    labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
    datasets: [
      {
        label: 'Reviews',
        data: data.charts.ratingDistribution.map(r => r.count),
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(250, 204, 21, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(16, 185, 129, 0.8)',
        ],
      },
    ],
  };

  const categoryDistData = {
    labels: data.charts.categoryDistribution.map(c => c.category),
    datasets: [
      {
        data: data.charts.categoryDistribution.map(c => c.count),
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into your booking performance
          </p>
        </div>
        <Select value={year.toString()} onValueChange={(v) => setYear(parseInt(v))}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
              <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Total Bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.kpis.totalBookings.value}</div>
            <div className="flex items-center text-xs">
              {data.kpis.totalBookings.change >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={data.kpis.totalBookings.change >= 0 ? "text-green-500" : "text-red-500"}>
                {formatPercentage(data.kpis.totalBookings.change)}
              </span>
              <span className="text-muted-foreground ml-1">from last period</span>
            </div>
          </CardContent>
        </Card>

        {/* Total Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <span className="text-xl font-bold text-muted-foreground">₱</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.kpis.totalRevenue.value)}</div>
            <div className="flex items-center text-xs">
              {data.kpis.totalRevenue.change >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={data.kpis.totalRevenue.change >= 0 ? "text-green-500" : "text-red-500"}>
                {formatPercentage(data.kpis.totalRevenue.change)}
              </span>
              <span className="text-muted-foreground ml-1">from last period</span>
            </div>
          </CardContent>
        </Card>

        {/* Average Rating */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.kpis.averageRating.value.toFixed(1)} ⭐</div>
            <p className="text-xs text-muted-foreground">
              Based on {data.kpis.averageRating.total} reviews
            </p>
          </CardContent>
        </Card>

        {/* Occupancy Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.kpis.occupancyRate.value.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {data.kpis.occupancyRate.bookedDays} / {data.kpis.occupancyRate.availableDays} days
            </p>
          </CardContent>
        </Card>

        {/* Total Reviews */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.kpis.totalReviews.value}</div>
            <p className="text-xs text-muted-foreground">
              All time reviews
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Trends */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Booking Trends</CardTitle>
                <CardDescription>Monthly performance for {year}</CardDescription>
              </div>
              <Select value={viewMode} onValueChange={(v) => setViewMode(v as 'bookings' | 'revenue')}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bookings">Bookings</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <Line data={bookingTrendData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Most Booked Facilities */}
        <Card>
          <CardHeader>
            <CardTitle>Most Booked Facilities</CardTitle>
            <CardDescription>Top performing facilities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <Bar 
                data={mostBookedData} 
                options={{
                  ...chartOptions,
                  indexAxis: 'y' as const,
                }} 
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rating Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Rating Distribution</CardTitle>
            <CardDescription>Breakdown of customer ratings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <Bar data={ratingDistData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Category Distribution</CardTitle>
            <CardDescription>Bookings by facility type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <div className="w-[280px] h-[280px]">
                <Pie 
                  data={categoryDistData} 
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
      </div>

      {/* Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Peak Season */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Peak Season
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{data.insights.peakMonth.month}</div>
              <div className="text-sm text-muted-foreground">
                {data.insights.peakMonth.bookings} bookings
              </div>
              <div className="text-sm font-medium">
                {formatCurrency(data.insights.peakMonth.revenue)} revenue
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cancellation Rate */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className={`h-5 w-5 ${data.insights.cancellationRate > 10 ? 'text-red-500' : 'text-yellow-500'}`} />
              Cancellation Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{data.insights.cancellationRate.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">
                {data.insights.cancelledBookings} cancelled bookings
              </div>
              {data.insights.cancellationRate > 10 && (
                <div className="text-xs text-red-500 font-medium">
                  ⚠️ Above 10% threshold
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Low Performing Facilities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Needs Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.insights.lowPerformingFacilities.length > 0 ? (
                data.insights.lowPerformingFacilities.map((facility, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <span className="truncate">{facility.name}</span>
                    <span className="text-muted-foreground">{facility.bookings} bookings</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">All facilities performing well</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Ratings Alert */}
      {data.insights.lowRatings.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              Recent Low Ratings (Requires Response)
            </CardTitle>
            <CardDescription>Reviews with 2 stars or below in the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.insights.lowRatings.map((review, idx) => (
                <div key={idx} className="bg-white p-4 rounded-lg border border-red-200">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-medium">{review.facilityName}</div>
                      <div className="text-sm text-muted-foreground">by {review.customerName}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-red-500 text-red-500" />
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-gray-700 italic">"{review.comment}"</p>
                  )}
                  <div className="text-xs text-muted-foreground mt-2">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
