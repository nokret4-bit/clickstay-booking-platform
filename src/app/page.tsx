"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { BookingChecker } from "@/components/booking-checker";
import { PromoSlider } from "@/components/promo-slider";
import { TropicalButton } from "@/components/tropical/tropical-button";
import { TropicalCard } from "@/components/tropical/tropical-card";
import { PreBookingModal } from "@/components/pre-booking-modal";
import { Calendar, Sparkles, Shield, Palmtree, Home } from "lucide-react";

export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleBookStayClick = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 bg-white/95 backdrop-blur-sm">
        {/* Promo Slider Section - Edge to Edge */}
        <section className="w-full">
          <PromoSlider />
        </section>

        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-tropical-blue/20 via-tropical-green-soft/10 to-tropical-yellow/10 py-24 md:py-32 overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-20 right-10 w-72 h-72 bg-tropical-yellow/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-tropical-red/10 rounded-full blur-3xl" style={{animationDelay: '1s'}} />
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-tropical-yellow/90 text-tropical-black px-6 py-2 rounded-full mb-6 shadow-lg">
                <Palmtree className="h-5 w-5" />
                <span className="font-semibold">Your Tropical Paradise Awaits</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
                <span className="bg-gradient-to-r from-tropical-red via-tropical-yellow to-tropical-green bg-clip-text text-transparent">
                  Escape to Manuel Resort
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-tropical-black mb-4 max-w-3xl mx-auto font-bold drop-shadow-lg">
                Where Paradise Meets Comfort
              </p>
              
              <p className="text-lg text-tropical-black/90 mb-10 max-w-2xl mx-auto font-medium drop-shadow-md bg-white/40 backdrop-blur-sm px-6 py-3 rounded-2xl">
                Immerse yourself in tropical luxury with pristine pools, cozy cottages, 
                and world-class amenities. Your dream vacation starts here.
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center items-center">
                <TropicalButton 
                  size="lg" 
                  variant="primary"
                  onClick={handleBookStayClick}
                >
                  Book Your Stay
                </TropicalButton>
                <Link href="/#booking-checker">
                  <TropicalButton size="lg" variant="outline">
                    Check My Booking
                  </TropicalButton>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Booking Checker Section */}
        <section id="booking-checker" className="py-20 bg-gradient-to-b from-white to-tropical-tan/10">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-tropical-red to-tropical-green bg-clip-text text-transparent">
                Track Your Booking
              </h2>
              <p className="text-tropical-black/70 text-lg">Enter your booking code to view details and manage your reservation</p>
            </div>
            <BookingChecker />
          </div>
        </section>

        {/* Features Section */}
        <section className="relative py-20 bg-gradient-to-b from-tropical-tan/10 to-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-tropical-green-deep to-tropical-green-soft bg-clip-text text-transparent">
                  Why Choose Manuel Resort Online Booking?
                </span>
              </h2>
              <p className="text-lg text-tropical-black/70 max-w-2xl mx-auto">
                Experience hassle-free booking with premium amenities and unmatched hospitality
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <TropicalCard hover variant="default" className="text-center">
                <div className="w-16 h-16 bg-gradient-tropical rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-tropical-black">Real-Time Availability</h3>
                <p className="text-tropical-black/70">
                  Check live availability and book instantly without waiting for confirmation.
                </p>
              </TropicalCard>

              <TropicalCard hover variant="default" className="text-center">
                <div className="w-16 h-16 bg-gradient-green rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-tropical-black">Secure Payments</h3>
                <p className="text-tropical-black/70">
                  Pay securely with GCash through our trusted PayMongo integration.
                </p>
              </TropicalCard>

              <TropicalCard hover variant="default" className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-tropical-yellow to-tropical-red rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Home className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-tropical-black">Multiple Facilities</h3>
                <p className="text-tropical-black/70">
                  Choose from luxury rooms, pool cottages, and spacious function halls.
                </p>
              </TropicalCard>

              <TropicalCard hover variant="default" className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-tropical-blue to-tropical-green rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-tropical-black">Instant Confirmation</h3>
                <p className="text-tropical-black/70">
                  Receive booking confirmations and calendar invites immediately via email.
                </p>
              </TropicalCard>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative bg-gradient-to-br from-tropical-green-deep to-tropical-green-soft py-24 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-tropical-red via-tropical-yellow to-white" />
          <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-tropical-yellow/20 rounded-full blur-3xl" />
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-tropical-red/20 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <Palmtree className="h-16 w-16 text-tropical-yellow mx-auto mb-6 animate-float" />
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Ready to Experience Paradise?
            </h2>
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
              Don't wait! Browse our stunning facilities and secure your dream vacation today. 
              Limited availability for peak seasons.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <TropicalButton 
                size="lg" 
                className="bg-white text-tropical-red hover:scale-110 hover:shadow-2xl"
                onClick={handleBookStayClick}
              >
                Explore Facilities
              </TropicalButton>
              <a href="tel:+631234567890">
                <TropicalButton size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-tropical-green">
                  Call Us Now
                </TropicalButton>
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      
      {/* Pre-booking Modal */}
      <PreBookingModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
