// app/reservation/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { Select } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";

// Validation Schema
const reservationSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name is too long"),
  email: z.string().email("Invalid email address"),
  date: z.date({ error: "Please select a date" }),
  time: z.string().min(1, "Please select a time"),
  guests: z.string().min(1, "Please select number of guests"),
});

type ReservationFormData = z.infer<typeof reservationSchema>;

// Generate time slots with better formatting
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 17; hour <= 22; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;
      const displayTime = new Date(
        `2000-01-01T${timeString}`
      ).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      slots.push({ value: timeString, label: displayTime });
    }
  }
  return slots;
};

const timeSlots = generateTimeSlots();
const guestOptions = Array.from({ length: 10 }, (_, i) => ({
  value: String(i + 1),
  label: `${i + 1} ${i === 0 ? "guest" : "guests"}`,
}));

export default function Reservation() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, setSubmittedData] =
    useState<ReservationFormData | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      name: "",
      email: "",
      time: "",
      guests: "2",
    },
  });

  const onSubmit = async (data: ReservationFormData) => {
    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          date: format(data.date, "yyyy-MM-dd"),
        }),
      });

      if (response.ok) {
        setSubmittedData(data);
        setIsSubmitted(true);
      } else {
        const errorData = await response.json();
        console.error("Reservation failed:", errorData);
      }
    } catch (error) {
      console.error("Error submitting reservation:", error);
    }
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setSubmittedData(null);
    reset();
  };

  if (isSubmitted && submittedData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-lg w-full"
        >
          <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6"
            >
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </motion.div>

            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-gray-900 mb-3"
            >
              Reservation Confirmed!
            </motion.h3>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="space-y-4 mb-6"
            >
              <p className="text-gray-600">
                Thank you,{" "}
                <span className="font-semibold text-amber-700">
                  {submittedData.name}
                </span>
                !
              </p>

              <div className="bg-amber-50 rounded-xl p-4 space-y-3 border border-amber-100">
                <div className="text-gray-800">
                  <p className="text-xs text-gray-500 mb-1">Date</p>
                  <p className="font-semibold">
                    {format(submittedData.date, "EEEE, MMMM d, yyyy")}
                  </p>
                </div>
                <div className="text-gray-800">
                  <p className="text-xs text-gray-500 mb-1">Time</p>
                  <p className="font-semibold">{submittedData.time}</p>
                </div>
                <div className="text-gray-800">
                  <p className="text-xs text-gray-500 mb-1">Party Size</p>
                  <p className="font-semibold">
                    {submittedData.guests}{" "}
                    {submittedData.guests === "1" ? "guest" : "guests"}
                  </p>
                </div>
              </div>

              <p className="text-xs text-gray-500">
                A confirmation email has been sent to{" "}
                <span className="font-semibold">{submittedData.email}</span>
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-2"
            >
              <Link
                href="/"
                className="w-full py-3 px-6 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-all duration-200 font-semibold block text-center shadow-lg hover:shadow-xl cursor-pointer"
              >
                Back to Home
              </Link>
              <button
                onClick={resetForm}
                className="w-full py-3 px-6 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium cursor-pointer"
              >
                Make Another Reservation
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Compact Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-amber-700 transition-colors duration-200 group cursor-pointer mb-6"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="ml-2 font-medium">Back to Home</span>
          </Link>

          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-amber-800 font-serif mb-2">
              Reserve Your Table
            </h1>
            <p className="text-gray-600 max-w-xl mx-auto">
              Book your table for an unforgettable dining experience
            </p>
          </div>
        </motion.div>

        {/* Compact Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white py-6 px-6 shadow-2xl rounded-2xl sm:px-8"
        >
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            {/* Name & Email in Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Full Name *
                </label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="John Doe"
                      className={`appearance-none block w-full px-4 py-2.5 border ${
                        errors.name
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-300 focus:ring-amber-500"
                      } rounded-lg placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
                    />
                  )}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Email Address *
                </label>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="email"
                      placeholder="john@example.com"
                      className={`appearance-none block w-full px-4 py-2.5 border ${
                        errors.email
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-300 focus:ring-amber-500"
                      } rounded-lg placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
                    />
                  )}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                        className={`w-full flex items-center justify-between px-4 py-2.5 border ${
                          errors.date ? "border-red-300" : "border-gray-300"
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 cursor-pointer text-left text-sm hover:bg-gray-50`}
                      >
                        <span
                          className={
                            field.value
                              ? "text-gray-900 font-medium"
                              : "text-gray-400"
                          }
                        >
                          {field.value
                            ? format(field.value, "EEEE, MMMM d, yyyy")
                            : "Select your preferred date"}
                        </span>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="center">
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
                          return date < today || date > maxDate;
                        }}
                        initialFocus
                        captionLayout="dropdown"
                        fromYear={new Date().getFullYear()}
                        toYear={new Date().getFullYear() + 1}
                        className="rounded-2xl border shadow-2xl"
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
              {errors.date && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.date.message}
                </p>
              )}
            </div>

            {/* Time & Guests in Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Preferred Time *
                </label>
                <Controller
                  name="time"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      options={timeSlots}
                      placeholder="Select time"
                      className={`w-full ${
                        errors.time ? "border-red-300" : ""
                      }`}
                    />
                  )}
                />
                {errors.time && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.time.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Number of Guests *
                </label>
                <Controller
                  name="guests"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      options={guestOptions}
                      placeholder="Select guests"
                      className="w-full"
                    />
                  )}
                />
                {errors.guests && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.guests.message}
                  </p>
                )}
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              className="group relative w-full flex justify-center items-center py-3 px-6 border border-transparent text-base font-semibold rounded-xl text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer mt-6"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  Processing...
                </>
              ) : (
                "Confirm Reservation"
              )}
            </motion.button>

            <p className="text-xs text-gray-500 text-center">
              All fields are required. You&apos;ll receive a confirmation email after
              booking.
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}