import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { TropicalCard } from "@/components/tropical/tropical-card";
import { TropicalButton } from "@/components/tropical/tropical-button";
import { Mail, Phone, MapPin, Clock, Facebook, Instagram } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-tropical-green-deep/20 via-tropical-green-soft/30 to-tropical-blue/20 py-24 overflow-hidden">
        <div className="absolute top-10 left-10 w-64 h-64 bg-tropical-yellow/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-tropical-red/10 rounded-full blur-3xl" style={{animationDelay: '1s'}} />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-tropical-green/90 text-white px-6 py-2 rounded-full mb-6 shadow-lg">
            <Mail className="h-5 w-5" />
            <span className="font-semibold">Get in Touch</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-tropical-red via-tropical-yellow to-tropical-green bg-clip-text text-transparent">
              Contact Us
            </span>
          </h1>
          
          <div className="max-w-3xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow-md px-8 py-4 mb-4">
            <p className="text-xl md:text-2xl text-tropical-black font-semibold">
              We're Here to Help You Plan Your Perfect Getaway
            </p>
          </div>
          
          <p className="text-lg text-tropical-black font-semibold max-w-2xl mx-auto px-6 py-2 bg-white/70 backdrop-blur-sm rounded-xl">
            Have questions? Need assistance with your booking? Our team is ready to assist you
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <main className="flex-1 py-16 bg-gradient-to-b from-white to-tropical-tan/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Contact Form */}
            <TropicalCard variant="default" className="p-8">
              <h2 className="text-3xl font-bold mb-6 text-tropical-black">Send Us a Message</h2>
              <form className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-tropical-black mb-2">
                    Full Name *
                  </label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Juan Dela Cruz"
                    className="h-12 border-2 border-tropical-tan/30 focus:border-tropical-red rounded-xl"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-tropical-black mb-2">
                    Email Address *
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="juan@example.com"
                    className="h-12 border-2 border-tropical-tan/30 focus:border-tropical-red rounded-xl"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-tropical-black mb-2">
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+63 912 345 6789"
                    className="h-12 border-2 border-tropical-tan/30 focus:border-tropical-red rounded-xl"
                  />
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-tropical-black mb-2">
                    Subject *
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    placeholder="Booking Inquiry"
                    className="h-12 border-2 border-tropical-tan/30 focus:border-tropical-red rounded-xl"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-tropical-black mb-2">
                    Message *
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Tell us how we can help you..."
                    rows={6}
                    className="border-2 border-tropical-tan/30 focus:border-tropical-red rounded-xl resize-none"
                    required
                  />
                </div>
                
                <TropicalButton type="submit" size="lg" className="w-full">
                  Send Message
                </TropicalButton>
              </form>
            </TropicalCard>

            {/* Contact Info Cards */}
            <div className="space-y-6">
              <TropicalCard variant="green" className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-tropical-green rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-tropical-black mb-2">Visit Us</h3>
                    <p className="text-tropical-black/70">
                      Manuel Resort<br />
                      San Antonio, Isabela<br />
                      Philippines, 3313
                    </p>
                  </div>
                </div>
              </TropicalCard>

              <TropicalCard variant="accent" className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-gradient-tropical rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-tropical-black mb-2">Call Us</h3>
                    <p className="text-tropical-black/70 mb-1">
                      <a href="tel:+631234567890" className="hover:text-tropical-red transition-colors">
                        +63 123 456 7890
                      </a>
                    </p>
                    <p className="text-tropical-black/70">
                      <a href="tel:+639876543210" className="hover:text-tropical-red transition-colors">
                        +63 987 654 3210
                      </a>
                    </p>
                  </div>
                </div>
              </TropicalCard>

              <TropicalCard variant="default" className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-tropical-blue rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-tropical-black mb-2">Email Us</h3>
                    <p className="text-tropical-black/70 mb-1">
                      <a href="mailto:info@manuelresort.com" className="hover:text-tropical-red transition-colors">
                        info@manuelresort.com
                      </a>
                    </p>
                    <p className="text-tropical-black/70">
                      <a href="mailto:reservations@manuelresort.com" className="hover:text-tropical-red transition-colors">
                        reservations@manuelresort.com
                      </a>
                    </p>
                  </div>
                </div>
              </TropicalCard>

              <TropicalCard variant="green" className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-tropical-green-soft rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-tropical-black mb-2">Office Hours</h3>
                    <p className="text-tropical-black/70">
                      Monday - Sunday<br />
                      8:00 AM - 8:00 PM
                    </p>
                  </div>
                </div>
              </TropicalCard>

              {/* Social Media */}
              <TropicalCard variant="accent" className="p-6">
                <h3 className="text-xl font-bold text-tropical-black mb-4">Follow Us</h3>
                <div className="flex gap-3">
                  <a 
                    href="#" 
                    className="w-12 h-12 rounded-full bg-gradient-tropical flex items-center justify-center text-white hover:scale-110 transition-transform shadow-md"
                  >
                    <Facebook className="h-6 w-6" />
                  </a>
                  <a 
                    href="#" 
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white hover:scale-110 transition-transform shadow-md"
                  >
                    <Instagram className="h-6 w-6" />
                  </a>
                </div>
              </TropicalCard>
            </div>
          </div>

          {/* Map Section - Placeholder */}
          <TropicalCard className="overflow-hidden">
            <div className="aspect-[21/9] bg-gradient-to-br from-tropical-green-soft to-tropical-blue flex items-center justify-center">
              <div className="text-center text-white">
                <MapPin className="h-20 w-20 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Find Us on the Map</h3>
                <p className="text-white/80">Map integration placeholder</p>
              </div>
            </div>
          </TropicalCard>
        </div>
      </main>

      <Footer />
    </div>
  );
}
