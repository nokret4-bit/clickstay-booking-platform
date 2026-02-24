"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Building2, User } from "lucide-react";
import { useEffect, useState } from "react";

interface Session {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export function NavbarClient() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        setSession(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Building2 className="h-6 w-6" />
          <span>ClickStay</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/browse">
            <Button variant="ghost">Browse Facilities</Button>
          </Link>

          {!loading && session?.user ? (
            <>
              <Link href="/bookings">
                <Button variant="ghost">My Bookings</Button>
              </Link>
              {(session.user.role === "ADMIN" || session.user.role === "STAFF") && (
                <Link href="/admin">
                  <Button variant="outline">Admin Dashboard</Button>
                </Link>
              )}
              <Link href="/api/auth/signout">
                <Button variant="ghost">
                  <User className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </Link>
            </>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
