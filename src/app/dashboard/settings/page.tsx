'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { withRole } from "@/lib/withRole";

function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [openingTime, setOpeningTime] = useState("10:00");
  const [closingTime, setClosingTime] = useState("22:00");
  const [closedDates, setClosedDates] = useState<string[]>([]);
  const [newHoliday, setNewHoliday] = useState("");

  // ✅ Load settings from Supabase
  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from("restaurant_settings")
        .select("*")
        .single();

      if (error) {
        console.error("Error fetching settings:", error);
        return;
      }

      if (data) {
        setOpeningTime(data.opening_time || "10:00");
        setClosingTime(data.closing_time || "22:00");
        setClosedDates(data.closed_dates || []);
      }
    };

    fetchSettings();
  }, []);

  // ✅ Save updates to Supabase
  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase
      .from("restaurant_settings")
      .update({
        opening_time: openingTime,
        closing_time: closingTime,
        closed_dates: closedDates,
        updated_at: new Date(),
      })
      .eq("id", 1); // assuming you have only one row for global settings

    setLoading(false);

    if (error) {
      alert("Failed to update settings ❌");
      console.error(error);
    } else {
      alert("Settings updated successfully ✅");
    }
  };

  // ✅ Add or remove holidays
  const addHoliday = () => {
    if (!newHoliday) return;
    if (closedDates.includes(newHoliday)) return alert("Already added ❗");
    setClosedDates([...closedDates, newHoliday]);
    setNewHoliday("");
  };

  const removeHoliday = (date: string) => {
    setClosedDates(closedDates.filter((d) => d !== date));
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Restaurant Settings</h1>
      <p className="text-gray-600">Manage opening hours and holidays.</p>

      {/* Opening & Closing Time */}
      <div className="bg-white p-4 shadow rounded-lg space-y-4">
        <h2 className="text-lg font-semibold">Opening Hours</h2>

        <div className="flex items-center gap-4">
          <div>
            <label className="block text-sm text-gray-700">Opening Time</label>
            <input
              type="time"
              value={openingTime}
              onChange={(e) => setOpeningTime(e.target.value)}
              className="border rounded-md p-2"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700">Closing Time</label>
            <input
              type="time"
              value={closingTime}
              onChange={(e) => setClosingTime(e.target.value)}
              className="border rounded-md p-2"
            />
          </div>
        </div>
      </div>

      {/* Closed Dates (Holidays) */}
      <div className="bg-white p-4 shadow rounded-lg space-y-4">
        <h2 className="text-lg font-semibold">Holidays / Closed Dates</h2>

        <div className="flex items-center gap-3">
          <input
            type="date"
            value={newHoliday}
            onChange={(e) => setNewHoliday(e.target.value)}
            className="border rounded-md p-2"
          />
          <button
            onClick={addHoliday}
            className="bg-amber-600 text-white px-3 py-2 rounded-md hover:bg-amber-700"
          >
            Add Holiday
          </button>
        </div>

        {closedDates.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {closedDates.map((date) => (
              <li
                key={date}
                className="flex justify-between items-center border rounded-md p-2"
              >
                <span>{date}</span>
                <button
                  onClick={() => removeHoliday(date)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm">No holidays added yet.</p>
        )}
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={loading}
        className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save Settings"}
      </button>
    </div>
  );
}

export default withRole(SettingsPage, ["admin"]);
