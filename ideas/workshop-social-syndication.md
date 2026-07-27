# Idea: Workshops as a syndicated content type (Mike, 2026-07-21)

Workshops are already structured content (title, date, hook copy, price, Zoom link) — model them once in the CMS and every workshop can fan out to LinkedIn, Instagram, Facebook to drive registrations.

## Core architecture principle (Mike): events as a feed

On a rebuild, events live as structured data with **public feed endpoints** — write once in the CMS, consume anywhere, no per-destination work:

- /api/events.json — canonical JSON feed (also JSON Feed 1.1 spec for feed readers)
- /events.ics — iCal feed → subscribable in Google/Apple Calendar (nice client touch)
- RSS — legacy but Zapier/Make/Buffer all eat it natively, which makes Tier-2 automation trivial: "new item in feed → queue social post"
- JSON-LD Event schema embedded per event page → Google event rich results
- Same feed can drive an email digest, a partner site embed, Eventbrite-style aggregators, etc.

This is a genuine differentiator vs. Wix (content trapped in Wix Events/Bookings/Pricing Plans silos — the current site has ticketing split across two of them).

## How it could work (Sanity-based rebuild)

1. **Workshop doc type** in Sanity: title, date/time, description, price, registration URL, cover art/color, status.
2. **Auto-generated social assets:** on publish, render a branded social card (OG image pipeline — same vibrant type-driven design language as the site) per workshop. Zero design effort per post.
3. **Syndication tiers** (pick per budget/appetite):
   - **Tier 1 — assisted manual:** CMS "share kit" per workshop: pre-drafted captions per platform (LinkedIn = professional angle, IG = visual card + hook, FB = event framing) + the image, one click to copy. Stef posts herself. Cheapest, no API fragility.
   - **Tier 2 — scheduler:** feed → Zapier/Make/Buffer; Stef approves a queue. The JSON/RSS feed makes this near-zero custom code.
   - **Tier 3 — full auto:** Meta Graph API (IG/FB) + LinkedIn API posting directly. Most fragile (API approvals, token refreshes) — probably overkill for a solo practice.
4. **Custom GPT agent tie-in:** the agent drafts the workshop description AND the three platform captions in one pass — concrete, sellable use of the "Custom GPT" concept from the project brief.

## Notes

- Cadence is built in: 10 workshops Sep–Nov = 10+ posts of native marketing material, plus "last chance" variants.
- Recommend starting Tier 1 or 2 — matches a solo practitioner's reality, avoids platform-API maintenance burden.
- Ask on call: does she have social accounts today, and does she want to be promotional there? Discretion is part of her positioning — LinkedIn may fit her audience better than IG/FB.
