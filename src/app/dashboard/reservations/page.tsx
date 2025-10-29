"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { withRole } from "@/lib/withRole";
import {
  Search,
  Calendar,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  UserCheck,
  Filter,
  Edit,
  Save,
  X,
  Phone,
  MessageCircle,
} from "lucide-react";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import AlertModal from "@/components/AlertModal";


type Reservation = {
  id: string;
  vorname: string;
  nachname: string;
  email: string;
  telefon: string;
  datum: string;
  uhrzeit: string;
  gaeste: number;
  status: string;
  tisch_id: string | null;
  bemerkung: string | null;
};

type Table = {
  id: string;
  nummer: number;
  kapazitaet: number;
  status: "available" | "reserved" | "occupied";
};

type ActionModalData = {
  type: "confirm" | "cancel" | "arrived" | "edit" | null;
  reservation: Reservation | null;
};

function ReservationsPage({ role }: { role: string }) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [remarkModal, setRemarkModal] = useState<{ open: boolean; bemerkung: string }>({ open: false, bemerkung: "" });
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<"success" | "error" | "warning" | "info">("success");
  const [alertMessage, setAlertMessage] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal state
  const [actionModal, setActionModal] = useState<ActionModalData>({
    type: null,
    reservation: null,
  });

  // Edit state for confirmed reservations
  const [editingReservationId, setEditingReservationId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    datum: "",
    uhrzeit: "",
    gaeste: 0,
    tisch_id: "",
  });

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: resData } = await supabase
        .from("reservierungen")
        .select(`
          *,
          tische ( nummer, kapazitaet )
        `)
        .order("datum", { ascending: true })
        .order("uhrzeit", { ascending: true });

      const { data: tableData } = await supabase
        .from("tische")
        .select("*")
        .order("nummer", { ascending: true });

      setReservations(resData || []);
      setTables(tableData || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Handle status updates
  const updateStatus = async (id: string, status: string) => {
    // Update reservation status in DB
    await supabase.from("reservierungen").update({ status }).eq("id", id);

    // Update local state
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
    setActionModal({ type: null, reservation: null });

    // Get reservation details (for email + table release/occupy)
    const reservation = reservations.find((r) => r.id === id);

    if (!reservation) return;

    // If cancelled → free the table (only if assigned)
    if (status === "cancelled" && reservation.tisch_id) {
      await supabase
        .from("tische")
        .update({ status: "available" })
        .eq("id", reservation.tisch_id);

      setTables((prev) =>
        prev.map((t) =>
          t.id === reservation.tisch_id ? { ...t, status: "available" } : t
        )
      );
    }

    // If cancelled → send rejection email (always, even if no table assigned)
    if (status === "cancelled") {
      try {
        const response = await fetch("/api/send-rejection-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: reservation.email,
            vorname: reservation.vorname,  // Send vorname separately
            nachname: reservation.nachname,    // Send nachname separately
            datum: reservation.datum,
            uhrzeit: reservation.uhrzeit,
          }),
        });

        const result = await response.json();
        if (!result.success) {
          console.error("Email failed:", result.error);
          setAlertType("error");
          setAlertMessage("Reservierung storniert");
          setShowAlert(true);
        }
      } catch (err) {
        console.error("Error sending rejection email:", err);
        setAlertType("error");
        setAlertMessage("Reservierung storniert");
        setShowAlert(true);
      }
    }

    // If arrived → mark table as occupied
    if (status === "arrived" && reservation.tisch_id) {
      await supabase
        .from("tische")
        .update({ status: "occupied" })
        .eq("id", reservation.tisch_id);

      setTables((prev) =>
        prev.map((t) =>
          t.id === reservation.tisch_id ? { ...t, status: "occupied" } : t
        )
      );
    }
  };

  // Confirm reservation (only if table assigned)
  const confirmReservation = async (reservation: Reservation) => {
    if (!reservation.tisch_id) {
      setErrorMessage("⚠️ Bitte zuerst einen Tisch zuweisen.");
      return;
    }

    await supabase
      .from("reservierungen")
      .update({ status: "accepted" })
      .eq("id", reservation.id);

    // Update table status → reserved
    await supabase
      .from("tische")
      .update({ status: "reserved" })
      .eq("id", reservation.tisch_id);

    setReservations((prev) =>
      prev.map((r) =>
        r.id === reservation.id ? { ...r, status: "accepted" } : r
      )
    );
    setTables((prev) =>
      prev.map((t) =>
        t.id === reservation.tisch_id ? { ...t, status: "reserved" } : t
      )
    );
    setActionModal({ type: null, reservation: null });

    // 🚀 Send confirmation email via Resend API
    const table = tables.find((t) => t.id === reservation.tisch_id);
    try {
      const response = await fetch("/api/send-confirmation-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: reservation.email,
          vorname: reservation.vorname,  // Send vorname separately
          nachname: reservation.nachname,    // Send nachname separately
          datum: reservation.datum,
          uhrzeit: reservation.uhrzeit,
          table: table ? `Table ${table.nummer} (${table.kapazitaet} seats)` : "N/A",
        }),
      });

      const result = await response.json();
      if (!result.success) {
        console.error("Email failed:", result.error);
        setAlertType("error");
        setAlertMessage("Reservierung bestätigt, aber E‑Mail konnte nicht gesendet werden");
        setShowAlert(true);
      }
    } catch (err) {
      console.error("Error sending email:", err);
      setAlertType("error");
      setAlertMessage("Reservierung bestätigt, aber E‑Mail konnte nicht gesendet werden");
      setShowAlert(true);
    }
  };

  // Assign table for pending reservations
  const assignTable = async (reservationId: string, tableId: string) => {
    const reservation = reservations.find(r => r.id === reservationId);
    const previousTableId = reservation?.tisch_id;

    // If changing from one table to another, update previous table status
    if (previousTableId && previousTableId !== tableId) {
      await supabase
        .from("tische")
        .update({ status: "available" })
        .eq("id", previousTableId);
    }

    // Update new table status to reserved
    await supabase
      .from("tische")
      .update({ status: "reserved" })
      .eq("id", tableId);

    // Update reservation with new table
    await supabase
      .from("reservierungen")
      .update({ tisch_id: tableId })
      .eq("id", reservationId);

    setReservations((prev) =>
      prev.map((r) =>
        r.id === reservationId ? { ...r, tisch_id: tableId } : r
      )
    );

    // Update tables state
    setTables((prev) =>
      prev.map((t) => {
        if (t.id === previousTableId) {
          return { ...t, status: "available" };
        } else if (t.id === tableId) {
          return { ...t, status: "reserved" };
        }
        return t;
      })
    );
  };

  // Start editing confirmed reservation
  const startEditing = (reservation: Reservation) => {
    setEditingReservationId(reservation.id);
    setEditForm({
      datum: reservation.datum,
      uhrzeit: reservation.uhrzeit,
      gaeste: reservation.gaeste,
      tisch_id: reservation.tisch_id || "",
    });
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingReservationId(null);
    setEditForm({
      datum: "",
      uhrzeit: "",
      gaeste: 0,
      tisch_id: "",
    });
  };

  // Save edited reservation
  const saveEdit = async () => {
    if (!editingReservationId) return;

    const reservation = reservations.find(r => r.id === editingReservationId);
    if (!reservation) return;

    const previousTableId = reservation.tisch_id;
    const newTableId = editForm.tisch_id;

    try {
      // If table is being changed, update table statuses
      if (previousTableId !== newTableId) {
        // Free up the previous table
        if (previousTableId) {
          await supabase
            .from("tische")
            .update({ status: "available" })
            .eq("id", previousTableId);
        }

        // Reserve the new table
        if (newTableId) {
          await supabase
            .from("tische")
            .update({ status: "reserved" })
            .eq("id", newTableId);
        }
      }

      // Update reservation details
      const { error } = await supabase
        .from("reservierungen")
        .update({
          datum: editForm.datum,
          uhrzeit: editForm.uhrzeit,
          gaeste: editForm.gaeste,
          tisch_id: newTableId || null,
        })
        .eq("id", editingReservationId);

      if (error) {
        console.error("Error updating reservation:", error);
        setAlertType("error");
        setAlertMessage("Reservierung nicht aktualisiert");
        setShowAlert(true);
        return;
      }

      // Update local state
      setReservations((prev) =>
        prev.map((r) =>
          r.id === editingReservationId
            ? {
              ...r,
              datum: editForm.datum,
              uhrzeit: editForm.uhrzeit,
              gaeste: editForm.gaeste,
              tisch_id: newTableId || null,
            }
            : r
        )
      );

      // Update tables state
      setTables((prev) =>
        prev.map((t) => {
          if (t.id === previousTableId && previousTableId !== newTableId) {
            return { ...t, status: "available" };
          } else if (t.id === newTableId && previousTableId !== newTableId) {
            return { ...t, status: "reserved" };
          }
          return t;
        })
      );

      cancelEditing();
      setAlertType("success");
      setAlertMessage("Reservierung erfolgreich aktualisiert!");
      setShowAlert(true);
    } catch (error) {
      console.error("Error saving reservation edit:", error);
      setAlertType("error");
      setAlertMessage("Error Updating Reservation");
      setShowAlert(true);
    }
  };

  // Filter reservations
  const filteredReservations = reservations.filter((r) => {
    const fullName = `${r.vorname} ${r.nachname}`.toLowerCase();
    const matchesSearch =
      fullName.includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase()) ||
      r.telefon.includes(search);
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus && r.status !== "accepted" && r.status !== "arrived"; // exclude confirmed
  });

  // Confirmed reservations
  const confirmedReservations = reservations.filter(
    (r) => r.status === "accepted" || r.status === "arrived"
  );

  // Pagination
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);
  const paginatedReservations = filteredReservations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Stats
  const todayReservations = reservations.filter(
    (r) => new Date(r.datum).toDateString() === new Date().toDateString()
  ).length;
  const pendingCount = reservations.filter(
    (r) => r.status === "pending"
  ).length;
  const acceptedCount = confirmedReservations.length;
  const arrivedCount = reservations.filter(
    (r) => r.status === "arrived"
  ).length;

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-800 border border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border border-red-200";
      case "arrived":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  // Modal actions
  const openActionModal = (
    type: "confirm" | "cancel" | "arrived",
    reservation: Reservation
  ) => {
    setActionModal({ type, reservation });
    setErrorMessage(null); // clear old error
  };

  const getModalContent = () => {
    if (!actionModal.reservation) return null;

    const { type, reservation } = actionModal;

    const modalConfig = {
      confirm: {
        title: "Confirm Reservation",
        description: "Are you sure you want to confirm this reservation?",
        actionText: "Confirm",
        actionClass: "bg-green-500 hover:bg-green-600",
        action: () => confirmReservation(reservation),
      },
      cancel: {
        title: "Cancel Reservation",
        description: "Are you sure you want to cancel this reservation?",
        actionText: "Cancel Reservation",
        actionClass: "bg-red-500 hover:bg-red-600",
        action: () => updateStatus(reservation.id, "cancelled"),
      },
      arrived: {
        title: "Mark as Arrived",
        description: "Confirm that the guest has arrived at the restaurant.",
        actionText: "Mark Arrived",
        actionClass: "bg-blue-500 hover:bg-blue-600",
        action: () => updateStatus(reservation.id, "arrived"),
      },
    };

    const config = type ? modalConfig[type as keyof typeof modalConfig] : null;
    if (!config) return null;

    return (
      <Modal
        isOpen={true}
        onClose={() => setActionModal({ type: null, reservation: null })}
        title={config.title}
        description={config.description}
      >
        <div className="space-y-4">
          {errorMessage && (
            <div className="text-red-600 text-sm bg-red-100 p-2 rounded">
              {errorMessage}
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Guest:</span>
              <span className="font-medium text-gray-900">
                {reservation.vorname} {reservation.nachname}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium text-gray-900">
                {reservation.email}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Telephone:</span>
              <span className="font-medium text-gray-900">
                {reservation.telefon}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium text-gray-900">
                {new Date(reservation.datum).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Time:</span>
              <span className="font-medium text-gray-900">
                {reservation.uhrzeit}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Party Size:</span>
              <span className="font-medium text-gray-900">
                {reservation.gaeste} guests
              </span>
            </div>
            {reservation.bemerkung && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Remarks:</span>
                <span className="font-medium text-gray-900">
                  {reservation.bemerkung}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Table Assigned:</span>
              <span className="font-medium text-gray-900">
                {reservation.tisch_id ? `Table ${tables.find(t => t.id === reservation.tisch_id)?.nummer}` : "None"}
              </span>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setActionModal({ type: null, reservation: null })}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={config.action}
              className={`px-4 py-2 text-white rounded-lg transition-colors cursor-pointer ${config.actionClass}`}
            >
              {config.actionText}
            </button>
          </div>
        </div>
      </Modal>
    );
  };

  // Get available tables for dropdown (available + current table if reserved)
  const getAvailableTables = (currentTableId?: string | null) => {
    return tables.filter(
      (t) => t.status === "available" || t.id === currentTableId
    );
  };

  return (
    <div className="p-6 space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reservierungen</h1>
        <p className="text-gray-600 mt-1">
          Alle Reservierungen des Restaurants verwalten und verfolgen
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm font-medium text-gray-600 mb-2">Heutige Reservierungen</p>
          <p className="text-3xl font-bold text-gray-900">
            {todayReservations}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm font-medium text-gray-600 mb-2">Ausstehend</p>
          <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm font-medium text-gray-600 mb-2">Bestätigt</p>
          <p className="text-3xl font-bold text-green-600">{acceptedCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm font-medium text-gray-600 mb-2">Angekommen</p>
          <p className="text-3xl font-bold text-blue-600">{arrivedCount}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Nach Name, E‑Mail oder Telefon suchen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2 min-w-[200px]">
            <Filter className="text-gray-400 w-5 h-5" />
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
              options={[
                { value: "all", label: "Alle Status" },
                { value: "pending", label: "Ausstehend" },
                { value: "accepted", label: "Bestätigt" },
                { value: "arrived", label: "Angekommen" },
                { value: "cancelled", label: "Storniert" },
              ]}
              placeholder="Nach Status filtern"
              className="flex-1"
            />
          </div>
        </div>
      </div>

      {showAlert && (
        <AlertModal
          type={alertType}
          message={alertMessage}
          onClose={() => setShowAlert(false)}
        />
      )}

      {/* All Reservations Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Ausstehende Anfragen ({filteredReservations.length})
          </h3>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">
            Reservierungen werden geladen...
          </div>
        ) : paginatedReservations.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500">Keine ausstehenden Reservierungen gefunden</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Kontakt
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Datum & Uhrzeit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Gaeste
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tisch
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Aktionen
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedReservations.map((res) => (
                    <tr key={res.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {res.vorname} {res.nachname}
                          </div>
                          {res.bemerkung && (
                            <button
                              type="button"
                              className="flex items-center text-xs text-blue-600 mt-1 hover:underline focus:outline-none cursor-pointer"
                              onClick={() => setRemarkModal({ open: true, bemerkung: res.bemerkung! })}
                              title="Bemerkung anzeigen"
                            >
                              <MessageCircle className="w-3 h-3 mr-1" />
                              Has Bemerkung
                            </button>
                          )}
                        </div>

                        {remarkModal.open && (
                          <Modal
                            isOpen={remarkModal.open}
                            onClose={() => setRemarkModal({ open: false, bemerkung: "" })}
                            title="Reservierungsbemerkung"
                            description=""
                          >
                            <div className="p-4">
                              <p className="text-gray-800 text-sm whitespace-pre-line">{remarkModal.bemerkung}</p>
                              <div className="mt-4 flex justify-end">
                                <button
                                  onClick={() => setRemarkModal({ open: false, bemerkung: "" })}
                                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                                >
                                  Schließen
                                </button>
                              </div>
                            </div>
                          </Modal>
                        )}

                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {res.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <Phone className="w-3 h-3 mr-1" />
                          {res.telefon}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-900">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{new Date(res.datum).toLocaleDateString('de-DE')}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>{res.uhrzeit}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-900">
                          <Users className="w-4 h-4 mr-2 text-gray-400" />
                          {res.gaeste} gäste
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Select
                          value={res.tisch_id || ""}
                          onValueChange={(value) => assignTable(res.id, value)}
                          options={getAvailableTables(res.tisch_id).map((t) => ({
                            value: t.id,
                            label: `Tisch ${t.nummer} (${t.kapazitaet} Plätze)`,
                          }))}
                          placeholder="Tisch zuweisen"
                          className="min-w-[150px]"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            res.status
                          )}`}
                        >
                          {res.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {res.status !== "accepted" && (
                            <button
                              onClick={() => openActionModal("confirm", res)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors cursor-pointer"
                              title="Bestätigen"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                          )}
                          <button
                            onClick={() => openActionModal("cancel", res)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Stornieren/Löschen"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                          {res.status === "accepted" && (
                            <button
                              onClick={() => openActionModal("arrived", res)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Als angekommen markieren"
                            >
                              <UserCheck className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredReservations.length}
              itemsPerPage={itemsPerPage}
            />
          </>
        )}
      </div>

      {/* Confirmed Reservations Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Bestätigte Reservierungen ({confirmedReservations.length})
          </h3>
        </div>
        {confirmedReservations.length === 0 ? (
          <div className="p-6 text-gray-500">Keine bestätigten Reservierungen</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Datum & Uhrzeit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Gaeste
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tisch
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {confirmedReservations.map((res) => {
                  const table = tables.find((t) => t.id === res.tisch_id);

                  // Prevent editing UI for arrived reservations
                  const isEditing = editingReservationId === res.id && res.status !== "arrived";

                  return (
                    <tr key={res.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {res.vorname} {res.nachname}
                          </div>
                          {res.bemerkung && (
                            <button
                              type="button"
                              className="flex items-center text-xs text-blue-600 mt-1 hover:underline focus:outline-none cursor-pointer"
                              onClick={() => setRemarkModal({ open: true, bemerkung: res.bemerkung! })}
                            title="Bemerkung anzeigen"
                            >
                              <MessageCircle className="w-3 h-3 mr-1" />
                              Has Bemerkung
                            </button>
                          )}
                        </div>
                        {remarkModal.open && (
                          <Modal
                            isOpen={remarkModal.open}
                            onClose={() => setRemarkModal({ open: false, bemerkung: "" })}
                            title="Reservierungsbemerkung"
                            description=""
                          >
                            <div className="p-4">
                              <p className="text-gray-800 text-sm whitespace-pre-line">{remarkModal.bemerkung}</p>
                              <div className="mt-4 flex justify-end">
                                <button
                                  onClick={() => setRemarkModal({ open: false, bemerkung: "" })}
                              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                              Schließen
                                </button>
                              </div>
                            </div>
                          </Modal>
                        )}

                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {res.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <Phone className="w-3 h-3 mr-1" />
                          {res.telefon}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {isEditing ? (
                          <div className="space-y-2">
                            <input
                              type="date"
                              value={editForm.datum}
                              onChange={(e) => setEditForm((prev) => ({ ...prev, datum: e.target.value }))}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                            <input
                              type="time"
                              value={editForm.uhrzeit}
                              onChange={(e) => setEditForm((prev) => ({ ...prev, uhrzeit: e.target.value }))}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center space-x-2 text-sm text-gray-900">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span>{new Date(res.datum).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span>{res.uhrzeit}</span>
                            </div>
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {isEditing ? (
                          <input
                            type="number"
                            min="1"
                            value={editForm.gaeste}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, gaeste: parseInt(e.target.value) || 1 }))}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        ) : (
                          <div className="flex items-center text-sm text-gray-900">
                            <Users className="w-4 h-4 mr-2 text-gray-400" />
                            {res.gaeste} gäste
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {isEditing ? (
                          <Select
                            value={editForm.tisch_id}
                            onValueChange={(value) => setEditForm((prev) => ({ ...prev, tisch_id: value }))}
                            options={getAvailableTables(res.tisch_id).map((t) => ({
                              value: t.id,
                              label: `Tisch ${t.nummer} (${t.kapazitaet} Plätze)`,
                            }))}
                            placeholder="Tisch wählen"
                            className="min-w-[150px]"
                          />
                        ) : (
                          <span className="text-sm text-gray-600">
                            {table ? `Tisch ${table.nummer} (${table.kapazitaet})` : "—"}
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            res.status
                          )}`}
                        >
                          {res.status.charAt(0).toUpperCase() + res.status.slice(1)}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {isEditing ? (
                            <>
                              <button
                                onClick={saveEdit}
                                className="flex items-center space-x-1 px-2 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                              >
                                <Save className="w-4 h-4" />
                                <span>Speichern</span>
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="flex items-center space-x-1 px-2 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
                              >
                                <X className="w-4 h-4" />
                                <span>Abbrechen</span>
                              </button>
                            </>
                          ) : (
                            <>
                              {/* HIDE Edit and Mark Arrived buttons for reservations that are already 'arrived' */}
                              {res.status !== "arrived" && (
                                <>
                                  {role !== "waiter" && (
                                    <button
                                      onClick={() => startEditing(res)}
                                      className="flex items-center space-x-1 px-2 py-1 text-orange-800 rounded text-sm hover:bg-orange-100 transition-colors"
                                      title="Reservierung bearbeiten"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                  )}

                                  <button
                                    onClick={() => openActionModal("arrived", res)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                    title="Als angekommen markieren"
                                  >
                                    <UserCheck className="w-5 h-5" />
                                  </button>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {actionModal.type && getModalContent()}
    </div>
  );
}

export default withRole(ReservationsPage, ["admin", "manager", "waiter"]);