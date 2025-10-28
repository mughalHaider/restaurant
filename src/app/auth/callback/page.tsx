"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Error getting session:", error);
        return;
      }

      const session = data?.session;
      if (session?.user?.email) {
        // update employee status → active
        await supabase
          .from("mitarbeiter")
          .update({ status: "active" })
          .eq("email", session.user.email);
      }

      // redirect to dashboard
      router.replace("/dashboard");
    };

    handleAuth();
  }, [router]);

  return <p className="p-6">Completing login...</p>;
}
