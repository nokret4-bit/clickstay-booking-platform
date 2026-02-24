import Link from "next/link";
import { Palmtree, Mail, Phone, MapPin, Facebook, Instagram, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative bg-gradient-to-br from-tropical-green-deep via-tropical-green to-tropical-green-soft text-white overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-tropical-red via-tropical-yellow to-tropical-green-soft" />
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <Palmtree className="h-10 w-10 text-tropical-yellow" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-tropical-red rounded-full animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-2xl bg-gradient-to-r from-tropical-yellow to-white bg-clip-text text-transparent">Manuel Resort</h3>
                <p className="text-tropical-tan text-xs">Your Tropical Paradise</p>
              </div>
            </div>
            <p className="text-white/90 text-sm leading-relaxed mb-4">
              Experience the perfect blend of nature and luxury at Manuel Resort. 
              Book your dream vacation today and create unforgettable memories in paradise.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-tropical-red flex items-center justify-center transition-all hover:scale-110">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-tropical-red flex items-center justify-center transition-all hover:scale-110">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-tropical-red flex items-center justify-center transition-all hover:scale-110">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-tropical-yellow">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/browse" className="text-white/80 hover:text-tropical-yellow transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-tropical-yellow opacity-0 group-hover:opacity-100 transition-opacity" />
                  Facilities
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="text-white/80 hover:text-tropical-yellow transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-tropical-yellow opacity-0 group-hover:opacity-100 transition-opacity" />
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-white/80 hover:text-tropical-yellow transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-tropical-yellow opacity-0 group-hover:opacity-100 transition-opacity" />
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/#booking-checker" className="text-white/80 hover:text-tropical-yellow transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-tropical-yellow opacity-0 group-hover:opacity-100 transition-opacity" />
                  My Bookings
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-tropical-yellow">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3 text-white/80">
                <MapPin className="h-5 w-5 text-tropical-yellow mt-0.5 flex-shrink-0" />
                <span>Manuel Resort, Piñan, Philippines</span>
              </li>
              <li className="flex items-center gap-3 text-white/80">
                <Phone className="h-5 w-5 text-tropical-yellow flex-shrink-0" />
                <span>+63 123 456 7890</span>
              </li>
              <li className="flex items-center gap-3 text-white/80">
                <Mail className="h-5 w-5 text-tropical-yellow flex-shrink-0" />
                <span>info@manuelresort.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/20 text-center text-sm text-white/70">
          <p>&copy; {new Date().getFullYear()} Manuel Resort. All rights reserved.</p>
        </div>
      </div>
      
      {/* Decorative palm leaves */}
      <div className="absolute bottom-0 right-0 w-64 h-64 opacity-5">
        <Palmtree className="w-full h-full" />
      </div>
    </footer>
  );
}
