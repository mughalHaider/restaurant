"use client";

import { Select } from "@/components/ui/select";
import { supabase } from "@/lib/supabaseClient";
import { getWeek } from "@/lib/utils";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  TrendingUp,
  Users,
  XCircle
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

type DailyStat = { date: string; count: number };
type WeeklyStat = { week: number; count: number };
type StatusStat = { status: string; count: number; percentage: number };

export default function StatsPage() {
  const [daily, setDaily] = useState<DailyStat[]>([]);
  const [weekly, setWeekly] = useState<WeeklyStat[]>([]);
  const [statusStats, setStatusStats] = useState<StatusStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30");
  
  // Overall stats
  const [totalReservations, setTotalReservations] = useState(0);
  const [avgDaily, setAvgDaily] = useState(0);
  const [peakDay, setPeakDay] = useState("");
  const [growthRate, setGrowthRate] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(timeRange));

      // Fetch reservations within range
      const { data, error } = await supabase
        .from("reservations")
        .select("date, id, status")
        .gte("date", startDate.toISOString().split('T')[0])
        .lte("date", endDate.toISOString().split('T')[0]);

      if (error) {
        console.error("Error fetching stats:", error.message);
        setLoading(false);
        return;
      }

      if (data) {
        setTotalReservations(data.length);

        // Group daily
        const groupedDaily: Record<string, number> = {};
        data.forEach((r) => {
          groupedDaily[r.date] = (groupedDaily[r.date] || 0) + 1;
        });

        const dailyData = Object.entries(groupedDaily)
          .map(([date, count]) => ({ date, count }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        setDaily(dailyData);

        // Calculate average daily
        const avg = dailyData.length > 0 ? data.length / dailyData.length : 0;
        setAvgDaily(Math.round(avg * 10) / 10);

        // Find peak day
        const peak = dailyData.reduce((max, d) => d.count > max.count ? d : max, dailyData[0] || { date: "", count: 0 });
        setPeakDay(peak.date ? new Date(peak.date).toLocaleDateString() : "N/A");

        // Calculate growth rate (comparing first and last week)
        if (dailyData.length > 14) {
          const firstWeek = dailyData.slice(0, 7).reduce((sum, d) => sum + d.count, 0);
          const lastWeek = dailyData.slice(-7).reduce((sum, d) => sum + d.count, 0);
          const growth = firstWeek > 0 ? ((lastWeek - firstWeek) / firstWeek) * 100 : 0;
          setGrowthRate(Math.round(growth * 10) / 10);
        }

        // Group weekly
        const groupedWeekly: Record<number, number> = {};
        data.forEach((r) => {
          const week = getWeek(new Date(r.date));
          groupedWeekly[week] = (groupedWeekly[week] || 0) + 1;
        });

        setWeekly(
          Object.entries(groupedWeekly)
            .map(([week, count]) => ({ week: Number(week), count }))
            .sort((a, b) => a.week - b.week)
        );

        // Group by status
        const groupedStatus: Record<string, number> = {};
        data.forEach((r) => {
          groupedStatus[r.status] = (groupedStatus[r.status] || 0) + 1;
        });

        const statusData = Object.entries(groupedStatus).map(([status, count]) => ({
          status,
          count,
          percentage: Math.round((count / data.length) * 100)
        }));
        setStatusStats(statusData);
      }

      setLoading(false);
    };

    fetchStats();
  }, [timeRange]);

  // Chart colors
  const COLORS = {
    accepted: "#22c55e",
    pending: "#eab308",
    cancelled: "#ef4444",
    arrived: "#3b82f6",
  };

  const PIE_COLORS = ["#f59e0b", "#22c55e", "#ef4444", "#3b82f6"];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Statistics & Analytics</h1>
          <p className="text-gray-600 mt-1">Track your restaurant&apos;s performance and trends</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="text-gray-400 w-5 h-5" />
          <Select
            value={timeRange}
            onValueChange={setTimeRange}
            options={[
              { value: "7", label: "Last 7 Days" },
              { value: "30", label: "Last 30 Days" },
              { value: "90", label: "Last 90 Days" },
              { value: "365", label: "Last Year" },
            ]}
            placeholder="Select range"
            className="min-w-[160px]"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-500">Loading statistics...</div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">Total Reservations</p>
                <Calendar className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{totalReservations}</p>
              <p className="text-sm text-gray-500 mt-1">in selected period</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">Daily Average</p>
                <TrendingUp className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{avgDaily}</p>
              <p className="text-sm text-gray-500 mt-1">reservations per day</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">Peak Day</p>
                <Users className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{peakDay.split('/')[1] || 'N/A'}</p>
              <p className="text-sm text-gray-500 mt-1">{peakDay}</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">Growth Rate</p>
                <TrendingUp className="w-5 h-5 text-gray-400" />
              </div>
              <p className={`text-3xl font-bold ${growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {growthRate >= 0 ? '+' : ''}{growthRate}%
              </p>
              <p className="text-sm text-gray-500 mt-1">week over week</p>
            </div>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Reservations Chart */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Reservations</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={daily}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    formatter={(value) => [`${value} reservations`, 'Count']}
                  />
                  <Bar dataKey="count" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Status Distribution Chart */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusStats}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ status, percentage }) => `${status}: ${percentage}%`}
                  >
                    {statusStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} reservations`, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weekly Trend Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weekly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" label={{ value: 'Week Number', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Reservations', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => [`${value} reservations`, 'Count']} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#f59e0b" 
                  strokeWidth={3}
                  dot={{ fill: '#f59e0b', r: 5 }}
                  name="Reservations"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Status Breakdown Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statusStats.map((stat) => {
              const Icon = 
                stat.status === "accepted" ? CheckCircle :
                stat.status === "cancelled" ? XCircle :
                stat.status === "arrived" ? Users : AlertCircle;
              
              const colorClass = 
                stat.status === "accepted" ? "text-green-600 bg-green-100" :
                stat.status === "cancelled" ? "text-red-600 bg-red-100" :
                stat.status === "arrived" ? "text-blue-600 bg-blue-100" : "text-yellow-600 bg-yellow-100";

              return (
                <div key={stat.status} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-gray-600 capitalize">{stat.status}</p>
                    <div className={`p-2 rounded-lg ${colorClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{stat.count}</p>
                  <p className="text-sm text-gray-500">{stat.percentage}% of total</p>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}