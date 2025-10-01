"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Role = "waiter" | "manager" | "admin";

type Reservation = {
  id: string;
  name: string;
  time: string;
  guests: number;
  status: string;
  date: string; // assuming your reservations table has a "date" column
};

function DashboardPage() {
  const [role, setRole] = useState<Role | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [reservedTables, setReservedTables] = useState<number>(0);
  const [totalTables, setTotalTables] = useState<number>(0);
  const [staffCount, setStaffCount] = useState<number>(0);

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
      const today = new Date().toISOString().split("T")[0];

      // ✅ Fetch confirmed reservations for today
      const { data: resData } = await supabase
        .from("reservations")
        .select("id, name, time, guests, status, date")
        .eq("status", "confirmed")
        .eq("date", today)
        .order("time", { ascending: true });

      if (resData) setReservations(resData);

      // ✅ Fetch tables (reserved vs total)
      const { data: tableData } = await supabase
        .from("tables")
        .select("id, status");

      if (tableData) {
        setTotalTables(tableData.length);
        setReservedTables(tableData.filter((t) => t.status === "reserved").length);
      }

      // ✅ Fetch staff except admins
      const { data: empData } = await supabase
        .from("employees")
        .select("id, role")
        .neq("role", "admin");

      if (empData) setStaffCount(empData.length);
    };

    fetchUserRole();
    fetchDashboardData();
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Welcome section */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg shadow-md p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">
          {userName ? `Welcome back, ${userName}!` : "Welcome back!"}
        </h2>
        <p className="text-amber-50">
          {role ? `Your role: ${role.charAt(0).toUpperCase() + role.slice(1)}` : "Loading role..."}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Today's Reservations */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm font-medium text-gray-600 mb-2">Today's Reservations</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{reservations.length}</p>
        </div>

        {/* Active Tables */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm font-medium text-gray-600 mb-2">Active Tables</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">
            {reservedTables}/{totalTables}
          </p>
        </div>

        {/* Staff on Duty */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm font-medium text-gray-600 mb-2">Staff on Duty</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{staffCount}</p>
        </div>
      </div>

      {/* Confirmed reservations for today */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Today's Confirmed Reservations</h3>
        </div>
        {reservations.length === 0 ? (
          <p className="p-6 text-gray-500">No confirmed reservations for today.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guest
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guests
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reservations.map((reservation) => (
                  <tr key={reservation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {reservation.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {reservation.time}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {reservation.guests}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Confirmed
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
