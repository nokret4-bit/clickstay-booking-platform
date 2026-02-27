"use client";

import { useState, useEffect } from "react";
import { NavbarClient } from "@/components/navbar-client";
import { Footer } from "@/components/footer";
import { TropicalButton } from "@/components/tropical/tropical-button";
import { TropicalCard } from "@/components/tropical/tropical-card";
import { Badge } from "@/components/ui/badge";
import {
  Ticket,
  Calendar,
  Users,
  Clock,
  Loader2,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { format, isWeekend } from "date-fns";
import Link from "next/link";

interface TicketType {
  id: string;
  name: string;
  description: string | null;
  weekdayPrice: number;
  weekendPrice: number;
  eventId: string | null;
  event: { id: string; name: string; date: string } | null;
}

interface EventType {
  id: string;
  name: string;
  description: string | null;
  date: string;
  endDate: string | null;
  tickets: TicketType[];
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ticketsRes, eventsRes] = await Promise.all([
          fetch("/api/tickets"),
          fetch("/api/events?upcoming=true"),
        ]);
        const ticketsData = await ticketsRes.json();
        const eventsData = await eventsRes.json();
        setTickets(ticketsData.tickets || []);
        setEvents(eventsData.events || []);
      } catch (error) {
        console.error("Failed to fetch tickets:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const regularTickets = tickets.filter((t) => !t.eventId);
  const todayIsWeekend = isWeekend(new Date());

  return (
    <div className="flex min-h-screen flex-col">
      <NavbarClient />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-purple-500/20 via-pink-400/10 to-tropical-yellow/10 py-20 overflow-hidden">
          <div className="absolute top-20 right-10 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-pink-400/10 rounded-full blur-3xl" style={{ animationDelay: "1s" }} />

          <div className="container mx-auto px-4 text-center relative z-10">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-tropical-red bg-clip-text text-transparent">
                Get Your Tickets
              </span>
            </h1>

            <p className="text-xl text-tropical-black mb-4 max-w-2xl mx-auto font-medium drop-shadow-md bg-white/40 backdrop-blur-sm px-6 py-3 rounded-2xl">
              Buy tickets for regular admission or upcoming events at Manuel Resort
            </p>

            <Link href="/">
              <TropicalButton variant="outline" size="md">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </TropicalButton>
            </Link>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
              </div>
            ) : (
              <>
                {/* Regular Admission Tickets */}
                {regularTickets.length > 0 && (
                  <div className="mb-16">
                    <div className="text-center mb-10">
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">Regular Admission</h2>
                      <p className="text-gray-500">
                        Walk-in tickets for the Function Hall
                        {todayIsWeekend && (
                          <Badge className="ml-2 bg-orange-100 text-orange-700 border-orange-200">
                            Weekend pricing today
                          </Badge>
                        )}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {regularTickets.map((ticket) => (
                        <TropicalCard key={ticket.id} className="relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
                          <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h3 className="text-xl font-bold text-gray-900">{ticket.name}</h3>
                                {ticket.description && (
                                  <p className="text-sm text-gray-500 mt-1">{ticket.description}</p>
                                )}
                              </div>
                              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                <Ticket className="h-5 w-5 text-purple-600" />
                              </div>
                            </div>

                            <div className="space-y-3 mb-6">
                              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-green-600" />
                                  <span className="text-sm font-medium text-green-700">Weekday</span>
                                </div>
                                <span className="text-lg font-bold text-green-600">
                                  ₱{Number(ticket.weekdayPrice).toLocaleString()}
                                </span>
                              </div>
                              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <Sparkles className="h-4 w-4 text-orange-600" />
                                  <span className="text-sm font-medium text-orange-700">Weekend</span>
                                </div>
                                <span className="text-lg font-bold text-orange-600">
                                  ₱{Number(ticket.weekendPrice).toLocaleString()}
                                </span>
                              </div>
                            </div>

                            <div className="text-xs text-gray-400 flex items-center gap-1 mb-4">
                              <Users className="h-3 w-3" />
                              {ticket.facility.name}
                            </div>

                            <div className="text-center p-3 bg-purple-50 rounded-lg">
                              <p className="text-sm font-medium text-purple-700">
                                Today&apos;s Price:{" "}
                                <span className="text-xl font-bold">
                                  ₱{todayIsWeekend
                                    ? Number(ticket.weekendPrice).toLocaleString()
                                    : Number(ticket.weekdayPrice).toLocaleString()}
                                </span>
                              </p>
                            </div>
                          </div>
                        </TropicalCard>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upcoming Events */}
                {events.length > 0 && (
                  <div className="mb-16">
                    <div className="text-center mb-10">
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">Upcoming Events</h2>
                      <p className="text-gray-500">Special events happening at Manuel Resort</p>
                    </div>

                    <div className="space-y-6">
                      {events.map((event) => (
                        <TropicalCard key={event.id} className="overflow-hidden">
                          <div className="bg-gradient-to-r from-purple-600 to-pink-500 p-6 text-white">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="text-2xl font-bold mb-2">{event.name}</h3>
                                <div className="flex items-center gap-4 text-white/90">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>{format(new Date(event.date), "MMMM dd, yyyy")}</span>
                                  </div>
                                  {event.endDate && (
                                    <span>— {format(new Date(event.endDate), "MMMM dd, yyyy")}</span>
                                  )}
                                </div>
                                {event.description && (
                                  <p className="text-white/80 mt-2">{event.description}</p>
                                )}
                              </div>
                              <Badge className="bg-white/20 text-white border-white/30">
                                {event.facility.name}
                              </Badge>
                            </div>
                          </div>

                          {event.tickets.length > 0 ? (
                            <div className="p-6">
                              <h4 className="font-semibold text-gray-700 mb-4">Available Tickets</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {event.tickets.map((ticket: any) => (
                                  <div
                                    key={ticket.id}
                                    className="border-2 rounded-xl p-4 hover:border-purple-300 transition-colors"
                                  >
                                    <h5 className="font-bold text-gray-900 mb-2">{ticket.name}</h5>
                                    <div className="space-y-1 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-gray-500">Weekday</span>
                                        <span className="font-semibold text-green-600">
                                          ₱{Number(ticket.weekdayPrice).toLocaleString()}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-500">Weekend</span>
                                        <span className="font-semibold text-orange-600">
                                          ₱{Number(ticket.weekendPrice).toLocaleString()}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="p-6 text-center text-gray-400">
                              <p>Tickets coming soon!</p>
                            </div>
                          )}
                        </TropicalCard>
                      ))}
                    </div>
                  </div>
                )}

                {/* No tickets or events */}
                {regularTickets.length === 0 && events.length === 0 && (
                  <div className="text-center py-20">
                    <Ticket className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">No Tickets Available</h2>
                    <p className="text-gray-500 mb-6">
                      There are currently no tickets or events available. Check back later!
                    </p>
                    <Link href="/">
                      <TropicalButton variant="primary">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Home
                      </TropicalButton>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
