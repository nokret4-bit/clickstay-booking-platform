interface ICSEvent {
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  organizerEmail: string;
  attendeeEmail: string;
}

export function generateICS(event: ICSEvent): Buffer {
  const formatDate = (date: Date): string => {
    return date
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  };

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ClickStay//Manuel Resort Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@clickstay.local`,
    `DTSTAMP:${formatDate(new Date())}`,
    `DTSTART:${formatDate(event.startDate)}`,
    `DTEND:${formatDate(event.endDate)}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description.replace(/\n/g, "\\n")}`,
    `LOCATION:${event.location}`,
    `ORGANIZER;CN=Manuel Resort:mailto:${event.organizerEmail}`,
    `ATTENDEE;CN=${event.attendeeEmail};RSVP=TRUE:mailto:${event.attendeeEmail}`,
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return Buffer.from(icsContent, "utf-8");
}
