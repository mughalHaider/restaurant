'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { withRole } from "@/lib/withRole";
import {
  Save,
  Clock,
  Calendar,
  Plus,
  Trash2,
  Settings as SettingsIcon,
  Building
} from "lucide-react";
import AlertModal from "@/components/AlertModal";

function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [openingTime, setOpeningTime] = useState("10:00");
  const [closingTime, setClosingTime] = useState("22:00");
  const [closedDates, setClosedDates] = useState<string[]>([]);
  const [newHoliday, setNewHoliday] = useState("");


  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState("success");
  const [alertMessage, setAlertMessage] = useState("");

  // ✅ Load settings from Supabase
  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from("restaurant_einstellungen")
        .select("*")
        .single();

      if (error) {
        console.error("Error fetching settings:", error);
        return;
      }

      if (data) {
        setOpeningTime(data.oeffnungszeit || "10:00");
        setClosingTime(data.schliesszeit || "22:00");
        setClosedDates(data.schliesstage || []);
      }
    };

    fetchSettings();
  }, []);

  // ✅ Save updates to Supabase
  const handleSave = async () => {
    setLoading(true);

    // Check if settings row exists
    const { data: existing, error: fetchError } = await supabase
      .from("restaurant_einstellungen")
      .select("*")
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 = no rows found (so we can ignore that)
      console.error("Error checking settings:", fetchError);
      setAlertType("error");
      setAlertMessage("Failed to check settings ❌");
      setShowAlert(true);
      setLoading(false);
      return;
    }

    let result;
    if (existing) {
      // ✅ Row exists → update it
      result = await supabase
        .from("restaurant_einstellungen")
        .update({
          oeffnungszeit: openingTime,
          schliesszeit: closingTime,
          schliesstage: closedDates,
          aktualisiert_am: new Date(),
        })
        .eq("id", existing.id);
    } else {
      // 🆕 No row → insert new one
      result = await supabase.from("restaurant_einstellungen").insert([
        {
          oeffnungszeit: openingTime,
          schliesszeit: closingTime,
          schliesstage: closedDates,
          aktualisiert_am: new Date(),
        },
      ]);
    }

    setLoading(false);

    if (result.error) {
      console.error("Save failed:", result.error);
      setAlertType("error");
      setAlertMessage("Failed to save settings ❌");
      setShowAlert(true);
    } else {
      setAlertType("success");
      setAlertMessage("Settings saved successfully ✅");
      setShowAlert(true);
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

  // Format date for display
  const formatDateDisplay = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Restaurant Settings</h1>
          <p className="text-gray-600 mt-2">Manage opening hours, holidays, and restaurant configuration</p>
        </div>
        <div className="p-3 bg-amber-100 rounded-xl">
          <SettingsIcon className="w-8 h-8 text-amber-600" />
        </div>
      </div>

       {showAlert && (
        <AlertModal
          type={alertType}
          message={alertMessage}
          onClose={() => setShowAlert(false)}
        />
      )}

      {/* Opening & Closing Time */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Clock className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Oeffnungszeiten</h2>
            <p className="text-gray-600 text-sm">
              {`Set your restaurant's daily operating hours`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-md">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Oeffnungszeit</label>
            <div className="relative">
              <input
                type="time"
                value={openingTime}
                onChange={(e) => setOpeningTime(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors duration-200"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Schliesszeit</label>
            <div className="relative">
              <input
                type="time"
                value={closingTime}
                onChange={(e) => setClosingTime(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors duration-200"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-sm text-amber-800">
            <strong>Current hours:</strong> {openingTime} - {closingTime}
          </p>
        </div>
      </div>

      {/* Closed Dates (Holidays) */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-red-100 rounded-lg">
            <Calendar className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Feiertage & Schliesstage</h2>
            <p className="text-gray-600 text-sm">Mark dates when the restaurant will be closed</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 mb-6">
          <div className="flex-1 space-y-2">
            <label className="block text-sm font-medium text-gray-700">Add Schliesstag</label>
            <input
              type="date"
              value={newHoliday}
              onChange={(e) => setNewHoliday(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors duration-200"
            />
          </div>
          <button
            onClick={addHoliday}
            className="flex items-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-xl hover:bg-amber-700 transition-colors duration-200 font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Datum
          </button>
        </div>

        {closedDates.length > 0 ? (
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-gray-900">Scheduled Closures ({closedDates.length})</h3>
            <div className="grid gap-3">
              {closedDates.map((date) => (
                <div
                  key={date}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="font-medium text-gray-900">{formatDateDisplay(date)}</span>
                  </div>
                  <button
                    onClick={() => removeHoliday(date)}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors duration-200 p-2 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Remove</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="p-4 bg-gray-100 rounded-2xl inline-block mb-4">
              <Building className="w-12 h-12 text-gray-400" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">No holidays scheduled</h4>
            <p className="text-gray-500 max-w-md mx-auto">
              Add dates when the restaurant will be closed for holidays, maintenance, or special events.
            </p>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-4 rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>Save Settings</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default withRole(SettingsPage, ["admin"]);