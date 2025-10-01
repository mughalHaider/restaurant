// app/employee-login/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { supabase } from "@/lib/supabaseClient";

export default function EmployeeLogin() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // 1. Check employee in DB
    const { data: employees, error } = await supabase
      .from("employees")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !employees) {
      setIsLoading(false);
      alert("No employee found with this email.");
      return;
    }

    if (employees.status !== "active") {
      setIsLoading(false);
      alert("Your account is not active yet. Contact admin.");
      return;
    }

    // 2. Send magic link
    const { error: inviteError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/employee-auth-callback`,
      },
    });

    setIsLoading(false);

    if (inviteError) {
      console.error(inviteError);
      alert("Error sending magic link. Try again later.");
      return;
    }

    setIsSubmitted(true);
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header with Back Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center relative"
        >
          {/* Back Button */}
          <Link
            href="/"
            className="absolute left-0 top-1/2 transform -translate-y-1/2 flex items-center text-gray-600 hover:text-amber-700 transition-colors duration-200 group"
          >
            <svg
              className="w-6 h-6 group-hover:-translate-x-1 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>

          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-amber-800 font-serif">Madot Restaurant</h1>
          </Link>
          <h2 className="mt-6 text-2xl sm:text-3xl font-bold text-gray-900">
            Employee Login
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Secure passwordless authentication for staff
          </p>
        </motion.div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10"
        >
          {!isSubmitted ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Work Email Address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 transition-colors duration-200"
                    placeholder="employee@madotrestaurant.com"
                  />
                </div>
              </div>

              <div>
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending Magic Link...
                    </div>
                  ) : (
                    'Send Magic Link'
                  )}
                </motion.button>
              </div>
            </form>
          ) : (
            // Success State
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Magic Link Sent!
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                {"We've sent a secure login link to "} <strong>{email}</strong>
                {". Check your email and click the link to access your dashboard."}
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail('');
                  }}
                  className="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-amber-700 bg-amber-100 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-200"
                >
                  Send Another Link
                </button>
                <Link
                  href="/"
                  className="block w-full py-2 px-4 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-200"
                >
                  Back to Home
                </Link>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Support Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <p className="text-sm text-gray-600">
            Need help?{' '}
            <a href="mailto:support@madotrestaurant.com" className="font-medium text-amber-600 hover:text-amber-500 transition-colors duration-200">
              Contact support
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}