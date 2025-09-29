"use client";

import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

type Role = "waiter" | "manager" | "admin";

 function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [role] = useState<Role>("manager");
  const [userName] = useState("John Doe");

  const navItems = [
    { label: "Reservations", href: "/dashboard/reservations", roles: ["waiter", "manager", "admin"] },
    { label: "Tables", href: "/dashboard/tables", roles: ["manager", "admin"] },
    { label: "Statistics", href: "/dashboard/stats", roles: ["manager", "admin"] },
    { label: "Employees", href: "/dashboard/employees", roles: ["admin"] },
    { label: "Settings", href: "/dashboard/settings", roles: ["admin"] },
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(role));

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-bold text-gray-800">Restaurant</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* User info */}
          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-white font-semibold">
                {userName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
                <p className="text-xs text-gray-500 capitalize">{role}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {filteredNavItems.map(item => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-amber-50 hover:text-amber-700 transition-colors duration-150 font-medium"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Logout button */}
          <div className="p-4 border-t">
            <button className="flex items-center space-x-2 w-full px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors duration-150">
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navbar */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex-1 lg:flex-none">
              <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
export default Layout