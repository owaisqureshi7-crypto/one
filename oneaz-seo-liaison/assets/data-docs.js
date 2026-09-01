/* OUTPUT DOCUMENTS — what this desk produces, for whom, and where it got to.
   side:   product | market | both
   status: idea | drafting | in-review | sent | acknowledged | superseded | recurring
   Seeded from what the deck, the tracker and the next-steps list already commit to. */

window.DATA_DOCS = {

docs: [
  /* ------------------------------------------------ product-facing */
  { id:'d-playbook', side:'product', title:'SEO and GEO playbook for the One AZ product team',
    type:'Standard', status:'drafting', owner:'Owais / GCS SEO', audience:'Adrian, One AZ product',
    date:'', due:'2026-09-30', link:'', market:'',
    what:'Technical standards — URL structure, indexation controls, schema, tech files — and content standards — page structure, metadata patterns, keyword and prompt scope for GEO. Written for the product team rather than per market, so the standard ships with the template.',
    next:'Fold in the AI crawler decision and the metadata override requirement before the first version goes over.',
    relates:['p-playbook'] },

  { id:'d-crawler', side:'product', title:'AI crawler position — one decision for all One AZ properties',
    type:'Decision paper', status:'idea', owner:'Owais → Adrian', audience:'One AZ product',
    date:'', due:'2026-09-17', link:'', market:'',
    what:'A single recorded position on GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Bingbot and CCBot, to be written into the playbook and the template rather than answered differently by each market.',
    next:'Put it on the next touch-base agenda as a decision item, not a discussion item.',
    relates:['b-ai-crawlers'] },

  { id:'d-deurl', side:'product', title:'Germany URL edge cases → proposed guideline text',
    type:'Proposal', status:'idea', owner:'Owais', audience:'Florian Howe, Adrian',
    date:'', due:'', link:'', market:'DE',
    what:'The calls Germany made where the One AZ URL convention was ambiguous, stress-tested across 13 brands and 938 pages, written up as proposed additions to the governance document.',
    next:'Cheapest item on the list. Draft it from the per-brand workbooks and send it to the document owner.',
    relates:['c-de-ambig','ch-de-urlcalls'] },

  { id:'d-sitemapreview', side:'product', title:'Review comments on the next Sitemap Governance version',
    type:'Review', status:'idea', owner:'Owais', audience:'Florian Howe',
    date:'', due:'', link:'', market:'',
    what:'The document already lists "ensure SEO best practices are followed" as an objective with no specifics attached. This is what attaches them.',
    next:'Ask to be notified of any version above Gamma 3.1 before it publishes.',
    relates:['SITEMAP-GAMMA'] },

  { id:'d-onboarding', side:'product', title:'Onboarding session — how GCS SEO intake, delivery and QA work',
    type:'Session', status:'idea', owner:'GCS SEO', audience:'One AZ product team',
    date:'', due:'', link:'', market:'',
    what:'One session plus one page of guidance, walking the product team through how a request reaches us, what we deliver, and where QA sits.',
    next:'Named as a next step in the product session. We can start this from our side without waiting.',
    relates:[] },

  { id:'d-backlogroute', side:'product', title:'Route for raising SEO and GEO items into the One AZ backlog',
    type:'Process', status:'idea', owner:'Owais + Adrian', audience:'One AZ product',
    date:'', due:'2026-09-30', link:'', market:'',
    what:'A written, agreed path for an SEO or GEO requirement to become a product item — so a fix ships once to every market instead of as 21 local tickets.',
    next:'One of the two things actually requested in the product session. Ask for it explicitly.',
    relates:['p-playbook'] },

  { id:'d-prodnote', side:'product', title:'Product feedback note', type:'Recurring note',
    status:'recurring', owner:'Owais', audience:'Adrian', date:'', due:'', link:'', market:'',
    what:'The standing note taking market reality back to the product backlog. Generated from the desk each cycle.',
    next:'Generate it in Briefings before each touch-base, send it, then mark the items as raised.',
    relates:[] },

  { id:'d-assess', side:'product', title:'GEO and SEO readiness assessments', type:'Assessment',
    status:'recurring', owner:'Owais / SEO Technical', audience:'One AZ product, per feature',
    date:'', due:'', link:'', market:'',
    what:'A scored readout per product feature naming the must-have failures. Run from the checklist.',
    next:'Run one against the localised URL slug work and the video gallery spike — both are still shapeable.',
    relates:[] },

  /* ------------------------------------------------- market-facing */
  { id:'d-marketbrief', side:'market', title:'Product update brief to the SEO team and markets',
    type:'Recurring note', status:'recurring', owner:'Owais', audience:'Ana, Sushanta, Aswine → markets',
    date:'', due:'', link:'', market:'',
    what:'What changed on the product side, what it means for each market, and what the market has to do about it. Generated from the desk.',
    next:'Generate in Briefings after each touch-base and mark the items as cascaded.',
    relates:[] },

  { id:'d-training', side:'market', title:'Guideline briefing for market digital leads',
    type:'Session', status:'idea', owner:'GCS SEO + One AZ', audience:'Market digital leads',
    date:'', due:'', link:'', market:'',
    what:'What SEO needs at wireframe stage and why it is cheaper there. Austria and the Baltics are the evidence; Portugal is the counter-example.',
    next:'Named as a next step. Needs the product team alongside us for it to carry weight.',
    relates:[] },

  { id:'d-urlwb', side:'market', title:'Per-brand URL structuring workbooks', type:'Deliverable',
    status:'recurring', owner:'Delivery team', audience:'Market, then assembly', date:'', due:'', link:'', market:'DE',
    what:'One working file per brand. Structure written in column E, trimmed in column F where there is a rationale, signed off by the market before anything is built.',
    next:'These are the source for the guideline-text proposal. Keep them together.',
    relates:['d-deurl'] },

  { id:'d-audits', side:'market', title:'Pre- and post-launch audit reports', type:'Deliverable',
    status:'recurring', owner:'Aswine Sami', audience:'Market, named implementer', date:'', due:'', link:'', market:'',
    what:'Staging validated against the recommendation before go-live, then a live check two weeks after release. Now standard in every web page package.',
    next:'Portugal is the open case — the audit found redirects and metadata not implemented and there is no named recipient.',
    relates:['b-pt-owner'] },

  { id:'d-quarterly', side:'market', title:'Quarterly performance reports', type:'Deliverable',
    status:'recurring', owner:'Delivery team', audience:'Market', date:'', due:'', link:'', market:'',
    what:'Adobe Analytics, Search Console and BrightEdge across the quarter. Switzerland and the Netherlands are where the cadence already is.',
    next:'Use the Swiss cadence as the model when arguing for measurement on the paywall batches.',
    relates:[] },

  { id:'d-paywall30', side:'market', title:'Paywall 30-day post-launch report', type:'Report',
    status:'idea', owner:'SEO Technical, with Ana', audience:'Sandy, Marisa, One AZ product',
    date:'', due:'2026-11-10', link:'', market:'CH',
    what:'The measurement window on batch 2, opening 10 October. The evidence that decides whether the package extends beyond Switzerland.',
    next:'Baseline has to be captured before the batch goes live, not after.',
    relates:['p-paywall-ch'] },

  { id:'d-blockerwb', side:'both', title:'EUCAN SEO blocker review and forward tracker', type:'Register',
    status:'recurring', owner:'Owais / Ana', audience:'Both sides', date:'', due:'', link:'', market:'',
    what:'The blocker themes and the forward implementation actions. This desk mirrors its field schema, so exports line up.',
    next:'Keep the desk and the workbook in step — the workbook is what other people read.',
    relates:[] }
],

/* The inputs this desk was built from. Read-only reference. */
sources: [
  { t:'GCS SEO / One AZ deck', d:'August 2026 · the delivery record, the operating model, the partnership asks', side:'both' },
  { t:'EUCAN Internal Catch-up Tracker', d:'281 deliverables, market contacts, migration packages, requestors', side:'market' },
  { t:'EUCAN Customer Engagement Q3-2026 PI Planning outputs', d:'The product delivery plan, sprint windows and the RAID log', side:'product' },
  { t:'Sitemap Governance for One AZ Portals — Gamma v3.1', d:'Florian Howe, 20/10/2025 · the structure standard', side:'product' },
  { t:'EUCAN SEO Blocker Review and Forward Tracker', d:'The blocker field schema this desk mirrors', side:'both' },
  { t:'EUCAN SEO Strategic Framing', d:'Ana Pires, August 2026 · the three-layer operating model and the quarterly build', side:'both' },
  { t:'One AZ SEO Projects and Status deck', d:'8 July 2026 · per-market project detail and the performance evidence', side:'market' },
  { t:'Switzerland Paywall Kickoff', d:'Ana Pires, August 2026 · the RACI and the delivery plan', side:'market' }
],

statuses: {
  idea:        ['ghost', 'Idea'],
  drafting:    ['warn',  'Drafting'],
  'in-review': ['info',  'In review'],
  sent:        ['ok',    'Sent'],
  acknowledged:['ok',    'Acknowledged'],
  superseded:  ['ghost', 'Superseded'],
  recurring:   ['teal',  'Recurring']
}
};
