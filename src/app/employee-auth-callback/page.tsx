"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function EmployeeAuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleLogin = async () => {
      try {
        // 1. Exchange URL fragment/code for a session
        const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);

        if (error) {
          console.error("Error exchanging code:", error);
          router.replace("/employee-login");
          return;
        }

        const session = data?.session;
        const email = session?.user?.email;

        if (!email) {
          router.replace("/employee-login");
          return;
        }

        // 2. Verify employee in DB
        const { data: emp, error: empError } = await supabase
          .from("employees")
          .select("id, role, status")
          .eq("email", email)
          .single();

        if (empError || !emp) {
          console.error("Employee not found:", empError);
          router.replace("/employee-login");
          return;
        }

        // 3. Check active status
        if (emp.status !== "active") {
          alert("Your account is not active. Contact admin.");
          await supabase.auth.signOut();
          router.replace("/employee-login");
          return;
        }

        // 4. Save role locally
        localStorage.setItem("employeeRole", emp.role);
        localStorage.setItem("employeeEmail", email);

        // 5. Redirect by role
        router.replace("/dashboard");
      } catch (err) {
        console.error("Unexpected error:", err);
        router.replace("/employee-login");
      }
    };

    handleLogin();
  }, [router]);

  return <p className="p-6">Logging you in...</p>;
}









