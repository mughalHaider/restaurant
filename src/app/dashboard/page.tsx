"use client";

import { useState } from "react";

type Role = "waiter" | "manager" | "admin";
function DashboardPage() {
  const [role] = useState<Role>("manager");

  const stats = [
    {
      label: "Today's Reservations",
      value: "24",
      change: "+12%",
      changeType: "increase",
    },
    {
      label: "Active Tables",
      value: "8/15",
      change: "53%",
      changeType: "neutral",
    },
    {
      label: "Revenue Today",
      value: "$2,450",
      change: "+8%",
      changeType: "increase",
    },
    {
      label: "Staff on Duty",
      value: "12",
      change: "100%",
      changeType: "neutral",
    },
  ];

  const recentReservations = [
    {
      id: 1,
      name: "Sarah Johnson",
      time: "7:00 PM",
      guests: 4,
      status: "confirmed",
    },
    { id: 2, name: "Mike Chen", time: "7:30 PM", guests: 2, status: "pending" },
    {
      id: 3,
      name: "Emma Davis",
      time: "8:00 PM",
      guests: 6,
      status: "confirmed",
    },
    {
      id: 4,
      name: "Robert Wilson",
      time: "8:30 PM",
      guests: 3,
      status: "confirmed",
    },
  ];

  const quickActions = [
    { label: "New Reservation", color: "bg-blue-500 hover:bg-blue-600" },
    { label: "View Tables", color: "bg-green-500 hover:bg-green-600" },
    { label: "Staff Schedule", color: "bg-purple-500 hover:bg-purple-600" },
    { label: "Reports", color: "bg-amber-500 hover:bg-amber-600" },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Welcome section */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg shadow-md p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">
          Welcome back, {role.charAt(0).toUpperCase() + role.slice(1)}!
        </h2>
        <p className="text-amber-50">
          Here&apos;s what&apos;s happening with your restaurant today.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm font-medium text-gray-600 mb-2">
              {stat.label}
            </p>
            <p className="text-3xl font-bold text-gray-900 mb-2">
              {stat.value}
            </p>
            <p
              className={`text-sm ${
                stat.changeType === "increase"
                  ? "text-green-600"
                  : "text-gray-600"
              }`}
            >
              {stat.change}{" "}
              {stat.changeType === "increase" ? "from yesterday" : "occupied"}
            </p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              className={`${action.color} text-white rounded-lg p-4 font-medium transition-colors duration-150 shadow-md`}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recent reservations */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Today&apos;s Reservations
          </h3>
        </div>
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
              {recentReservations.map((reservation) => (
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
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        reservation.status === "confirmed"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {reservation.status.charAt(0).toUpperCase() +
                        reservation.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t bg-gray-50">
          <button className="text-sm text-amber-600 hover:text-amber-700 font-medium">
            View all reservations →
          </button>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
