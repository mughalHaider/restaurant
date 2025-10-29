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
  vorname: string;
  nachname: string;
  uhrzeit: string;
  gaeste: number;
  status: string;
  datum: string;
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
          .from("mitarbeiter")
          .select("name, rolle")
          .eq("email", session.user.email)
          .single();

        if (employee) {
          setRole(employee.rolle as Role);
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
          .from("reservierungen")
          .select("id, vorname, nachname, uhrzeit, gaeste, status, datum")
          .order("uhrzeit", { ascending: true });

        if (allReservations) {
          // ✅ Use the same date filtering method that works
          const todayReservations = allReservations.filter(
            (r) => new Date(r.datum).toDateString() === new Date().toDateString()
          );

          // ✅ Filter for "accepted" status only
          const acceptedToday = todayReservations.filter(r => r.status === "accepted");

          setReservations(acceptedToday);
        }

        // ✅ Fetch tables (reserved vs total)
        const { data: tableData } = await supabase
          .from("tische")
          .select("id, status");

        if (tableData) {
          setTotalTables(tableData.length);
          setReservedTables(tableData.filter((t) => t.status === "reserved" || t.status === "occupied").length);
        }

        // ✅ Fetch staff except admins
        const { data: empData } = await supabase
          .from("mitarbeiter")
          .select("id, rolle")
          .eq("status", "active")
          .neq("rolle", "admin");

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
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          
          {/* Table Skeleton */}
          <div className="h-96 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  const occupancyRate = totalTables > 0 ? Math.round((reservedTables / totalTables) * 100) : 0;

  // Helper function to get initials from first and last name
  const getInitials = (vorname: string, nachname: string) => {
    return `${vorname[0] || ''}${nachname[0] || ''}`.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 space-y-6">
      {/* Welcome section */}
      <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              {userName ? `Willkommen zurück, ${userName}!` : "Willkommen bei Madot!"}
            </h1>
            <p className="text-amber-100 text-base sm:text-lg">
              {role ? `Bereit, die heutigen Abläufe als ${role} zu verwalten` : "Dashboard wird geladen..."}
            </p>
            <p className="text-amber-200 mt-2 flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4" />
              {new Date().toLocaleDateString('de-DE', { 
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

      {/* Stats grid - CHANGED TO 3 COLUMNS ON ALL SCREENS */}
      <div className="grid grid-cols-3 gap-4">
        {/* Today's Reservations */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-4 hover:shadow-xl transition-all duration-300">
          <div className="flex flex-col items-center text-center">
            <div className="p-2 bg-amber-100 rounded-lg mb-2">
              <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-amber-600" />
            </div>
            <p className="text-xs font-medium text-gray-600 mb-1">Heutige Reservierungen</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{reservations.length}</p>
            <div className="flex items-center text-xs text-gray-500">
              <TrendingUp className="w-3 h-3 mr-1" />
              <span>Bestätigt</span>
            </div>
          </div>
        </div>

        {/* Active Tables */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-4 hover:shadow-xl transition-all duration-300">
          <div className="flex flex-col items-center text-center">
            <div className="p-2 bg-green-100 rounded-lg mb-2">
              <Utensils className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            </div>
            <p className="text-xs font-medium text-gray-600 mb-1">Aktive Tische</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
              {reservedTables}<span className="text-lg text-gray-400">/{totalTables}</span>
            </p>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${occupancyRate}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">{occupancyRate}% belegt</p>
          </div>
        </div>

        {/* Staff on Duty */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-4 hover:shadow-xl transition-all duration-300">
          <div className="flex flex-col items-center text-center">
            <div className="p-2 bg-blue-100 rounded-lg mb-2">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            </div>
            <p className="text-xs font-medium text-gray-600 mb-1">Mitarbeiter im Dienst</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{staffCount}</p>
            <div className="flex items-center text-xs text-gray-500">
              <User className="w-3 h-3 mr-1" />
              <span>Aktiv</span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmed reservations for today */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Heutiger Ablauf</h3>
              <p className="text-gray-600 mt-1">Bestätigte Reservierungen für Ihre Schicht</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                {reservations.length} Reservierungen
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
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Heute keine Reservierungen</h4>
              <p className="text-gray-500 mb-4">Alles klar! Für heute sind keine bestätigten Reservierungen geplant.</p>
              <div className="text-sm text-gray-400 bg-gray-50 rounded-lg p-3">
                <Clock className="w-4 h-4 inline mr-1" />
                Später erneut prüfen für neue Reservierungen
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Gast
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Uhrzeit
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Gästeanzahl
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
                            {getInitials(reservation.vorname, reservation.nachname)}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900 group-hover:text-amber-700 transition-colors">
                            {reservation.vorname} {reservation.nachname}
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
                        <span className="font-medium">{reservation.uhrzeit}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {reservation.gaeste} {reservation.gaeste === 1 ? 'Gast' : 'Gäste'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                        <CheckCircle className="w-3 h-3" />
                        <span>Bestätigt</span>
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