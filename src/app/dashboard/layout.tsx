"use client";

import { LogOut, Menu, X, Home, Calendar, Table, BarChart3, Users, Settings, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, usePathname } from "next/navigation";
import "@/globals.css";

type Role = "waiter" | "manager" | "admin";

function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [role, setRole] = useState<Role | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Fetch current employee info
  useEffect(() => {
    const loadEmployee = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const email = session?.user?.email;

      if (!email) {
        router.replace("/login"); // redirect if not logged in
        return;
      }

      const { data: employee, error } = await supabase
        .from("employees")
        .select("name, role")
        .eq("email", email)
        .single();

      if (error || !employee) {
        console.error("Employee not found:", error);
        router.replace("/login");
        return;
      }

      setUserName(employee.name);
      setRole(employee.role as Role);
    };

    loadEmployee();
  }, [router]);

  const navItems = [
    { 
      label: "Dashboard", 
      href: "/dashboard", 
      icon: Home,
      roles: ["waiter", "manager", "admin"] 
    },
    { 
      label: "Reservations", 
      href: "/dashboard/reservations", 
      icon: Calendar,
      roles: ["waiter", "manager", "admin"] 
    },
    { 
      label: "Tables", 
      href: "/dashboard/tables", 
      icon: Table,
      roles: ["manager", "admin", "waiter"] 
    },
    { 
      label: "Statistics", 
      href: "/dashboard/stats", 
      icon: BarChart3,
      roles: ["manager", "admin"] 
    },
    { 
      label: "Employees", 
      href: "/dashboard/employees", 
      icon: Users,
      roles: ["admin"] 
    },
    { 
      label: "Settings", 
      href: "/dashboard/settings", 
      icon: Settings,
      roles: ["admin"] 
    },
  ];

  const filteredNavItems = role ? navItems.filter(item => item.roles.includes(role)) : [];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  const handleLogoClick = () => {
    router.push("/dashboard");
  };

  const isActiveRoute = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  if (!role) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

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
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-gradient-to-b from-white to-gray-50/80 shadow-xl transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <button
              onClick={handleLogoClick}
              className="flex items-center space-x-2 group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800 group-hover:text-amber-600 transition-colors duration-200">
                Madot
              </h2>
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* User info */}
          <div className="p-4 border-b border-gray-200 bg-white/50">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
                <p className="text-xs text-gray-500 capitalize bg-amber-100 text-amber-800 px-2 py-1 rounded-full inline-block mt-1">
                  {role}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              {filteredNavItems.map(item => {
                const isActive = isActiveRoute(item.href);
                const Icon = item.icon;
                
                return (
                  <button
                    key={item.href}
                    onClick={() => {
                      router.push(item.href);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium group ${
                      isActive 
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-200' 
                        : 'text-gray-700 hover:bg-amber-50 hover:text-amber-700 hover:shadow-md'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-amber-600'}`} />
                    <span className="flex-1 text-left">{item.label}</span>
                    {isActive && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Removed logout button from sidebar */}
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b border-gray-200 z-10">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex-1 lg:flex-none">
              <h1 className="text-2xl font-bold text-gray-900">
                {filteredNavItems.find(item => isActiveRoute(item.href))?.label || "Dashboard"}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm">
                <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-medium">
                  <span>
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
              
              {/* Profile dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2 bg-white border border-gray-200 rounded-xl px-3 py-2 hover:shadow-md transition-all duration-200"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                    profileDropdownOpen ? 'rotate-180' : ''
                  }`} />
                </button>

                {/* Dropdown menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
                      <p className="text-xs text-gray-500 capitalize">{role}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-150 text-sm font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-amber-50/30 hide-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;