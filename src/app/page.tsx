// app/page.tsx
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className={`bg-white/90 backdrop-blur-md shadow-sm fixed w-full top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'py-2' : 'py-4'
      }`}>
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center">
            {/* Restaurant Name - Left Side */}
            <div className="flex items-center">
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xl sm:text-2xl font-bold text-amber-800 font-serif"
              >
                Madot Restaurant
              </motion.h1>
            </div>

            {/* Buttons - Right Side */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2 sm:space-x-4"
            >
              <Link 
                href="/login" 
                className="px-3 py-1.5 sm:px-6 sm:py-2 text-amber-800 border border-amber-800 rounded-full hover:bg-amber-50 transition-all duration-300 hover:scale-105 text-sm sm:text-base"
              >
                <span className="hidden sm:inline">Employee Login</span>
                <span className="sm:hidden">Login</span>
              </Link>
              
              <Link 
                href="/reservation" 
                className="px-3 py-1.5 sm:px-6 sm:py-2 bg-amber-600 text-white rounded-full hover:bg-amber-700 transition-all duration-300 hover:scale-105 shadow-lg text-sm sm:text-base"
              >
                <span className="hidden sm:inline">Book a Table</span>
                <span className="sm:hidden">Book</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Background Image */}
      <section className="relative h-screen flex items-center justify-center pt-16">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")',
          }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        {/* Hero Content */}
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
              className="px-6 py-3 sm:px-8 sm:py-4 bg-amber-600 text-white rounded-full hover:bg-amber-700 transition-all duration-300 hover:scale-105 text-base sm:text-lg font-semibold shadow-2xl w-full sm:w-auto text-center"
            >
              Reserve Your Table
            </Link>
            <Link 
              href="#about" 
              className="px-6 py-3 sm:px-8 sm:py-4 border border-white text-white rounded-full hover:bg-white hover:text-amber-800 transition-all duration-300 hover:scale-105 text-base sm:text-lg font-semibold w-full sm:w-auto text-center"
            >
              Discover More
            </Link>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="animate-bounce">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </motion.div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 sm:py-20 bg-amber-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-amber-800 font-serif mb-4 sm:mb-6 text-center lg:text-left">
                Our Story
              </h2>
              <p className="text-base sm:text-lg text-gray-700 mb-4 sm:mb-6 text-center lg:text-left">
                Nestled in the heart of the city, Madot Restaurant has been serving exceptional cuisine since 2010. 
                Our passion for culinary excellence and warm hospitality creates unforgettable dining experiences.
              </p>
              <p className="text-base sm:text-lg text-gray-700 mb-6 sm:mb-8 text-center lg:text-left">
                With carefully crafted menus featuring locally sourced ingredients and an extensive wine selection, 
                we invite you to indulge in a journey of flavors that will delight your senses.
              </p>
              <div className="grid grid-cols-3 gap-3 sm:gap-4 text-center lg:text-left">
                <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
                  <div className="text-xl sm:text-2xl font-bold text-amber-600">12+</div>
                  <div className="text-xs sm:text-sm text-gray-600">Years Experience</div>
                </div>
                <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
                  <div className="text-xl sm:text-2xl font-bold text-amber-600">50+</div>
                  <div className="text-xs sm:text-sm text-gray-600">Menu Items</div>
                </div>
                <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
                  <div className="text-xl sm:text-2xl font-bold text-amber-600">12</div>
                  <div className="text-xs sm:text-sm text-gray-600">Elegant Tables</div>
                </div>
              </div>
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
                    alt="Dish 1" 
                    className="rounded-lg shadow-lg hover:scale-105 transition-transform duration-300 w-full h-32 sm:h-48 object-cover"
                  />
                  <img 
                    src="https://images.unsplash.com/photo-1565958011703-44f9829ba187?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" 
                    alt="Dish 2" 
                    className="rounded-lg shadow-lg hover:scale-105 transition-transform duration-300 w-full h-32 sm:h-48 object-cover"
                  />
                </div>
                <div className="space-y-3 sm:space-y-4 mt-4 sm:mt-8">
                  <img 
                    src="https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" 
                    alt="Dish 3" 
                    className="rounded-lg shadow-lg hover:scale-105 transition-transform duration-300 w-full h-32 sm:h-48 object-cover"
                  />
                  <img 
                    src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" 
                    alt="Dish 4" 
                    className="rounded-lg shadow-lg hover:scale-105 transition-transform duration-300 w-full h-32 sm:h-48 object-cover"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-amber-800 text-white">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold font-serif mb-4 sm:mb-6">
              Ready for an Unforgettable Experience?
            </h2>
            <p className="text-lg sm:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
              Book your table today and let us create a memorable dining experience for you and your loved ones.
            </p>
            <Link 
              href="/reservation" 
              className="inline-block px-6 py-3 sm:px-8 sm:py-4 bg-white text-amber-800 rounded-full hover:bg-amber-100 transition-all duration-300 hover:scale-105 text-base sm:text-lg font-semibold shadow-2xl w-full sm:w-auto"
            >
              Make a Reservation
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center md:text-left">
              <h3 className="text-xl sm:text-2xl font-bold text-amber-300 font-serif mb-3 sm:mb-4">Madot Restaurant</h3>
              <p className="text-gray-400 text-sm sm:text-base">
                Fine dining experience with exceptional cuisine and impeccable service.
              </p>
            </div>
            <div className="text-center md:text-left">
              <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Contact Info</h4>
              <p className="text-gray-400 text-sm sm:text-base">123 Gourmet Street</p>
              <p className="text-gray-400 text-sm sm:text-base">Culinary City, CC 10101</p>
              <p className="text-gray-400 text-sm sm:text-base">reservations@erestaurant.com</p>
              <p className="text-gray-400 text-sm sm:text-base">+1 (555) 123-4567</p>
            </div>
            <div className="text-center md:text-left">
              <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Hours</h4>
              <p className="text-gray-400 text-sm sm:text-base">Monday - Thursday: 5PM - 10PM</p>
              <p className="text-gray-400 text-sm sm:text-base">Friday - Sunday: 5PM - 11PM</p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-gray-400 text-sm sm:text-base">
            <p>&copy; 2024 Madot Restaurant. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}