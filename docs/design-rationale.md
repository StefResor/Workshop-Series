# Design Rationale — stefanie-schumacher.com Rebuild

**Prepared by EN Design Studio · July 2026**

This document records the reasoning behind the design direction for the rebuild of stefanie-schumacher.com. Every decision below traces back to the references Stef provided — three sites she wants to feel like, one she doesn't, and four she explicitly wants to avoid — plus what the audit of the current site revealed.

---

## 1. The brief, in Stef's own words

> "This might seem a little strange but I want my site to be almost like an artist's site. Something with color, vibrancy, visual enticement."

**Liked:** Neïl Beloufa at Mendes Wood DM · Seth Price at Petzel · martinesy.ms (Martine Syms)
**Least favorite:** mai.art (Marina Abramović Institute)
**Explicitly not:** terryreal.com · estherperel.com · gottman.com · ourritual.com

## 2. Reading the references

The three sites she likes share a design language, and it's worth naming precisely, because it's what every decision flows from:

**Mendes Wood DM (Beloufa)** and **Petzel (Seth Price)** are gallery artist pages. Their traits: generous white space cut by hairline rules; a strict grid; the artist's *work* carried entirely by imagery while the chrome stays quiet; content organized into clean sections (Overview / Works / Exhibitions / Press); and — critically — **typographic identity**. Neither gallery has a logo. Their brands are a name, set well.

**martinesy.ms** is the personal-artist counterpart: a single confident scroll, text treated as a visual element in its own right, saturated color used fearlessly, and personality allowed into the smallest details (her copyright line reads "all rights Wronged"). It proves an artist site can be minimal *and* warm.

**mai.art — her least favorite — is the control variable.** It is also minimal, also image-led, also institutional-grade design. What distinguishes it from the three she likes is temperature: gray-neutral palette, video-hero solemnity, institution-scale anonymity. The lesson is precise: **Stef doesn't want less minimalism — she wants minimalism with warmth, color, and a person in it.**

The four anti-references (Real, Perel, Gottman, OurRitual) share the standard therapist-brand formula: warm-neutral or coral palettes, stock photography of smiling couples, credential-forward authority signaling, and SaaS-style conversion funnels ("Get started," course upsells, headshot-plus-book-cover heroes). Her current Wix site is, unintentionally, a budget version of this exact formula — marble texture, centered serif stacks, stock photos of therapy sessions and touching hands.

## 3. The central design idea

**Present the practice like a body of work, not a service funnel.**

A gallery site's job is to make you want to spend time with the work and take the artist seriously. That is *precisely* the correct posture for a private-pay, small-caseload, discretion-first practice: it doesn't chase, it curates. Every decision below implements this idea.

## 4. The decisions

### 4.1 Typographic wordmark — no logo
All three liked references are type-driven identities; none has a logo. So the brand is **"Stefanie Schumacher," set with intent**, with "Relational Diplomacy" as the practice line beneath it. This resolves the current site's split identity (domain says her name; site title says the practice name) in favor of the artist-site convention: the person is the mark. It also means no logo-design engagement is needed — the identity budget goes into typography and color instead.
*Source: Mendes Wood, Petzel, Martine Syms — all typographic marks.*

### 4.2 Zero stock photography — vibrancy from color and type
The anti-references run on stock imagery of happy couples; her current site uses Wix stock ("Therapy Session Discussion," "Touching Hands," and a shipping photo captioned "Woman Holding Package" illustrating Individual Relational Work). The references get their visual power from *the work itself*. Stef's "work" isn't photographable — so in its place, the design uses **color fields, saturated grounds, and monumental typography as the artwork**. This delivers the "color, vibrancy, visual enticement" she asked for, avoids the Gottman look entirely, and sidesteps the fact that she has no photo library.
*Source: Syms's color confidence; gallery sites' imagery-carries-everything principle, transposed to color/type.*

### 4.3 One real photograph, treated like a portrait in a gallery
Her single genuine asset — her own photo — is used once, on a dedicated About page, and *art-directed* rather than dropped in: gallery-framed with a museum-style caption, or duotone-treated, or high-contrast black and white, depending on direction. One authentic image treated seriously beats ten stock images. (Note: the current file is a screenshot; we'll request the original.)
*Source: the artist-portrait convention on every gallery artist page.*

### 4.4 Warm minimalism — the mai.art lesson applied
Whites are warm (bone, cream), never gray. Accent colors are electric (Klein blue, chartreuse, vermillion orange), never coral (Gottman's color) and never muted sage (the current site's color). Wit is permitted in the copy ("The fight is never about the dishes"). Minimal structure, human temperature.
*Source: the delta between mai.art (rejected) and the three she liked.*

### 4.5 Workshops presented as an exhibitions index
Gallery sites list exhibitions as dated, scannable, typographic rows — and that format maps one-to-one onto her 10-workshop series: date, title, register. On the current site, each workshop is a fat white card requiring a full screen of scrolling, and the event pages lead with "Tickets are not on sale." The rebuild treats the workshop list as a first-class, data-driven index (which is also what makes the events-feed/syndication architecture possible).
*Source: the Exhibitions sections of Mendes Wood and Petzel.*

### 4.6 Real navigation; content split into pages
The references organize content into tabbed/sectioned pages; her current homepage has **no nav menu at all**, so seven sections pile into one scroll and the strong bio content buries the services. The rebuild gives the site true pages — Home (orient and route), About (bio + portrait), Approach (method + process, merged and deduplicated), Workshops, Fees, Contact — with a persistent, quiet top nav.
*Source: Overview/Works/Exhibitions/Press structure of the gallery pages.*

### 4.7 Editorial layout — asymmetric, gridded, ruled
Centered-stacked text (the current site's only layout move, and the anti-references' favorite) is replaced by asymmetric grids, hairline rules as structure, numbered lists (01/02/03), and generous margins. Text sits where a curator would put it, not centered where a template defaults it.
*Source: all three liked references; this is the shared skeleton beneath their different personalities.*

### 4.8 One design system across every page
The current site runs three unrelated visual systems (marble/serif homepage, thin-sans Wix event pages, Georgia-italic forms). The references are ruthlessly consistent — the event page, the about page, and the home page of the rebuild all derive from one set of tokens (type scale, palette, rules, spacing). This is also why the prototype's event and About pages restyle themselves per direction: same structure, one system.
*Source: gallery-site consistency; confirmed as a pain point by the current-site audit.*

### 4.9 Copy in a confident, direct voice
Her positioning is "structured, direct" — but the current site's copy is wordy (six paragraphs before the workshop list) and typo-prone. Reference-site copy is spare and declarative. The rebuild compresses intro copy to one or two lines, moves depth to detail pages, and treats headlines as design objects ("Say the hard thing skillfully").
*Source: Syms's one-line self-descriptions; gallery-label economy. Mike's note: "a bit wordy."*

## 5. Why three directions, not one

The references share a skeleton but differ in temperature, so we built three trial balloons on identical content: **A · Gallery** (closest to Mendes Wood/Petzel: white ground, color-field panels, Klein blue), **B · Signal** (closest to Syms: saturated violet field, chartreuse, serif display, marquee), and **C · Wise Adult** (the brief's "structured, direct" made literal: bone ground, monumental type, single orange accent). All three obey every decision above; they differ only in how loud the color and type get. Stef's reaction — including "B's palette with A's layout"-style mixing — picks the lane cheaply, before any production work.

## 6. What we deliberately did not do

No marble or texture backgrounds (current site). No coral, sage, or gray-neutral palettes (Gottman, current site, mai.art). No stock photography (all anti-references). No logo mark (no reference has one). No credential-first hero (Real/Perel formula — credentials moved to About facts, gallery-label style). No "Get started" funnel language (OurRitual). No single endless scroll without nav (current site).

---

*Companion documents: `design/stef-design-direction.md` (raw reference analysis), `site-audit/` (current-site findings), `prototype/stef-cms-demo.html` (the three directions, live).*
