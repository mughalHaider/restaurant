// app/page.tsx
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Phone, Mail, ChevronDown } from 'lucide-react';

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Enhanced Navbar */}
      <nav className={`bg-white/95 backdrop-blur-md shadow-sm fixed w-full top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'py-3' : 'py-4'
      }`}>
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center"
            >
              <h1 className="text-xl sm:text-2xl font-bold text-amber-800 font-serif">
                Madot Restaurant
              </h1>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2 sm:space-x-4"
            >
              <Link 
                href="/login" 
                className="px-3 py-1.5 sm:px-6 sm:py-2 text-amber-800 border border-amber-800 rounded-full hover:bg-amber-50 transition-all duration-300 hover:scale-105 text-sm sm:text-base cursor-pointer"
              >
                <span className="hidden sm:inline">Employee Login</span>
                <span className="sm:hidden">Login</span>
              </Link>
              
              <Link 
                href="/reservation" 
                className="px-3 py-1.5 sm:px-6 sm:py-2 bg-amber-600 text-white rounded-full hover:bg-amber-700 transition-all duration-300 hover:scale-105 shadow-lg text-sm sm:text-base cursor-pointer"
              >
                <span className="hidden sm:inline">Book a Table</span>
                <span className="sm:hidden">Book</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Enhanced Hero Section */}
      <section className="relative h-screen flex items-center justify-center pt-16">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60"></div>
        </div>

        <div className="relative z-10 text-center text-white px-4 sm:px-6 max-w-6xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-serif mb-4 sm:mb-6"
          >
            Welcome to
          </motion.h1>
          
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold font-serif mb-6 sm:mb-8 text-amber-300 leading-tight"
          >
            Madot Restaurant
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 max-w-2xl mx-auto font-light px-4"
          >
            Experience culinary excellence in an atmosphere of refined elegance
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center"
          >
            <Link 
              href="/reservation" 
              className="px-6 py-3 sm:px-8 sm:py-4 bg-amber-600 text-white rounded-full hover:bg-amber-700 transition-all duration-300 hover:scale-105 text-base sm:text-lg font-semibold shadow-2xl w-full sm:w-auto text-center cursor-pointer"
            >
              Reserve Your Table
            </Link>
            <a 
              href="#about" 
              className="px-6 py-3 sm:px-8 sm:py-4 border-2 border-white text-white rounded-full hover:bg-white hover:text-amber-800 transition-all duration-300 hover:scale-105 text-base sm:text-lg font-semibold w-full sm:w-auto text-center cursor-pointer"
            >
              Discover More
            </a>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer"
        >
          <a href="#about" className="block animate-bounce">
            <ChevronDown className="w-8 h-8 text-white" />
          </a>
        </motion.div>
      </section>

      {/* Enhanced About Section */}
      <section id="about" className="py-16 sm:py-24 bg-gradient-to-b from-amber-50 to-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <h2 className="text-3xl sm:text-5xl font-bold text-amber-800 font-serif mb-4 sm:mb-6 text-center lg:text-left">
                Our Story
              </h2>
              <p className="text-base sm:text-lg text-gray-700 mb-4 sm:mb-6 leading-relaxed text-center lg:text-left">
                Nestled in the heart of the city, Madot Restaurant has been serving exceptional cuisine since 2010. 
                Our passion for culinary excellence and warm hospitality creates unforgettable dining experiences.
              </p>
              <p className="text-base sm:text-lg text-gray-700 mb-6 sm:mb-8 leading-relaxed text-center lg:text-left">
                With carefully crafted menus featuring locally sourced ingredients and an extensive wine selection, 
                we invite you to indulge in a journey of flavors that will delight your senses.
              </p>
              <motion.div 
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                className="grid grid-cols-3 gap-3 sm:gap-6 text-center lg:text-left"
              >
                <motion.div variants={fadeInUp} className="bg-white rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow">
                  <div className="text-2xl sm:text-3xl font-bold text-amber-600 mb-1">12+</div>
                  <div className="text-xs sm:text-sm text-gray-600 font-medium">Years Experience</div>
                </motion.div>
                <motion.div variants={fadeInUp} className="bg-white rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow">
                  <div className="text-2xl sm:text-3xl font-bold text-amber-600 mb-1">50+</div>
                  <div className="text-xs sm:text-sm text-gray-600 font-medium">Menu Items</div>
                </motion.div>
                <motion.div variants={fadeInUp} className="bg-white rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow">
                  <div className="text-2xl sm:text-3xl font-bold text-amber-600 mb-1">12</div>
                  <div className="text-xs sm:text-sm text-gray-600 font-medium">Elegant Tables</div>
                </motion.div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-3 sm:space-y-4">
                  <img 
                    src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" 
                    alt="Gourmet dish presentation" 
                    className="rounded-xl shadow-xl hover:scale-105 transition-transform duration-300 w-full h-32 sm:h-48 object-cover"
                  />
                  <img 
                    src="https://images.unsplash.com/photo-1565958011703-44f9829ba187?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" 
                    alt="Pizza specialty" 
                    className="rounded-xl shadow-xl hover:scale-105 transition-transform duration-300 w-full h-32 sm:h-48 object-cover"
                  />
                </div>
                <div className="space-y-3 sm:space-y-4 mt-4 sm:mt-8">
                  <img 
                    src="https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" 
                    alt="Soup course" 
                    className="rounded-xl shadow-xl hover:scale-105 transition-transform duration-300 w-full h-32 sm:h-48 object-cover"
                  />
                  <img 
                    src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" 
                    alt="Pizza with fresh ingredients" 
                    className="rounded-xl shadow-xl hover:scale-105 transition-transform duration-300 w-full h-32 sm:h-48 object-cover"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}}></div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-5xl font-bold font-serif mb-4 sm:mb-6">
              Ready for an Unforgettable Experience?
            </h2>
            <p className="text-lg sm:text-xl mb-6 sm:mb-10 max-w-2xl mx-auto px-4 leading-relaxed">
              Book your table today and let us create a memorable dining experience for you and your loved ones.
            </p>
            <Link 
              href="/reservation" 
              className="inline-block px-6 py-3 sm:px-10 sm:py-4 bg-white text-amber-800 rounded-full hover:bg-amber-50 transition-all duration-300 hover:scale-105 text-base sm:text-lg font-semibold shadow-2xl w-full sm:w-auto cursor-pointer"
            >
              Make a Reservation
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer Component */}
      
    </div>
  );
}