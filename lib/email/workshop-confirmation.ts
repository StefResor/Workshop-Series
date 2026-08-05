/**
 * Email 1 of 3 — registration confirmation.
 * Sent immediately by the Stripe webhook on checkout.session.completed.
 *
 * Deliberately contains NO Zoom link or passcode. Those ship 8 days out
 * (workshop-credentials.ts) and again on the day (workshop-reminder.ts).
 * This email's job is to confirm what was purchased and set the expectation
 * for the second email.
 *
 * Findability is a design requirement: the subject leads with workshop number
 * and date so a run of confirmations reads as an ordered series in the inbox,
 * and the body carries the terms someone would actually search three weeks
 * later — the practice name, the word Zoom, the title, the date.
 */

import {
  BODY,
  CREDENTIALS_LEAD_DAYS,
  DISPLAY,
  INK,
  MUTED,
  RULE,
  VERMILLION,
  aside,
  block,
  dataRow,
  emailShell,
  eyebrow,
  footer,
  hero,
  inTZ,
  lede,
  marker,
  pad2,
  para,
  policies,
  sectionTitle,
  solidButton,
  timeRange,
} from "./theme";

export type ConfirmationData = {
  workshopNumber: number;
  title: string;
  startsAt: string; // ISO 8601 UTC
  durationMinutes: number;
  calendarUrl: string;
  detailsUrl: string;
  amountPaid: string;
  /** True when this came from an all-access series pass rather than a single sale. */
  fromPass?: boolean;
  seriesTitle?: string; // "Fall 2026"
};

/** One step in the correspondence timeline. */
const step = (when: string, what: string, body: string, active = false) => `
  <tr>
    <td width="14" valign="top" style="padding:0 16px 0 0;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="width:10px;height:10px;background:${active ? VERMILLION : RULE};font-size:0;line-height:0;">&nbsp;</td>
      </tr></table>
    </td>
    <td valign="top" style="padding:0 0 24px;">
      <p style="margin:0 0 3px;font-family:${BODY};font-size:11px;line-height:1.2;letter-spacing:0.14em;text-transform:uppercase;color:${active ? VERMILLION : MUTED};">${when}</p>
      <p style="margin:0 0 4px;font-family:${BODY};font-size:16px;line-height:1.4;font-weight:600;color:${INK};">${what}</p>
      <p style="margin:0;font-family:${BODY};font-size:15px;line-height:1.55;color:${MUTED};">${body}</p>
    </td>
  </tr>`;

export function renderConfirmation(w: ConfirmationData, firstName?: string) {
  const num = pad2(w.workshopNumber);
  const weekday = inTZ(w.startsAt, { weekday: "long" });
  const weekdayShort = inTZ(w.startsAt, { weekday: "short" });
  const dateLong = inTZ(w.startsAt, { month: "long", day: "numeric", year: "numeric" });
  const dateShort = inTZ(w.startsAt, { month: "short", day: "numeric" });
  const times = timeRange(w.startsAt, w.durationMinutes);
  const credsDate = inTZ(
    new Date(new Date(w.startsAt).getTime() - CREDENTIALS_LEAD_DAYS * 86_400_000),
    { month: "long", day: "numeric" },
  );

  const subject = `Workshop ${num} · ${weekdayShort}, ${dateShort} · ${w.title}`;
  const preheader = `Registration confirmed — Relational Diplomacy Workshops. ${times} on Zoom. Your Zoom link and passcode arrive ${credsDate}, about a week before we meet.`;

  const greeting = firstName ? `${firstName}, you're<br />registered.` : "You're<br />registered.";

  const html = emailShell({
    subject,
    preheader,
    body: [
      block(
        hero(greeting) +
          lede(
            w.fromPass
              ? `Your ${w.seriesTitle ?? "series"} pass covers this workshop. Here are the details, and when to expect your Zoom link.`
              : `Thank you for signing up. Here's what you booked, and when to expect your Zoom link.`,
          ),
      ),

      block(
        marker +
          `<p style="margin:16px 0 4px;font-family:${BODY};font-size:11px;line-height:1.2;letter-spacing:0.14em;text-transform:uppercase;color:${VERMILLION};">Workshop ${num}</p>` +
          `<p style="margin:0 0 32px;font-family:${DISPLAY};font-size:26px;line-height:1.15;letter-spacing:-0.01em;color:${INK};">${w.title}</p>` +
          `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            ${dataRow("Date", `${weekday}, ${dateLong}`)}
            ${dataRow("Time", `${times}<br /><span style="font-size:14px;color:${MUTED};">${w.durationMinutes} minutes, live</span>`)}
            ${dataRow("Where", "Zoom &mdash; link sent separately")}
            ${dataRow(w.fromPass ? "Covered by" : "Paid", w.fromPass ? `${w.seriesTitle ?? "Series"} pass` : w.amountPaid)}
          </table>` +
          solidButton(w.calendarUrl, "Add to calendar"),
      ),

      block(
        marker +
          `<p style="margin:16px 0 6px;font-family:${DISPLAY};font-size:15px;line-height:1.2;letter-spacing:0.04em;text-transform:uppercase;color:${INK};">What happens next</p>` +
          `<p style="margin:0 0 28px;font-family:${BODY};font-size:16px;line-height:1.6;color:${MUTED};max-width:460px;">You'll hear from us twice more before we meet. Nothing else is needed from you between now and then.</p>` +
          `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            ${step("Now", "This confirmation", "Keep it — it's your record of what you registered for and what you paid.", true)}
            ${step(`${credsDate} · ${CREDENTIALS_LEAD_DAYS} days before`, "Your Zoom link and passcode", `A separate email with the Zoom meeting link and the passcode you'll need to get in. If it hasn't arrived by ${credsDate}, check your spam folder first, then write to us.`)}
            ${step(`${dateShort} · Workshop day`, "A short reminder", "The link and passcode again, so you don't have to go looking on the day.")}
          </table>`,
        "52px 48px 0",
      ),

      block(
        aside(
          `To find this email later, search your inbox for <strong style="color:${INK};font-weight:600;">Relational Diplomacy</strong>. Adding this address to your contacts also helps make sure your Zoom link lands in your inbox rather than your spam folder.`,
        ),
        "20px 48px 0",
      ),

      block(
        marker +
          sectionTitle("What the workshop is like") +
          para(
            "Ninety minutes, live on Zoom. Roughly half is teaching, half is open question and answer. Each workshop stands alone — you don't need the ones before it.",
          ) +
          para(
            "Your camera can stay off. Questions can be asked out loud or typed in the chat, whichever you prefer.",
          ),
        "48px 48px 0",
      ),

      block(policies),
      block(footer(w.detailsUrl), "36px 48px 56px"),
    ].join("\n"),
  });

  const text = [
    `${firstName ? firstName + ", you're" : "You're"} registered.`,
    ``,
    w.fromPass
      ? `Your ${w.seriesTitle ?? "series"} pass covers this workshop.`
      : `Thank you for signing up. Here's what you booked, and when to expect your Zoom link.`,
    ``,
    `RELATIONAL DIPLOMACY — WORKSHOP ${num}`,
    w.title,
    `${weekday}, ${dateLong}`,
    `${times} (${w.durationMinutes} minutes, live)`,
    `Where: Zoom — link sent separately`,
    w.fromPass ? `Covered by: ${w.seriesTitle ?? "Series"} pass` : `Paid: ${w.amountPaid}`,
    ``,
    `Add to calendar: ${w.calendarUrl}`,
    ``,
    `WHAT HAPPENS NEXT`,
    `You'll hear from us twice more before we meet.`,
    ``,
    `  Now — This confirmation. Keep it.`,
    `  ${credsDate} (${CREDENTIALS_LEAD_DAYS} days before) — Your Zoom link and passcode.`,
    `  If it hasn't arrived by ${credsDate}, check your spam folder first, then write to us.`,
    `  ${dateShort} (workshop day) — A short reminder with the link and passcode again.`,
    ``,
    `To find this email later, search your inbox for "Relational Diplomacy."`,
    `Adding this address to your contacts also helps make sure your Zoom link`,
    `lands in your inbox rather than your spam folder.`,
    ``,
    `WHAT THE WORKSHOP IS LIKE`,
    `Ninety minutes, live on Zoom. Roughly half is teaching, half is open Q&A.`,
    `Each workshop stands alone. Your camera can stay off.`,
    ``,
    `This is education, not therapy. These workshops are educational and do not`,
    `constitute psychotherapy or create a therapist-client relationship.`,
    `Registration is non-refundable and is per participant.`,
    ``,
    `Questions about this workshop? Reply to this email.`,
    `Workshop details: ${w.detailsUrl}`,
    `Stefanie Schumacher · Relational Diplomacy Workshops`,
  ].join("\n");

  return { subject, html, text };
}
