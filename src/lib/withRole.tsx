// lib/withRole.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export function withRole<T extends object>(
  Component: React.ComponentType<T & { role: string }>, // 👈 add role prop
  allowedRoles: string[]
) {
  return function ProtectedPage(props: T) {
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);
    const [role, setRole] = useState<string | null>(null); // 👈 keep track of role
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

        setRole(employee.role); // 👈 store role
        setAuthorized(true);
        setLoading(false);
      };

      checkRole();
    }, [router]);

    if (loading) return <p className="p-6">Checking permissions...</p>;
    if (!authorized || !role) return null;

    // 👇 pass role into component
    return <Component {...props} role={role} />;
  };
}
