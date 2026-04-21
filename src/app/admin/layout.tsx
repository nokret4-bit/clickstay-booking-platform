"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Calendar,
  Building2,
  BarChart3,
  Coins,
  Megaphone,
  Image,
  UserCog,
  Activity,
  Banknote,
  Home,
  Palmtree,
  LogOut,
  ChevronRight,
  Sparkles,
  Star,
  Ticket,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { hasPermission } from "@/lib/permissions";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(session => {
        if (session?.user) {
          setRole(session.user.role || null);
          setPermissions(session.user.permissions || {});
          setIsAdmin(session.user.role === 'ADMIN');
        }
      });
  }, []);

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname?.startsWith(href);
  };

  const navItems = [
    { href: "/dashboard" as const, label: "Dashboard", icon: LayoutDashboard, adminOnly: false, badge: null, permission: null },
    { href: "/dashboard/reservations" as const, label: "Reservations", icon: Calendar, adminOnly: false, badge: null, permission: "manage_bookings" as const },
    { href: "/cashier" as const, label: "Cashier", icon: Banknote, adminOnly: false, badge: null, permission: "cashier" as const },
    { href: "/dashboard/facilities" as const, label: "Facilities", icon: Building2, adminOnly: false, badge: null, permission: "manage_facilities" as const },
    { href: "/dashboard/pricing" as const, label: "Pricing", icon: Coins, adminOnly: false, badge: null, permission: "manage_pricing" as const },
    { href: "/dashboard/tickets" as const, label: "Tickets", icon: Ticket, adminOnly: true, badge: null, permission: null },
    { href: "/dashboard/reviews" as const, label: "Reviews", icon: Star, adminOnly: true, badge: null, permission: null },
    { href: "/dashboard/reports" as const, label: "Reports", icon: BarChart3, adminOnly: false, badge: null, permission: "view_reports" as const },
    { href: "/dashboard/promos" as const, label: "Promo Management", icon: Megaphone, adminOnly: true, badge: null, permission: null },
    { href: "/dashboard/gallery" as const, label: "Gallery", icon: Image, adminOnly: true, badge: null, permission: null },
    { href: "/dashboard/staff" as const, label: "Staff Management", icon: UserCog, adminOnly: false, badge: null, permission: "manage_staff" as const },
    { href: "/dashboard/activity-logs" as const, label: "Activity Logs", icon: Activity, adminOnly: false, badge: null, permission: "view_reports" as const },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-tropical-green-deep to-tropical-green fixed h-full shadow-2xl z-50 flex flex-col border-r border-white/10">
        {/* Logo/Header - Fixed at top */}
        <div className="p-6 border-b border-white/20 bg-gradient-to-b from-tropical-green-deep to-tropical-green relative z-20">
          <Link href="/" className="flex items-center gap-3 text-white hover:opacity-90 transition-all duration-300 group">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
              <Palmtree className="h-8 w-8 text-tropical-green-deep" />
            </div>
            <div>
              <h2 className="font-bold text-xl tracking-tight">Manuel Resort</h2>
              <p className="text-sm text-white/90 font-medium">Portal</p>
            </div>
          </Link>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {/* Navigation */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              if (item.adminOnly && !isAdmin) return null;
              if (item.permission && role === "STAFF" && !hasPermission("STAFF", permissions, item.permission)) return null;

              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden
                    ${
                      active
                        ? 'bg-white text-tropical-green-deep shadow-lg font-semibold'
                        : 'text-white hover:bg-white/15 hover:translate-x-1'
                    }
                  `}
                >
                  <div className="flex items-center gap-3 relative z-10">
                    <Icon className={`h-5 w-5 transition-all duration-300 ${
                      active ? 'scale-110' : 'group-hover:scale-110'
                    }`} />
                    <span className="font-medium text-[15px]">{item.label}</span>
                  </div>
                  
                  {/* Badge */}
                  {item.badge && (
                    <Badge className="bg-yellow-400 text-tropical-green-deep text-xs px-2 py-0.5 font-bold border-0 shadow-md">
                      <Sparkles className="h-3 w-3 mr-1 inline" />
                      {item.badge}
                    </Badge>
                  )}
                  
                  {/* Active indicator */}
                  {active && (
                    <ChevronRight className="h-5 w-5 text-tropical-green-deep" />
                  )}
                  
                  {/* Hover effect background */}
                  {!active && (
                    <div className="absolute inset-0 bg-white/5 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-white/20 space-y-2 bg-gradient-to-t from-tropical-green-deep/50 to-transparent">
          <Link
            href="/auth/signout"
            className="flex items-center gap-3 px-4 py-3 text-white hover:bg-red-500/40 rounded-xl transition-all duration-300 w-full group hover:translate-x-1 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-red-500/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            <LogOut className="h-5 w-5 relative z-10 group-hover:scale-110 transition-transform" />
            <span className="font-medium text-[15px] relative z-10">Logout</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 text-white hover:bg-white/15 rounded-xl transition-all duration-300 w-full group hover:translate-x-1 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/5 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            <Home className="h-5 w-5 relative z-10 group-hover:scale-110 transition-transform" />
            <span className="font-medium text-[15px] relative z-10">Back to Site</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">{children}</main>
    </div>
  );
}
