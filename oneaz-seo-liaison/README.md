# One AZ <> SEO Liaison Desk

A local, single-folder tool for the middle seat between the One AZ product team and the
GCS SEO delivery team in EUCAN. No install, no server, no network.

**To use it: double-click `index.html`.** That is the whole setup.

Everything you type is saved in that browser's local storage on that machine. Nothing is
sent anywhere. Use **Data → Export JSON backup** before you change browser or clear site
data, and **Import backup** to restore.

---

## The eight views

| View | What it is for |
|---|---|
| **Dashboard** | Only the things waiting on you, split into the two directions: flag to markets, raise with product. |
| **Product radar** | Every One AZ item that could change what markets have to do — with its PI timing, an SEO/GEO read, and whether you have actually told anyone. |
| **Markets** | One row per market, then a full market page: projects, blockers, product items landing there, the whole delivery record, and the contacts. |
| **Blockers** | Market limitations. A friction matrix, then the register — with *told markets* and *told product* dates on every row. |
| **Projects** | Each workstream with milestones you can tick. The paywall pilot carries its 15-task RACI and its dated delivery plan. |
| **GEO checklist** | 50 items in 9 groups. Run a feature against it, score it, get a readout naming the blockers. |
| **Stakeholders** | Who to keep warm, on what cadence, what is open with each of them, when you last spoke. |
| **Briefings** | Turns current state into paste-ready text: market brief, product note, touch-base agenda, status summary. |

## The one workflow that matters

1. Something changes on the product side. Log it in **Product radar** — or open the item
   already seeded from the PI plan.
2. Read the SEO/GEO assessment. Items marked `draft read` are a first pass; confirm or
   rewrite before you quote them.
3. Set the flag direction: to markets, to product, both, or none.
4. Go to **Briefings**, pick the brief, copy it, send it.
5. Hit *Mark these as told* — every item in that brief gets today's date and drops off
   the dashboard.

Blockers work the same way in reverse: a market hits a limitation, you log it, it appears
in the product note until you have raised it.

## What is pre-loaded, and from where

| Data | Source |
|---|---|
| 26 markets, clusters, contacts, sites | EUCAN Internal Catch-up Tracker + the GCS SEO / One AZ deck |
| 281 deliverables with dates and status | EUCAN Internal Catch-up Tracker, Status sheets |
| 28 product items with sprint timing | EUCAN Customer Engagement Q3-2026 PI Planning outputs, One AZ delivery plan and RAID log |
| 15 blockers | The deck, the tracker, the PI RAID log. Field schema matches the EUCAN SEO Blocker Review workbook |
| 8 projects, RACI, delivery plan | Switzerland Paywall Kickoff + the deck appendices |
| 15 stakeholders | Named across all of the above |
| 50-item GEO/SEO checklist | Written for this role; URL and IA items cite Sitemap Governance One AZ Gamma v3.1 |
| Sitemap governance reference card | Sitemap Governance for One AZ Portals, Gamma v3.1 (Florian Howe, 20/10/2025) |

Two honesty markers are built in, because the tool is only useful if you can tell what
came from a document and what came from an inference:

- Product items are `draft read` until you confirm them. The SEO/GEO reasoning on each
  one is a first pass, not something the product team wrote.
- Blockers are flagged `unverified` where they are a starting hypothesis rather than an
  observed fact. Filter on *Unverified — confirm or delete* and clear them out.

**Email addresses were deliberately not imported** from the tracker. Names and roles are
there; add addresses locally if you want them and they will stay in that browser.

## Files

```
oneaz-seo-liaison/
  index.html               open this
  README.md
  assets/
    styles.css
    data-core.js           markets, stakeholders, taxonomy, cadence
    data-product.js        product items and PI timing
    data-market.js         blockers, projects, migration model
    data-deliverables.js   the 281-item delivery record
    checklist.js           GEO/SEO checklist + governance rules
    app.js                 the application
```

To change what ships as the starting point, edit the `data-*.js` files, then
**Data → Reset to seed data**. To change only your own working copy, edit in the app.

## Notes

- Plain ES5-era JavaScript with no dependencies, so it runs from `file://` with no server
  and will keep working in any browser for a long time.
- Light and dark themes; follows your OS setting, and the **Theme** button overrides it.
- Print any view — the chrome drops away.
- `Esc` closes the detail panel.
