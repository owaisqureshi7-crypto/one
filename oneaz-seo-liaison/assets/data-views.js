/* Data that powers the visual views: geography, the product category map,
   the page-anatomy map, the paywall programme, and project task bars. */

window.DATA_VIEWS = {

/* Approximate capital coordinates. The map is a schematic, not a survey. */
/* [lat, lon, dx, dy] — dx/dy are pixel nudges to stop close capitals colliding. */
geo: {
  DE:[52.52,13.40],  CH:[46.95,7.45],   ES:[40.42,-3.70], AT:[48.21,16.37,-13,-6], PT:[38.72,-9.14],
  NL:[52.37,4.90],   BE:[50.85,4.35],   LT:[54.69,25.28], LV:[56.95,24.11],        EE:[59.44,24.75],
  PL:[52.23,21.01],  CZ:[50.08,14.44,0,-7], SK:[48.15,17.11,17,4], HU:[47.50,19.04,8,10], HR:[45.81,15.98,8,10],
  RS:[44.79,20.45],  SI:[46.06,14.51,-16,4], BG:[42.70,23.32], RO:[44.43,26.10],   UK:[51.51,-0.13],
  IT:[41.90,12.50],  FR:[48.86,2.35],   SE:[59.33,18.07], NO:[59.91,10.75]
},
offMap: ['CA','GLOBAL'],

/* ---------------------------------------------------------------------
   The product surface, grouped the way it matters to SEO and GEO.
   `care` is how much of our standard lives in that category:
     core   — our standard is decided here; be in the room
     watch  — can undo our work if it ships unreviewed
     light  — worth knowing, rarely worth intervening
   --------------------------------------------------------------------- */
categories: [
  { id:'url', title:'URL, IA and navigation', care:'core', icon:'⌗',
    blurb:'The layer the whole One AZ SEO case rests on. Germany stress-tested it across 13 brands; the Sitemap Governance doc is the written standard.',
    stake:'Every URL and IA recommendation the team has ever written assumes this stays put. A change here is a change to 20 markets at once.',
    subs:[
      { id:'url-slug', title:'URLs and slugs', care:'core', note:'The .html convention, content pages only, no navigation-only labels.' },
      { id:'url-nav',  title:'Navigation and menus', care:'core', note:'Megamenu, breadcrumbs, the 5×10 and 7-tab caps.' },
      { id:'url-domain', title:'Domains and routing', care:'core', note:'Which system serves which path; canonical when two do.' }
    ]},
  { id:'access', title:'Access and identity', care:'core', icon:'⚿',
    blurb:'Login, registration, consent, session. In an HCP portal this is the same question as indexability: what a crawler is served before the wall.',
    stake:'The lead-in paywall model works only because the existing AEM login and 302 flow already holds Swissmedic and TPA compliance. Anything that reworks it re-opens a settled question.',
    subs:[
      { id:'acc-login', title:'Login and redirect flow', care:'core', note:'Magic link, redirect auth, bypass. Decides what an anonymous fetch returns.' },
      { id:'acc-consent', title:'Consent and preference', care:'watch', note:'An interstitial in front of a teaser page defeats the teaser.' },
      { id:'acc-session', title:'Session handling', care:'light', note:'Mostly behind the wall. Check it never renders on public pages.' }
    ]},
  { id:'template', title:'Templates and components', care:'core', icon:'▤',
    blurb:'Where a standard either gets built in once or gets re-litigated in 21 markets.',
    stake:'A guideline built into the component is met by every market that uses it. A guideline written in a recommendation is met by the markets that had time to read it.',
    subs:[
      { id:'tpl-content', title:'Content components', care:'core', note:'Cards, tabs, accordions, mandatory-text regions.' },
      { id:'tpl-media', title:'Media and video', care:'watch', note:'Schema, transcripts and lazy loading, or a heavy component that returns nothing.' },
      { id:'tpl-design', title:'Design system and tokens', care:'light', note:'Cosmetic — but it is the machinery that could carry SEO defaults too.' }
    ]},
  { id:'discovery', title:'On-site search and discovery', care:'watch', icon:'⌕',
    blurb:'Search, filters and finders. The classic source of crawl waste and near-duplicate URLs.',
    stake:'Germany already URL-structures off filters, so filtered views are URL-bearing in at least one market. Decide parameter handling before rollout, not after.',
    subs:[
      { id:'dis-search', title:'Advanced search and filtering', care:'watch', note:'Does a filter state get a crawlable URL?' },
      { id:'dis-finder', title:'Finder components', care:'light', note:'Map and locator patterns.' }
    ]},
  { id:'perso', title:'Personalisation and customer data', care:'watch', icon:'◈',
    blurb:'Content that varies per user on the same URL — invisible to a crawler, unstable for an AI answer.',
    stake:'MCP needs to know which AEM pages are articles. That inventory is the one URL structuring already produces. We are the natural source, and right now it is a manual list.',
    subs:[
      { id:'per-mcp', title:'MCP personalisation rollout', care:'watch', note:'Ten markets in Phase 1, with a GCS reporting dependency.' },
      { id:'per-page', title:'Personalised pages and carousels', care:'watch', note:'Needs an explicit indexation decision in the template.' },
      { id:'per-id', title:'Identity and attribution', care:'light', note:'Spike work. Watch for analytics impact.' }
    ]},
  { id:'events', title:'Events and meetings', care:'light', icon:'▦',
    blurb:'Veeva Events and Meetings integration, webinars, speaker profiles.',
    stake:'Event pages are a natural structured-data surface and are often gated by default without anyone deciding to gate them.',
    subs:[
      { id:'ev-veeva', title:'Veeva Events integration', care:'light', note:'Registration, visibility, confirmation emails.' },
      { id:'ev-webinar', title:'Webinar PoC', care:'light', note:'Requirements not firm. Ask for Event schema when they are.' }
    ]},
  { id:'forms', title:'Forms, commerce and contact', care:'light', icon:'✉',
    blurb:'Contact Us, order lists, rep contact, webshop.',
    stake:'Contact Us is a mandatory utility-nav page carrying adverse event reporting. It must stay reachable and crawlable through any fix.',
    subs:[
      { id:'frm-contact', title:'Contact and rep forms', care:'light', note:'Mandatory page; keep it crawlable.' },
      { id:'frm-shop', title:'Webshop integration', care:'light', note:'Blocked on architecture. Watch only.' }
    ]},
  { id:'reporting', title:'Reporting and governance', care:'watch', icon:'◱',
    blurb:'Component usage reporting, template governance, tracking remediation.',
    stake:'Component and feature usage reporting is quietly the most useful item on the board for us: it would tell us which components carry real page volume, so the playbook targets those instead of guessing.',
    subs:[
      { id:'rep-usage', title:'Component and feature usage', care:'watch', note:'Ask for read access when it lands.' },
      { id:'rep-gov', title:'Template and email governance', care:'light', note:'Useful precedent for centralising a standard.' }
    ]},
  { id:'intake', title:'Delivery process and intake', care:'core', icon:'⇥',
    blurb:'How work reaches us at all: the Web Delivery intake form, the Jira packages, the migration tracking list.',
    stake:'When SEO is an option on the intake form rather than a separate conversation, the guideline gets applied by default. This is the same argument as the playbook, made at the ordering layer.',
    subs:[
      { id:'int-form', title:'Intake form and packages', care:'core', note:'Three SEO/GEO selections, live in WESE and Canada.' },
      { id:'int-standard', title:'The written standard', care:'core', note:'Sitemap Governance, and the playbook that attaches specifics to it.' }
    ]}
],

/* Which product item sits where. id -> [categoryId, subId] */
itemCat: {
  'EBPT-4625':['url','url-slug'], 'SITEMAP-GAMMA':['intake','int-standard'],
  'EBPT-3330':['url','url-nav'], 'EUC-19745':['discovery','dis-finder'],
  'EBPT-5585':['url','url-domain'],
  'EBPT-5276':['access','acc-login'], 'EBPT-5368':['access','acc-login'],
  'EBPT-5419':['access','acc-login'], 'EBPT-4769':['access','acc-login'],
  'EBPT-5127':['access','acc-consent'], 'EBPT-4744':['access','acc-consent'],
  'EBPT-5100':['access','acc-consent'], 'EBPT-5149':['access','acc-session'],
  'RAID-8':['template','tpl-content'], 'EBPT-4909':['template','tpl-content'],
  'EBPT-4759':['template','tpl-media'], 'EBPT-4732':['template','tpl-design'],
  'EBPT-4742':['discovery','dis-search'],
  'EBPT-3725':['perso','per-page'], 'EBPT-3092':['perso','per-page'],
  'MCP-FLAG':['perso','per-mcp'],
  'EBPT-4265':['events','ev-webinar'],
  'EBPT-4748':['forms','frm-shop'], 'INC4514462':['forms','frm-contact'],
  'EBPT-2725':['reporting','rep-usage'], 'EBPT-5161':['reporting','rep-gov'],
  'INTAKE-SEO':['intake','int-form'], 'JIRA-PKG':['intake','int-form']
},

/* ---------------------------------------------------------------------
   The page anatomy. A One AZ HCP page, region by region, and what
   touches each one. `zone` positions the hotspot on the wireframe.
   --------------------------------------------------------------------- */
anatomy: [
  { id:'utility', n:1, label:'Utility navigation', care:'light',
    what:'Contact Us (mandatory, carries adverse event reporting), language toggle, log-in / sign-up, My Account.',
    seo:'Contact Us must stay crawlable. The language toggle is the hreflang question in disguise.',
    items:['INC4514462','EBPT-5276'], check:['u7','m4'] },
  { id:'topnav', n:2, label:'Top navigation and megamenu', care:'core',
    what:'Max 7 tabs, three mandatory: Our Medicines, Therapeutic Areas, News. Main nav max 5 columns of 10 links.',
    seo:'The internal linking layer for the whole portal. Links must be real anchors in the served HTML, and navigation-only labels must carry no URLs.',
    items:['EBPT-3330','SITEMAP-GAMMA'], check:['u2','u7','c1'] },
  { id:'breadcrumb', n:3, label:'Breadcrumb', care:'core',
    what:'Only actual content pages are listed. Emitted once, with BreadcrumbList markup.',
    seo:'Estonia currently carries an old breadcrumb schema alongside the new one — two definitions invalidate both.',
    items:['SITEMAP-GAMMA'], check:['u3','s4'] },
  { id:'hero', n:4, label:'H1 and intro — the teaser layer', care:'core',
    what:'One H1. On a lead-in paywall page this is the part that sits ahead of login and is open to search and AI crawlers.',
    seo:'The whole paywall proposition lives in this band. It is also where the 40–60 word answer passage belongs.',
    items:['EBPT-4625'], check:['g1','g3','i2','c3'] },
  { id:'tabs', n:5, label:'In-page tabs', care:'core',
    what:'Max 7 tabs, each dropdown max 7 links. Mandatory product sub-sections: Overview, Clinical Trials, Prescribing Information, Other Indications.',
    seo:'Where content goes to hide. Switzerland proved it both ways — a CVRM page carried its content as tabs in one URL; splitting each tab into a page improved performance.',
    items:['EBPT-4909'], check:['c2','u5'] },
  { id:'body', n:6, label:'Body content', care:'core',
    what:'The chunks an answer engine actually retrieves. Headings, lists, tables, claims and dates.',
    seo:'Chunk-level retrievability, semantic headings, entities written out, sourcing and a real last-reviewed date.',
    items:['RAID-8'], check:['g2','g4','g6','g7','g8'] },
  { id:'media', n:7, label:'Media and video', care:'watch',
    what:'Kaltura playlists and the gallery component, arriving across markets.',
    seo:'VideoObject schema, a transcript field and lazy loading. Cheap now in the component, expensive later per market.',
    items:['EBPT-4759'], check:['s1','p3'] },
  { id:'perso', n:8, label:'Personalisation carousel', care:'watch',
    what:'MCP-driven cards. AEM currently sends every page including Home, Contact us and Thank you, with no exclusion flag.',
    seo:'Content that varies on one URL. Needs a stable default variant for anonymous fetches and an explicit indexation decision.',
    items:['EBPT-3725','EBPT-3092','MCP-FLAG'], check:['i1','c1'] },
  { id:'gate', n:9, label:'The gated boundary', care:'core',
    what:'Swiss Rx Login, redirect auth, magic link, consent capture. Everything below stays as gated as it is today.',
    seo:'Teaser indexable, gated content excluded — verified, not assumed. Any change to the 302 behaviour is a change to the paywall model.',
    items:['EBPT-5276','EBPT-5127','EBPT-5419','EBPT-4744'], check:['i2','c3','k1'] },
  { id:'mandatory', n:10, label:'Mandatory local text', care:'core',
    what:'Pflichttext, job codes, prescribing information links, adverse event statements.',
    seo:'A template with no authorable region for this cannot ship in Germany. Product has already logged it as a component reusability risk.',
    items:['RAID-8'], check:['k2','k3'] },
  { id:'head', n:11, label:'The invisible layer', care:'core',
    what:'Title, description, canonical, hreflang, robots directives, structured data, XML sitemap entry.',
    seo:'Generated by the template once, overridable per page and per locale — Switzerland puts metadata through MLR, so a locked pattern cannot ship there.',
    items:['EBPT-4625','SITEMAP-GAMMA'], check:['m1','m2','i1','i5','s1','s2','u5'] }
],

/* ---------------------------------------------------------------------
   Paywall programme
   --------------------------------------------------------------------- */
paywall: {
  model:'Lead-in paywall: H1 and intro sit ahead of login, open to search engines and AI crawlers. Everything behind the login stays exactly as gated as it is today. The existing AEM login and 302 flow already supports it — nothing new to build.',
  stages:[
    { n:1, title:'Page audit', what:'Every page scored on five criteria. The scores produce the batches.' },
    { n:2, title:'Batching', what:'Three batch types — prove the pattern, commercial priority, complex or contested. The market chooses which runs first.' },
    { n:3, title:'Build', what:'Teaser layer on the existing AEM login and 302 flow, which already holds Swissmedic and TPA compliance for HCP access.' },
    { n:4, title:'Controls and measurement', what:'noarchive, nosnippet and schema applied consistently as volume grows, with drift caught when content changes.' },
    { n:5, title:'Governance', what:'Biweekly 30-minute review: batch status, compliance watch, content progress, escalations.' }
  ],
  criteria:['Regulatory exposure','Current performance','Content readiness','Search opportunity','Build effort'],
  batchTypes:[
    { k:'Prove the pattern', v:'Low regulatory exposure, clear search opportunity. Runs first to establish the model.' },
    { k:'Commercial priority', v:'What the market wants visible, sequenced once the pattern holds.' },
    { k:'Complex or contested', v:'High regulatory exposure or unclear content ownership. Runs last, with compliance in the room.' }
  ],
  markets:[
    { code:'CH', state:'live-pilot', label:'Live pilot',
      note:'Trixeo German and French lead-in pages live, built with PIO, compliance reviewed. Pace 5–8 pages per three-week cycle, confirmed by batch 1. Next product scope confirmed at the Compliance and SLT meeting, w/c 8 September.',
      owner:'Sandy Wang (Digital Lead) · Ana Pires (SEO Strategy)' },
    { code:'CA', state:'precedent', label:'Proven precedent',
      note:'Hard paywall live on myastrazeneca.ca across 25 brand pages, PAAB approved, HCP login unchanged. Organic clicks 7 → 280 (39x), impressions 1,294 → 75,456 (58x), ranking keywords 3 → 133 (44x). The evidence the Swiss case rests on.',
      owner:'—' },
    { code:'PT', state:'candidate', label:'Candidate',
      note:'Already runs a mostly gated estate — 14 gated pages to 1 public at the last metadata pass. The gap between gated content and indexable content is widest here. Blocked first on naming an implementation owner.',
      owner:'unassigned' },
    { code:'DE', state:'candidate', label:'Candidate',
      note:'Largest page volume in the region and the migration lands in October. A teaser layer applied at migration is cheaper than one retrofitted after. Pflichttext must have a home in the teaser template.',
      owner:'Alena Krivonos (PM)' },
    { code:'AT', state:'candidate', label:'Candidate',
      note:'Small, guideline-compliant estate built to One AZ conventions from the start — the cheapest place to test whether the pattern travels to a build-time market.',
      owner:'Sonia Vives (CDM)' },
    { code:'BE', state:'watch', state2:true, label:'Watch',
      note:'Two language tracks and no One AZ guideline programme. Would double the teaser authoring effort. Not a first mover.',
      owner:'Alexia Bonnet' }
  ],
  phase2:'Regulatory alignment. Input still being gathered from Sandy and Stefanie on the Swiss regulatory alignment discussions; the intent is to fold the regulatory reading and strategy PIO led into a defined phase 2. Open until that input lands — phase 1 does not depend on it.',
  scopeNote:'The current programme covers Switzerland. Extending the package to further markets is the next question, not a decision already taken. The candidate rows above are a liaison view, not an agreed pipeline.'
},

/* ---------------------------------------------------------------------
   Task bars for the Gantt views. status: done | active | todo | blocked
   --------------------------------------------------------------------- */
projectTasks: {
  'p-paywall-ch': [
    { name:'Kickoff — RACI and roles confirmed', start:'2026-08-03', end:'2026-08-08', owner:'All', status:'done', lane:'Governance' },
    { name:'Batch 1 — Trixeo DE and FR lead-in pages live', start:'2026-08-08', end:'2026-08-28', owner:'SEO Technical / Shubh', status:'done', lane:'Batch 1' },
    { name:'Compliance and SLT meeting — results and scale-up plan', start:'2026-09-08', end:'2026-09-12', owner:'Sandy (market)', status:'active', lane:'Governance' },
    { name:'Page audit and batching for the confirmed product', start:'2026-09-15', end:'2026-09-19', owner:'Ana / SEO Technical', status:'todo', lane:'Batch 2' },
    { name:'Template feasibility check', start:'2026-09-15', end:'2026-09-19', owner:'SEO Technical', status:'todo', lane:'Batch 2' },
    { name:'Keyword and content briefs issued', start:'2026-09-22', end:'2026-09-26', owner:'Ana', status:'todo', lane:'Batch 2' },
    { name:'Teaser copy produced and approved', start:'2026-09-26', end:'2026-10-03', owner:'Sandy / Ana', status:'todo', lane:'Batch 2' },
    { name:'MLR review of meta title and description', start:'2026-09-28', end:'2026-10-05', owner:'Sandy', status:'todo', lane:'Batch 2' },
    { name:'Build, indexing controls, access path', start:'2026-09-29', end:'2026-10-10', owner:'SEO Technical / Shubh', status:'todo', lane:'Batch 2' },
    { name:'QA, sign-off, batch live', start:'2026-10-08', end:'2026-10-10', owner:'SEO Technical / Shubh / Sandy', status:'todo', lane:'Batch 2' },
    { name:'Measurement window — 30-day report', start:'2026-10-10', end:'2026-11-10', owner:'Ana', status:'todo', lane:'Measurement' },
    { name:'Review data, confirm next batch timing', start:'2026-11-17', end:'2026-11-27', owner:'Ana, with Marisa', status:'todo', lane:'Measurement' },
    { name:'Phase 2 regulatory alignment — input pending', start:'2026-09-01', end:'2026-10-31', owner:'Sandy / Stefanie', status:'blocked', lane:'Phase 2' }
  ],
  'p-de-migration': [
    { name:'Package 1 — URL structuring across 13 brands', start:'2026-03-01', end:'2026-07-31', owner:'Sathik / Ana', status:'done', lane:'Package 1' },
    { name:'BAU sync queue — 35 tickets to July', start:'2026-06-01', end:'2026-07-31', owner:'Sathik', status:'done', lane:'BAU' },
    { name:'BAU sync queue — 79 further tickets', start:'2026-08-01', end:'2026-08-31', owner:'Sathik', status:'done', lane:'BAU' },
    { name:'Package 2 — metadata and technical SEO', start:'2026-09-01', end:'2026-10-15', owner:'Sathik', status:'active', lane:'Package 2' },
    { name:'Staging access and labelled sitemaps confirmed', start:'2026-09-01', end:'2026-09-30', owner:'Alena Krivonos', status:'active', lane:'Inputs' },
    { name:'Package 3 — pre-launch audit', start:'2026-10-05', end:'2026-10-25', owner:'Aswine Sami', status:'todo', lane:'Package 3' },
    { name:'Migration go-live', start:'2026-10-26', end:'2026-10-31', owner:'Alena Krivonos', status:'todo', lane:'Go-live' },
    { name:'Package 4 — post-launch audit', start:'2026-11-09', end:'2026-11-20', owner:'Aswine Sami', status:'todo', lane:'Package 4' }
  ],
  'p-baltics': [
    { name:'Lithuania — 33 HCP pages to guidelines', start:'2025-12-01', end:'2026-04-30', owner:'Priya', status:'done', lane:'Lithuania' },
    { name:'Lithuania — schema and post-launch audits', start:'2026-05-01', end:'2026-06-30', owner:'Priya', status:'done', lane:'Lithuania' },
    { name:'Estonia and Latvia — KWR, on-page, metadata', start:'2026-04-01', end:'2026-05-31', owner:'Priya', status:'done', lane:'EE / LV' },
    { name:'Estonia — pre-launch audit and schema', start:'2026-07-01', end:'2026-08-31', owner:'Priya', status:'done', lane:'EE / LV' },
    { name:'Tech files after URL shortening — LT, LV, EE', start:'2026-08-01', end:'2026-08-31', owner:'Priya', status:'done', lane:'EE / LV' },
    { name:'Estonia — remove old breadcrumb schema', start:'2026-09-01', end:'2026-09-30', owner:'Justina Gokaite', status:'active', lane:'EE / LV' },
    { name:'Austria — metadata programme', start:'2026-05-01', end:'2026-08-31', owner:'Priya', status:'done', lane:'Austria' },
    { name:'Austria — KWR and content strategy, indication pages', start:'2026-09-01', end:'2026-10-31', owner:'Priya', status:'todo', lane:'Austria' }
  ],
  'p-es-geo': [
    { name:'Metadata sets 41–47', start:'2026-03-01', end:'2026-08-31', owner:'Marshall Raj', status:'done', lane:'Metadata line' },
    { name:'GEO — LLM recommendations and prompt analysis', start:'2026-03-01', end:'2026-06-30', owner:'Marshall Raj', status:'done', lane:'GEO' },
    { name:'SEMrush project — keywords, prompts, competitors', start:'2026-07-01', end:'2026-07-31', owner:'Marshall Raj', status:'done', lane:'GEO' },
    { name:'Top 24 priority pages — KWR, prompts, on-page', start:'2026-08-01', end:'2026-08-31', owner:'Marshall Raj', status:'done', lane:'Pre-migration' },
    { name:'Top 40 priority pages — KWR, prompts, on-page', start:'2026-09-01', end:'2026-09-30', owner:'Marshall Raj', status:'active', lane:'Pre-migration' },
    { name:'Schema file — Pediatric Flu pages', start:'2026-07-01', end:'2026-09-30', owner:'Marshall Raj', status:'active', lane:'Metadata line' },
    { name:'Migration final delivery', start:'2026-09-08', end:'2026-09-18', owner:'Ana Pires', status:'active', lane:'Migration' },
    { name:'One AZ URL structuring — not started', start:'2026-10-01', end:'2026-12-31', owner:'unassigned', status:'blocked', lane:'Migration' }
  ],
  'p-balkans': [
    { name:'Audit the four sites, find the indexing cause', start:'2026-05-01', end:'2026-05-31', owner:'Priya', status:'done', lane:'Recovery' },
    { name:'Tech files — XML sitemap and robots', start:'2026-05-15', end:'2026-06-30', owner:'Priya', status:'done', lane:'Recovery' },
    { name:'Re-enable SEO, push index requests', start:'2026-06-01', end:'2026-06-30', owner:'Priya', status:'done', lane:'Recovery' },
    { name:'Four-market roadmap definition', start:'2026-08-01', end:'2026-09-30', owner:'Ana Pires', status:'active', lane:'Roadmap' },
    { name:'MCP Phase 1 — AEM authoring and daily jobs', start:'2026-07-20', end:'2026-10-09', owner:'GCS / AEM / AML', status:'active', lane:'MCP' },
    { name:'Post-release indexation check', start:'2026-10-09', end:'2026-10-23', owner:'Priya', status:'todo', lane:'MCP' }
  ],
  'p-service-integration': [
    { name:'SEO/GEO selections added to the intake form', start:'2026-06-01', end:'2026-08-20', owner:'Patricia Marques', status:'done', lane:'Intake' },
    { name:'Jira package changes live', start:'2026-07-01', end:'2026-08-20', owner:'Patricia Marques', status:'done', lane:'Packages' },
    { name:'Pilot running — WESE and Canada', start:'2026-08-20', end:'2026-10-31', owner:'Patricia Marques', status:'active', lane:'Intake' },
    { name:'Confirm timeline for widening scope', start:'2026-09-01', end:'2026-09-15', owner:'Owais → Patricia', status:'active', lane:'Intake' }
  ],
  'p-playbook': [
    { name:'Collect the standards already proved in market', start:'2026-08-01', end:'2026-09-15', owner:'Owais / GCS SEO', status:'active', lane:'Draft' },
    { name:'AI crawler position — get a product decision', start:'2026-09-01', end:'2026-09-17', owner:'Owais → Adrian', status:'active', lane:'Open questions' },
    { name:'Metadata override requirement written in', start:'2026-09-01', end:'2026-09-30', owner:'Owais', status:'todo', lane:'Draft' },
    { name:'First version to the product team', start:'2026-09-20', end:'2026-09-30', owner:'GCS SEO', status:'todo', lane:'Draft' },
    { name:'Backlog route confirmed', start:'2026-09-01', end:'2026-09-30', owner:'Owais + Adrian', status:'todo', lane:'Open questions' }
  ],
  'p-fr-releases': [
    { name:'Release 1 — breast cancer, 45 pages', start:'2025-12-01', end:'2026-05-31', owner:'Priya', status:'done', lane:'R1' },
    { name:'Release 2 — prostate and lung, 40 pages', start:'2025-12-01', end:'2026-08-31', owner:'Priya', status:'done', lane:'R2' },
    { name:'Release 3 — LLC, URL structuring and mapping', start:'2026-08-01', end:'2026-08-31', owner:'Priya', status:'done', lane:'R3' },
    { name:'Release 3 — redirect implementation by market', start:'2026-09-01', end:'2026-10-31', owner:'Aude Meslati (PM)', status:'blocked', lane:'R3' }
  ]
},

/* Seed calendar. Everything else you add yourself. */
events: [
  { id:'ev-1', date:'2026-09-03', time:'', type:'meeting', who:['sh-adrian'], title:'Bi-weekly touch-base — Adrian',
    notes:'Standing product liaison slot.', next:['Put the AI crawler decision on the agenda as a decision item, not a discussion item','Ask for the release roadmap view'], done:false },
  { id:'ev-2', date:'2026-09-04', time:'', type:'connect', who:['sh-ana','sh-sushanta','sh-aswine'], title:'Weekly SEO team sync',
    notes:'Ana, Sushanta, Aswine.', next:['Capacity plan against the Q3 release window'], done:false },
  { id:'ev-3', date:'2026-09-08', time:'', type:'deadline', who:['sh-sandy'], title:'Switzerland Compliance and SLT meeting',
    notes:'Trixeo results reported, scale-up plan for the next product presented. Everything after this date moves with it.', next:['Get the confirmed product scope the same week so page audit can start 15 Sep'], done:false },
  { id:'ev-4', date:'2026-09-15', time:'', type:'email', who:['sh-patricia'], title:'Chase: timeline for widening SEO intake beyond WESE and Canada',
    notes:'', next:[], done:false },
  { id:'ev-5', date:'2026-09-17', time:'', type:'meeting', who:['sh-adrian'], title:'Bi-weekly touch-base — Adrian',
    notes:'', next:[], done:false }
]
};
