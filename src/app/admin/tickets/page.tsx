"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Ticket,
  Plus,
  Trash2,
  Edit,
  Calendar,
  DollarSign,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";

interface TicketType {
  id: string;
  name: string;
  description: string | null;
  weekdayPrice: number;
  weekendPrice: number;
  eventId: string | null;
  isActive: boolean;
  event: { id: string; name: string; date: string } | null;
  _count: { purchases: number };
}

interface EventType {
  id: string;
  name: string;
  description: string | null;
  date: string;
  endDate: string | null;
  isActive: boolean;
  tickets: any[];
}

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingTicket, setEditingTicket] = useState<TicketType | null>(null);
  const [editingEvent, setEditingEvent] = useState<EventType | null>(null);
  const [activeTab, setActiveTab] = useState<"tickets" | "events">("tickets");

  // Ticket form
  const [ticketForm, setTicketForm] = useState({
    name: "",
    description: "",
    weekdayPrice: "",
    weekendPrice: "",
    eventId: "",
  });

  // Event form
  const [eventForm, setEventForm] = useState({
    name: "",
    description: "",
    date: "",
    endDate: "",
    maxCapacity: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ticketsRes, eventsRes] = await Promise.all([
        fetch("/api/tickets?all=true"),
        fetch("/api/events?all=true"),
      ]);
      const ticketsData = await ticketsRes.json();
      const eventsData = await eventsRes.json();

      setTickets(ticketsData.tickets || []);
      setEvents(eventsData.events || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // TICKET CRUD
  const handleSaveTicket = async () => {
    try {
      const url = editingTicket
        ? `/api/tickets/${editingTicket.id}`
        : "/api/tickets";
      const method = editingTicket ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ticketForm),
      });

      if (!res.ok) throw new Error("Failed to save ticket");

      setShowTicketModal(false);
      setEditingTicket(null);
      resetTicketForm();
      fetchData();
    } catch (error) {
      console.error("Save ticket error:", error);
      alert("Failed to save ticket");
    }
  };

  const handleDeleteTicket = async (id: string) => {
    if (!confirm("Are you sure you want to delete this ticket?")) return;
    try {
      const res = await fetch(`/api/tickets/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      fetchData();
    } catch (error) {
      console.error("Delete ticket error:", error);
      alert("Failed to delete ticket");
    }
  };

  const openEditTicket = (ticket: TicketType) => {
    setEditingTicket(ticket);
    setTicketForm({
      name: ticket.name,
      description: ticket.description || "",
      weekdayPrice: String(ticket.weekdayPrice),
      weekendPrice: String(ticket.weekendPrice),
      eventId: ticket.eventId || "",
    });
    setShowTicketModal(true);
  };

  const resetTicketForm = () => {
    setTicketForm({
      name: "",
      description: "",
      weekdayPrice: "",
      weekendPrice: "",
      eventId: "",
    });
  };

  // EVENT CRUD
  const handleSaveEvent = async () => {
    try {
      const url = editingEvent
        ? `/api/events/${editingEvent.id}`
        : "/api/events";
      const method = editingEvent ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventForm),
      });

      if (!res.ok) throw new Error("Failed to save event");

      setShowEventModal(false);
      setEditingEvent(null);
      resetEventForm();
      fetchData();
    } catch (error) {
      console.error("Save event error:", error);
      alert("Failed to save event");
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event and all its tickets?")) return;
    try {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      fetchData();
    } catch (error) {
      console.error("Delete event error:", error);
      alert("Failed to delete event");
    }
  };

  const openEditEvent = (event: EventType) => {
    setEditingEvent(event);
    setEventForm({
      name: event.name,
      description: event.description || "",
      date: format(new Date(event.date), "yyyy-MM-dd"),
      endDate: event.endDate ? format(new Date(event.endDate), "yyyy-MM-dd") : "",
      maxCapacity: event.tickets?.[0]?.maxCapacity || "",
    });
    setShowEventModal(true);
  };

  const resetEventForm = () => {
    setEventForm({
      name: "",
      description: "",
      date: "",
      endDate: "",
      maxCapacity: "",
    });
  };

  // Separate tickets into regular (no event) and event tickets
  const regularTickets = tickets.filter((t) => !t.eventId);
  const eventTickets = tickets.filter((t) => t.eventId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-tropical-green" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Ticket className="h-8 w-8 text-tropical-green" />
            Ticket Management
          </h1>
          <p className="text-gray-500 mt-1">
            Manage resort-wide tickets — regular admission and event tickets
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTab === "tickets" ? "default" : "outline"}
          onClick={() => setActiveTab("tickets")}
          className={activeTab === "tickets" ? "bg-tropical-green hover:bg-tropical-green/90" : ""}
        >
          <Ticket className="h-4 w-4 mr-2" />
          Tickets ({tickets.length})
        </Button>
        <Button
          variant={activeTab === "events" ? "default" : "outline"}
          onClick={() => setActiveTab("events")}
          className={activeTab === "events" ? "bg-tropical-green hover:bg-tropical-green/90" : ""}
        >
          <Calendar className="h-4 w-4 mr-2" />
          Events ({events.length})
        </Button>
      </div>

      {/* TICKETS TAB */}
      {activeTab === "tickets" && (
        <>
          <div className="flex justify-end mb-4">
            <Button
              onClick={() => {
                setEditingTicket(null);
                resetTicketForm();
                setShowTicketModal(true);
              }}
              className="bg-tropical-green hover:bg-tropical-green/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Ticket
            </Button>
          </div>

          {/* Regular Tickets */}
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Regular Admission Tickets</h2>
          {regularTickets.length === 0 ? (
            <Card className="mb-8">
              <CardContent className="py-12 text-center text-gray-500">
                <Ticket className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No regular tickets yet. Add one to get started.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {regularTickets.map((ticket) => (
                <Card key={ticket.id} className={`${!ticket.isActive ? "opacity-60" : ""}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{ticket.name}</CardTitle>
                        {ticket.description && (
                          <p className="text-sm text-gray-500 mt-1">{ticket.description}</p>
                        )}
                      </div>
                      {!ticket.isActive && <Badge variant="secondary">Inactive</Badge>}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Weekday Price</span>
                        <span className="font-bold text-green-600">₱{Number(ticket.weekdayPrice).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Weekend Price</span>
                        <span className="font-bold text-orange-600">₱{Number(ticket.weekendPrice).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEditTicket(ticket)}>
                        <Edit className="h-3 w-3 mr-1" /> Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteTicket(ticket.id)}>
                        <Trash2 className="h-3 w-3 mr-1" /> Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Event Tickets */}
          {eventTickets.length > 0 && (
            <>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Event Tickets</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {eventTickets.map((ticket) => (
                  <Card key={ticket.id} className={`${!ticket.isActive ? "opacity-60" : ""}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{ticket.name}</CardTitle>
                          {ticket.event && (
                            <Badge variant="outline" className="mt-1">
                              <Calendar className="h-3 w-3 mr-1" />
                              {ticket.event.name} — {format(new Date(ticket.event.date), "MMM dd, yyyy")}
                            </Badge>
                          )}
                        </div>
                        {!ticket.isActive && <Badge variant="secondary">Inactive</Badge>}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Weekday Price</span>
                          <span className="font-bold text-green-600">₱{Number(ticket.weekdayPrice).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Weekend Price</span>
                          <span className="font-bold text-orange-600">₱{Number(ticket.weekendPrice).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEditTicket(ticket)}>
                          <Edit className="h-3 w-3 mr-1" /> Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteTicket(ticket.id)}>
                          <Trash2 className="h-3 w-3 mr-1" /> Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* EVENTS TAB */}
      {activeTab === "events" && (
        <>
          <div className="flex justify-end mb-4">
            <Button
              onClick={() => {
                setEditingEvent(null);
                resetEventForm();
                setShowEventModal(true);
              }}
              className="bg-tropical-green hover:bg-tropical-green/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </div>

          {events.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No events yet. Create one and add tickets to it.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <Card key={event.id} className={`${!event.isActive ? "opacity-60" : ""}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-purple-500" />
                          {event.name}
                        </CardTitle>
                        <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                          <span>{format(new Date(event.date), "MMMM dd, yyyy")}</span>
                          {event.endDate && <span>— {format(new Date(event.endDate), "MMMM dd, yyyy")}</span>}
                        </div>
                        {event.description && (
                          <p className="text-sm text-gray-500 mt-2">{event.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {!event.isActive && <Badge variant="secondary">Inactive</Badge>}
                        <Button size="sm" variant="outline" onClick={() => openEditEvent(event)}>
                          <Edit className="h-3 w-3 mr-1" /> Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteEvent(event.id)}>
                          <Trash2 className="h-3 w-3 mr-1" /> Delete
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-3">
                      <h4 className="text-sm font-semibold text-gray-700">Event Tickets</h4>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => {
                          setEditingTicket(null);
                          setTicketForm({
                            name: "",
                            description: "",
                            weekdayPrice: "",
                            weekendPrice: "",
                            eventId: event.id,
                          });
                          setShowTicketModal(true);
                        }}
                      >
                        <Plus className="h-3 w-3 mr-1" /> Add Ticket
                      </Button>
                    </div>
                    {event.tickets.length === 0 ? (
                      <p className="text-sm text-gray-400">No tickets for this event yet</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {event.tickets.map((ticket: any) => (
                          <div key={ticket.id} className="border rounded-lg p-3 bg-gray-50">
                            <div className="font-medium text-sm">{ticket.name}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              Weekday: ₱{Number(ticket.weekdayPrice).toLocaleString()} •
                              Weekend: ₱{Number(ticket.weekendPrice).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* TICKET MODAL */}
      <Dialog open={showTicketModal} onOpenChange={setShowTicketModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTicket ? "Edit Ticket" : "Add New Ticket"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ticketName">Ticket Name *</Label>
              <Input
                id="ticketName"
                placeholder="e.g. Regular Admission, VIP"
                value={ticketForm.name}
                onChange={(e) => setTicketForm({ ...ticketForm, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ticketDesc">Description</Label>
              <Textarea
                id="ticketDesc"
                placeholder="Optional description"
                value={ticketForm.description}
                onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weekdayPrice">Weekday Price (₱) *</Label>
                <Input
                  id="weekdayPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={ticketForm.weekdayPrice}
                  onChange={(e) => setTicketForm({ ...ticketForm, weekdayPrice: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weekendPrice">Weekend Price (₱) *</Label>
                <Input
                  id="weekendPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={ticketForm.weekendPrice}
                  onChange={(e) => setTicketForm({ ...ticketForm, weekendPrice: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ticketEvent">Event (optional)</Label>
              <select
                id="ticketEvent"
                value={ticketForm.eventId}
                onChange={(e) => setTicketForm({ ...ticketForm, eventId: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Regular admission (no event)</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name} — {format(new Date(event.date), "MMM dd, yyyy")}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowTicketModal(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-tropical-green hover:bg-tropical-green/90"
                onClick={handleSaveTicket}
                disabled={!ticketForm.name || !ticketForm.weekdayPrice || !ticketForm.weekendPrice}
              >
                {editingTicket ? "Update" : "Create"} Ticket
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* EVENT MODAL */}
      <Dialog open={showEventModal} onOpenChange={setShowEventModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingEvent ? "Edit Event" : "Add New Event"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="eventName">Event Name *</Label>
              <Input
                id="eventName"
                placeholder="e.g. New Year's Eve Party"
                value={eventForm.name}
                onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventDesc">Description</Label>
              <Textarea
                id="eventDesc"
                placeholder="Optional description"
                value={eventForm.description}
                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="eventDate">Event Date *</Label>
                <Input
                  id="eventDate"
                  type="date"
                  value={eventForm.date}
                  onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventEndDate">End Date</Label>
                <Input
                  id="eventEndDate"
                  type="date"
                  value={eventForm.endDate}
                  min={eventForm.date}
                  onChange={(e) => setEventForm({ ...eventForm, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventCapacity">Max Capacity (optional)</Label>
              <Input
                id="eventCapacity"
                type="number"
                min="1"
                placeholder="Leave empty for default hall capacity"
                value={eventForm.maxCapacity}
                onChange={(e) => setEventForm({ ...eventForm, maxCapacity: e.target.value })}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowEventModal(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-tropical-green hover:bg-tropical-green/90"
                onClick={handleSaveEvent}
                disabled={!eventForm.name || !eventForm.date}
              >
                {editingEvent ? "Update" : "Create"} Event
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
