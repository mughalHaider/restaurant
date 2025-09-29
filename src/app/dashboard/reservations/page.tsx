"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Reservation = {
  id: string;
  name: string;
  email: string;
  date: string;
  time: string;
  guests: number;
  status: string;
  table_id: string | null;
};

type Table = {
  id: string;
  number: number;
  capacity: number;
  status: string;
};

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [search, setSearch] = useState("");

  // ✅ Fetch reservations + tables
  useEffect(() => {
    const fetchData = async () => {
      const { data: resData } = await supabase
        .from("reservations")
        .select("*")
        .order("date", { ascending: true })
        .order("time", { ascending: true });

      const { data: tableData } = await supabase
        .from("restaurant_tables")
        .select("*")
        .order("number", { ascending: true });

      setReservations(resData || []);
      setTables(tableData || []);
    };

    fetchData();
  }, []);

  // ✅ Handle status updates
  const updateStatus = async (id: string, status: string) => {
    await supabase.from("reservations").update({ status }).eq("id", id);
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
  };

  // ✅ Assign table
  const assignTable = async (reservationId: string, tableId: string) => {
    await supabase.from("reservations").update({ table_id: tableId }).eq("id", reservationId);
    setReservations((prev) =>
      prev.map((r) => (r.id === reservationId ? { ...r, table_id: tableId } : r))
    );

    // update table status → reserved
    await supabase.from("restaurant_tables").update({ status: "reserved" }).eq("id", tableId);
    setTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, status: "reserved" } : t))
    );
  };

  // ✅ Filter reservations (search)
  const filteredReservations = reservations.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.email.toLowerCase().includes(search.toLowerCase())
  );

  // ✅ Get only confirmed reservations
  const confirmedReservations = reservations.filter((r) => r.status === "accepted");

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Reservations</h1>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by name/email"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border px-3 py-2 rounded mb-4 w-full"
      />

      {/* All Reservations */}
      <div className="overflow-x-auto rounded-lg shadow mb-12">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-amber-100 text-left text-gray-700">
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Time</th>
              <th className="py-3 px-4">Guests</th>
              <th className="py-3 px-4">Table</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReservations.map((res) => (
              <tr key={res.id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-4">{res.name}</td>
                <td className="py-2 px-4">
                  {new Date(res.date).toLocaleDateString()}
                </td>
                <td className="py-2 px-4">{res.time}</td>
                <td className="py-2 px-4">{res.guests}</td>
                <td className="py-2 px-4">
                  <select
                    value={res.table_id || ""}
                    onChange={(e) => assignTable(res.id, e.target.value)}
                    className="border px-2 py-1 rounded"
                  >
                    <option value="">-- Assign --</option>
                    {tables
                      .filter((t) => t.status === "free" || t.id === res.table_id)
                      .map((t) => (
                        <option key={t.id} value={t.id}>
                          Table {t.number} ({t.capacity} seats)
                        </option>
                      ))}
                  </select>
                </td>
                <td className="py-2 px-4 capitalize">{res.status}</td>
                <td className="py-2 px-4 space-x-2">
                  <button
                    onClick={() => updateStatus(res.id, "accepted")}
                    className="px-2 py-1 bg-green-500 text-white rounded"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => updateStatus(res.id, "cancelled")}
                    className="px-2 py-1 bg-red-500 text-white rounded"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => updateStatus(res.id, "arrived")}
                    className="px-2 py-1 bg-blue-500 text-white rounded"
                  >
                    Arrived
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirmed Reservations Section */}
      <h2 className="text-xl font-semibold mb-4">Confirmed Reservations</h2>
      {confirmedReservations.length === 0 ? (
        <p className="text-gray-600">No confirmed reservations yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-green-100 text-left text-gray-700">
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Guests</th>
                <th className="py-3 px-4">Table</th>
              </tr>
            </thead>
            <tbody>
              {confirmedReservations.map((res) => (
                <tr key={res.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">{res.name}</td>
                  <td className="py-2 px-4">
                    {new Date(res.date).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-4">{res.time}</td>
                  <td className="py-2 px-4">{res.guests}</td>
                  <td className="py-2 px-4">
                    {tables.find((t) => t.id === res.table_id)?.number || "Unassigned"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
