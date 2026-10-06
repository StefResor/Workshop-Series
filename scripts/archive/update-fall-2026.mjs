#!/usr/bin/env node
/**
 * update-fall-2026.mjs
 * Overwrites the demo Fall 2026 workshops in place with the real schedule:
 * new startsAt, zoomLink, zoomPasscode. Session 06 also gets its correct
 * topic (The Art & Skill of Acceptance) if it still holds a duplicate.
 * Leaves stripePaymentLink, registrationStatus and everything else alone.
 *
 * Dry run (default): node scripts/update-fall-2026.mjs
 * Apply:             node scripts/update-fall-2026.mjs --commit
 *
 * Finds the series by slug "fall-2026" (aborts unless exactly one), then the
 * 10 workshop docs referencing it, matched by sessionNumber. No schema changes.
 *
 * Env: SANITY_PROJECT_ID (default dx57inng), SANITY_DATASET (default production),
 *      SANITY_API_WRITE_TOKEN (required)
 */
import { createClient } from '@sanity/client'

const COMMIT = process.argv.includes('--commit')
const SERIES_SLUG = 'fall-2026'

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID || 'dx57inng',
  dataset: process.env.SANITY_DATASET || 'production',
  token: process.env.SANITY_API_WRITE_TOKEN,
  apiVersion: '2025-01-01',
  useCdn: false,
})
if (!process.env.SANITY_API_WRITE_TOKEN) {
  console.error('Missing SANITY_API_WRITE_TOKEN'); process.exit(1)
}

const FALL = [
  {
    "sessionNumber": 1,
    "slug": "im-right-youre-wrong-the-fight-that-never-ends",
    "title": "\"I'm right, you're wrong\" — The Fight That Never Ends",
    "shortDescription": "Why winning the argument loses the connection — and what to do instead.",
    "body": [
      {
        "_type": "block",
        "_key": "d556b2b2a7",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "d556b2b2a7s",
            "text": "Why trying to be “right” never gets you the understanding and connection you want.",
            "marks": []
          }
        ]
      },
      {
        "_type": "block",
        "_key": "15e6040667",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "15e6040667s",
            "text": "Have you ever walked away from an argument feeling certain you were right — but somehow farther away from the person you love?",
            "marks": []
          }
        ]
      },
      {
        "_type": "block",
        "_key": "2ce72fa320",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "2ce72fa320s",
            "text": "We've all been there. As a therapist, I've watched couples, friends, family members, repeat the same painful pattern: we become so focused on being understood that we lose our ability to understand. The result isn't resolution — it's distance. We debate facts and objective reality, and lose sight of what the other person is experiencing subjectively. We'll explore why who's right and who's wrong is largely irrelevant, as hard as that might be to believe at first.",
            "marks": []
          }
        ]
      },
      {
        "_type": "block",
        "_key": "773f02bfe7",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "773f02bfe7s",
            "text": "Substantial time is dedicated to Q&A, so we can explore as a group how this losing strategy shows up in our lives, and how to shift it.",
            "marks": []
          }
        ]
      }
    ],
    "startsAt": "2026-10-28T23:00:00.000Z",
    "zoomLink": "https://us06web.zoom.us/j/86094656410?pwd=mQLKYnShZEeip5Z8R1vqT1x0IKvV3G.1",
    "zoomPasscode": "227984"
  },
  {
    "sessionNumber": 2,
    "slug": "if-we-cant-control-our-partner-why-do-we-keep-trying",
    "title": "If We Can't Control Our Partner, Why Do We Keep Trying?",
    "shortDescription": "The control reflex, where it comes from, and how to put it down.",
    "body": [
      {
        "_type": "block",
        "_key": "a6ea13802e",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "a6ea13802es",
            "text": "The control reflex, why we do it and why it never gets us what we want--connection.",
            "marks": []
          }
        ]
      },
      {
        "_type": "block",
        "_key": "ad6296403e",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "ad6296403es",
            "text": "This workshop will delve into the reasons people try to control others and the  different ways control may show up in ourselves and others. We will explore why we shift into trying to control, how trying to control may make us feel safer and more stable in the moment but in the end just destabilizes us and the relationship even more.",
            "marks": []
          }
        ]
      },
      {
        "_type": "block",
        "_key": "c099bbda2d",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "c099bbda2ds",
            "text": "Substantial time is dedicated to Q&A, so we can explore as a group how this dynamic plays out in your own relationships, and how to shift it.",
            "marks": []
          }
        ]
      }
    ],
    "startsAt": "2026-11-05T00:00:00.000Z",
    "zoomLink": "https://us06web.zoom.us/j/87994241745?pwd=fxnsZPMkqJbls6uwLg50AIIUgaKxVd.1",
    "zoomPasscode": "898782"
  },
  {
    "sessionNumber": 3,
    "slug": "why-unleashing-on-your-partner-never-gets-you-heard",
    "title": "Why Unleashing on Your Partner Never Gets You Heard",
    "shortDescription": "Full volume gets you defensiveness or withdrawal in return rather than understanding and compassion.",
    "body": [
      {
        "_type": "block",
        "_key": "c98e4bff91",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "c98e4bff91s",
            "text": "Unleashing on the other person may feel good in the moment, it may even feel justified, and yet it never results in anything but defensiveness, withdrawal, potential retaliation and disconnection. While it may feel tempting to vent your anger and high intensity emotions on your partner, family member or friend, you'll do more damage and end up needing to repair even more.",
            "marks": []
          }
        ]
      },
      {
        "_type": "block",
        "_key": "c5b65d18d9",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "c5b65d18d9s",
            "text": "We will explore why people unleash on others, why they feel entitled to do so or justified in this behavior. We will also discuss the damage that will be done and other, more effective ways to be heard and understood.",
            "marks": []
          }
        ]
      },
      {
        "_type": "block",
        "_key": "c099bbda2d",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "c099bbda2ds",
            "text": "Substantial time is dedicated to Q&A, so we can explore as a group how this dynamic plays out in your own relationships, and how to shift it.",
            "marks": []
          }
        ]
      }
    ],
    "startsAt": "2026-11-12T00:00:00.000Z",
    "zoomLink": "https://us06web.zoom.us/j/83786135249?pwd=mFPBo470blOGqojAaS2np2re3QCxHo.1",
    "zoomPasscode": "148182"
  },
  {
    "sessionNumber": 4,
    "slug": "the-destructive-force-of-retaliation",
    "title": "The Destructive Force of Retaliation",
    "shortDescription": "Payback feels fair in the moment — and costs the relationship every time.",
    "body": [
      {
        "_type": "block",
        "_key": "633504c667",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "633504c667s",
            "text": "Payback feels fair in the moment — and costs the relationship every time.",
            "marks": []
          }
        ]
      },
      {
        "_type": "block",
        "_key": "7affb5eea2",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "7affb5eea2s",
            "text": "People retaliate to even the score or deliberately inflict pain when they feel injured, wounded, or insulted. Revenge feels good in the moment but does nothing to alleviate the pain in the long run. What you can count on is more pain for everyone, more hurt, more anger, counter-retaliation and an endless cycle of pain. There are other ways to deal with our feelings when we feel hurt than to seek revenge. This workshop will look at some other ways to respond to hurt and injury without causing more damage.",
            "marks": []
          }
        ]
      },
      {
        "_type": "block",
        "_key": "c099bbda2d",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "c099bbda2ds",
            "text": "Substantial time is dedicated to Q&A, so we can explore as a group how this dynamic plays out in your own relationships, and how to shift it.",
            "marks": []
          }
        ]
      }
    ],
    "startsAt": "2026-11-19T00:00:00.000Z",
    "zoomLink": "https://us06web.zoom.us/j/84621773019?pwd=NUJ9fjqb2RDSUFThN8npv2Mcx70aXM.1",
    "zoomPasscode": "558014"
  },
  {
    "sessionNumber": 5,
    "slug": "the-withdrawal-trap",
    "title": "The Withdrawal Trap",
    "shortDescription": "When going quiet becomes going missing — and how to come back.",
    "body": [
      {
        "_type": "block",
        "_key": "f940b4b2ec",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "f940b4b2ecs",
            "text": "When going quiet becomes going missing — and how to come back.",
            "marks": []
          }
        ]
      },
      {
        "_type": "block",
        "_key": "f439608536",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "f439608536s",
            "text": "In this workshop we will examine why people withdraw, how it can be protective yet also damaging to the relationship, and how it sometimes may be an act of retaliation. We will look at other ways to express hurt or to ask for space to process hurt feelings.",
            "marks": []
          }
        ]
      },
      {
        "_type": "block",
        "_key": "c099bbda2d",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "c099bbda2ds",
            "text": "Substantial time is dedicated to Q&A, so we can explore as a group how this dynamic plays out in your own relationships, and how to shift it.",
            "marks": []
          }
        ]
      }
    ],
    "startsAt": "2026-12-03T00:00:00.000Z",
    "zoomLink": "https://us06web.zoom.us/j/86927388953?pwd=dfxB3NGCsLtsEolpX87fgclQlNNZdV.1",
    "zoomPasscode": "410165"
  },
  {
    "sessionNumber": 6,
    "slug": "the-art-skill-of-acceptance",
    "title": "The Art & Skill of Acceptance",
    "shortDescription": "What acceptance actually is (it isn't giving up), and how to practice it.",
    "body": [
      {
        "_type": "block",
        "_key": "ae17535326",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "ae17535326s",
            "text": "Relating from a place of acceptance is the foundation of making meaningful change in your relationships and in your own life. Acceptance precedes any real meaning making.",
            "marks": []
          }
        ]
      },
      {
        "_type": "block",
        "_key": "c71de1b0ef",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "c71de1b0efs",
            "text": "In this workshop we will explore the various facets of acceptance, how to be in a state of acceptance, and how to move foward from a place of acceptance.",
            "marks": []
          }
        ]
      },
      {
        "_type": "block",
        "_key": "c099bbda2d",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "c099bbda2ds",
            "text": "Substantial time is dedicated to Q&A, so we can explore as a group how this dynamic plays out in your own relationships, and how to shift it.",
            "marks": []
          }
        ]
      }
    ],
    "startsAt": "2026-12-10T00:00:00.000Z",
    "zoomLink": "https://us06web.zoom.us/j/81263446796?pwd=4aY7vGMz9rpyUsC6GigCZZ43aJjeME.1",
    "zoomPasscode": "555648"
  },
  {
    "sessionNumber": 7,
    "slug": "the-discipline-of-listening-to-understand",
    "title": "The Discipline of Listening to Understand",
    "shortDescription": "Listening to respond vs. listening to understand — a trainable difference.",
    "body": [
      {
        "_type": "block",
        "_key": "385fa6b85e",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "385fa6b85es",
            "text": "Listening to respond vs. listening to understand — a trainable difference.",
            "marks": []
          }
        ]
      },
      {
        "_type": "block",
        "_key": "59f05e2e6a",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "59f05e2e6as",
            "text": "This workshop will introduce you to the discipline and practice of listening to understand, and why it matters. We will examine poor habits of listening and useful habits to adopt and how deep listening reduces conflict and misunderstandings.",
            "marks": []
          }
        ]
      },
      {
        "_type": "block",
        "_key": "c099bbda2d",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "c099bbda2ds",
            "text": "Substantial time is dedicated to Q&A, so we can explore as a group how this dynamic plays out in your own relationships, and how to shift it.",
            "marks": []
          }
        ]
      }
    ],
    "startsAt": "2026-12-17T00:00:00.000Z",
    "zoomLink": "https://us06web.zoom.us/j/81005547779?pwd=HoUJe5YqRpGUdxjv0NrnA1azbbyDQ4.1",
    "zoomPasscode": "822258"
  },
  {
    "sessionNumber": 8,
    "slug": "responsible-distance-taking-responsible-feedback",
    "title": "Responsible Distance-Taking & Responsible Feedback",
    "shortDescription": "It's responsible to take distance when needed so long as it's done in a responsible way. The same goes with giving feedback.",
    "body": [
      {
        "_type": "block",
        "_key": "b30229e91c",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "b30229e91cs",
            "text": "In this workshop we will learn about responsible distance taking and how to give feedback so that you are heard and understood while also learning how to listen to and understand the other person.",
            "marks": []
          }
        ]
      },
      {
        "_type": "block",
        "_key": "c099bbda2d",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "c099bbda2ds",
            "text": "Substantial time is dedicated to Q&A, so we can explore as a group how this dynamic plays out in your own relationships, and how to shift it.",
            "marks": []
          }
        ]
      }
    ],
    "startsAt": "2027-01-07T00:00:00.000Z",
    "zoomLink": "https://us06web.zoom.us/j/87683741484?pwd=i5wjJ0Z88VXWHGZcTBPXAGnyGvwhE8.1",
    "zoomPasscode": "243247"
  },
  {
    "sessionNumber": 9,
    "slug": "the-art-of-generosity-empowering-your-partner",
    "title": "Generosity as a Choice",
    "shortDescription": "Generosity as a choice, not a mood — and why it's good for you to give.",
    "body": [
      {
        "_type": "block",
        "_key": "f7ba70a16e",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "f7ba70a16es",
            "text": "Generosity is a choice, not a mood — and why it's good for you to give.",
            "marks": []
          }
        ]
      },
      {
        "_type": "block",
        "_key": "e3c5e90ccf",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "e3c5e90ccfs",
            "text": "We can decide to be generous with our partner, friend or family member. Generosity is a choice that often leads to less conflict and more mutual understanding. We'll talk about the why, when and how of generosity.",
            "marks": []
          }
        ]
      },
      {
        "_type": "block",
        "_key": "c099bbda2d",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "c099bbda2ds",
            "text": "Substantial time is dedicated to Q&A, so we can explore as a group how this dynamic plays out in your own relationships, and how to shift it.",
            "marks": []
          }
        ]
      }
    ],
    "startsAt": "2027-01-14T00:00:00.000Z",
    "zoomLink": "https://us06web.zoom.us/j/82395903905?pwd=RbymoJqaUZRE4sFA0ouyPBEUDWZzur.1",
    "zoomPasscode": "346648"
  },
  {
    "sessionNumber": 10,
    "slug": "the-art-of-the-apology",
    "title": "Why Should I Apologize?",
    "shortDescription": "Why an apologies matters.",
    "body": [
      {
        "_type": "block",
        "_key": "658d4b5dc6",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "658d4b5dc6s",
            "text": "An apology matters in a relationship of any kind, and yet many people find it difficult to apologize, get stuck on waiting for the other person to apologize, find it defeatist to apologize, or that it signals weakness.",
            "marks": []
          }
        ]
      },
      {
        "_type": "block",
        "_key": "4b5e6af5ce",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "4b5e6af5ces",
            "text": "We will discuss why an apology matters, how to do it well and mean it, how to receive an apology and accept it, and why an apology is an act of strength, confidence, care, and being a good human being.",
            "marks": []
          }
        ]
      },
      {
        "_type": "block",
        "_key": "c099bbda2d",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "c099bbda2ds",
            "text": "Substantial time is dedicated to Q&A, so we can explore as a group how this dynamic plays out in your own relationships, and how to shift it.",
            "marks": []
          }
        ]
      }
    ],
    "startsAt": "2027-01-21T00:00:00.000Z",
    "zoomLink": "https://us06web.zoom.us/j/89004226537?pwd=3BYlxyOMc0NFGz8KwUeU5f3BQ9PeLm.1",
    "zoomPasscode": "619081"
  }
]

const fmt = (iso) => new Date(iso).toLocaleString('en-US', {
  timeZone: 'America/New_York', weekday: 'short', month: 'short', day: 'numeric',
  year: 'numeric', hour: 'numeric', minute: '2-digit',
}) + ' ET'

// Resolve the series by slug; never assume its _id.
const seriesDocs = await client.fetch(
  `*[_type == "series" && slug.current == $slug && !(_id in path("drafts.**"))]{_id, title, "slug": slug.current}`,
  { slug: SERIES_SLUG },
)
if (seriesDocs.length !== 1) {
  console.error(`Expected exactly 1 series with slug "${SERIES_SLUG}", found ${seriesDocs.length}. Aborting.`)
  process.exit(1)
}
const SERIES_ID = seriesDocs[0]._id
console.log(`Series: ${SERIES_ID} (slug: ${seriesDocs[0].slug})`)

// Published and draft workshop docs in that series.
const existing = await client.fetch(
  `*[_type == "workshop" && series._ref == $series]{_id, sessionNumber, title, "slug": slug.current, startsAt}`,
  { series: SERIES_ID },
)
const published = existing.filter((d) => !d._id.startsWith('drafts.'))
const drafts = existing.filter((d) => d._id.startsWith('drafts.'))

console.log(`Found ${published.length} published workshop docs in ${SERIES_ID}` +
  (drafts.length ? ` (+${drafts.length} drafts — discard these in Studio first)` : ''))

const tx = client.transaction()
let problems = 0
for (const row of FALL) {
  const matches = published.filter((d) => d.sessionNumber === row.sessionNumber)
  if (matches.length !== 1) {
    console.error(`  ✗ Session ${row.sessionNumber}: expected 1 doc, found ${matches.length}`)
    problems++; continue
  }
  const doc = matches[0]
  const set = { startsAt: row.startsAt, zoomLink: row.zoomLink, zoomPasscode: row.zoomPasscode }
  const retopic = doc.slug !== row.slug
  if (retopic) Object.assign(set, {
    title: row.title, slug: { _type: 'slug', current: row.slug },
    shortDescription: row.shortDescription, body: row.body,
  })
  console.log(`  ${String(row.sessionNumber).padStart(2, '0')}  ${doc._id}`)
  console.log(`      ${doc.startsAt ? fmt(doc.startsAt) : '(no date)'}  →  ${fmt(row.startsAt)}`)
  if (retopic) console.log(`      topic: "${doc.title}"  →  "${row.title}"`)
  tx.patch(doc._id, (p) => p.set(set))
}

// Demo registrations would get real Zoom links from the 8-day cron.
const regs = await client.fetch(
  `count(*[_type == "registration" && references($ids) && testMode != true])`,
  { ids: published.map((d) => d._id) },
)
console.log(`\nNon-test registrations on these workshops: ${regs}` +
  (regs ? '  ← demo data? delete or set testMode before Oct 20 (first credentials send)' : ''))

if (problems) { console.error(`\n${problems} problem(s); nothing written.`); process.exit(1) }
if (!COMMIT) { console.log('\nDry run. Re-run with --commit to apply.'); process.exit(0) }
const res = await tx.commit()
console.log(`\nCommitted ${res.results.length} patches.`)
