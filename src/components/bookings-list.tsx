"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Search, ChevronDown } from "lucide-react";
import { BookingStatus } from "@prisma/client";

interface Booking {
  id: string;
  code: string;
  customerName: string;
  customerEmail: string;
  status: BookingStatus;
  totalAmount: number;
  createdAt: string;
  startDate: string;
  endDate: string;
  facility: {
    name: string;
  };
}

interface BookingsListProps {
  bookings: Booking[];
}

export function BookingsList({ bookings }: BookingsListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month">("all");
  const [dateFilterType, setDateFilterType] = useState<"booking" | "checkin">("booking");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "ALL">("ALL");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "amount" | "checkin">("newest");

  // Helper function to get date range
  const getDateRange = (filter: string) => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (filter) {
      case "today":
        const endOfDay = new Date(startOfDay);
        endOfDay.setHours(23, 59, 59, 999);
        return { start: startOfDay, end: endOfDay };
      case "week":
        const weekStart = new Date(startOfDay);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);
        return { start: weekStart, end: weekEnd };
      case "month":
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        monthEnd.setHours(23, 59, 59, 999);
        return { start: monthStart, end: monthEnd };
      default:
        return { start: new Date(0), end: new Date() };
    }
  };

  // Filter and search bookings
  const filteredAndSortedBookings = useMemo(() => {
    let filtered = bookings.filter((booking) => {
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        booking.code.toLowerCase().includes(searchLower) ||
        booking.customerName.toLowerCase().includes(searchLower) ||
        booking.customerEmail.toLowerCase().includes(searchLower) ||
        booking.facility.name.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;

      // Status filter
      if (statusFilter !== "ALL" && booking.status !== statusFilter) {
        return false;
      }

      // Date filter (by booking date or check-in date)
      const dateRange = getDateRange(dateFilter);
      const dateToFilter = dateFilterType === "booking" 
        ? new Date(booking.createdAt)
        : new Date(booking.startDate);
      if (dateToFilter < dateRange.start || dateToFilter > dateRange.end) {
        return false;
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "amount":
          return b.totalAmount - a.totalAmount;
        case "checkin":
          return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [bookings, searchTerm, dateFilter, statusFilter, sortBy]);

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CHECKED_IN":
        return "bg-green-100 text-green-800";
      case "CHECKED_OUT":
        return "bg-gray-100 text-gray-800";
      case "COMPLETED":
        return "bg-emerald-100 text-emerald-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>All Bookings</CardTitle>
            <CardDescription>
              Showing {filteredAndSortedBookings.length} of {bookings.length} bookings
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search and Filters */}
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search by booking code, customer name, email, or facility..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Date Filter */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Date Filter</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
              <div className="flex gap-2 mt-2">
                <label className="flex items-center gap-1 text-xs">
                  <input
                    type="radio"
                    name="dateType"
                    value="booking"
                    checked={dateFilterType === "booking"}
                    onChange={(e) => setDateFilterType(e.target.value as any)}
                    className="w-3 h-3"
                  />
                  Booking Date
                </label>
                <label className="flex items-center gap-1 text-xs">
                  <input
                    type="radio"
                    name="dateType"
                    value="checkin"
                    checked={dateFilterType === "checkin"}
                    onChange={(e) => setDateFilterType(e.target.value as any)}
                    className="w-3 h-3"
                  />
                  Check-in Date
                </label>
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="CHECKED_IN">Checked In</option>
                <option value="CHECKED_OUT">Checked Out</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* Sort By */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="amount">Highest Amount</option>
                <option value="checkin">Check-in Date</option>
              </select>
            </div>

            {/* Reset Button */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">&nbsp;</label>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setDateFilter("all");
                  setDateFilterType("booking");
                  setStatusFilter("ALL");
                  setSortBy("newest");
                }}
                className="w-full"
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="overflow-x-auto">
          {filteredAndSortedBookings.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">No bookings found</p>
              <p className="text-sm text-gray-500">Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Booking Code</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Customer</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Facility</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Check-in</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Check-out</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Amount</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Date Created</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedBookings.map((booking) => (
                  <tr key={booking.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-semibold text-blue-600">{booking.code}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold">{booking.customerName}</p>
                        <p className="text-xs text-gray-500">{booking.customerEmail}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">{booking.facility.name}</td>
                    <td className="px-4 py-3">{formatDate(booking.startDate)}</td>
                    <td className="px-4 py-3">{formatDate(booking.endDate)}</td>
                    <td className="px-4 py-3 font-semibold">₱{Number(booking.totalAmount).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                        {booking.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(booking.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Summary */}
        {filteredAndSortedBookings.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total Bookings Shown</p>
                <p className="text-2xl font-bold text-gray-900">{filteredAndSortedBookings.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Revenue (Filtered)</p>
                <p className="text-2xl font-bold text-green-600">
                  ₱{filteredAndSortedBookings.reduce((sum, b) => sum + Number(b.totalAmount), 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Average Booking Value</p>
                <p className="text-2xl font-bold text-blue-600">
                  ₱{Math.round(filteredAndSortedBookings.reduce((sum, b) => sum + Number(b.totalAmount), 0) / filteredAndSortedBookings.length).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
