// app/employee-auth-callback/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function EmployeeAuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleLogin = async () => {
      // 1. Get session
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Error getting session:", error);
        router.replace("/login");
        return;
      }

      const session = data?.session;
      const email = session?.user?.email;

      if (!email) {
        router.replace("/login");
        return;
      }

      // 2. Verify employee
      const { data: emp, error: empError } = await supabase
        .from("employees")
        .select("id, role, status")
        .eq("email", email)
        .single();

      if (empError || !emp) {
        console.error("Employee not found:", empError);
        router.replace("/login");
        return;
      }

      // 3. Allow only active employees
      if (emp.status !== "active") {
        alert("Your account is not active. Contact admin.");
        await supabase.auth.signOut();
        router.replace("/login");
        return;
      }

      // 4. Save role locally
      localStorage.setItem("employeeRole", emp.role);
      localStorage.setItem("employeeEmail", email);

      // 5. Redirect based on role
      if (emp.role === "manager") {
        router.replace("/dashboard/");
      } else if (emp.role === "waiter") {
        router.replace("/dashboard/");
      } else {
        router.replace("/dashboard"); // fallback for admin or unknown
      }
    };

    handleLogin();
  }, [router]);

  return <p className="p-6">Logging you in...</p>;
}
