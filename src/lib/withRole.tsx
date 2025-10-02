// lib/withRole.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export function withRole<T extends object>(
  Component: React.ComponentType<T & { role: string }>,
  allowedRoles: string[]
) {
  return function ProtectedPage(props: T) {
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);
    const [role, setRole] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
      const checkRole = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        const email = session?.user?.email;

        if (!email) {
          router.replace("/login");
          return;
        }

        const { data: employee } = await supabase
          .from("employees")
          .select("role")
          .eq("email", email)
          .single();

        if (!employee || !allowedRoles.includes(employee.role)) {
          router.replace("/dashboard");
          return;
        }

        setRole(employee.role);
        setAuthorized(true);
        setLoading(false);
      };

      checkRole();
    }, [router]);

    if (loading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Checking permissions...</p>
          </div>
        </div>
      );
    }

    if (!authorized || !role) return null;

    return <Component {...props} role={role} />;
  };
}