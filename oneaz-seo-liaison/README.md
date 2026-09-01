# One AZ <> SEO Liaison Desk

The middle seat between the One AZ product team and the GCS SEO delivery team in EUCAN.

Runs two ways, from the same folder:

- **Local.** Double-click `index.html`. No install, no server, no network. Data lives in that
  browser's local storage.
- **Hosted on Vercel.** Deploy the folder, set two environment variables, and the same app
  keeps its data on the server — so it survives deleting the folder, clearing your browser,
  or moving machine, and you can open it from anywhere.

---

## How the data updates

Three ways, and it is worth being clear about which is which:

1. **You type it.** Every field in the app is editable. Anything you change is saved
   immediately — to the browser, and to the server if sync is on.
2. **You drop a file into Ingest.** Spreadsheets get column-mapped and merged; decks and
   documents get their text extracted so you can turn a passage into a product item, a
   blocker or a calendar entry. Re-dropping the same tracker changes nothing, so you can
   re-import it as often as it updates.
3. **The seed files.** `assets/data-*.js` is the starting point only. Editing them changes
   what a *fresh* copy starts with — it does not touch your working data unless you hit
   **Data → Reset to seed data**.

Putting a file in the folder does nothing on its own. Nothing watches the filesystem.

## The views

| View | What it is for |
|---|---|
| **Dashboard** | Only what is waiting on you, in two lanes: flag to markets, raise with product. Filter by market and urgency, sort by urgency, due date, market or name. |
| **Learn** | Seven short lessons that teach the product from scratch, plus a 51-term decoder. Start here if the product side feels opaque. |
| **Product** | Four tabs. **Radar** — every item that could change what markets do. **Map** — the surface grouped by what it means to us, plus a clickable page wireframe. **Timeline** — what is rolled out, being built, or still a spike. **Structure** — the full One AZ sitemap, the 39-item feature inventory, and what each market has built. |
| **Markets** | Three tabs: **List**, **Map**, and **Links** — every property with its robots file, sitemap and index check one click away. Then a full market page: projects, plan timeline, blockers, product items landing there, the delivery record, contacts. All editable. |
| **Blockers** | A friction matrix, then the register — same fields as the EUCAN blocker workbook, plus *told markets* and *told product*. |
| **Projects** | Each workstream with milestones and a Gantt timeline. |
| **Paywall** | The whole programme: five stages, scoring criteria, batch types, the Swiss delivery Gantt, market states, and the RACI. |
| **GEO checklist** | 50 items in 9 groups. Score a feature, get a readout naming the blockers. |
| **People** | Stakeholder tracker, and a calendar of meetings, connects, emails and deadlines with the next steps from each. Project milestones and blocker target dates lay in automatically. |
| **Documents** | What this desk produces and where each thing got to — product-facing on one side, market-facing on the other, plus the source documents everything was seeded from. |
| **Briefings** | Paste-ready market brief, product note, touch-base agenda, status summary. |
| **Ingest** | Drop `.xlsx`, `.pptx`, `.docx`, `.csv`, `.txt`, `.eml` or a JSON backup. |

## If the product side is the hard part

Start in **Learn**. Seven lessons, about half an hour in total:

1. What One AZ actually is — one product, many market sites, and why that asymmetry is your whole argument.
2. The shape of a One AZ site — the sitemap standard, with the caps in one table.
3. The moving parts — a diagram of AEM, Veeva, Reltio, MCP, Kaltura, the login and analytics, and whether you care about each.
4. How the work gets planned — PI, sprints, spikes, RAID, releases, and the four signals worth acting on.
5. How to read a product ticket — a worked example on EBPT-4625, in four questions.
6. What to ask, by component type — the cheat sheet to keep open during the touch-base.
7. Where your leverage actually is — three categories out of nine.

Then **Product → Map**, and click anything. Every category and sub-category opens a panel with: what it is in plain terms, how it works as numbered steps, why it reaches us, what to watch, and the two or three questions to ask. The page wireframe below works the same way — click a region and get the product items touching it plus the checklist questions that apply.

**Product → Structure** is the reference: the full One AZ sitemap level by level (content page versus navigation-only label, mandatory versus optional, URL pattern), a 39-item feature inventory grouped by what each thing does, and a per-market profile of what has actually been built — languages, gating, therapy areas, brands, scale and the notable quirks.

**Product → Timeline** answers "is this already out there": rolled out, being built, investigating, blocked, planned — with the rule of thumb that the earlier something is in that list, the cheaper it is to influence.

## The one workflow that matters

1. Something changes on the product side. Log it in **Product radar**, or open the item
   already seeded from the PI plan.
2. Read the SEO/GEO assessment. Items marked `draft read` are a first pass — confirm or
   rewrite before you quote them.
3. Set the flag direction: to markets, to product, both, or none.
4. **Briefings** → pick the brief → copy → send.
5. **Mark these as told.** Everything in that brief gets today's date and leaves the dashboard.

Blockers run the same loop in reverse.

## Ingest

Office files are ZIP archives, and the browser can unzip them itself. The app uses
`DecompressionStream`, which is built into every current browser — so **files are parsed on
your machine, nothing is uploaded, and it works offline.**

- **`.xlsx` / `.csv`** — pick a sheet, pick what it feeds (delivery record, blockers, product
  items), map the columns. The mapping is guessed from the headers. A preview shows exactly
  what will land before you merge. Merging matches on market + deliverable (or title, or
  ticket id), so **an existing row is updated and only genuinely new rows are added.**
  Re-importing the EUCAN catch-up tracker unchanged reports `0 added, 0 updated`.
- **`.pptx` / `.docx` / `.txt` / `.eml`** — text is extracted into a pane. Select a passage,
  then send it into a new product item, blocker or calendar entry.
- **`.json`** — a desk backup. Restoring replaces everything.

## Hosting it on Vercel

The folder is already a valid Vercel project. Static app, one serverless function.

```bash
cd oneaz-seo-liaison
vercel            # first deploy
vercel --prod
```

Then in the Vercel project settings:

1. **Storage** → create a **Blob** store (or a KV store) and connect it to the project.
   That sets `BLOB_READ_WRITE_TOKEN` (or `KV_REST_API_URL` + `KV_REST_API_TOKEN`).
2. **Environment Variables** → add `DESK_KEY` and set it to a long random string. This is
   the key the app sends on every request. **Without `DESK_KEY` the API refuses to serve
   anything**, so the data cannot leak through a URL someone stumbles onto.
3. Redeploy, open the site, go to **Data → Server sync**, paste the same key, hit
   **Connect**.

From then on every edit is written to the server about a second later. Open the site in
another browser, enter the key, and you get the same desk. Concurrent edits are guarded:
a save built on a stale read is refused rather than silently overwriting.

**About access.** `DESK_KEY` protects the *data*, not the page. The HTML itself is served to
anyone with the URL — it is sent with `X-Robots-Tag: noindex, nofollow` so it stays out of
search, but that is obscurity, not access control. Given this holds internal market
information and named colleagues, turn on Vercel's **Deployment Protection** (Settings →
Deployment Protection → Vercel Authentication, or Password Protection) so the page itself
requires a login. Do that before you put anything sensitive in it.

`api/state.js` returns `501` and the app runs purely local if the storage or the key is
missing — nothing half-configured silently loses data.

## What is pre-loaded, and from where

| Data | Source |
|---|---|
| 26 markets, clusters, contacts, sites | EUCAN Internal Catch-up Tracker + the GCS SEO / One AZ deck |
| 281 deliverables with dates and status | EUCAN Internal Catch-up Tracker, Status sheets |
| 28 product items with sprint timing | EUCAN Customer Engagement Q3-2026 PI Planning outputs, One AZ delivery plan, RAID log |
| 15 blockers | The deck, the tracker, the PI RAID log. Field schema matches the EUCAN SEO Blocker Review workbook |
| 8 projects with Gantt task bars | Switzerland Paywall Kickoff, the deck appendices, the tracker |
| Paywall programme | Switzerland Paywall Kickoff + the Canada precedent |
| 15 stakeholders | Named across all of the above |
| Product categories and page anatomy | A liaison-side reading of the PI plan against Sitemap Governance |
| The One AZ sitemap tree and navigation rules | Sitemap Governance One AZ Gamma v3.1, level by level |
| 39-feature component inventory | The PI plan, the governance document and the delivery record |
| 12 per-market site profiles | What has actually been delivered per market, from the tracker and the projects deck |
| Site URLs for every property | The Websites sheet of the catch-up tracker |
| 7 lessons and a 51-term decoder | Written for this role from all of the above |
| 15 output documents | The next-steps list, the deck and the standing deliverable types |
| 50-item GEO/SEO checklist | Written for this role; URL and IA items cite Sitemap Governance One AZ Gamma v3.1 |

Two honesty markers are built in, because the tool is only useful if you can tell what came
from a document and what came from an inference:

- Product items are `draft read` until you confirm them. The SEO/GEO reasoning on each is a
  first pass, not something the product team wrote.
- Blockers are flagged `unverified` where they are a starting hypothesis rather than an
  observed fact. There is a filter for them.

The paywall candidate markets, the product category `core / watch / light` ratings and the
rollout states on the timeline are also a liaison view, not an agreed position.

**The sites themselves were not crawled** — the environment this was built in cannot reach
them. The sitemap tree comes from the governance document, which is the canonical source
anyway; the per-market structure comes from what has actually been delivered. So it is the
shape of the work, not a page-by-page audit.

**Email addresses were deliberately not imported** from the tracker. Names and roles are
there; add addresses in the market editor if you want them.

## Files

```
oneaz-seo-liaison/
  index.html               open this
  README.md
  package.json             for Vercel
  vercel.json              security headers
  api/
    state.js               GET/PUT the shared state (Blob or KV, key-gated)
  assets/
    styles.css
    sync.js                optional server sync; inert on file://
    data-core.js           markets, stakeholders, taxonomy, cadence
    data-product.js        product items and PI timing
    data-market.js         blockers, projects, migration model
    data-deliverables.js   the 281-item delivery record
    data-views.js          geography, product map, page anatomy, paywall, Gantt tasks
    data-learn.js          the lessons and the decoder
    data-sitemap.js        the sitemap tree, feature inventory, market profiles, site URLs
    data-explain.js        deep-dive explainers and rollout states
    data-docs.js           the output document register
    checklist.js           GEO/SEO checklist + governance rules
    app.js                 the application
```

## Notes

- Plain ES5-era JavaScript, no dependencies, no build step.
- Light and dark themes; follows the OS setting, **Theme** overrides it.
- Print any view — the chrome drops away. `Esc` closes the detail panel.
- Export a JSON backup before switching browsers if you are not using server sync.
