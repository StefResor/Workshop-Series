/**
 * Shared shell for all transactional workshop email.
 *
 * Every template here is one-to-one, triggered by a purchase or by the
 * schedule. None of them carry an unsubscribe link, and none of them are
 * Broadcasts. Marketing lives entirely in the campaign kit; if you find
 * yourself adding a promotional block to anything in this folder, it belongs
 * in the kit instead — and adding one converts the message to a commercial
 * message with a different compliance profile.
 *
 * Design tokens mirror the site (Direction C — "The Wise Adult").
 */

export const BONE = "#F3EFE7";
export const INK = "#14110E";
export const VERMILLION = "#FF4A17";
export const RULE = "#DBD3C4";
export const MUTED = "#6B645B";

// 'Archivo Black' loads in Apple Mail and little else. 'Arial Black' is the
// closest ubiquitous heavy grotesque and holds the monumental-caps treatment
// far better than Helvetica would.
export const DISPLAY = `'Archivo Black','Arial Black','Helvetica Neue',Helvetica,Arial,sans-serif`;
export const BODY = `'Archivo','Helvetica Neue',Helvetica,Arial,sans-serif`;

/** Days before a workshop that Zoom credentials are sent. */
export const CREDENTIALS_LEAD_DAYS = 8;

/* ------------------------------------------------------------------ */
/* Date helpers — everything renders in the practice's timezone.       */
/* ------------------------------------------------------------------ */

export const TZ = "America/New_York";

export const inTZ = (iso: string | Date, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-US", { timeZone: TZ, ...opts }).format(new Date(iso));

export const pad2 = (n: number) => String(n).padStart(2, "0");

/** "7:00 – 8:30 PM ET" — always ET; sessions 9–10 fall after DST ends. */
export function timeRange(startsAt: string, durationMinutes: number) {
  const start = new Date(startsAt);
  const end = new Date(start.getTime() + durationMinutes * 60_000);
  const clock = (d: Date) => inTZ(d, { hour: "numeric", minute: "2-digit" });
  return `${clock(start)} – ${clock(end)} ET`;
}

/** Bare address from WORKSHOP_FROM_EMAIL (not Reply-To). */
export function workshopFromAddress(): string {
  const raw =
    process.env.WORKSHOP_FROM_EMAIL?.trim() ||
    "Stefanie Schumacher <workshops@mail.stefanie-schumacher.com>";
  const angle = raw.match(/<([^>]+)>/);
  return (angle?.[1] ?? raw).trim();
}

/* ------------------------------------------------------------------ */
/* Layout primitives                                                   */
/* ------------------------------------------------------------------ */

/** The 48px vermillion rule — section marker carried over from the site. */
export const marker = `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="width:48px;height:3px;background:${VERMILLION};font-size:0;line-height:0;">&nbsp;</td></tr></table>`;

export const hairline = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="height:1px;background:${RULE};font-size:0;line-height:0;">&nbsp;</td></tr></table>`;

export const eyebrow = (t: string, color = VERMILLION) =>
  `<p style="margin:0 0 4px;font-family:${BODY};font-size:11px;line-height:1.2;letter-spacing:0.14em;text-transform:uppercase;color:${color};">${t}</p>`;

export const sectionTitle = (t: string) =>
  `<p style="margin:16px 0 16px;font-family:${DISPLAY};font-size:15px;line-height:1.2;letter-spacing:0.04em;text-transform:uppercase;color:${INK};">${t}</p>`;

export const hero = (t: string) =>
  `<p class="hero" style="margin:0;font-family:${DISPLAY};font-size:52px;line-height:0.96;letter-spacing:-0.02em;text-transform:uppercase;color:${INK};">${t}</p>`;

export const lede = (t: string) =>
  `<p style="margin:20px 0 0;font-family:${BODY};font-size:17px;line-height:1.5;color:${MUTED};max-width:440px;">${t}</p>`;

export const para = (t: string, size = 16) =>
  `<p style="margin:0 0 12px;font-family:${BODY};font-size:${size}px;line-height:1.6;color:${MUTED};">${t}</p>`;

export const dataRow = (label: string, value: string) =>
  `<tr><td style="padding:0 0 22px;">
    <p style="margin:0 0 6px;font-family:${BODY};font-size:11px;line-height:1.2;letter-spacing:0.14em;text-transform:uppercase;color:${MUTED};">${label}</p>
    <p style="margin:0;font-family:${BODY};font-size:17px;line-height:1.45;color:${INK};">${value}</p>
  </td></tr>`;

export const solidButton = (href: string, text: string) => `
  <!--[if mso]>
  <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${href}" style="height:54px;v-text-anchor:middle;width:504px;" arcsize="0%" strokecolor="${INK}" fillcolor="${INK}">
    <w:anchorlock/><center style="color:${BONE};font-family:Arial,sans-serif;font-size:13px;font-weight:bold;letter-spacing:1px;">${text.toUpperCase()}</center>
  </v:roundrect><![endif]-->
  <!--[if !mso]><!-->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
    <td align="center" style="background:${INK};">
      <a href="${href}" style="display:block;padding:18px 24px;font-family:${BODY};font-size:13px;line-height:1;letter-spacing:0.12em;text-transform:uppercase;color:${BONE};text-decoration:none;font-weight:600;">${text}</a>
    </td>
  </tr></table>
  <!--<![endif]-->`;

export const outlineButton = (href: string, text: string) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:12px;"><tr>
    <td align="center" style="border:1px solid ${INK};">
      <a href="${href}" style="display:block;padding:17px 24px;font-family:${BODY};font-size:13px;line-height:1;letter-spacing:0.12em;text-transform:uppercase;color:${INK};text-decoration:none;font-weight:600;">${text}</a>
    </td>
  </tr></table>`;

/** Vermillion-ruled aside. */
export const aside = (html: string) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
    <td style="border-left:3px solid ${VERMILLION};padding:2px 0 2px 18px;">
      <p style="margin:0;font-family:${BODY};font-size:15px;line-height:1.6;color:${MUTED};">${html}</p>
    </td>
  </tr></table>`;

/** The disclaimer block. Legally load-bearing — present on every send. */
export const policies = `
  ${hairline}
  <p style="margin:24px 0 12px;font-family:${BODY};font-size:13px;line-height:1.6;color:${MUTED};"><strong style="color:${INK};font-weight:600;">This is education, not therapy.</strong> These workshops are educational and do not constitute psychotherapy or create a therapist&ndash;client relationship.</p>
  <p style="margin:0 0 12px;font-family:${BODY};font-size:13px;line-height:1.6;color:${MUTED};"><strong style="color:${INK};font-weight:600;">Registration is non-refundable.</strong> Registration is per participant &mdash; partners attending together register separately.</p>
  <p style="margin:0 0 12px;font-family:${BODY};font-size:13px;line-height:1.6;color:${MUTED};"><strong style="color:${INK};font-weight:600;">Sessions aren&rsquo;t recorded.</strong> There&rsquo;s no replay, so plan to join live.</p>
  <p style="margin:0;font-family:${BODY};font-size:13px;line-height:1.6;color:${MUTED};"><strong style="color:${INK};font-weight:600;">Cameras stay on.</strong> Registration is per participant. Please join with video enabled; you can stay muted throughout.</p>`;

export const footer = (detailsUrl: string) => `
  ${hairline}
  <p style="margin:24px 0 0;font-family:${BODY};font-size:13px;line-height:1.6;color:${MUTED};">Questions about this session? Reply to this email.<br />Session details: <a href="${detailsUrl}" style="color:${INK};text-decoration:underline;">View session details &rarr;</a></p>
  <p style="margin:20px 0 0;font-family:${BODY};font-size:11px;line-height:1.5;letter-spacing:0.08em;text-transform:uppercase;color:${MUTED};">Stefanie Schumacher &middot; The Connection Workshop</p>
  <p style="margin:8px 0 0;font-family:${BODY};font-size:11px;line-height:1.5;color:${MUTED};">You&rsquo;re receiving this because you registered for a session of The Connection Workshop. This is workshop correspondence, not a marketing message.</p>`;

/* ------------------------------------------------------------------ */
/* Document shell                                                      */
/* ------------------------------------------------------------------ */

export function emailShell({
  subject,
  preheader,
  body,
}: {
  subject: string;
  preheader: string;
  body: string;
}) {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="color-scheme" content="light only" />
<meta name="supported-color-schemes" content="light only" />
<title>${subject}</title>
<!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;600&family=Archivo+Black&display=swap" rel="stylesheet" />
<style>
  :root { color-scheme: light only; supported-color-schemes: light only; }
  body { margin:0; padding:0; width:100% !important; background:${BONE}; -webkit-text-size-adjust:100%; }
  a { color:${INK}; }
  @media only screen and (max-width:620px) {
    .wrap { width:100% !important; }
    .pad { padding-left:24px !important; padding-right:24px !important; }
    .hero { font-size:38px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:${BONE};">
<div style="display:none;font-size:1px;color:${BONE};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</div>
<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BONE};">
<tr><td align="center" style="padding:0;">
<table role="presentation" class="wrap" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background:${BONE};">

  <tr><td class="pad" style="padding:40px 48px 0;">
    <p style="margin:0;font-family:${DISPLAY};font-size:15px;line-height:1.2;letter-spacing:0.04em;text-transform:uppercase;color:${INK};">Stefanie Schumacher</p>
    <p style="margin:4px 0 0;font-family:${BODY};font-size:11px;line-height:1.2;letter-spacing:0.18em;text-transform:uppercase;color:${MUTED};">The Connection Workshop</p>
  </td></tr>
  <tr><td class="pad" style="padding:36px 48px 0;">${hairline}</td></tr>

${body}

</table>
</td></tr>
</table>
</body>
</html>`;
}

/** Wrap a chunk of body HTML in a padded row. */
export const block = (html: string, padding = "44px 48px 0") =>
  `<tr><td class="pad" style="padding:${padding};">${html}</td></tr>`;
