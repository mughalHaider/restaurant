"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Mail, Phone, Clock, Calendar } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import gr from "../app/message/de.json";

export default function Footer() {
    const currentYear = new Date().getFullYear();
    const [openingTime, setOpeningTime] = useState<string>("17:00");
    const [closingTime, setClosingTime] = useState<string>("22:00");
    const [loading, setLoading] = useState(true);

    // ✅ Fetch opening & closing hours from Supabase
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data, error } = await supabase
                    .from("restaurant_einstellungen")
                    .select("oeffnungszeit, schliesszeit")
                    .single();

                if (error) {
                    console.error("Error fetching settings:", error);
                } else if (data) {
                    // Format to German 24-hour (Uhr) format
                    const formatTime = (time: string) => {
                        const [hour, minute] = time.split(":").map(Number);
                        const date = new Date();
                        date.setHours(hour, minute);
                        return date.toLocaleTimeString("de-DE", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                        });
                    };

                    setOpeningTime(formatTime(data.oeffnungszeit || "17:00"));
                    setClosingTime(formatTime(data.schliesszeit || "22:00"));
                }
            } catch (err) {
                console.error("Unexpected error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    return (
        <footer className="bg-gray-900 text-white py-10 sm:py-16">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="grid md:grid-cols-3 gap-8 sm:gap-12">
                    {/* 🔹 Restaurant Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center md:text-left"
                    >
                        <h3 className="text-xl sm:text-2xl font-bold text-amber-300 font-serif mb-3 sm:mb-4">
                            Madot Restaurant
                        </h3>
                        <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                            Ein Fine-Dining-Erlebnis mit außergewöhnlicher Küche und makellosem Service seit 2010.
                        </p>
                    </motion.div>

                    {/* 🔹 Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-center md:text-left"
                    >
                        <h4 className="text-base sm:text-lg font-semibold mb-4 sm:mb-5 text-amber-300">
                            {gr.ContactInfo}
                        </h4>
                        <div className="space-y-3">
                            <div className="flex items-center justify-center md:justify-start gap-3 text-gray-400 text-sm sm:text-base">
                                <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0" />
                                <span>Sonnenalle 14, 16321 Bernau bei Berlin</span>
                            </div>
                            <div className="flex items-center justify-center md:justify-start gap-3 text-gray-400 text-sm sm:text-base">
                                <Mail className="w-4 h-4 text-amber-400 flex-shrink-0" />
                                <a
                                    href="mailto:reservations@madotrestaurant.com"
                                    className="hover:text-amber-300 transition-colors cursor-pointer"
                                >
                                    reservations@madotrestaurant.com
                                </a>
                            </div>
                            <div className="flex items-center justify-center md:justify-start gap-3 text-gray-400 text-sm sm:text-base">
                                <Phone className="w-4 h-4 text-amber-400 flex-shrink-0" />
                                <a
                                    href="tel:+03338 1234-0"
                                    className="hover:text-amber-300 transition-colors cursor-pointer"
                                >
                                    03338 1234-0
                                </a>
                            </div>
                        </div>
                    </motion.div>

                    {/* 🔹 Opening Hours (Dynamic) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-center md:text-left"
                    >
                        <h4 className="text-base sm:text-lg font-semibold mb-4 sm:mb-5 text-amber-300">
                            {gr.OpeningHours}
                        </h4>

                        {loading ? (
                            <p className="text-gray-400 text-sm sm:text-base">Loading...</p>
                        ) : (
                            <div className="space-y-2">
                                <div className="flex items-center justify-center md:justify-start gap-3 text-gray-400 text-sm sm:text-base">
                                    <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                                    <span>Montag - Sonntag</span>
                                </div>
                                <p className="text-gray-400 text-sm sm:text-base md:ml-7">
                                    {openingTime} - {closingTime}
                                </p>
                            </div>
                        )}
                    </motion.div>
                </div>
                <div className="mt-10 flex justify-center md:justify-start">
                    <a
                        href="/login"
                        className="px-5 py-2 border border-amber-400 text-amber-300 rounded-full 
               hover:bg-amber-400 hover:text-gray-900 transition-all duration-300 
               text-sm sm:text-base font-medium shadow-md"
                    >
                        {gr.EmployeeLogin}
                    </a>
                </div>

                {/* 🔹 Bottom Links */}
                <div className="border-gray-800 mt-8 sm:mt-12 pt-6 sm:pt-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl text-amber-300 font-serif font-bold">
                                Madot
                            </h2>
                        </div>

                        <div className="flex flex-wrap justify-center gap-6 text-gray-400 text-sm sm:text-base">
                            <a href="/impressum" className="hover:text-amber-300 transition-colors">
                                Impressum
                            </a>
                            <a
                                href="/datenschutz"
                                className="hover:text-amber-300 transition-colors"
                            >
                                Datenschutzerklärung
                            </a>
                            <a
                                href="/haftungsausschluss"
                                className="hover:text-amber-300 transition-colors"
                            >
                                Haftungsausschluss (Disclaimer)
                            </a>
                            <a href="/kontakt" className="hover:text-amber-300 transition-colors">
                                Kontakt
                            </a>
                            <a href="/cookies" className="hover:text-amber-300 transition-colors">
                                Cookie-Richtlinie (EU)
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center">
                    <div className="flex flex-col items-center space-y-4">
                        {/* 🔹 Employee Login Button */}


                        {/* 🔹 Copyright */}
                        <p className="text-gray-400 text-sm sm:text-base">
                            &copy; {new Date().getFullYear()} Madot Restaurant. {gr.AllRightsReserved}.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
