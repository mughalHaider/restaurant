// src/app/dashboard/employees/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { withRole } from "@/lib/withRole";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Save,
  X,
  Mail,
  User,
  Shield,
  Filter,
  MoreVertical
} from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";
import AlertModal from "@/components/AlertModal";
type Employee = {
  id: string;
  name: string;
  email: string;
  rolle: "waiter" | "manager" | "admin";
  status: "pending" | "active" | "inactive";
};

function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "waiter" | "manager">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "active" | "inactive">("all");

  // form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rolle, setRolle] = useState<"waiter" | "manager">("waiter");
  const [showAddForm, setShowAddForm] = useState(false);

  // edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRolle, setEditRolle] = useState<"waiter" | "manager">("waiter");
  const [editStatus, setEditStatus] = useState<"pending" | "active" | "inactive">("pending");

  // alert states
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<"success" | "error" | "warning" | "info">("success");
  const [alertMessage, setAlertMessage] = useState("");

  const [deleteId, setDeleteId] = useState<string | null>(null);


  // ✅ Fetch employees (excluding admins)
  const fetchEmployees = async () => {
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .order("id", { ascending: false }); // fallback

    if (error) {
      console.error("Error fetching employees:", error);
    } else {
      setEmployees((data || []).filter((emp) => emp.rolle !== "admin"));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // ✅ Add employee → status = pending + send magic link
  const addEmployee = async () => {
    if (!name || !email) {
      setAlertType("warning");
      setAlertMessage("Please fill all fields");
      setShowAlert(true);
      return;
    }

    const { error: insertError } = await supabase.from("employees").insert([
      {
        name,
        email,
        rolle,
        status: "pending",
      },
    ]);

    if (insertError) {
      console.error("Error adding employee:", insertError);
      setAlertType("error");
      setAlertMessage("Error adding employee");
      setShowAlert(true);
      return;
    }

    // Send magic link
    const { error: inviteError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (inviteError) {
      console.error("Error sending magic link:", inviteError);
      setAlertType("error");
      setAlertMessage("Employee added but magic link not sent");
      setShowAlert(true);
    } else {
      setAlertType("success");
      setAlertMessage("Employee added and magic link sent to email!");
      setShowAlert(true);
    }

    setName("");
    setEmail("");
    setRolle("waiter");
    setShowAddForm(false);
    fetchEmployees();
  };

  // ✅ Delete employee
  const deleteEmployee = async (id: string) => {
    if (!confirm("Are you sure you want to delete this employee?")) return;

    const { error } = await supabase.from("employees").delete().eq("id", id);

    if (error) {
      console.error("Error deleting employee:", error);
    } else {
      setEmployees((prev) => prev.filter((emp) => emp.id !== id));
    }
  };

  // ✅ Start editing
  const startEditing = (emp: Employee) => {
    setEditingId(emp.id);
    setEditName(emp.name);
    setEditEmail(emp.email);
    setEditRolle(emp.rolle as "waiter" | "manager");
    setEditStatus(emp.status);
  };

  // ✅ Cancel editing
  const cancelEditing = () => {
    setEditingId(null);
    setEditName("");
    setEditEmail("");
    setEditRolle("waiter");
    setEditStatus("pending");
  };

  // ✅ Save edit
  const saveEdit = async () => {
    if (!editingId) return;

    const updateData: Partial<Employee> = {
      name: editName,
      email: editEmail,
      rolle: editRolle,
    };

    // Only allow updating status if not pending
    if (editStatus !== "pending") {
      updateData.status = editStatus;
    }

    const { error } = await supabase
      .from("employees")
      .update(updateData)
      .eq("id", editingId);

    if (error) {
      console.error("Error updating employee:", error);
      setAlertType("error");
      setAlertMessage("Error Updating Employee");
      setShowAlert(true);
    } else {
      fetchEmployees();
      cancelEditing();
      setAlertType("success");
      setAlertMessage("Employee Updated Successfully!");
      setShowAlert(true);
    }
  };

  // Filter employees based on search and filters
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch =
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'all' || employee.rolle === roleFilter;
    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Get role info for styling
  const getRoleInfo = (rolle: string) => {
    switch (rolle) {
      case 'manager':
        return { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Manager' };
      case 'waiter':
        return { color: 'bg-green-100 text-green-800 border-green-200', label: 'Waiter' };
      default:
        return { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Unknown' };
    }
  };

  // Get status info for styling
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return { color: 'bg-green-100 text-green-800 border-green-200', label: 'Active' };
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Pending' };
      case 'inactive':
        return { color: 'bg-red-100 text-red-800 border-red-200', label: 'Inactive' };
      default:
        return { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Unknown' };
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
          <p className="text-gray-600 mt-1">
            Manage staff accounts and permissions
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600">Total Employees</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{employees.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600">Waiters</p>
          <p className="text-2xl font-bold text-green-600 mt-2">
            {employees.filter(e => e.rolle === 'waiter').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600">Managers</p>
          <p className="text-2xl font-bold text-blue-600 mt-2">
            {employees.filter(e => e.rolle === 'manager').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600">Active</p>
          <p className="text-2xl font-bold text-purple-600 mt-2">
            {employees.filter(e => e.status === 'active').length}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search employees by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors duration-200"
            />
          </div>

          {/* Role Filter */}
          <div className="flex items-center space-x-2 min-w-[200px]">
            <Filter className="text-gray-400 w-5 h-5" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as "all" | "waiter" | "manager")}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors duration-200"
            >
              <option value="all">All Rollen</option>
              <option value="waiter">Waiter</option>
              <option value="manager">Manager</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2 min-w-[200px]">
            <Filter className="text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | "pending" | "active" | "inactive")}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors duration-200"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Add Employee Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-700/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Add New Employee</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors duration-200"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors duration-200"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  value={rolle}
                  onChange={(e) => setRolle(e.target.value as "waiter" | "manager")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors duration-200"
                >
                  <option value="waiter">Waiter</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={addEmployee}
                className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors duration-200"
              >
                Add Employee
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <ConfirmModal
          message="Are you sure you want to delete this employee?"
          onCancel={() => setDeleteId(null)}
          onConfirm={async () => {
            const { error } = await supabase.from("employees").delete().eq("id", deleteId);
            setDeleteId(null);
            if (error) {
              setAlertType("error");
              setAlertMessage("Error deleting employee");
              setShowAlert(true);
            } else {
              setEmployees((prev) => prev.filter((emp) => emp.id !== deleteId));
              setAlertType("success");
              setAlertMessage("Employee deleted successfully");
              setShowAlert(true);
            }
          }}
        />
      )}

      {showAlert && (
        <AlertModal
          type={alertType}
          message={alertMessage}
          onClose={() => setShowAlert(false)}
        />
      )}

      {/* Employees Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Employees ({filteredEmployees.length})
          </h3>
        </div>

        {filteredEmployees.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500">
              {employees.length === 0 ? 'No employees found.' : 'No employees found matching your criteria.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Employee</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Rolle</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEmployees.map((emp) => {
                  const roleInfo = getRoleInfo(emp.rolle);
                  const statusInfo = getStatusInfo(emp.status);

                  return (
                    <tr key={emp.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                            <span className="text-amber-800 font-medium text-sm">
                              {emp.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {editingId === emp.id ? (
                                <input
                                  type="text"
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  className="border border-gray-300 px-2 py-1 rounded focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                />
                              ) : (
                                emp.name
                              )}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center space-x-1">
                              <Mail className="w-4 h-4" />
                              {editingId === emp.id ? (
                                <input
                                  type="email"
                                  value={editEmail}
                                  onChange={(e) => setEditEmail(e.target.value)}
                                  className="border border-gray-300 px-2 py-1 rounded focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                />
                              ) : (
                                <span>{emp.email}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {editingId === emp.id ? (
                          <select
                            value={editRolle}
                            onChange={(e) => setEditRolle(e.target.value as "waiter" | "manager")}
                            className="border border-gray-300 px-2 py-1 rounded focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          >
                            <option value="waiter">Waiter</option>
                            <option value="manager">Manager</option>
                          </select>
                        ) : (
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${roleInfo.color}`}>
                            {roleInfo.label}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingId === emp.id ? (
                          emp.status === "pending" ? (
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                              {statusInfo.label}
                            </span>
                          ) : (
                            <select
                              value={editStatus}
                              onChange={(e) => setEditStatus(e.target.value as "active" | "inactive")}
                              className="border border-gray-300 px-2 py-1 rounded focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            >
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                            </select>
                          )
                        ) : (
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {editingId === emp.id ? (
                            <>
                              <button
                                onClick={saveEdit}
                                className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                              >
                                <Save className="w-4 h-4" />
                                <span>Save</span>
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="flex items-center space-x-1 px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
                              >
                                <X className="w-4 h-4" />
                                <span>Cancel</span>
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEditing(emp)}
                                className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                              >
                                <Edit className="w-4 h-4" />

                              </button>
                              <button
                                onClick={() => setDeleteId(emp.id)}
                                className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
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
    </div>
  );
}

export default withRole(EmployeesPage, ["admin"]);