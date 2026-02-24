"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Palmtree, User, Menu } from "lucide-react";
import { TropicalButton } from "@/components/tropical/tropical-button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [session, setSession] = useState<{ user?: { role?: string } } | null>(null);

  useEffect(() => {
    // Fetch session on client side
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => setSession(data));
  }, []);

  const userRole = session?.user?.role;
  const isAdmin = userRole === "ADMIN";
  const isStaff = userRole === "STAFF";
  
  // Temporary: Show links if role is undefined (old sessions)
  const showAdminLinks = isAdmin || !userRole;
  const showStaffLinks = isAdmin || isStaff || !userRole;

  return (
    <nav className="sticky top-0 z-50 border-b-2 border-tropical-green/20 bg-white/95 backdrop-blur-md shadow-xl">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-tropical-green/20 rounded-full blur-xl group-hover:bg-tropical-green/30 transition-all duration-300" />
            <div className="relative w-12 h-12 bg-gradient-to-br from-tropical-green to-tropical-green-deep rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
              <Palmtree className="h-6 w-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-tropical-yellow to-tropical-red rounded-full animate-pulse shadow-md" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-2xl bg-gradient-to-r from-tropical-red via-tropical-yellow to-tropical-green bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">Manuel Resort</span>
            <span className="text-xs text-tropical-green-deep font-semibold tracking-wide">Paradise Awaits</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          <Link href="/gallery">
            <Button variant="ghost" className="font-semibold text-tropical-black hover:bg-gradient-to-r hover:from-tropical-red/10 hover:to-tropical-yellow/10 hover:text-tropical-red transition-all duration-300 hover:scale-105 rounded-xl">Gallery</Button>
          </Link>
          
          <Link href="/contact">
            <Button variant="ghost" className="font-semibold text-tropical-black hover:bg-gradient-to-r hover:from-tropical-red/10 hover:to-tropical-yellow/10 hover:text-tropical-red transition-all duration-300 hover:scale-105 rounded-xl">Contact</Button>
          </Link>

          <Link href="/#booking-checker">
            <Button variant="ghost" className="font-semibold text-tropical-black hover:bg-gradient-to-r hover:from-tropical-red/10 hover:to-tropical-yellow/10 hover:text-tropical-red transition-all duration-300 hover:scale-105 rounded-xl">My Bookings</Button>
          </Link>

          <div className="ml-2 border-l border-tropical-green/20 pl-2" />
          
          {session?.user ? (
            <>
              {/* Show Cashier for Admin and Staff */}
              {showStaffLinks && (
                <Link href="/cashier">
                  <Button variant="outline" className="font-semibold border-2 border-tropical-green text-tropical-green hover:bg-tropical-green hover:text-white transition-all duration-300 hover:scale-105 hover:shadow-lg rounded-xl">Cashier</Button>
                </Link>
              )}
              
              {/* Show Management Portal only for Admin */}
              {showAdminLinks && (
                <Link href="/admin">
                  <Button variant="outline" className="font-semibold border-2 border-tropical-green text-tropical-green hover:bg-tropical-green hover:text-white transition-all duration-300 hover:scale-105 hover:shadow-lg rounded-xl">Portal</Button>
                </Link>
              )}
              
              <Link href="/api/auth/signout">
                <Button variant="ghost" className="font-semibold text-tropical-black hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-red-600 transition-all duration-300 hover:scale-105 rounded-xl">
                  <User className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </Link>
            </>
          ) : (
            <Link href="/browse">
              <TropicalButton size="md" className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">Book Now</TropicalButton>
            </Link>
          )}
        </div>
        
        {/* Mobile menu drawer */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <button className="md:hidden p-2.5 hover:bg-gradient-to-r hover:from-tropical-red/10 hover:to-tropical-yellow/10 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95">
              <Menu className="h-6 w-6 text-tropical-red" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-gradient-to-b from-white to-tropical-green/5">
            <SheetHeader className="mb-6 pb-4 border-b border-tropical-green/20">
              <SheetTitle>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-tropical-green to-tropical-green-deep rounded-full flex items-center justify-center shadow-lg">
                    <Palmtree className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-tropical-red via-tropical-yellow to-tropical-green bg-clip-text text-transparent">Menu</span>
                </div>
              </SheetTitle>
            </SheetHeader>
            
            <div className="flex flex-col gap-2">
              <Link href="/gallery" onClick={() => setIsOpen(false)}>
                <Button variant="ghost" className="w-full justify-start font-semibold text-tropical-black hover:bg-gradient-to-r hover:from-tropical-red/10 hover:to-tropical-yellow/10 hover:text-tropical-red transition-all duration-300 hover:translate-x-1 rounded-xl">
                  Gallery
                </Button>
              </Link>
              
              <Link href="/contact" onClick={() => setIsOpen(false)}>
                <Button variant="ghost" className="w-full justify-start font-semibold text-tropical-black hover:bg-gradient-to-r hover:from-tropical-red/10 hover:to-tropical-yellow/10 hover:text-tropical-red transition-all duration-300 hover:translate-x-1 rounded-xl">
                  Contact
                </Button>
              </Link>

              <Link href="/#booking-checker" onClick={() => setIsOpen(false)}>
                <Button variant="ghost" className="w-full justify-start font-semibold text-tropical-black hover:bg-gradient-to-r hover:from-tropical-red/10 hover:to-tropical-yellow/10 hover:text-tropical-red transition-all duration-300 hover:translate-x-1 rounded-xl">
                  My Bookings
                </Button>
              </Link>

              <div className="border-t border-tropical-green/20 my-4" />

              {session?.user ? (
                <>
                  {/* Show Cashier for Admin and Staff */}
                  {showStaffLinks && (
                    <Link href="/cashier" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full justify-start font-semibold border-2 border-tropical-green text-tropical-green hover:bg-tropical-green hover:text-white transition-all duration-300 hover:translate-x-1 hover:shadow-lg rounded-xl">
                        Cashier
                      </Button>
                    </Link>
                  )}
                  
                  {/* Show Management Portal only for Admin */}
                  {showAdminLinks && (
                    <Link href="/admin" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full justify-start font-semibold border-2 border-tropical-green text-tropical-green hover:bg-tropical-green hover:text-white transition-all duration-300 hover:translate-x-1 hover:shadow-lg rounded-xl">
                        Portal
                      </Button>
                    </Link>
                  )}
                  
                  <Link href="/api/auth/signout" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start font-semibold text-tropical-black hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-red-600 transition-all duration-300 hover:translate-x-1 rounded-xl">
                      <User className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </Link>
                </>
              ) : (
                <Link href="/browse" onClick={() => setIsOpen(false)}>
                  <TropicalButton size="md" className="w-full shadow-lg hover:shadow-xl transition-all duration-300">Book Now</TropicalButton>
                </Link>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
