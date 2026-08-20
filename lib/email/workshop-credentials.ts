/**
 * Emails 2 and 3 — Zoom credentials (8 days out) and the day-of reminder.
 *
 * Both are transactional: they deliver access to a thing that was paid for.
 * They are sent to every ACTIVE registration for the workshop, regardless of
 * marketing consent or unsubscribe state. Someone who opted out of workshop
 * announcements still bought this workshop and still gets in.
 *
 * The passcode is rendered as selectable text, never as an image, and appears
 * in the plain-text part too — people read these on phones and retype them.
 */

import {
  BODY,
  DISPLAY,
  INK,
  MUTED,
  VERMILLION,
  aside,
  block,
  dataRow,
  emailShell,
  footer,
  hero,
  inTZ,
  lede,
  marker,
  outlineButton,
  pad2,
  para,
  policies,
  sectionTitle,
  solidButton,
  timeRange,
} from "./theme";

export type CredentialsData = {
  workshopNumber: number;
  title: string;
  startsAt: string;
  durationMinutes: number;
  joinUrl: string;
  passcode?: string;
  calendarUrl: string;
  detailsUrl: string;
};

/** Big, selectable, unmistakable. */
const passcodeBlock = (passcode: string) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px;"><tr>
    <td style="border:1px solid ${INK};padding:22px 24px;">
      <p style="margin:0 0 8px;font-family:${BODY};font-size:11px;line-height:1.2;letter-spacing:0.14em;text-transform:uppercase;color:${MUTED};">Passcode</p>
      <p style="margin:0;font-family:${DISPLAY};font-size:32px;line-height:1;letter-spacing:0.08em;color:${INK};">${passcode}</p>
    </td>
  </tr></table>`;

/* ------------------------------------------------------------------ */
/* Email 2 — credentials, 8 days out                                   */
/* ------------------------------------------------------------------ */

export function renderCredentials(w: CredentialsData, firstName?: string) {
  const num = pad2(w.workshopNumber);
  const weekday = inTZ(w.startsAt, { weekday: "long" });
  const weekdayShort = inTZ(w.startsAt, { weekday: "short" });
  const dateLong = inTZ(w.startsAt, { month: "long", day: "numeric", year: "numeric" });
  const dateShort = inTZ(w.startsAt, { month: "short", day: "numeric" });
  const times = timeRange(w.startsAt, w.durationMinutes);

  const subject = `Your Zoom link · Workshop ${num} · ${weekdayShort}, ${dateShort} · ${w.title}`;
  const preheader = `The Connection Workshops. ${times}. Link and passcode inside — save this email.`;

  const html = emailShell({
    subject,
    preheader,
    body: [
      block(
        hero("Your Zoom<br />link is here.") +
          lede(
            `${firstName ? firstName + ", we" : "We"} meet on ${weekday}, ${dateLong} at ${times}. Save this email — it's how you get in.`,
          ),
      ),

      block(
        marker +
          `<p style="margin:16px 0 4px;font-family:${BODY};font-size:11px;line-height:1.2;letter-spacing:0.14em;text-transform:uppercase;color:${VERMILLION};">Workshop ${num}</p>` +
          `<p style="margin:0 0 32px;font-family:${DISPLAY};font-size:26px;line-height:1.15;letter-spacing:-0.01em;color:${INK};">${w.title}</p>` +
          `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            ${dataRow("Date", `${weekday}, ${dateLong}`)}
            ${dataRow("Time", `${times}<br /><span style="font-size:14px;color:${MUTED};">${w.durationMinutes} minutes, live</span>`)}
          </table>` +
          solidButton(w.joinUrl, "Join on Zoom") +
          (w.passcode ? passcodeBlock(w.passcode) : "") +
          outlineButton(w.calendarUrl, "Add to calendar"),
      ),

      block(
        aside(
          `The link opens the meeting room; the passcode gets you in. Both are personal to your registration — please don't forward them. If you can't get in on the day, reply to this email and we'll help.`,
        ),
        "36px 48px 0",
      ),

      block(
        marker +
          sectionTitle("Before we meet") +
          para(
            "Nothing to prepare and nothing to read. Come with a situation you're actually stuck in, if you have one — that's what makes the question and answer half useful.",
          ) +
          para(
            "Please join with your camera on. Registration is per person, and seeing everyone is how we keep the room to the people who signed up. You're welcome to stay muted — questions can be asked out loud or typed in the chat, whichever you prefer.",
          ),
        "48px 48px 0",
      ),

      block(policies),
      block(footer(w.detailsUrl), "36px 48px 56px"),
    ].join("\n"),
  });

  const text = [
    `Your Zoom link is here.`,
    ``,
    `${firstName ? firstName + ", we" : "We"} meet on ${weekday}, ${dateLong} at ${times}.`,
    `Save this email — it's how you get in.`,
    ``,
    `THE CONNECTION WORKSHOPS — WORKSHOP ${num}`,
    w.title,
    `${weekday}, ${dateLong}`,
    `${times} (${w.durationMinutes} minutes, live)`,
    ``,
    `Join on Zoom: ${w.joinUrl}`,
    w.passcode ? `Passcode: ${w.passcode}` : ``,
    `Add to calendar: ${w.calendarUrl}`,
    ``,
    `The link opens the meeting room; the passcode gets you in. Both are personal`,
    `to your registration — please don't forward them. If you can't get in on the`,
    `day, reply to this email and we'll help.`,
    ``,
    `BEFORE WE MEET`,
    `Nothing to prepare and nothing to read. Come with a situation you're actually`,
    `stuck in, if you have one.`,
    `Please join with your camera on. Registration is per person, and seeing everyone`,
    `is how we keep the room to the people who signed up. You're welcome to stay muted`,
    `— questions can be asked out loud or typed in the chat, whichever you prefer.`,
    ``,
    `This is education, not therapy. These workshops are educational and do not`,
    `constitute psychotherapy or create a therapist-client relationship.`,
    `Registration is non-refundable and is per participant.`,
    `Sessions aren't recorded. There's no replay, so plan to join live.`,
    `Cameras stay on. Registration is per participant. Please join with video enabled; you can stay muted throughout.`,
    ``,
    `Questions? Reply to this email.`,
    `Workshop details: ${w.detailsUrl}`,
    `Stefanie Schumacher · The Connection Workshops`,
    `You're receiving this because you registered for a Connection Workshop. This is workshop correspondence, not a marketing message.`,
  ]
    .filter((l) => l !== "")
    .join("\n");

  return { subject, html, text };
}

/* ------------------------------------------------------------------ */
/* Email 3 — day-of reminder                                           */
/* ------------------------------------------------------------------ */

export function renderReminder(w: CredentialsData, firstName?: string) {
  const num = pad2(w.workshopNumber);
  const times = timeRange(w.startsAt, w.durationMinutes);
  const clock = inTZ(w.startsAt, { hour: "numeric", minute: "2-digit" });
  const dateShort = inTZ(w.startsAt, { month: "short", day: "numeric" });
  const weekdayShort = inTZ(w.startsAt, { weekday: "short" });

  const subject = `Tonight at ${clock} · Workshop ${num} · ${w.title}`;
  const preheader = `The Connection Workshops. ${times}. Your link and passcode, one more time.`;

  // Deliberately short. Nobody reads a long email an hour before a meeting.
  const html = emailShell({
    subject,
    preheader,
    body: [
      block(
        hero(`Tonight,<br />${clock}.`) +
          lede(
            `${firstName ? firstName + ", we're" : "We're"} on in a few hours. Link and passcode below.`,
          ),
      ),

      block(
        marker +
          `<p style="margin:16px 0 4px;font-family:${BODY};font-size:11px;line-height:1.2;letter-spacing:0.14em;text-transform:uppercase;color:${VERMILLION};">Workshop ${num} · ${weekdayShort}, ${dateShort}</p>` +
          `<p style="margin:0 0 28px;font-family:${DISPLAY};font-size:26px;line-height:1.15;letter-spacing:-0.01em;color:${INK};">${w.title}</p>` +
          solidButton(w.joinUrl, "Join on Zoom") +
          (w.passcode ? passcodeBlock(w.passcode) : ""),
      ),

      block(
        para(
          `Doors open a few minutes early. If you can't get in, reply here and we'll help.`,
          15,
        ),
        "32px 48px 0",
      ),

      block(footer(w.detailsUrl), "36px 48px 56px"),
    ].join("\n"),
  });

  const text = [
    `Tonight at ${clock}.`,
    ``,
    `${firstName ? firstName + ", we're" : "We're"} on in a few hours.`,
    ``,
    `WORKSHOP ${num} — ${w.title}`,
    `${times}`,
    ``,
    `Join on Zoom: ${w.joinUrl}`,
    w.passcode ? `Passcode: ${w.passcode}` : ``,
    ``,
    `Doors open a few minutes early. If you can't get in, reply here and we'll help.`,
    ``,
    `Stefanie Schumacher · The Connection Workshops`,
    `You're receiving this because you registered for a Connection Workshop. This is workshop correspondence, not a marketing message.`,
  ]
    .filter((l) => l !== "")
    .join("\n");

  return { subject, html, text };
}
