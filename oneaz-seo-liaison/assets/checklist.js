/* GEO & SEO readiness checklist for a new One AZ product feature.
   Run it against a feature before it is built, not after.

   w  = weight: 'must' (a blocker if it fails) or 'should'
   geo = true where the item exists specifically because AI answer engines behave
         differently from a classic crawler.
   Where an item restates a rule from Sitemap Governance One AZ Gamma v3.1, `gov` names it. */

window.CHECKLIST = {

groups: [
  { id:'crawl', title:'Crawlability and access', intro:'If a crawler cannot fetch and render it, nothing else on this list matters.', items:[
    { id:'c1', w:'must', geo:false, q:'Feature content is in the served HTML, not injected only by client-side script',
      why:'Both search crawlers and AI crawlers vary in how much JavaScript they execute. AI crawlers are the stricter case — several fetch raw HTML and never execute script at all.' },
    { id:'c2', w:'must', geo:false, q:'Content is reachable without user interaction — tabs, accordions and carousels render into the DOM at load',
      why:'Switzerland proved this both ways: a CVRM page hid its content in tabs inside one URL; splitting each tab into a dedicated page improved performance. ATTR pages showed the same pattern.',
      gov:'Product and disease pages group content into in-page tabs by design — so this is the default state to check, not an edge case.' },
    { id:'c3', w:'must', geo:false, q:'Public and teaser content is not behind a login, consent layer or interstitial for an anonymous visitor',
      why:'The lead-in paywall model depends entirely on this. An interstitial in front of a teaser page makes the whole exercise pointless.' },
    { id:'c4', w:'should', geo:true, q:'A deliberate decision exists on AI crawler access, recorded at product level',
      why:'GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Bingbot, CCBot. With GEO deliverables now in production, this cannot keep defaulting to whatever each market robots.txt happens to say.' },
    { id:'c5', w:'should', geo:false, q:'The feature does not generate crawlable URL variants — filters, sorts, session or tracking parameters',
      why:'Faceted search and finder components are the usual source. Germany already URL-structures off filters, so filtered views are URL-bearing in at least one market.' },
    { id:'c6', w:'should', geo:false, q:'Pagination and load-more expose real anchor links to every item',
      why:'Infinite scroll with no crawlable links leaves everything past the first screen undiscovered.' }
  ]},

  { id:'url', title:'URL and information architecture', intro:'Measured against Sitemap Governance One AZ Gamma v3.1.', items:[
    { id:'u1', w:'must', geo:false, q:'URLs follow the One AZ convention and no new pattern has been invented',
      why:'Germany stress-tested the convention across 13 brands and 938 pages. A feature that invents its own pattern breaks the one thing that is consistent across markets.',
      gov:'Product overview /forxiga.html · indication /forxiga/heart-failure.html · sub-section /forxiga/heart-failure/safety.html · TA disease page /heart-failure.html' },
    { id:'u2', w:'must', geo:false, q:'Only real content pages carry URLs — navigation-only labels do not',
      why:'Therapeutic area, disease and tumour-type labels are navigation, not pages.',
      gov:'"The URL structure will be determined dynamically and only real content pages will be taken into account, not any of the navigation only labels."' },
    { id:'u3', w:'must', geo:false, q:'Breadcrumbs list content pages only, and the component emits BreadcrumbList markup once',
      why:'Estonia currently has an old breadcrumb schema still to be removed alongside the new one — two definitions invalidate both.',
      gov:'"For breadcrumbs within the portal, only actual content pages are to be listed."' },
    { id:'u4', w:'must', geo:false, q:'If the feature changes existing URLs, a redirect plan exists before release',
      why:'Switzerland is the standing example: structure delivered, pages already live, re-pointing effort is the blocker and the correction is long pending. Never create a second wave of that.' },
    { id:'u5', w:'should', geo:false, q:'Canonical is decided for every variant state the feature can produce',
      why:'Tabs, filters, anchored states, print views, and the Italy case of legacy and One AZ pages served under one domain.' },
    { id:'u6', w:'should', geo:false, q:'New page types are added to the XML sitemap automatically on publish',
      why:'On the paywall RACI this is its own accountable task — "implementation of URL to sitemap" — because it does not happen by itself.' },
    { id:'u7', w:'should', geo:false, q:'Navigation limits are enforced by the component, not by market discipline',
      why:'Caps that rely on markets remembering them are caps that drift.',
      gov:'Top nav max 7 tabs, three mandatory (Our Medicines, Therapeutic Areas, News). Main nav max 5 columns, 10 links per column. In-page tabs max 7, dropdowns max 7 links.' }
  ]},

  { id:'geo', title:'Answerability — the GEO layer', intro:'Written for retrieval and citation by AI answer engines, which read in chunks rather than pages.', items:[
    { id:'g1', w:'must', geo:true, q:'The page answers its primary question in a self-contained 40–60 word passage near the top',
      why:'Answer engines lift passages, not pages. A passage that only makes sense after three paragraphs of preamble does not get lifted.' },
    { id:'g2', w:'must', geo:true, q:'Content is chunked into semantically complete sections that each stand alone',
      why:'Retrieval happens at chunk level. A section that depends on the one above it loses its meaning the moment it is retrieved on its own.' },
    { id:'g3', w:'must', geo:true, q:'Heading hierarchy is semantic — one H1, properly nested H2s and H3s, not styled divs',
      why:'Headings are the chunk boundaries. Visual hierarchy without semantic hierarchy gives a model nothing to segment on.' },
    { id:'g4', w:'must', geo:true, q:'Brand, molecule, indication and therapy-area names are written out in text, consistently',
      why:'Entity consistency is what lets a model connect this page to what it already knows. The German research on Nebenwirkungen vs Verträglichkeit vs Sicherheit is the same principle: the words markets actually use decide whether the page is found.' },
    { id:'g5', w:'must', geo:true, q:'Critical content is not locked in images, carousels or PDFs only',
      why:'A PDF-only prescribing summary is invisible to most answer pipelines.' },
    { id:'g6', w:'should', geo:true, q:'Lists, comparisons and dosing or trial data are real HTML lists and tables',
      why:'Tabular structure survives extraction. A table rendered as an image does not.' },
    { id:'g7', w:'should', geo:true, q:'Claims carry visible attribution — source, study, and a date',
      why:'Attributable statements are preferentially cited. In a regulated context this is also what the content already has to do.' },
    { id:'g8', w:'should', geo:true, q:'A visible last-reviewed or last-updated date is rendered, and it changes when the content changes',
      why:'Freshness is a ranking and a citation signal. A date that never moves is worse than no date.' },
    { id:'g9', w:'should', geo:true, q:'Where the feature answers questions, it uses explicit question-shaped headings',
      why:'The Swiss FAQ page work is the precedent. Question headings map directly onto how the query arrives.' },
    { id:'g10', w:'should', geo:true, q:'Prompt scope has been considered alongside keyword scope for this feature',
      why:'Spain ships prompt research alongside keywords as standard output, and SEMrush prompt tracking is configured in three markets. Prompts are now part of the brief, not an extra.' }
  ]},

  { id:'schema', title:'Structured data', intro:'Generated by the component once, not hand-authored 21 times.', items:[
    { id:'s1', w:'must', geo:true, q:'A schema type is chosen and generated by the template',
      why:'MedicalWebPage, Drug, MedicalCondition, FAQPage, BreadcrumbList, Organization, VideoObject as applicable. Generated centrally is the whole argument: a guideline built into the component is met by every market that uses it.' },
    { id:'s2', w:'must', geo:false, q:'Schema fields are localisable and validate cleanly per locale',
      why:'Switzerland alone needs DE, FR and IT.' },
    { id:'s3', w:'should', geo:true, q:'Medical review, author and date fields are populated where regulated content requires them',
      why:'These are the fields that carry credibility signals into an answer engine, and the content is usually already reviewed.' },
    { id:'s4', w:'should', geo:false, q:'No competing or legacy markup is left behind on the same page',
      why:'Estonia: old breadcrumb schema to be removed. Exactly this failure.' }
  ]},

  { id:'meta', title:'Metadata', intro:'Patterns are fine. Locked patterns are not.', items:[
    { id:'m1', w:'must', geo:false, q:'Title and description are overridable per page and per locale in the authoring UI',
      why:'Switzerland puts meta title and description through MLR review as a distinct accountable task. A template-locked pattern cannot be reviewed, so it cannot ship there.' },
    { id:'m2', w:'must', geo:false, q:'Character budgets survive language expansion',
      why:'German runs roughly 30% longer than English. A pattern that fits in English truncates in German and Dutch.' },
    { id:'m3', w:'should', geo:false, q:'A review state exists for metadata where the market requires MLR',
      why:'Otherwise metadata goes live ahead of its approval, which is a compliance problem rather than an SEO one.' },
    { id:'m4', w:'should', geo:false, q:'hreflang is emitted for multi-language markets',
      why:'Switzerland (DE/FR/IT) and Belgium (NL/FR) both need it, and both are running full delivery programmes.' }
  ]},

  { id:'index', title:'Indexation controls', intro:'Explicit per page state. This is the cluster where a mistake has already cost a market its index.', items:[
    { id:'i1', w:'must', geo:false, q:'index / noindex is decided explicitly for every state the feature produces',
      why:'Personalised landing pages, thank-you pages, search results and filtered views each need an answer. Silence defaults to indexable.' },
    { id:'i2', w:'must', geo:false, q:'Gated pages: the teaser is indexable and the gated content is excluded, verified not assumed',
      why:'This is the entire lead-in paywall proposition. It has to be tested, not designed.' },
    { id:'i3', w:'must', geo:false, q:'Staging is noindexed and access-restricted',
      why:'Packages 2 and 3 both put us on staging. Staging leaking into the index is a live risk on every migration.' },
    { id:'i4', w:'should', geo:true, q:'noarchive, nosnippet and max-snippet are applied deliberately where content is sensitive',
      why:'On the paywall build these are applied consistently as volume grows, with drift caught when content changes. They are also the levers that govern what an AI answer may quote.' },
    { id:'i5', w:'must', geo:false, q:'robots.txt and the XML sitemap update automatically on publish, and are reviewed before release',
      why:'The Balkans lost their index through a robots issue. Never ship a robots-touching change into that cluster unreviewed.' },
    { id:'i6', w:'should', geo:false, q:'Search Console coverage includes the new paths',
      why:'GSC verification was part of the Lithuanian build for exactly this reason — without it there is no signal that anything went wrong.' }
  ]},

  { id:'perf', title:'Performance and rendering', intro:'', items:[
    { id:'p1', w:'should', geo:false, q:'Core Web Vitals impact is assessed — LCP element, layout shift, interaction latency',
      why:'A component that ships to every market ships its performance cost to every market.' },
    { id:'p2', w:'should', geo:false, q:'Images have dimensions, modern formats and authorable alt text',
      why:'Germany ran image optimisation as a distinct deliverable on Enhertu. It should not need to be a deliverable.' },
    { id:'p3', w:'should', geo:false, q:'The feature does not block render or add heavy third-party script',
      why:'Video galleries and personalisation scripts are the usual candidates.' }
  ]},

  { id:'market', title:'Market fit and compliance', intro:'The part that decides whether a feature is trickier in some markets than others.', items:[
    { id:'k1', w:'must', geo:false, q:'Regulatory exposure is assessed per market — promotional vs non-promotional, HCP-only vs public',
      why:'The paywall page audit scores exactly this first, before anything else.' },
    { id:'k2', w:'must', geo:false, q:'There is an authorable region for mandatory local elements',
      why:'German Pflichttext, job codes, prescribing information links, adverse event statements. The product RAID log already records this as a reusability risk on card components.' },
    { id:'k3', w:'must', geo:false, q:'Every locale in scope has a translation route and an owner',
      why:'Confirm translations is its own accountable RACI task in Switzerland. It is not a step that happens for free.' },
    { id:'k4', w:'should', geo:false, q:'A market that cannot adopt has a defined opt-out that does not break the template',
      why:'The Nordics de-scoped until go-live; Belgium has no guideline track; CEEBA has baseline only. Non-adoption is a real state that needs a defined behaviour.' },
    { id:'k5', w:'should', geo:false, q:'The consent and cookie layer has been confirmed crawler-transparent in the markets in scope',
      why:'Currently unverified anywhere. Worth testing in Switzerland alongside the next paywall batch.' }
  ]},

  { id:'land', title:'Landing and measurement', intro:'A recommendation that nobody implements is not a deliverable.', items:[
    { id:'l1', w:'must', geo:false, q:'A named person per market owns implementation and sign-off',
      why:'Portugal is the standing counter-example: recommendations delivered, then left unverified, because the hand-off had nowhere to land.' },
    { id:'l2', w:'must', geo:false, q:'A pre-launch audit is scheduled against staging, before the go-live date is fixed',
      why:'Package 3. Staging URLs are needed before the date is set, not after.' },
    { id:'l3', w:'must', geo:false, q:'A post-launch audit is scheduled for two weeks after release',
      why:'Package 4. This is what closes the loop and tells the market what was actually implemented, not just what was recommended.' },
    { id:'l4', w:'should', geo:false, q:'Analytics and tagging are defined, and a baseline is captured before rollout',
      why:'The paywall measurement window depends on a clean before-and-after. Canada is only a usable precedent because the baseline existed.' },
    { id:'l5', w:'should', geo:false, q:'Degradation behaviour is defined for a market that does not implement it',
      why:'Partial rollout is the normal state across 21 markets, not the exception.' }
  ]}
],

/* Reference card — the standard the URL and IA items are measured against. */
governance: {
  doc:'Sitemap Governance for One AZ Portals — Gamma v3.1',
  meta:'Owner: Florian Howe · dated 20/10/2025 · applies to HCP portals on product version Gamma or above',
  note:'The exact number, order and naming of pages within the sitemap is at each market’s discretion. The structure is not. Responsibility for adherence sits with GCS and the One AZ Champions in each market.',
  rules:[
    { k:'URL construction', v:'Determined dynamically; only real content pages are taken into account, never navigation-only labels.' },
    { k:'URL examples', v:'/forxiga.html · /forxiga/heart-failure.html · /forxiga/heart-failure/safety.html · /heart-failure.html' },
    { k:'Breadcrumbs', v:'Only actual content pages are listed.' },
    { k:'Top navigation', v:'Max 7 tabs. Three are mandatory: Our Medicines, Therapeutic Areas, News.' },
    { k:'Main navigation', v:'Max 5 columns, max 10 links or labels per column; overflow creates a second column automatically.' },
    { k:'Our Medicines', v:'Branded content. May need to be login-only depending on local regulation.' },
    { k:'Navigation-only levels', v:'Therapeutic Area, Disease / Tumour Type, and Indication / Tumour Sub-Type are labels with no content pages behind them.' },
    { k:'Product page sub-sections', v:'Mandatory: Product Overview, Clinical Trials, Prescribing Information, Other Indications (multi-indication only). Optional: Mechanism of Action, Resources, Safety.' },
    { k:'In-page tabs', v:'Max 7 tabs; each dropdown max 7 links. Applies to product pages and disease / tumour pages alike.' },
    { k:'Therapeutic Areas section', v:'Unbranded disease-awareness content. Disease Overview is mandatory on a disease page.' },
    { k:'Utility navigation', v:'Contact Us is mandatory and carries adverse event reporting. Language toggle, log-in/sign-up and My Account are optional.' },
    { k:'Stated objective', v:'"To ensure SEO best practices are followed" — an objective the document sets without attaching specifics. The playbook is what attaches them.' }
  ]
}
};
