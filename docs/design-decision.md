# Design decision — Direction C · The Wise Adult

**Status:** Locked for implementation (2026-07-27). Source of truth: `prototype/stef-cms-demo.html` Direction C.

## Visual system

| Token | Value |
|---|---|
| Ground | `#F3EFE7` (bone) |
| Ink | `#1A1815` |
| Accent | `#FF4D00` (electric orange) |
| Muted text | `#44403A` / `#6B6459` |
| Display | Archivo Black |
| Body | Archivo |
| Mono / labels | IBM Plex Mono |
| Rules | `1.5px solid` ink |
| Wordmark | Typographic, uppercase — no logo |

## Composition (homepage)

1. Topbar wordmark + nav  
2. Hero: kicker (practice line) → monumental headline → summary + CTA  
3. Orange method marquee  
4. Three service panels (ruled grid)  
5. How change happens  
6. Workshop index  
7. Fees strip  
8. Footer  

## Inner pages

Same tokens/chrome. About uses B/W portrait + orange band (prototype C treatment). Workshop detail uses C event theme.

## Explicitly deferred

- Stakeholder “revise C a bit” micro-adjustments (iterate via tokens.css)  
- Higher-res portrait swap when available (`public/stefanie-schumacher.jpg` from prototype for now)

---

# The Practice — section ground revision

**Status:** decided · supersedes the dark textured treatment
**Client note:** "The Practice session even with the gradient looks too heavy and industrial. Maybe a lighter orange section instead."

## Decision

The Practice section moves from a dark charcoal ground with a faceted polygon texture to a **flat, full-bleed warm tint** derived from the existing vermillion accent. Type inverts from knockout bone to ink.

No new hue enters the palette. `#F4E2D6` is `#FF4A17` mixed into the bone ground `#F3EFE7` at 8%, so the section stays inside the bone / ink / vermillion system.

## Tokens

```css
:root {
  /* existing */
  --bone:      #F3EFE7;
  --ink:       #14110E;
  --vermillion:#FF4A17;

  /* The Practice section */
  --practice-ground: #F4E2D6; /* vermillion @ 8% into bone */
  --practice-body:   #4A3A32; /* softened ink for body copy */
  --practice-label:  #B23410; /* vermillion darkened 30% — for small text only */
  --practice-grain:  0;       /* grain overlay opacity, 0–0.04. Ship at 0. */
}
```

## Rules

**Ground** — `--practice-ground`, flat. Full-bleed, edge to edge, not inset in a container.

**Remove entirely:**
- the gradient
- the faceted / low-poly polygon texture

**Type** — all text is ink on the tint. No knockout anywhere in this section.
- `THE PRACTICE` — Archivo Black, `--ink`
- `INDIVIDUALS` / `COUPLES` — Archivo Black, `--ink`
- body copy — Archivo, `--practice-body`

**Vermillion** — full strength `--vermillion`, decorative only:
- 2px hairline across the **top edge** of the band, full-bleed. This is the section marker and is load-bearing — at 8% tint the ground alone does not read as a distinct zone.
- the existing 48px, 2px rules above `INDIVIDUALS` and `COUPLES`

**Never** set text in `--vermillion` on this ground — 2.7:1, fails AA. Use `--practice-label` if a small vermillion-family label is ever needed.

**Separation comes from whitespace, not surface.** If the band reads as insufficiently distinct once it's in the page, increase vertical padding. Do not reintroduce texture to solve it.

## Contrast

| Pair | Ratio | |
|---|---|---|
| `--ink` on `--practice-ground` | 15.1:1 | AAA |
| `--practice-body` on `--practice-ground` | 8.6:1 | AAA |
| `--practice-label` on `--practice-ground` | 4.9:1 | AA |
| `--vermillion` on `--practice-ground` | 2.7:1 | **decorative only** |

## Optional grain

Ships at `0`. Exists so the texture question can be answered by turning a number rather than rebuilding the section.

Tonal grain only — no motif, no geometry, no repeating figure. If a shape becomes visible at any opacity, the value is too high.

```css
.practice::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: var(--practice-grain);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)'/%3E%3C/svg%3E");
}
```

Requires `position: relative` on `.practice`. Usable range is `0`–`0.04`; past that the tint goes muddy rather than textured.

## Why

The faceted texture, not the darkness, is what read as industrial — a polygon field is the surface language of tech and datacenter marketing, and at that scale it reads as a material (carbon fiber, diamond plate).

It also contradicts a decision already on the record: textured backgrounds are listed in the design rationale under what the rebuild deliberately avoids, since replacing the current site's marble is one of the things the rebuild is correcting. Substituting polygons for marble is the same move in a different accent.

The reference sites (Mendes Wood DM, Petzel, martinesy.ms) are flat fields throughout. Their rhythm comes from space and rule weight, not from surface.
