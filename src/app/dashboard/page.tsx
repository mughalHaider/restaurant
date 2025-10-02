"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Calendar, 
  Users, 
  Utensils, 
  Clock, 
  CheckCircle,
  User,
  TrendingUp,
  Coffee
} from "lucide-react";

type Role = "waiter" | "manager" | "admin";

type Reservation = {
  id: string;
  name: string;
  time: string;
  guests: number;
  status: string;
  date: string;
};

function DashboardPage() {
  const [role, setRole] = useState<Role | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [reservedTables, setReservedTables] = useState<number>(0);
  const [totalTables, setTotalTables] = useState<number>(0);
  const [staffCount, setStaffCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user?.email) {
        const { data: employee } = await supabase
          .from("employees")
          .select("name, role")
          .eq("email", session.user.email)
          .single();

        if (employee) {
          setRole(employee.role as Role);
          setUserName(employee.name);
        }
      }
    };

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const today = new Date().toISOString().split('T')[0];

        // ✅ Fetch confirmed reservations for today
        const { data: allReservations } = await supabase
          .from("reservations")
          .select("id, name, time, guests, status, date")
          .order("time", { ascending: true });

        if (allReservations) {
          // ✅ Use the same date filtering method that works
          const todayReservations = allReservations.filter(
            (r) => new Date(r.date).toDateString() === new Date().toDateString()
          );

          // ✅ Filter for "accepted" status only
          const acceptedToday = todayReservations.filter(r => r.status === "accepted");

          setReservations(acceptedToday);
        }

        // ✅ Fetch tables (reserved vs total)
        const { data: tableData } = await supabase
          .from("restaurant_tables")
          .select("id, status");

        if (tableData) {
          setTotalTables(tableData.length);
          setReservedTables(tableData.filter((t) => t.status === "reserved" || t.status === "occupied").length);
        }

        // ✅ Fetch staff except admins
        const { data: empData } = await supabase
          .from("employees")
          .select("id, role")
          .eq("status", "active")
          .neq("role", "admin");

        if (empData) setStaffCount(empData.length);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="animate-pulse space-y-4 sm:space-y-6">
          {/* Welcome Skeleton */}
          <div className="h-20 sm:h-24 bg-gray-200 rounded-xl"></div>
          
          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 sm:h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          
          {/* Table Skeleton */}
          <div className="h-64 sm:h-96 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  const occupancyRate = totalTables > 0 ? Math.round((reservedTables / totalTables) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Welcome section */}
      <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">
              {userName ? `Welcome back, ${userName}!` : "Welcome to Madot!"}
            </h1>
            <p className="text-amber-100 text-sm sm:text-base lg:text-lg">
              {role ? `Ready to manage today's operations as ${role}` : "Loading your dashboard..."}
            </p>
            <p className="text-amber-200 mt-1 sm:mt-2 flex items-center gap-2 text-xs sm:text-sm">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="hidden sm:block">
            <div className="p-2 sm:p-3 lg:p-4 bg-amber-400 rounded-xl lg:rounded-2xl">
              <Coffee className="w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
        {/* Today's Reservations */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Today&apos;s Reservations</p>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">{reservations.length}</p>
            </div>
            <div className="p-2 sm:p-3 bg-amber-100 rounded-lg sm:rounded-xl">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-amber-600" />
            </div>
          </div>
          <div className="flex items-center text-xs sm:text-sm text-gray-500">
            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            <span>All confirmed for today</span>
          </div>
        </div>

        {/* Active Tables */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Active Tables</p>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                {reservedTables}<span className="text-lg sm:text-xl lg:text-2xl text-gray-400">/{totalTables}</span>
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-green-100 rounded-lg sm:rounded-xl">
              <Utensils className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-green-600" />
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
            <div 
              className="bg-green-500 h-1.5 sm:h-2 rounded-full transition-all duration-500"
              style={{ width: `${occupancyRate}%` }}
            ></div>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">{occupancyRate}% occupancy rate</p>
        </div>

        {/* Staff on Duty */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Staff on Duty</p>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">{staffCount}</p>
            </div>
            <div className="p-2 sm:p-3 bg-blue-100 rounded-lg sm:rounded-xl">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center text-xs sm:text-sm text-gray-500">
            <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            <span>Active team members</span>
          </div>
        </div>
      </div>

      {/* Confirmed reservations for today */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">Today&apos;s Schedule</h3>
              <p className="text-gray-600 text-sm mt-1">Confirmed reservations for your shift</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 sm:px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs sm:text-sm font-medium">
                {reservations.length} reservations
              </span>
            </div>
          </div>
        </div>

        {reservations.length === 0 ? (
          <div className="p-6 sm:p-8 lg:p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="p-3 sm:p-4 bg-gray-100 rounded-xl sm:rounded-2xl inline-block mb-3 sm:mb-4">
                <Calendar className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-gray-400" />
              </div>
              <h4 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">No reservations today</h4>
              <p className="text-gray-500 text-sm sm:text-base mb-3 sm:mb-4">
                All clear! There are no confirmed reservations scheduled for today.
              </p>
              <div className="text-xs sm:text-sm text-gray-400 bg-gray-50 rounded-lg p-2 sm:p-3">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                Check back later for new reservations
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Guest
                  </th>
                  <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Party Size
                  </th>
                  <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reservations.map((reservation) => (
                  <tr key={reservation.id} className="hover:bg-gray-50 transition-colors duration-150 group">
                    <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center">
                          <span className="text-amber-800 font-medium text-xs sm:text-sm">
                            {reservation.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-gray-900 group-hover:text-amber-700 transition-colors truncate">
                            {reservation.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            Reservation #{reservation.id.slice(-8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4">
                      <div className="flex items-center space-x-1 sm:space-x-2 text-sm text-gray-900">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                        <span className="font-medium text-xs sm:text-sm">{reservation.time}</span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4">
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <Users className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 text-xs sm:text-sm">
                          {reservation.guests} {reservation.guests === 1 ? 'guest' : 'guests'}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4">
                      <span className="inline-flex items-center space-x-1 px-2 sm:px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                        <CheckCircle className="w-2 h-2 sm:w-3 sm:h-3" />
                        <span className="hidden xs:inline">Confirmed</span>
                        <span className="xs:hidden">Conf</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;