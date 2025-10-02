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
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="animate-pulse space-y-6">
          {/* Welcome Skeleton */}
          <div className="h-24 bg-gray-200 rounded-xl"></div>
          
          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          
          {/* Table Skeleton */}
          <div className="h-96 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  const occupancyRate = totalTables > 0 ? Math.round((reservedTables / totalTables) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Welcome section */}
      <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {userName ? `Welcome back, ${userName}!` : "Welcome to Madot!"}
            </h1>
            <p className="text-amber-100 text-lg">
              {role ? `Ready to manage today's operations as ${role}` : "Loading your dashboard..."}
            </p>
            <p className="text-amber-200 mt-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="hidden lg:block">
            <div className="p-4 bg-amber-400 rounded-2xl">
              <Coffee className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Today's Reservations */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Today&apos;s Reservations</p>
              <p className="text-4xl font-bold text-gray-900">{reservations.length}</p>
            </div>
            <div className="p-3 bg-amber-100 rounded-xl">
              <Calendar className="w-8 h-8 text-amber-600" />
            </div>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>All confirmed for today</span>
          </div>
        </div>

        {/* Active Tables */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Active Tables</p>
              <p className="text-4xl font-bold text-gray-900">
                {reservedTables}<span className="text-2xl text-gray-400">/{totalTables}</span>
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <Utensils className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${occupancyRate}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">{occupancyRate}% occupancy rate</p>
        </div>

        {/* Staff on Duty */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Staff on Duty</p>
              <p className="text-4xl font-bold text-gray-900">{staffCount}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <User className="w-4 h-4 mr-1" />
            <span>Active team members</span>
          </div>
        </div>
      </div>

      {/* Confirmed reservations for today */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Today&apos;s Schedule</h3>
              <p className="text-gray-600 mt-1">Confirmed reservations for your shift</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                {reservations.length} reservations
              </span>
            </div>
          </div>
        </div>

        {reservations.length === 0 ? (
          <div className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="p-4 bg-gray-100 rounded-2xl inline-block mb-4">
                <Calendar className="w-12 h-12 text-gray-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">No reservations today</h4>
              <p className="text-gray-500 mb-4">
                All clear! There are no confirmed reservations scheduled for today.
              </p>
              <div className="text-sm text-gray-400 bg-gray-50 rounded-lg p-3">
                <Clock className="w-4 h-4 inline mr-1" />
                Check back later for new reservations
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Guest
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Party Size
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reservations.map((reservation) => (
                  <tr key={reservation.id} className="hover:bg-gray-50 transition-colors duration-150 group">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center">
                          <span className="text-amber-800 font-medium text-sm">
                            {reservation.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900 group-hover:text-amber-700 transition-colors">
                            {reservation.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            Reservation #{reservation.id.slice(-8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-900">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{reservation.time}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {reservation.guests} {reservation.guests === 1 ? 'guest' : 'guests'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                        <CheckCircle className="w-3 h-3" />
                        <span>Confirmed</span>
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