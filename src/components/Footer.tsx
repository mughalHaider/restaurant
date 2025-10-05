"use client";

import { motion } from "framer-motion";
import { MapPin, Mail, Phone, Clock, Calendar } from "lucide-react";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 text-white py-10 sm:py-16">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="grid md:grid-cols-3 gap-8 sm:gap-12">
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
                            Fine dining experience with exceptional cuisine and impeccable service since 2010.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-center md:text-left"
                    >
                        <h4 className="text-base sm:text-lg font-semibold mb-4 sm:mb-5 text-amber-300">Contact Info</h4>
                        <div className="space-y-3">
                            <div className="flex items-center justify-center md:justify-start gap-3 text-gray-400 text-sm sm:text-base">
                                <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0" />
                                <span>123 Gourmet Street, Culinary City, CC 10101</span>
                            </div>
                            <div className="flex items-center justify-center md:justify-start gap-3 text-gray-400 text-sm sm:text-base">
                                <Mail className="w-4 h-4 text-amber-400 flex-shrink-0" />
                                <a href="mailto:reservations@madotrestaurant.com" className="hover:text-amber-300 transition-colors cursor-pointer">
                                    reservations@madotrestaurant.com
                                </a>
                            </div>
                            <div className="flex items-center justify-center md:justify-start gap-3 text-gray-400 text-sm sm:text-base">
                                <Phone className="w-4 h-4 text-amber-400 flex-shrink-0" />
                                <a href="tel:+15551234567" className="hover:text-amber-300 transition-colors cursor-pointer">
                                    +1 (555) 123-4567
                                </a>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-center md:text-left"
                    >
                        <h4 className="text-base sm:text-lg font-semibold mb-4 sm:mb-5 text-amber-300">Opening Hours</h4>
                        <div className="space-y-2">
                            <div className="flex items-center justify-center md:justify-start gap-3 text-gray-400 text-sm sm:text-base">
                                <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                                <span>Monday - Thursday</span>
                            </div>
                            <p className="text-gray-400 text-sm sm:text-base md:ml-7">5:00 PM - 10:00 PM</p>
                            <div className="flex items-center justify-center md:justify-start gap-3 text-gray-400 text-sm sm:text-base mt-3">
                                <Calendar className="w-4 h-4 text-amber-400 flex-shrink-0" />
                                <span>Friday - Sunday</span>
                            </div>
                            <p className="text-gray-400 text-sm sm:text-base md:ml-7">5:00 PM - 11:00 PM</p>
                        </div>
                    </motion.div>
                </div>

                <div className="border-t border-gray-800 mt-8 sm:mt-12 pt-6 sm:pt-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        {/* Left side: Logo */}
                        <div className="flex items-center gap-2">
                            {/* <img src="/logo.png" alt="Restaurant Logo" className="h-8 w-auto" /> */}
                            <h2 className="text-xl text-amber-300 font-serif font-bold">Modat</h2>
                        </div>

                        {/* Center: Links */}
                        <div className="flex flex-wrap justify-center gap-6 text-gray-400 text-sm sm:text-base">
                            <a href="/impressum" className="hover:text-amber-300 transition-colors">Impressum</a>
                            <a href="/datenschutz" className="hover:text-amber-300 transition-colors">Datenschutzerklärung</a>
                            <a href="/haftungsausschluss" className="hover:text-amber-300 transition-colors">Haftungsausschluss (Disclaimer)</a>
                            <a href="/kontakt" className="hover:text-amber-300 transition-colors">Kontakt</a>
                            <a href="/cookies" className="hover:text-amber-300 transition-colors">Cookie-Richtlinie (EU)</a>
                        </div>
                    </div>
                </div>

            </div>
        </footer>
    );
}