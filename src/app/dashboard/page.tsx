"use client";

import { useState } from "react";
import Link from "next/link";

type Role = "waiter" | "manager" | "admin";

export default function DashboardPage() {
  // Later: replace with Supabase session role
  const [role] = useState<Role>("manager"); 

  const navItems = [
    { label: "Reservations", href: "/dashboard/reservations", roles: ["waiter", "manager", "admin"] },
    { label: "Tables", href: "/dashboard/tables", roles: ["manager", "admin"] },
    { label: "Statistics", href: "/dashboard/stats", roles: ["manager", "admin"] },
    { label: "Employees", href: "/dashboard/employees", roles: ["admin"] },
    { label: "Settings", href: "/dashboard/settings", roles: ["admin"] },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-6">
        <h2 className="text-xl font-bold mb-6">Dashboard</h2>
        <ul className="space-y-3">
          {navItems
            .filter(item => item.roles.includes(role))
            .map(item => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block px-3 py-2 rounded-md hover:bg-amber-100 text-gray-700 font-medium"
                >
                  {item.label}
                </Link>
              </li>
            ))}
        </ul>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold">Welcome, {role}!</h1>
        <p className="mt-2 text-gray-600">
          Select an option from the sidebar to manage the restaurant system.
        </p>
      </main>
    </div>
  );
}
