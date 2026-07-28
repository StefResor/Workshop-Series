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
| JSON-LD `@type` | `Person` (+ `WebSite` / `Event` as needed). **Do not** use `LocalBusiness` or `ProfessionalService` — the latter is a LocalBusiness subtype on schema.org and inherits address/geo expectations. |
| JSON-LD address | Online / Ohio label on Person only — **never** invent a city or street address |

## Wrong — ban list (do not seed, copy, or scaffold)

Do not restore Wix leftovers. Refer to them only by category (never paste the legacy strings into code, JSON-LD, or meta tags):

| Category | Where it showed up |
|---|---|
| Transferred-account org / practice name | LocalBusiness / org name on legacy pages |
| Incorrect TX city on contact blocks | Contact / LocalBusiness location |
| Legacy Gmail on service pages | Service-page contact email |
| Incorrect Twitter/OG site title leftover | `twitter:title` / related OG tags |
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
