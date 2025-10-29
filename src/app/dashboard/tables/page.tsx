"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Plus, Edit2, Trash2, Users } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Pagination } from "@/components/ui/pagination";
import { withRole } from "@/lib/withRole";

type Table = {
  id: string;
  nummer: number;
  kapazitaet: number;
  status: string;
};

type ModalData = {
  type: "add" | "edit" | "delete" | null;
  table: Table | null;
};

function TablesPage({ role }: { role: string }) {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal state
  const [modal, setModal] = useState<ModalData>({ type: null, table: null });

  // Form state
  const [formData, setFormData] = useState({ nummer: "", kapazitaet: "", status: "available" });

  // Fetch tables function
  const fetchTables = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("tische").select("*").order("nummer", { ascending: true });
    if (!error && data) setTables(data);
    setLoading(false);
  };

  // Load tables on mount
  useEffect(() => {
    fetchTables();
  }, []);

  // Add new table
  const addTable = async () => {
    if (!formData.nummer || !formData.kapazitaet) return alert("Nummer und Kapazität eingeben");
    const { error } = await supabase.from("tische").insert([{ nummer: Number(formData.nummer), kapazitaet: Number(formData.kapazitaet), status: formData.status }]);
    if (!error) {
      setFormData({ nummer: "", kapazitaet: "", status: "available" });
      setModal({ type: null, table: null });
      fetchTables();
    }
  };

  // Update table
  const updateTable = async () => {
    if (!modal.table || !formData.kapazitaet) return;
    const { error } = await supabase.from("tische").update({ kapazitaet: Number(formData.kapazitaet), status: formData.status }).eq("id", modal.table.id);
    if (!error) {
      setModal({ type: null, table: null });
      fetchTables();
    }
  };

  // Delete table
  const deleteTable = async () => {
    if (!modal.table) return;
    const { error } = await supabase.from("tische").delete().eq("id", modal.table.id);
    if (!error) {
      setModal({ type: null, table: null });
      fetchTables();
    }
  };

  // Open modals
  const openAddModal = () => {
    setFormData({ nummer: "", kapazitaet: "", status: "available" });
    setModal({ type: "add", table: null });
  };

  const openEditModal = (table: Table) => {
    setFormData({ nummer: table.nummer.toString(), kapazitaet: table.kapazitaet.toString(), status: table.status });
    setModal({ type: "edit", table });
  };

  const openDeleteModal = (table: Table) => {
    setModal({ type: "delete", table });
  };

  // Pagination
  const totalPages = Math.ceil(tables.length / itemsPerPage);
  const paginatedTables = tables.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Calculate stats
  const totalTables = tables.length;
  const availableTables = tables.filter(t => t.status === "available").length;
  const occupiedTables = tables.filter(t => t.status === "occupied").length;
  const totalCapacity = tables.reduce((sum, t) => sum + t.kapazitaet, 0);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-green-100 text-green-800";
      case "occupied": return "bg-red-100 text-red-800";
      case "reserved": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Render modals
  const renderModal = () => {
    if (!modal.type) return null;

    if (modal.type === "delete" && modal.table) {
      return (
        <Modal
          isOpen={true}
          onClose={() => setModal({ type: null, table: null })}
          title="Tisch löschen"
          description="Möchten Sie diesen Tisch wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden."
        >
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-red-700 font-bold text-lg">{modal.table.nummer}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Tisch {modal.table.nummer}</p>
                  <p className="text-sm text-gray-600">Kapazität: {modal.table.kapazitaet} Gäste</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setModal({ type: null, table: null })}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Abbrechen
              </button>
              <button
                onClick={deleteTable}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors cursor-pointer"
              >
                Tisch löschen
              </button>
            </div>
          </div>
        </Modal>
      );
    }

    const isEdit = modal.type === "edit";
    const title = isEdit ? "Tisch bearbeiten" : "Neuen Tisch hinzufügen";
    const description = isEdit ? "Tischkapazität und Status aktualisieren" : "Neuen Tisch zum Restaurant hinzufügen";

    return (
      <Modal
        isOpen={true}
        onClose={() => setModal({ type: null, table: null })}
        title={title}
        description={description}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tischnummer</label>
            <input
              type="number"
              placeholder="z. B. 1"
              value={formData.nummer}
              onChange={(e) => setFormData({ ...formData, nummer: e.target.value })}
              disabled={isEdit}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Kapazität</label>
            <input
              type="number"
              placeholder="z. B. 4"
              value={formData.kapazitaet}
              onChange={(e) => setFormData({ ...formData, kapazitaet: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
              options={[
                { value: "available", label: "Verfügbar" },
                { value: "occupied", label: "Belegt" },
                { value: "reserved", label: "Reserviert" },
              ]}
              placeholder="Status wählen"
              className="w-full"
            />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button
              onClick={() => setModal({ type: null, table: null })}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Abbrechen
            </button>
            <button
              onClick={isEdit ? updateTable : addTable}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors cursor-pointer"
            >
              {isEdit ? "Tisch aktualisieren" : "Tisch hinzufügen"}
            </button>
          </div>
        </div>
      </Modal>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tischverwaltung</h1>
          <p className="text-gray-600 mt-1">Tische und Sitzkapazitäten verwalten</p>
        </div>
        {role !== "waiter" && (
          <button
            onClick={openAddModal}
            className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg shadow-md transition-colors duration-150 font-medium cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            <span>Tisch hinzufügen</span>
          </button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm font-medium text-gray-600 mb-2">Tische insgesamt</p>
          <p className="text-3xl font-bold text-gray-900">{totalTables}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm font-medium text-gray-600 mb-2">Verfügbar</p>
          <p className="text-3xl font-bold text-green-600">{availableTables}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm font-medium text-gray-600 mb-2">Belegt</p>
          <p className="text-3xl font-bold text-red-600">{occupiedTables}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm font-medium text-gray-600 mb-2">Gesamtkapazität</p>
          <p className="text-3xl font-bold text-gray-900">{totalCapacity}</p>
        </div>
      </div>

      {/* Tables List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Alle Tische ({tables.length})</h3>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">Tische werden geladen...</div>
        ) : tables.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 mb-4">Keine Tische gefunden. Fügen Sie Ihren ersten Tisch hinzu!</p>
            <button
              onClick={openAddModal}
              className="inline-flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              <span>Ersten Tisch hinzufügen</span>
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tisch Nummer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kapazitaet
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aktionen
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedTables.map((table) => (
                    <tr key={table.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-amber-700 font-bold">{table.nummer}</span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">Tisch {table.nummer}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Users className="w-4 h-4 mr-2 text-gray-400" />
                          {table.kapazitaet} gäste
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(table.status)}`}>
                          {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {role !== "waiter" && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditModal(table)}
                              className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                              title="Bearbeiten"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(table)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Löschen"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={tables.length}
                itemsPerPage={itemsPerPage}
              />
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {renderModal()}
    </div>
  );
}

export default withRole(TablesPage, ["admin", "manager", "waiter"]);