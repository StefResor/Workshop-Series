# Content corrections

Source of typos: live Wix crawl + workshop page paste review.

Fee values are **out of scope** for the one-off patch — they stay flagged pending client confirmation.

---

## 1. Homepage spelling patches

Apply as **exact string replacements** on the `page` document with `slug.current == "home"` (fields: `body`, `summary`, `headline`). Do not rewrite fields wholesale.

| Find (exact) | Replace |
|---|---|
| `curiosty` | `curiosity` |
| `noticable` | `noticeable` |

Also ensure process promise uses **noticeable** (capitalized as the sentence requires): “Noticeable change in how you relate every day.”

---

## 2. Workshop #1 body patches

Apply as **exact string replacements** on the `workshop` document with `sessionNumber == 1` (fields: `body`, `shortDescription`). Patch published `_id` **and** `drafts.<id>` when a draft exists.

| # | Find (exact) | Replace |
|---|---|---|
| 1 | `loose sight` | `lose sight` |
| 2 | `thay` | `they` |
| 3 | `curiosty` | `curiosity` |
| 4 | `noticable` | `noticeable` |
| 5 | `largely / irrelevant` | `largely irrelevant` |

Also fold a stray mid-sentence line break when present as a literal newline between the words:

| Find (exact) | Replace |
|---|---|
| `largely\nirrelevant` | `largely irrelevant` |

Canonical corrected workshop #1 body (reference only — do **not** wholesale-replace the field with this block; use the string table above):

> Why trying to be “right” never gets you the understanding and connection you want.
>
> Have you ever walked away from an argument feeling certain you were right — but somehow farther away from the person you love?
>
> We've all been there. As a therapist, I've watched couples repeat the same painful pattern: we become so focused on being understood that we lose our ability to understand. The result isn't resolution — it's distance. We debate facts and objective reality, and lose sight of what our partner is experiencing subjectively. We'll explore why who's right and who's wrong is largely irrelevant — as hard as that may be to believe at first.
>
> Substantial time is dedicated to Q&A, so we can explore as a group how this losing strategy shows up in our lives, and how to shift it.

---

## 3. Workshop #3 body — missing words (seed / separate pass)

Live Wix copy for workshop #3 dropped words mid-sentence. Seed / future edit with complete sentences:

> Full volume gets full defenses. Getting heard takes something quieter — tone, timing, and the willingness to stay in the conversation without flooding it.

Short description:

> Full volume gets full defenses. Getting heard takes something quieter.

---

## Other spelling (catalog — apply if found in any page/workshop body)

| Wrong | Right |
|---|---|
| Reccomend | Recommend |
| seperate | separate |
| occured | occurred |

---

## Brand / process (seed guidance)

- Brand line: **Relational Diplomacy for Individuals and Couples**
- Wordmark: **Stefanie Schumacher** with credentials **MS, LPC, EMDR**

## Fees (CONFIRM WITH STEF — do not patch)

- Couples: **$300 / 75 min**
- Individuals: **$150 / 50 min**
- Workshops: **$35 / participant**
