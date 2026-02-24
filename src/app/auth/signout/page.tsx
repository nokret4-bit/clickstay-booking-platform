"use client";

import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { TropicalButton } from "@/components/tropical/tropical-button";
import { LogOut, Home, ArrowLeft } from "lucide-react";

export default function SignOutPage() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut({ 
        callbackUrl: "/",
        redirect: true 
      });
    } catch (error) {
      console.error("Sign out error:", error);
      setIsSigningOut(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center bg-gradient-to-br from-tropical-green-soft/20 via-tropical-yellow/10 to-tropical-red/10 py-16">
        {/* Floating decorative elements */}
        <div className="absolute top-20 right-20 w-48 h-48 bg-tropical-red/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-tropical-green/10 rounded-full blur-3xl" style={{animationDelay: '1.5s'}} />
        
        <div className="relative z-10 w-full max-w-md mx-4">
          {/* Sign Out Card */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 text-center">
            {/* Icon */}
            <div className="mb-6 flex justify-center">
              <div className="bg-gradient-to-br from-tropical-red to-tropical-yellow p-4 rounded-full shadow-lg">
                <LogOut className="h-12 w-12 text-white" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold mb-3">
              <span className="bg-gradient-to-r from-tropical-red to-tropical-yellow bg-clip-text text-transparent">
                Sign Out
              </span>
            </h1>

            {/* Message */}
            <p className="text-tropical-black/70 text-lg mb-8">
              Are you sure you want to sign out?
            </p>

            {/* Action Buttons */}
            <div className="space-y-3">
              <TropicalButton
                variant="primary"
                size="lg"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="w-full"
              >
                {isSigningOut ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Signing Out...
                  </>
                ) : (
                  <>
                    <LogOut className="h-5 w-5 mr-2" />
                    Yes, Sign Out
                  </>
                )}
              </TropicalButton>

              <TropicalButton
                variant="outline"
                size="lg"
                onClick={handleCancel}
                disabled={isSigningOut}
                className="w-full"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Cancel
              </TropicalButton>
            </div>

            {/* Additional Info */}
            <div className="mt-6 pt-6 border-t border-tropical-tan/20">
              <p className="text-sm text-tropical-black/60">
                You'll be redirected to the home page after signing out
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 text-center">
            <a 
              href="/"
              className="inline-flex items-center gap-2 text-tropical-black/70 hover:text-tropical-green transition-colors font-medium"
            >
              <Home className="h-4 w-4" />
              Go to Home Page
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
