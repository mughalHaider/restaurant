"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getWeek } from "@/lib/utils";

export default function StatsPage() {
  const [daily, setDaily] = useState<{ date: string; count: number }[]>([]);
  const [weekly, setWeekly] = useState<{ week: number; count: number }[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      // ✅ Fetch reservations
      const { data, error } = await supabase.from("reservations").select("date, id");
      if (error) {
        console.error("Error fetching stats:", error.message);
        return;
      }

      if (data) {
        // ✅ Group daily
        const groupedDaily: Record<string, number> = {};
        data.forEach((r) => {
          groupedDaily[r.date] = (groupedDaily[r.date] || 0) + 1;
        });

        setDaily(
          Object.entries(groupedDaily).map(([date, count]) => ({
            date,
            count,
          }))
        );

        // ✅ Group weekly
        const groupedWeekly: Record<number, number> = {};
        data.forEach((r) => {
          const week = getWeek(new Date(r.date));
          groupedWeekly[week] = (groupedWeekly[week] || 0) + 1;
        });

        setWeekly(
          Object.entries(groupedWeekly).map(([week, count]) => ({
            week: Number(week),
            count,
          }))
        );
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Reservation Statistics</h1>

      {/* Daily Stats */}
      <h2 className="text-lg font-semibold mb-2">Daily Reservations</h2>
      <ul className="mb-6">
        {daily.map((d) => (
          <li key={d.date}>
            {new Date(d.date).toLocaleDateString()}: {d.count}
          </li>
        ))}
      </ul>

      {/* Weekly Stats */}
      <h2 className="text-lg font-semibold mb-2">Weekly Reservations</h2>
      <ul>
        {weekly.map((w) => (
          <li key={w.week}>
            Week {w.week}: {w.count}
          </li>
        ))}
      </ul>
    </div>
  );
}
