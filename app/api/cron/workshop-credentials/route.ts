import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "next-sanity";
import { renderCredentials, renderReminder } from "@/lib/email/workshop-credentials";
import { CREDENTIALS_LEAD_DAYS } from "@/lib/email/theme";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300; // a full cohort of sends can take a while

const resend = new Resend(process.env.RESEND_API_KEY!);

const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2026-01-01",
  token: process.env.SANITY_API_WRITE_TOKEN!,
  useCdn: false,
});

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://stefanie-schumacher.com";
const FROM =
  process.env.WORKSHOP_FROM_EMAIL?.trim() ||
  "Stefanie Schumacher <workshops@mail.stefanie-schumacher.com>";
const REPLY_TO = process.env.WORKSHOP_REPLY_TO!;

const DAY = 86_400_000;

/**
 * Pending sends, expressed as "not yet sent" rather than "due today".
 *
 * This matters: if the cron fails to run on the exact day — outage, deploy,
 * quota — a date-equality query would skip that cohort permanently and nobody
 * would get their Zoom link. Selecting on the absence of a sent-at timestamp
 * means a missed run self-heals on the next one. Late is recoverable; never
 * is not.
 */
const PENDING = `{
  "credentials": *[
    _type == "registration" &&
    status == "active" &&
    !defined(credentialsSentAt) &&
    workshop->startsAt > $now &&
    workshop->startsAt < $credsCutoff
  ]{
    _id, email, firstName,
    "w": workshop->{ _id, sessionNumber, title, startsAt, durationMinutes, zoomLink, zoomPasscode, "slug": slug.current }
  },
  "reminders": *[
    _type == "registration" &&
    status == "active" &&
    !defined(reminderSentAt) &&
    workshop->startsAt > $now &&
    workshop->startsAt < $reminderCutoff
  ]{
    _id, email, firstName,
    "w": workshop->{ _id, sessionNumber, title, startsAt, durationMinutes, zoomLink, zoomPasscode, "slug": slug.current }
  }
}`;

type Row = {
  _id: string;
  email: string;
  firstName?: string;
  w: {
    _id: string;
    sessionNumber: number;
    title: string;
    startsAt: string;
    durationMinutes?: number;
    zoomLink?: string;
    zoomPasscode?: string;
    slug: string;
  };
};

export async function GET(req: NextRequest) {
  // Vercel Cron sends `Authorization: Bearer $CRON_SECRET`.
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const result = await writeClient.fetch(PENDING, {
    now: now.toISOString(),
    credsCutoff: new Date(now.getTime() + CREDENTIALS_LEAD_DAYS * DAY).toISOString(),
    reminderCutoff: new Date(now.getTime() + DAY).toISOString(),
  });

  const report = {
    credentials: await sendBatch(result.credentials as Row[], "credentials"),
    reminders: await sendBatch(result.reminders as Row[], "reminder"),
  };

  console.info("[cron] workshop-credentials", JSON.stringify(report));
  return NextResponse.json(report);
}

async function sendBatch(rows: Row[], kind: "credentials" | "reminder") {
  let sent = 0;
  const skipped: string[] = [];
  const failed: string[] = [];

  for (const row of rows) {
    // No join link means the workshop isn't ready. Skip without marking sent,
    // so it goes out on the next run once Stef fills it in.
    if (!row.w.zoomLink) {
      skipped.push(row.w.slug);
      continue;
    }

    const payload = {
      workshopNumber: row.w.sessionNumber,
      title: row.w.title,
      startsAt: row.w.startsAt,
      durationMinutes: row.w.durationMinutes ?? 90,
      joinUrl: row.w.zoomLink,
      passcode: row.w.zoomPasscode,
      calendarUrl: `${SITE}/workshops/${row.w.slug}/event.ics`,
      detailsUrl: `${SITE}/workshops/${row.w.slug}`,
    };

    const { subject, html, text } =
      kind === "credentials"
        ? renderCredentials(payload, row.firstName)
        : renderReminder(payload, row.firstName);

    try {
      await resend.emails.send({
        from: FROM,
        to: row.email,
        replyTo: REPLY_TO,
        subject,
        html,
        text,
        headers: { "X-Entity-Ref-ID": `${kind}:${row._id}` },
        tags: [{ name: "type", value: `workshop_${kind}` }],
      });

      // Marked one at a time, immediately after the send. A batch commit at the
      // end would risk re-sending everything if the function timed out midway.
      await writeClient
        .patch(row._id)
        .set({
          [kind === "credentials" ? "credentialsSentAt" : "reminderSentAt"]:
            new Date().toISOString(),
        })
        .commit();

      sent++;
    } catch (err) {
      console.error(`[cron] ${kind} send failed for ${row._id}:`, err);
      failed.push(row._id);
      // Not marked — retried on the next run.
    }
  }

  const uniqueSkipped = [...new Set(skipped)];
  if (uniqueSkipped.length) {
    console.warn(`[cron] ${kind}: no zoomLink set for workshop(s):`, uniqueSkipped.join(", "));
  }

  return { candidates: rows.length, sent, failed: failed.length, missingZoomLink: uniqueSkipped };
}
