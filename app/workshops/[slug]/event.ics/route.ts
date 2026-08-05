import { NextResponse } from "next/server";
import { client as sanity } from "@/sanity/lib/client";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://stefanie-schumacher.com";

const QUERY = `*[_type == "workshop" && slug.current == $slug][0]{
  sessionNumber, title, startsAt, durationMinutes, summary, "slug": slug.current
}`;

const utc = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

// RFC 5545: escape commas, semicolons, backslashes; newlines become \n.
const esc = (s: string) =>
  s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

// Lines must wrap at 75 octets.
const fold = (line: string) =>
  line.length <= 74 ? line : line.match(/.{1,74}/g)!.join("\r\n ");

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const w = await sanity.fetch(QUERY, { slug });
  if (!w) return new NextResponse("Not found", { status: 404 });

  const start = new Date(w.startsAt);
  const end = new Date(start.getTime() + (w.durationMinutes ?? 90) * 60_000);
  const num = String(w.sessionNumber).padStart(2, "0");

  const description = [
    w.summary ?? "",
    "",
    "Educational workshop. Not psychotherapy.",
    `${SITE}/workshops/${slug}`,
  ]
    .join("\n")
    .trim();

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Relational Diplomacy//Workshops//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:workshop-${slug}@stefanie-schumacher.com`,
    `DTSTAMP:${utc(new Date())}`,
    `DTSTART:${utc(start)}`,
    `DTEND:${utc(end)}`,
    fold(`SUMMARY:${esc(`Workshop ${num} — ${w.title}`)}`),
    fold(`DESCRIPTION:${esc(description)}`),
    "LOCATION:Zoom",
    fold(`URL:${SITE}/workshops/${slug}`),
    "BEGIN:VALARM",
    "TRIGGER:-PT15M",
    "ACTION:DISPLAY",
    fold(`DESCRIPTION:${esc(`Workshop ${num} starts in 15 minutes`)}`),
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);

  return new NextResponse(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="relational-diplomacy-${slug}.ics"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
