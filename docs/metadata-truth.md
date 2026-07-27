# Metadata truth

Site settings and SEO must use the **correct** column only. The **wrong** column is leftover Wix / transferred-account garbage. Nothing from the wrong table may appear in seed data, schemas defaults, JSON-LD, Open Graph, Twitter cards, or Studio placeholders.

## Correct

| Key | Value |
|---|---|
| Site / person name | Stefanie Schumacher |
| Credentials | MS, LPC, EMDR |
| Practice line | Relational Diplomacy for Individuals and Couples |
| Domain | https://stefanie-schumacher.com |
| Contact email (public / form destination) | stef8.schumacher@gmail.com *(CONFIRM WITH STEF if a practice domain address exists)* |
| Transactional from-address | `noreply@send.stefanie-schumacher.com` (Resend-verified subdomain — later) |
| Practice geography | Online practice · Ohio-based *(do not invent a city)* |
| Default meta title | Stefanie Schumacher — Relational Diplomacy |
| Default meta description | Structured, direct relationship work for high-responsibility professionals and leaders. Private-pay, online, and discreet. |
| Twitter / X title | Stefanie Schumacher — Relational Diplomacy |
| JSON-LD `@type` | `ProfessionalService` (or `Person` + `ProfessionalService`) — name Stefanie Schumacher / Relational Diplomacy |
| JSON-LD address | Online / Ohio only — **never** Austin, TX |

## Wrong — ban list (do not seed, copy, or scaffold)

| Wrong value | Where it showed up |
|---|---|
| Gender Psychotherapy Institute | LocalBusiness / org name on legacy pages |
| Austin, Texas / Austin, TX | Contact / LocalBusiness location |
| genderpsychotherapyinstitute@gmail.com | Service-page contact email |
| Trans-Anon.com | `twitter:title` (and related OG leftovers) |
| Relational Diplomacy For Couples *(Couples-only title as sole brand)* | Wix site title — too narrow; use Individuals and Couples |

## Sanity `siteSettings` singleton fields

- `siteName` (Stefanie Schumacher)
- `practiceLine`
- `credentials`
- `canonicalUrl`
- `contactEmail`
- `locationLabel` (e.g. `Online · Ohio`)
- `defaultTitle`
- `defaultDescription`
- `twitterTitle`
- `ogTitle`
