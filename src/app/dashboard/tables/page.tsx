"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Table = {
  id: string;
  number: number;
  capacity: number;
  status: string;
};

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [newNumber, setNewNumber] = useState("");
  const [newCapacity, setNewCapacity] = useState("");
  const [editedCapacities, setEditedCapacities] = useState<Record<string, number>>({});

  // ✅ Fetch tables function
  const fetchTables = async () => {
    const { data, error } = await supabase
      .from("restaurant_tables")
      .select("*")
      .order("number", { ascending: true });

    if (!error && data) setTables(data);
  };

  // Load tables on mount
  useEffect(() => {
    fetchTables();
  }, []);

  // ✅ Add new table
  const addTable = async () => {
    if (!newNumber || !newCapacity) return alert("Enter number & capacity");

    const { error } = await supabase
      .from("restaurant_tables")
      .insert([{ number: Number(newNumber), capacity: Number(newCapacity) }]);

    if (!error) {
      setNewNumber("");
      setNewCapacity("");
      fetchTables(); // refetch after add
    }
  };

  // ✅ Handle local capacity change
  const handleCapacityChange = (id: string, capacity: number) => {
    setEditedCapacities((prev) => ({ ...prev, [id]: capacity }));
  };

  // ✅ Update capacity in Supabase
  const updateCapacity = async (id: string) => {
    if (!editedCapacities[id]) return;

    const { error } = await supabase
      .from("restaurant_tables")
      .update({ capacity: editedCapacities[id] })
      .eq("id", id);

    if (!error) {
      fetchTables(); // refetch after update
      setEditedCapacities((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Manage Tables</h1>

      {/* Add New Table */}
      <div className="mb-6 flex space-x-3">
        <input
          type="number"
          placeholder="Table Number"
          value={newNumber}
          onChange={(e) => setNewNumber(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <input
          type="number"
          placeholder="Capacity"
          value={newCapacity}
          onChange={(e) => setNewCapacity(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <button
          onClick={addTable}
          className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700"
        >
          Add Table
        </button>
      </div>

      {/* Display Tables */}
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-amber-100 text-left text-gray-700">
              <th className="py-3 px-4">Table #</th>
              <th className="py-3 px-4">Capacity</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tables.map((table) => (
              <tr key={table.id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-4">{table.number}</td>
                <td className="py-2 px-4">
                  <input
                    type="number"
                    defaultValue={table.capacity}
                    onChange={(e) =>
                      handleCapacityChange(table.id, Number(e.target.value))
                    }
                    className="border px-2 py-1 rounded w-20"
                  />
                </td>
                <td className="py-2 px-4 capitalize">{table.status}</td>
                <td className="py-2 px-4">
                  {editedCapacities[table.id] !== undefined && (
                    <button
                      onClick={() => updateCapacity(table.id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Update
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
