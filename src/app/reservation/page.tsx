"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, CheckCircle2, Loader2, CalendarIcon, Clock, Users } from "lucide-react";
import { Select } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { supabase } from "@/lib/supabaseClient";

// ✅ Validation Schema
const reservationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().email("Invalid email address"),
  date: z.date({ error: "Please select a date" }),
  time: z.string().min(1, "Please select a time"),
  guests: z.string().min(1, "Please select number of guests"),
});

type ReservationFormData = z.infer<typeof reservationSchema>;

// ✅ Generate dynamic time slots between opening and closing times
const generateTimeSlots = (opening: string, closing: string) => {
  const slots = [];
  const [openHour, openMinute] = opening.split(":").map(Number);
  const [closeHour, closeMinute] = closing.split(":").map(Number);

  const start = new Date();
  start.setHours(openHour, openMinute, 0, 0);
  const end = new Date();
  end.setHours(closeHour, closeMinute, 0, 0);

  while (start <= end) {
    const value = start.toTimeString().slice(0, 5);
    const label = start.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    slots.push({ value, label });
    start.setMinutes(start.getMinutes() + 30);
  }

  return slots;
};

const guestOptions = Array.from({ length: 10 }, (_, i) => ({
  value: String(i + 1),
  label: `${i + 1} ${i === 0 ? "guest" : "guests"}`,
}));

export default function Reservation() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, setSubmittedData] =
    useState<ReservationFormData | null>(null);
  const [timeSlots, setTimeSlots] = useState<{ value: string; label: string }[]>(
    []
  );
  const [closedDates, setClosedDates] = useState<string[]>([]);
  const [loadingSettings, setLoadingSettings] = useState(true);

  // 🔹 New error message for holidays
  const [holidayError, setHolidayError] = useState<string>("");

  // ✅ Load settings from Supabase
  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from("restaurant_settings")
        .select("*")
        .single();

      if (error) {
        console.error("Error fetching settings:", error);
        setLoadingSettings(false);
        return;
      }

      if (data) {
        const opening = data.opening_time || "10:00";
        const closing = data.closing_time || "22:00";
        const holidays = data.closed_dates || [];

        setTimeSlots(generateTimeSlots(opening, closing));
        setClosedDates(holidays);
      }

      setLoadingSettings(false);
    };

    fetchSettings();
  }, []);

  // ✅ Form setup
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
    defaultValues: { name: "", email: "", time: "", guests: "2" },
  });

  // 🔹 Watch selected date to trigger holiday check dynamically
  const selectedDate = watch("date");

  useEffect(() => {
    if (!selectedDate) {
      setHolidayError("");
      return;
    }
    
    const formatted = format(selectedDate, "yyyy-MM-dd");
    if (closedDates.includes(formatted)) {
      setHolidayError("❌ Sorry, the restaurant is closed on this date. Please choose another date.");
    } else {
      setHolidayError("");
    }
  }, [selectedDate, closedDates]);

  // ✅ Submit handler
  const onSubmit = async (data: ReservationFormData) => {
    const formatted = format(data.date, "yyyy-MM-dd");

    // 🔹 Prevent submission if it's a holiday
    if (closedDates.includes(formatted)) {
      setHolidayError("❌ Sorry, the restaurant is closed on this date. Please choose another date.");
      return;
    }

    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          date: formatted,
        }),
      });

      if (response.ok) {
        setSubmittedData(data);
        setIsSubmitted(true);
      } else {
        console.error("Reservation failed:", await response.json());
      }
    } catch (error) {
      console.error("Error submitting reservation:", error);
    }
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setSubmittedData(null);
    setHolidayError("");
    reset();
  };

  if (loadingSettings) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-amber-50">
        <Loader2 className="animate-spin text-amber-600 w-8 h-8" />
      </div>
    );
  }

  // ✅ Confirmation Page
  if (isSubmitted && submittedData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center py-8 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-lg w-full bg-white py-8 px-6 shadow-2xl rounded-2xl text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6"
          >
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </motion.div>

          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Reservation Confirmed!
          </h3>
          <p className="text-gray-600 mb-4">
            Thank you,{" "}
            <span className="font-semibold text-amber-700">
              {submittedData.name}
            </span>
            !
          </p>

          <div className="bg-amber-50 rounded-xl p-4 space-y-3 border border-amber-100 text-left">
            <p>
              <span className="text-xs text-gray-500">Date: </span>
              <span className="font-semibold">
                {format(submittedData.date, "EEEE, MMMM d, yyyy")}
              </span>
            </p>
            <p>
              <span className="text-xs text-gray-500">Time: </span>
              <span className="font-semibold">{submittedData.time}</span>
            </p>
            <p>
              <span className="text-xs text-gray-500">Guests: </span>
              <span className="font-semibold">{submittedData.guests}</span>
            </p>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            A confirmation email has been sent to{" "}
            <span className="font-semibold">{submittedData.email}</span>.
          </p>

          <div className="mt-6 space-y-3">
            <Link
              href="/"
              className="w-full py-3 px-6 bg-amber-600 text-white rounded-xl hover:bg-amber-700 font-semibold block shadow-md"
            >
              Back to Home
            </Link>
            <button
              onClick={resetForm}
              className="w-full py-3 px-6 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
            >
              Make Another Reservation
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ✅ Reservation Form
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center text-amber-700 hover:text-amber-800 mb-8 group transition-colors"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform mr-2" />
          <span className="font-medium">Back to Home</span>
        </Link>

        {/* Page Title - Moved outside white background */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amber-800 mb-3">
            Reserve Your Table
          </h1>
        </div>

        {/* Form Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-8 border border-amber-100"
        >
          {/* 🔹 Show holiday list */}
          {closedDates.length > 0 && (
            <div className="mb-6 bg-red-50 border border-red-200 p-4 rounded-xl">
              <h2 className="font-semibold text-red-700 mb-2 flex items-center">
                <CalendarIcon className="w-4 h-4 mr-2" />
                Closed Dates
              </h2>
              <ul className="text-red-600 text-sm space-y-1">
                {closedDates.map((d) => (
                  <li key={d} className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full mr-2"></span>
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      {...field}
                      type="text"
                      placeholder="John Doe"
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                    />
                    {errors.name && (
                      <p className="text-xs text-red-600 mt-1">
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                )}
              />

              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      {...field}
                      type="email"
                      placeholder="john@example.com"
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                    />
                    {errors.email && (
                      <p className="text-xs text-red-600 mt-1">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>

            {/* Date Picker */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <CalendarIcon className="w-4 h-4 mr-2 text-amber-600" />
                Reservation Date *
              </label>
              <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className={`w-full border-2 rounded-lg px-4 py-3 text-left text-sm transition-colors flex items-center justify-between ${
                          field.value && closedDates.includes(format(field.value, "yyyy-MM-dd"))
                            ? "border-red-300 bg-red-50 text-red-700"
                            : "border-gray-200 hover:border-amber-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center">
                          <CalendarIcon className={`w-4 h-4 mr-3 ${
                            field.value && closedDates.includes(format(field.value, "yyyy-MM-dd"))
                              ? "text-red-500"
                              : "text-amber-600"
                          }`} />
                          {field.value
                            ? format(field.value, "EEEE, MMMM d, yyyy")
                            : "Select a date"}
                        </div>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 shadow-xl border border-gray-200 rounded-xl">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const maxDate = new Date(
                            Date.now() + 30 * 24 * 60 * 60 * 1000
                          );
                          return (
                            date < today ||
                            date > maxDate
                          );
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
              {errors.date && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.date.message}
                </p>
              )}
            </div>

            {/* 🔹 Show holiday error */}
            {holidayError && (
              <div className="bg-red-50 border-2 border-red-200 p-4 rounded-xl">
                <p className="text-red-700 font-medium flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                  {holidayError}
                </p>
              </div>
            )}

            {/* Time & Guests */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Controller
                name="time"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-amber-600" />
                      Preferred Time *
                    </label>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      options={timeSlots}
                      placeholder="Select time"
                      className="border-2 border-gray-200 rounded-lg px-10 hover:border-amber-300 transition-colors"
                    />
                    {errors.time && (
                      <p className="text-xs text-red-600 mt-1">
                        {errors.time.message}
                      </p>
                    )}
                  </div>
                )}
              />

              <Controller
                name="guests"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <Users className="w-4 h-4 mr-2 text-amber-600" />
                      Guests *
                    </label>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      options={guestOptions}
                      placeholder="Select guests"
                      className="border-2 border-gray-200 px-10 rounded-lg hover:border-amber-300 transition-colors"
                    />
                  </div>
                )}
              />
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isSubmitting || (selectedDate && closedDates.includes(format(selectedDate, "yyyy-MM-dd")))}
              whileHover={{ scale: (isSubmitting || (selectedDate && closedDates.includes(format(selectedDate, "yyyy-MM-dd")))) ? 1 : 1.02 }}
              className="w-full py-4 px-6 bg-amber-600 text-white rounded-xl hover:bg-amber-700 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all duration-200"
            >
              {isSubmitting ? (
                <span className="flex justify-center items-center gap-3">
                  <Loader2 className="animate-spin w-5 h-5" />
                  Processing...
                </span>
              ) : (
                "Confirm Reservation"
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}