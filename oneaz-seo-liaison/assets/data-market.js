/* MARKET SIDE: blockers (market limitations) and projects.

   Blocker fields mirror the EUCAN SEO Blocker Review workbook so the two stay interchangeable:
   topic, description, markets, rootCause, implImpact, seoImpact, evidence, priority,
   direction, owner, supporting, nextStep, targetDate, status, escalate, source.

   Plus the two fields this desk needs and the workbook does not have:
     toldMarkets  — date you briefed the markets (blank = not yet)
     toldProduct  — date you raised it with the product team (blank = not yet)

   verified:false marks a starting hypothesis to confirm or delete, not an observed fact. */

window.DATA_MARKET = {

blockers: [
  { id:'b-ch-liveurl', topic:'Migration / redirects', title:'Re-pointing live Swiss URLs is the standing blocker',
    markets:['CH'], priority:'Critical', status:'Resolution route to confirm', verified:true, tags:['url','nav'],
    description:'URL structure was delivered to One AZ guidance, but the pages are already live and high in volume. The correction is long pending.',
    rootCause:'Assembler effort to re-point live URLs; URL ownership sits with the CDM per the governance doc.',
    implImpact:'One AZ-compliant URLs cannot be applied to the existing estate on the current plan.',
    seoImpact:'The market stays on non-standard URLs; every later recommendation is written against a structure that is meant to change.',
    evidence:'Switzerland URL structure recommendations, Batch 1 and Batch 2; CVRM / R&I / Oncology URL structure review Apr 26.',
    direction:'Confirm sequencing with the CDM and agree whether the correction runs as its own batch or rides the next migration phase.',
    owner:'Sonia Vives (CDM)', supporting:'Ana Pires; Web Delivery; SEO Technical',
    nextStep:'Get a date from the planning pipeline, or agree the correction is deferred and say so explicitly.',
    targetDate:'2026-09-30', escalate:'To assess', source:'Deck A14; EUCAN tracker',
    toldMarkets:'2026-08-15', toldProduct:'' },

  { id:'b-pt-owner', topic:'Governance / workflow', title:'Portugal has no named owner for implementation after hand-off',
    markets:['PT'], priority:'Critical', status:'To review', verified:true, tags:['url','metadata'],
    description:'The post-launch audit found redirects and metadata were not implemented. Recommendations were delivered and then left unverified — the audit had nothing to check.',
    rootCause:'No named implementation owner, so the hand-off has nowhere to land. Tech SEO phase noted as waiting on responses.',
    implImpact:'Delivered work does not reach production; the audit stage produces no signal.',
    seoImpact:'Migration benefits from Saudeflix.pt are not realised; redirect equity and metadata gains are lost.',
    evidence:'Migration sheet Phase 3: "redirects & metadata not implemented"; Phase 2 tech SEO: waiting on responses.',
    direction:'Name an accountable implementer per market and make the audit report addressed to that person.',
    owner:'unassigned', supporting:'Sonia Vives (CDM); Catarina Cunha; Rita Nascimento',
    nextStep:'Ask the product team to confirm who owns One AZ guideline adherence per market — this is one of the four partnership asks.',
    targetDate:'2026-09-30', escalate:'Yes', source:'Deck A11 / A5; EUCAN tracker Migration sheet',
    toldMarkets:'', toldProduct:'' },

  { id:'b-ceeba-index', topic:'Indexation & crawlability', title:'Indexation controls in the Balkans have already failed in production',
    markets:['RS','HR','SI','BG'], priority:'High', status:'Monitoring', verified:true, tags:['indexation'],
    description:'The Balkans sites lost indexing. Audited, tech files corrected, indexing re-requested, traffic re-gained.',
    rootCause:'robots / tech file configuration with no monitoring to catch it.',
    implImpact:'Fixed, but nothing prevents a repeat when a release changes tech files.',
    seoImpact:'Total loss of organic visibility while it lasted.',
    evidence:'Balkans audit May 26; tech files (XML sitemap and robots) Jun 26; Serbia traffic recovery in GSC.',
    direction:'Any product feature that writes robots.txt or meta robots gets reviewed before release in this cluster, and verified after.',
    owner:'Priya (delivery)', supporting:'Marko Pejnovic; SEO Technical',
    nextStep:'Add a post-release indexation check to the Balkans MCP Phase 1 rollout.',
    targetDate:'', escalate:'No', source:'Deck 3 / A5; EUCAN tracker Status-CEEBA',
    toldMarkets:'2026-06-30', toldProduct:'' },

  { id:'b-de-pflicht', topic:'Compliance / regulatory', title:'Pflichttext is a mandatory page element Germany cannot ship without',
    markets:['DE','AT'], priority:'High', status:'Resolution route to confirm', verified:true, tags:['template','content','compliance'],
    description:'German pages carry Pflichttext as a delivered work item alongside URL structuring and metadata. The product RAID log already records that this limits component reusability.',
    rootCause:'Market-specific regulatory requirement meeting a global component model.',
    implImpact:'A One AZ card component with no configurable mandatory-text region cannot be used in Germany as-is.',
    seoImpact:'Local forks of a global component mean the SEO characteristics of that component stop being standard.',
    evidence:'Germany Pflichttext URL structuring and metadata, 10 pages, Apr 26; PI RAID log 3 of 3, item 8, owner GCIT.',
    direction:'Back the configurable global solution already proposed on the RAID log rather than per-market forks.',
    owner:'GCIT (per RAID log)', supporting:'Alena Krivonos; Ana Pires',
    nextStep:'Offer the German Pflichttext page set as the test case for the configurable component.',
    targetDate:'', escalate:'No', source:'PI RAID log; EUCAN tracker Status-Central',
    toldMarkets:'', toldProduct:'' },

  { id:'b-ch-mlr', topic:'Compliance / regulatory', title:'Swiss metadata is reviewed copy, not a free-text field',
    markets:['CH'], priority:'High', status:'Evidence being consolidated', verified:true, tags:['metadata','compliance','translation'],
    description:'MLR review of meta title and description is its own accountable task on the paywall RACI, owned by the market Digital Lead. Translations are a separate confirmation step, across DE, FR and IT.',
    rootCause:'Local regulatory process plus three content languages.',
    implImpact:'Every metadata change carries a review cycle and a translation cycle before it can go live.',
    seoImpact:'Turnaround is long; auto-generated metadata patterns are unusable unless they can be overridden and reviewed per page.',
    evidence:'Paywall RACI tasks 4, 5 and 6; Saphnelo and Tezspire metadata delivered in DE, FR and IT.',
    direction:'Any product-generated metadata must be overridable per page and per locale, with a review state.',
    owner:'Sandy Wang', supporting:'Franziska Püschel (brand lead, metadata AoR); Ana Pires',
    nextStep:'Raise the override requirement with product before any metadata automation ships.',
    targetDate:'', escalate:'No', source:'Deck A16; EUCAN tracker Status-WESE',
    toldMarkets:'2026-08-08', toldProduct:'' },

  { id:'b-es-seq', topic:'Migration / redirects', title:'Spain has not started One AZ URL structuring',
    markets:['ES'], priority:'High', status:'To review', verified:true, tags:['url','nav'],
    description:'On-page and GEO optimisation is running on the top priority pages first — 24 pages delivered in August, 40 more in progress — with migration to follow.',
    rootCause:'Deliberate sequencing decision: content quality before structural migration.',
    implImpact:'Any product change that assumes the One AZ URL convention is in place does not match azone.es today.',
    seoImpact:'The highest-volume metadata market in the region is the furthest from the URL standard.',
    evidence:'Status-Central: KWR, prompt analysis and on-page recommendations for top priority pages, Aug–Sep 26.',
    direction:'Sequence URL-dependent product features behind the Spanish migration, or provide a pre-migration fallback.',
    owner:'Belen Villaescusa', supporting:'Ana Pires; Marshall Raj',
    nextStep:'Get a target migration window from the market and hold product items against it.',
    targetDate:'', escalate:'No', source:'Deck A10; EUCAN tracker Status-Central',
    toldMarkets:'', toldProduct:'' },

  { id:'b-inputs', topic:'Governance / workflow', title:'Staging access and labelled sitemaps are the inputs we chase every time',
    markets:['ALL'], priority:'High', status:'Resolution route to confirm', verified:true, tags:['intake'],
    description:'Packages 2 and 3 both depend on staging access and staging URLs before the go-live date is fixed. On Imfinzi the exported page list gave no clear read on which entries were content pages; Forxiga came back with a labelled sitemap that was workable directly.',
    rootCause:'The One AZ Migration Tracking list does not require a labelled sitemap, and inputs are chased after the request rather than dated at it.',
    implImpact:'URL structuring cannot start confidently; delivery dates slip against a fixed go-live.',
    seoImpact:'Recommendations arrive late enough that dev has already built, which is the expensive order.',
    evidence:'Migration sheet inputs columns; deck A14 refinement note; Germany BAU sync queue.',
    direction:'Make "labelled sitemap: which pages are content" a required field on the tracking list, and date inputs at the point of request.',
    owner:'Owais', supporting:'Alena Krivonos; market PMs',
    nextStep:'Put the required-field change to the product team as a one-line ask — it is the cheapest item on the list.',
    targetDate:'2026-09-15', escalate:'No', source:'Deck A11 / A14',
    toldMarkets:'', toldProduct:'' },

  { id:'b-ai-crawlers', topic:'Indexation & crawlability', title:'No One AZ position on AI crawler access',
    markets:['ALL'], priority:'High', status:'To review', verified:false, tags:['indexation','content'],
    description:'GEO work is in production — LLM recommendations and prompt analysis in Spain, prompts in Austria and Portugal — but there is no recorded product-level decision on which AI user agents are allowed in robots.txt across One AZ properties.',
    rootCause:'The question has never been owned at product level, so it defaults to whatever each market’s robots.txt happens to say.',
    implImpact:'Markets will answer it inconsistently, and some already have.',
    seoImpact:'GEO recommendations are being written without knowing whether AI crawlers are permitted to fetch the pages at all.',
    evidence:'Spain LLM recommendations Mar 26; prompt analysis Jun–Aug 26; SEMrush prompt tracking in three markets.',
    direction:'One recorded decision covering GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Bingbot and CCBot, written into the playbook and the template.',
    owner:'Owais → Adrian', supporting:'Ana Pires; Sushanta Baidya Roy',
    nextStep:'Put it on the next touch-base agenda as a decision item, not a discussion item.',
    targetDate:'2026-09-17', escalate:'To assess', source:'Liaison view — needs product confirmation',
    toldMarkets:'', toldProduct:'' },

  { id:'b-mcp-flag', topic:'Governance / workflow', title:'GCS must manually tell MCP when AEM pages are added or deleted',
    markets:['RS','HR','PL','LT','RO','SK','HU','UK','BE','CH'], priority:'High', status:'Planned', verified:true,
    tags:['personalisation','content','intake'],
    description:'AEM sends every page to MCP including Home, Contact us, Thank you and Overview. There is no flag to exclude non-article pages, so GCS supplies and maintains the list manually. Two open risks on the product RAID log are owned by GCS: reporting page additions and page deletions.',
    rootCause:'Missing article / non-article flag in the AEM to MCP handoff; capability planned for this PI.',
    implImpact:'Non-relevant pages appear in personalisation carousels; deleted pages persist as assets.',
    seoImpact:'Indirect, but the page inventory MCP needs is the same inventory URL structuring already produces — we are the natural source.',
    evidence:'PI RAID log 2 of 3, items 1–4; MCP dependency tracker across ten markets.',
    direction:'Support building the flag this PI, and offer the page inventories held from URL structuring work as the interim list.',
    owner:'Gareth & Ash (product) / GCS', supporting:'AEM; Martech; market digital leads',
    nextStep:'Name the GCS person who owns the weekly check, per market.',
    targetDate:'', escalate:'To assess', source:'PI RAID log 2 of 3',
    toldMarkets:'', toldProduct:'' },

  { id:'b-ee-breadcrumb', topic:'Structured data', title:'Estonia: old breadcrumb schema still to be removed',
    markets:['EE'], priority:'Medium', status:'In progress', verified:true, tags:['schema'],
    description:'Schema recommendations for public and HPP pages delivered Aug 26 with a note that the old breadcrumb schema is to be removed.',
    rootCause:'Legacy markup left in place alongside the new recommendation.',
    implImpact:'Two competing breadcrumb definitions on the same pages.',
    seoImpact:'Conflicting structured data can invalidate the breadcrumb entirely.',
    evidence:'Status-CEEBA, Estonia, Aug 26.',
    direction:'Confirm removal at the next validation pass.',
    owner:'Justina Gokaite', supporting:'Priya',
    nextStep:'Add to the Baltics validation checklist.',
    targetDate:'2026-09-30', escalate:'No', source:'EUCAN tracker Status-CEEBA',
    toldMarkets:'2026-08-31', toldProduct:'' },

  { id:'b-ceeba-capacity', topic:'Capacity / ownership', title:'CEEBA markets have indexing baseline only and little capacity to implement',
    markets:['PL','CZ','SK','HU','RO'], priority:'Medium', status:'To review', verified:true, tags:['intake','analytics'],
    description:'Seven markets sit on an indexing baseline from the One AZ Google Indexing Report with no active guideline track, while simultaneously being in MCP Personalization Phase 1.',
    rootCause:'No local SEO capacity and no measurement to detect a regression.',
    implImpact:'A product change cannot rely on local implementation in these markets.',
    seoImpact:'Regressions would go unnoticed — this is the cluster where an indexing loss already happened once.',
    evidence:'Status-CEEBA: single indexing report per market, Feb 26; MCP dependency tracker.',
    direction:'These markets must inherit from the template rather than implement locally.',
    owner:'Ana Pires', supporting:'Monika Ostrowska',
    nextStep:'Baseline measurement before MCP Phase 1 changes land.',
    targetDate:'', escalate:'No', source:'Deck A5; EUCAN tracker; PI dependency tracker',
    toldMarkets:'', toldProduct:'' },

  { id:'b-be-noteam', topic:'Governance / workflow', title:'Belgium runs two language tracks with no One AZ guideline track',
    markets:['BE'], priority:'Medium', status:'To review', verified:true, tags:['translation','intake'],
    description:'Every Belgian deliverable ships in Dutch and French. The One AZ guideline column is empty; work is on-page, metadata and schema BAU.',
    rootCause:'Belgium has not been scoped into the One AZ rollout plan.',
    implImpact:'Double the authoring effort for any product change, with no guideline programme to absorb it.',
    seoImpact:'A market with real delivery volume is outside the standard.',
    evidence:'Status-WESE Belgium: on-page, metadata and schema consistently delivered in NL and FR.',
    direction:'Confirm whether Belgium is in the One AZ rollout plan and when.',
    owner:'Ana Pires', supporting:'Alexia Bonnet; Jihane Nejjari; Harry Osei',
    nextStep:'Ask the product team directly at the next touch-base.',
    targetDate:'', escalate:'No', source:'Deck 3 / A5; EUCAN tracker',
    toldMarkets:'', toldProduct:'' },

  { id:'b-nordics-scope', topic:'Governance / workflow', title:'Nordics de-scoped SEO until go-live',
    markets:['SE','NO'], priority:'Low', status:'Closed', verified:true, tags:['intake'],
    description:'SEO is de-scoped in the Nordics until go-live, which removes the pre-build window where guidelines are cheapest to apply. Norway has since had a URL structure audit against One AZ guidance and the Sitemap Governance doc.',
    rootCause:'Regional scoping decision.',
    implImpact:'Guidelines arrive after build, by design.',
    seoImpact:'Retrofit cost rather than build cost — the exact comparison Austria and the Baltics were used to make.',
    evidence:'Deck A3 scope note; Status-Nordics: Norway URL structure audit Aug 26.',
    direction:'Accepted. Track only so the retrofit cost is visible when the Nordics do go live.',
    owner:'—', supporting:'Jana Desiato Lasandova; Maria Pedersen',
    nextStep:'None. Revisit at Nordics go-live.',
    targetDate:'', escalate:'No', source:'Deck A3',
    toldMarkets:'', toldProduct:'' },

  { id:'b-consent', topic:'Page experience / performance', title:'Consent layer behaviour on indexable pages is unconfirmed',
    markets:['ALL'], priority:'Medium', status:'To review', verified:false, tags:['gated','indexation','performance'],
    description:'STARTING HYPOTHESIS — confirm or delete. If a consent layer blocks rendering for crawlers on public or teaser pages, indexable content is invisible however well it is written. Sharpened by the Swiss consent-capture item now in the product backlog.',
    rootCause:'Unknown — never tested per market.',
    implImpact:'Unknown until tested.',
    seoImpact:'Would silently undermine every lead-in paywall page and every public page.',
    evidence:'None yet. EBPT-5127 makes this worth testing in Switzerland first.',
    direction:'Fetch-and-render test on one public and one teaser URL per market with a paywall or gated estate.',
    owner:'SEO Technical', supporting:'Aswine Sami',
    nextStep:'Run the test in Switzerland alongside the next paywall batch QA.',
    targetDate:'2026-10-10', escalate:'No', source:'Liaison view — unverified',
    toldMarkets:'', toldProduct:'' },

  { id:'b-devcap', topic:'Capacity / ownership', title:'Local implementation capacity is not known at brief time',
    markets:['ALL'], priority:'Medium', status:'To review', verified:false, tags:['template','url'],
    description:'STARTING HYPOTHESIS — confirm or delete. Markets differ in whether they have any local dev or assembler capacity to implement a recommendation, which is the difference between a recommendation landing and stalling. Portugal and Switzerland are both stalled for reasons that look like capacity.',
    rootCause:'Never captured systematically.',
    implImpact:'We brief identically into markets with very different ability to act.',
    seoImpact:'Delivery volume stops predicting implemented volume.',
    evidence:'Portugal post-launch audit; Switzerland assembler effort on live URLs.',
    direction:'Capture implementation capacity per market once, then reuse it in every feasibility read.',
    owner:'Owais', supporting:'Ana Pires; market CDMs',
    nextStep:'Add three fields to the market view: has local dev, has assembler access, typical turnaround.',
    targetDate:'', escalate:'No', source:'Liaison view — unverified',
    toldMarkets:'', toldProduct:'' }
],

projects: [
  { id:'p-paywall-ch', name:'Lead-in paywall pilot', market:'CH', kind:'Strategic initiative',
    status:'active', rag:'amber',
    phase:'Batch 1 live. Scope for the next product confirmed at the market Compliance and SLT meeting, w/c 8 September.',
    summary:'A five-stage service: page audit scoring every page on regulatory exposure, current performance, content readiness, search opportunity and build effort; batching into prove-the-pattern, commercial priority and complex or contested; build on the existing AEM login and 302 flow which already holds Swissmedic and TPA compliance; noarchive, nosnippet and schema applied consistently as volume grows; and a biweekly 30-minute governance review. Trixeo German and French lead-in pages are live, built with PIO, compliance reviewed. Pace: 5–8 pages per three-week cycle, confirmed by batch 1.',
    evidence:'Canada precedent on myastrazeneca.ca: 25 brand pages indexed compliantly, PAAB approved, HCP login unchanged — organic clicks 7 → 280 (39x), impressions 1,294 → 75,456 (58x), ranking keywords 3 → 133 (44x).',
    watch:[
      'Phase 2 regulatory alignment is open pending input from Sandy and Stefanie — phase 1 does not depend on it',
      'Extending the package beyond Switzerland is the next question, not a decision already taken',
      'Dates shift together: if the September compliance meeting moves, everything after it moves by the same number of days',
      'EBPT-5276 reworks the magic-link redirect and EBPT-5127 adds a Swiss consent capture page — both touch the access path this model rests on'
    ],
    milestones:[
      { date:'2026-08-08', what:'Kickoff: RACI and roles confirmed, readiness set ahead of the market September meeting', owner:'All', done:true },
      { date:'2026-09-08', what:'Compliance and SLT meeting: Trixeo results reported, scale-up plan for the next product presented', owner:'Sandy (market)', done:false },
      { date:'2026-09-15', what:'Page audit and batching for the confirmed product; template feasibility check', owner:'Ana / SEO Technical', done:false },
      { date:'2026-09-22', what:'Keyword and content briefs issued', owner:'Ana, SEO Technical consulted', done:false },
      { date:'2026-09-26', what:'Teaser copy produced and approved', owner:'Sandy / Ana', done:false },
      { date:'2026-09-29', what:'Build, indexing controls, access path', owner:'SEO Technical / Shubh', done:false },
      { date:'2026-10-10', what:'QA, sign-off, batch live', owner:'SEO Technical / Shubh / Sandy', done:false },
      { date:'2026-10-10', what:'Measurement window begins', owner:'Ana', done:false },
      { date:'2026-11-24', what:'Review data, confirm next batch timing', owner:'Ana, with Marisa', done:false }
    ],
    raciCols:['SANDY · Digital Lead','ANA · SEO Strategy','SEO Technical','SHUBH · Web / AEM'],
    raci:[
      ['1. Compliance decision (lead-in vs hard paywall)','R,A','C','—','—'],
      ['2. Propose webpages to apply paywall','C','R,A','—','—'],
      ['3. Content and keyword production','—','R,A','C','—'],
      ['4. Generate meta title and description','—','R,A','C','—'],
      ['5. MLR review of meta title and description','R,A','I','—','—'],
      ['6. Confirm translations','R,A','I','—','—'],
      ['7. Generate schema code','—','C','R,A','I'],
      ['8. AEM implementation','—','I','C','R,A'],
      ['9. Code review and governance','—','I','C','R,A'],
      ['10. Implementation of URL to sitemap','—','—','—','R,A'],
      ['11. Validate meta title and description','A','C','R','—'],
      ['12. Validate breadcrumb implementation','A','C','R','—'],
      ['13. Confirm URL added to sitemap','A','C','R','—'],
      ['14. Sanity check: 404 errors','A','C','R','—'],
      ['15. Post-launch monitoring and 30-day report','A','C','R','—']
    ] },

  { id:'p-de-migration', name:'One AZ migration and URL standards at scale', market:'DE', kind:'Migration',
    status:'active', rag:'green',
    phase:'In-build phase. Migration planned for October. Packages 1–4 in flight; BAU sync queue standing.',
    summary:'The largest single body of work in EUCAN. One AZ URL convention applied across 13 brands — Imfinzi, Enhertu, Tezspire, Calquence, Lokelma, Lynparza, Truqap, Saphnelo, Trixeo, Wainzua, Fasenra, Fluenz and Forxiga. Largest batches: Imfinzi 116 pages, Tezspire 106, AZMedical 104, Calquence 84, Fasenra 78. Metadata and a pre-launch audit run alongside each batch. Metadata phases 2 and 3 de-scoped.',
    evidence:'43 logged deliverables. 35 BAU sync tickets cleared to July 2026, then 59 more in August. SEO research on Nebenwirkungen vs Verträglichkeit or Sicherheit fed a naming decision straight back into page structure.',
    watch:[
      'Where the guideline was ambiguous Germany made a call — those calls should become the standard, not stay local',
      'Brand-by-brand rollout works only because one team held the convention across all thirteen',
      'The labelled-sitemap fix must stay a required input on every brand request',
      'The same pattern is now running in Austria, Lithuania and Portugal — Germany is the template'
    ],
    milestones:[
      { date:'2026-07-31', what:'URL structuring complete across the brand portfolio; BAU sync queue standing', owner:'Sathik / Ana', done:true },
      { date:'2026-10-31', what:'Migration go-live window', owner:'Alena Krivonos (PM)', done:false },
      { date:'2026-10-31', what:'Pre-launch audit — Package 3, needs staging URLs before the date is fixed', owner:'Aswine Sami', done:false },
      { date:'2026-11-14', what:'Post-launch audit — Package 4, live URLs two weeks after release', owner:'Aswine Sami', done:false }
    ], raciCols:[], raci:[] },

  { id:'p-baltics', name:'Build-time guidelines — Austria and the Baltics', market:'AT', kind:'Build',
    status:'active', rag:'green',
    phase:'Lithuania live and market-confirmed. Estonia and Latvia through pre-launch audit and schema. Austria running metadata and GEO expansion.',
    summary:'Where there was no legacy site to migrate, guidelines were applied to the build itself — the cheapest place to apply them. Austria: URL structure to One AZ guidelines, on-page and wireframe recommendations, then 43+ pages of metadata. Lithuania: 33 live HCP pages to One AZ guidelines, keyword research and metadata for all 33, robots.txt, XML sitemap and GSC verification.',
    evidence:'Lithuania marked implemented by the market: no-index rules, home URL trimming, sitemap update, Mano Sunki Astma schema, and content recommendations. Search visibility for unbranded terms measurable from near zero.',
    watch:[
      'Estonia: old breadcrumb schema still to be removed',
      'Austria: keyword research and content strategy for indication pages logged as not started',
      'This is the cost comparison to put in front of product — guidelines at build vs retrofit after launch'
    ],
    milestones:[
      { date:'2026-08-31', what:'Tech files after URL shortening — URL validation, canonical, sitemap, robots (LT, LV, EE)', owner:'Priya', done:true },
      { date:'2026-09-30', what:'Estonia: confirm old breadcrumb schema removed', owner:'Justina Gokaite', done:false },
      { date:'2026-09-30', what:'Austria: start keyword research and content strategy for indication pages', owner:'Priya', done:false }
    ], raciCols:[], raci:[] },

  { id:'p-es-geo', name:'GEO pilot and pre-migration optimisation', market:'ES', kind:'Strategic initiative',
    status:'active', rag:'amber',
    phase:'Top 40 priority pages in progress. Migration final delivery targeted mid-September.',
    summary:'Spain is the first market where prompt research ships alongside keywords as standard output, not a pilot. LLM recommendations for Breast Cancer and Pediatric Cancer, prompt analysis for Pediatric Flu, and a SEMrush project configured for COPD, Asthma and Breast Cancer covering keywords, prompts and competitors. Alongside it, a metadata production line at 47 numbered sets.',
    evidence:'36 logged deliverables. Keyword research and prompt analysis plus on-page optimisation delivered for the top 24 priority pages in August; 40 more in progress for September.',
    watch:[
      'One AZ URL structuring has not started — the market is furthest from the URL standard while being highest in metadata volume',
      'EBPT-5419 migrates Spain to redirect authentication with QA capacity flagged as a risk',
      'Schema file for Pediatric Flu pages still in progress'
    ],
    milestones:[
      { date:'2026-09-15', what:'Spain migration final delivery (per the strategic framing roadmap)', owner:'Ana Pires', done:false },
      { date:'2026-09-30', what:'Top 40 priority pages: KWR, prompts and on-page recommendations complete', owner:'Marshall Raj', done:false }
    ], raciCols:[], raci:[] },

  { id:'p-balkans', name:'Balkans four-market roadmap', market:'HR', kind:'Recovery / roadmap',
    status:'active', rag:'amber',
    phase:'Scoping. Indexing recovery complete; roadmap being defined across HR, RS, SI and BG.',
    summary:'The sites lost indexing. The team audited to find the cause, corrected the tech files (XML sitemap and robots), and pushed re-index requests to Google. Traffic was re-gained. A four-market roadmap is now in scoping, while all four markets are simultaneously in MCP Personalization Phase 1.',
    evidence:'Serbia traffic recovery visible in GSC. Balkans audit and tech file work May–Jun 26.',
    watch:[
      'Four markets in MCP Phase 1 at the same time, with AEM production authoring and daily AEM→AML jobs',
      'This is the cluster where an indexation regression has already happened once — add a post-release check'
    ],
    milestones:[
      { date:'2026-06-30', what:'Tech files corrected and re-index requests pushed', owner:'Priya', done:true },
      { date:'2026-09-30', what:'Four-market roadmap defined', owner:'Ana Pires', done:false }
    ], raciCols:[], raci:[] },

  { id:'p-service-integration', name:'SEO embedded in the Web Delivery offer', market:'ALL', kind:'Programme',
    status:'active', rag:'green',
    phase:'Live in the WESE and Canada workspaces and intake forms as the initial pilot regions.',
    summary:'Three SEO/GEO selections on the intake form — Web default (new page), One AZ existing page (SEO/GEO content optimisation), and Paywall — each triggering a defined package at a defined project phase. Two new packages introduced. Jira web packages updated: post-launch reporting, optimal page content wireframe and pre/post-launch auditing added to both web page packages; the old wireframe/layout recommendation activity removed.',
    evidence:'SEO Service Integration with Web Delivery, Patricia Marques. Auditing and post-launch reporting are now standard, so the loop closes without anyone remembering to ask.',
    watch:[
      'Scope expected to widen beyond the pilot regions — timing not confirmed',
      'Delivery capacity needs planning against whatever the widened scope turns out to be'
    ],
    milestones:[
      { date:'2026-08-20', what:'Intake selections and package changes live in pilot regions', owner:'Patricia Marques', done:true },
      { date:'2026-09-15', what:'Confirm timeline for widening beyond WESE and Canada', owner:'Owais → Patricia', done:false }
    ], raciCols:[], raci:[] },

  { id:'p-playbook', name:'SEO and GEO playbook for the product team', market:'ALL', kind:'Standard',
    status:'active', rag:'amber',
    phase:'In build.',
    summary:'Technical standards (URL structure, indexation controls, schema, tech files) and content standards (page structure, metadata patterns, keyword and prompt scope for GEO), written for the product team rather than per market, so the standard ships with the template. Built on what Germany, Switzerland and the Baltics have already proved.',
    evidence:'Named as a next step in the product session, alongside the meeting cadence and the backlog route.',
    watch:[
      'Maintained as a live document, not a one-off deliverable',
      'Needs the AI crawler decision and the metadata override requirement written into it',
      'The Sitemap Governance doc already lists "ensure SEO best practices are followed" as an objective with no specifics attached — this is what attaches them'
    ],
    milestones:[
      { date:'2026-09-30', what:'First version to the product team', owner:'Owais / GCS SEO', done:false },
      { date:'2026-09-30', what:'Route confirmed for raising SEO and GEO standards into the One AZ backlog', owner:'Owais + Adrian', done:false }
    ], raciCols:[], raci:[] },

  { id:'p-fr-releases', name:'vivreavec.eu release migrations', market:'FR', kind:'Migration',
    status:'active', rag:'green',
    phase:'Releases 1 and 2 complete with post-launch audits. Release 3 (LLC) URL mapping awaiting feedback.',
    summary:'Patient-site migrations from indication root domains into vivreavec.eu — URL structure, mapping, 301 redirection, keyword research and metadata for 45 pages (R1) and 40 pages (R2), with pre- and post-launch audits. Outside One AZ, tracked here so France work is not mistaken for One AZ work.',
    evidence:'R1 post-launch: 301 redirection implemented May 26. R2 post-launch audit Aug 26. R3 URL structuring and mapping Aug 26.',
    watch:['Release 3 URL mapping for 301 redirection is waiting for feedback'],
    milestones:[
      { date:'2026-08-31', what:'Release 3 URL structuring and 301 mapping delivered', owner:'Priya', done:true },
      { date:'', what:'Release 3 redirect implementation confirmed by market', owner:'Aude Meslati (PM)', done:false }
    ], raciCols:[], raci:[] }
],

/* The four-package model — the same sequence in Germany, Austria, Portugal and Switzerland. */
migrationModel: [
  { pkg:'Package 1', what:'URL structuring & redirects', needs:'Sitemap, old page list, new page names' },
  { pkg:'Package 2', what:'Metadata & technical SEO',   needs:'Staging access, manuscripts, list of live pages' },
  { pkg:'Package 3', what:'Pre-launch audit',            needs:'Staging URLs, before the go-live date is fixed' },
  { pkg:'Package 4', what:'Post-launch audit',           needs:'Live URLs, two weeks after release' }
],

/* How a URL structuring request actually runs. Germany set this pattern. */
requestFlow: [
  'Brand logs the page set in the One AZ Migration Tracking list on SharePoint',
  'We pull the list into a working URL structuring file, one per brand',
  'PM asks the brand for a labelled sitemap: which pages are content, which are not',
  'We write the structure in column E, then trim in column F where there is a rationale',
  'Market reviews and signs off the structure before anything is built',
  'Handed to assembly for implementation in staging, then audited'
]
};
