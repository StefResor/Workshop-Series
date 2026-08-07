# Design decision — Direction C · The Wise Adult

**Status:** Locked for implementation (2026-07-27). Source of truth: `prototype/stef-cms-demo.html` Direction C.

## Visual system

| Token | Value |
|---|---|
| Ground | `#F3EFE7` (`--bone`) |
| Ink | `#14110E` (`--ink`) |
| Accent | `#FF4A17` (`--vermillion`) |
| Muted text | `#44403A` / `#6B6459` (`--muted` / `--muted-2`) |
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

**Status:** decided · white band (supersedes warm tint / amber trial)
**Client note:** "The Practice session even with the gradient looks too heavy and industrial."

## Decision

The Practice section is a **flat, full-bleed white** band (`#FFFFFF` / `--practice-ground`). No amber, no warm tint, no knockout type. Headings and body use the site ink / muted system; consultation CTAs use `--vermillion` like other site CTAs.

Removed tokens: `--amber`, `--practice-label`, `--practice-body` (body copy uses `--muted`).

## Tokens

```css
:root {
  --bone:      #F3EFE7;
  --ink:       #14110E;
  --vermillion:#FF4A17;
  --muted:     #44403A;
  --white:     #FFFFFF;

  /* The Practice section */
  --practice-ground: #FFFFFF;
  --practice-grain:  0; /* grain overlay opacity, 0–0.04. Ship at 0. */
}
```

## Rules

**Ground** — `--practice-ground` white, flat. Full-bleed, edge to edge.

**Keep:**
- 2px vermillion top border (section marker)
- 48px, 2px vermillion rules above Individuals / Couples
- optional grain `::before` (ships at opacity 0)

**Type**
- `THE PRACTICE` — Archivo Black, `--ink`, shared `--text-section-heading`
- `INDIVIDUALS` / `COUPLES` — Archivo Black, `--ink`
- body copy — Archivo, `--muted`
- consultation links — mono, `--vermillion`, 14px; hover matches site CTA opacity

**Remove entirely:**
- gradient / faceted polygon texture
- section-scoped link color (`--practice-label`) and hover-to-ink patches

**Separation comes from whitespace and the vermillion top rule**, not from a tinted surface.

## Contrast — accepted tradeoff

Vermillion links at text size compute roughly **~2.9:1 on bone** and **~3.4:1 on white**, below the **4.5:1** AA target for normal text. This is a deliberate decision to preserve the palette. Mitigation: larger type (14px) on Practice CTAs. Decorative vermillion (item rules) is not text.

| Pair | Ratio | |
|---|---|---|
| `--ink` on white | ~18.8:1 | AAA |
| `--muted` on white | ~9.7:1 | AAA |
| `--vermillion` on white | ~3.4:1 | below AA text; accepted |

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

The reference sites (Mendes Wood DM, Petzel, martinesy.ms) are flat fields throughout. Their rhythm comes from space and rule weight, not from surface. White keeps The Practice in that system without introducing a fourth ground hue.
