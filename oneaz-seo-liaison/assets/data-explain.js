/* Deep-dive content for the product map. One entry per category and per
   sub-category, written to be read cold. `plain` says what it is with no
   jargon; `flow` is the mechanism in steps; `care` is why it reaches us. */

window.DATA_EXPLAIN = {

cat: {
  url: {
    plain:'Everything about how a page is addressed and how you get to it: the URL it lives at, where it sits in the menus, and what the breadcrumb says. It is the skeleton of the site.',
    flow:['A market decides which brands and therapy areas it carries','The One AZ template turns those into a menu structure, capped at 5 columns of 10','Only real content pages get a URL; therapy area and disease labels are menu entries with nothing behind them','The URL is assembled from the content path — /forxiga/heart-failure.html'],
    care:'Every URL recommendation the team has ever written assumes this behaviour holds. Germany applied it across 13 brands and 938 pages. If the product changes how URLs are made, that work is re-derived — and markets already live need redirects, not just a new convention.',
    ask:['What happens to an existing URL when the rule changes?','Does the .html convention still hold?','Are navigation-only labels still excluded from URLs and breadcrumbs?'],
    watch:'Switzerland is the cautionary tale: structure delivered to guidance, pages already live, and re-pointing them is still pending. Never create a second one.'
  },
  access: {
    plain:'Who is allowed to see what. An HCP portal checks that a visitor is a verified healthcare professional before showing branded content, and that check is a piece of software with its own tickets.',
    flow:['A visitor asks for a gated page','The site checks whether they are a logged-in verified HCP','If not, a 302 redirect sends them to the login','Verification runs against Reltio and IQVIA, or a national service like Swiss Rx Login','Once verified, the full page is served'],
    care:'A crawler is always an unverified visitor. So "what does an anonymous visitor get served" and "what can be indexed" are the same question. The lead-in paywall exists entirely in the gap between the redirect and the gate.',
    ask:['What exactly does an anonymous visitor with no JavaScript receive?','Does the 302 behaviour on a gated URL change?','Can any new interstitial appear in front of a teaser page?'],
    watch:'The Swiss model needs nothing built because the existing login already holds Swissmedic and TPA compliance. Two live tickets rework parts of that path — that is worth watching closely.'
  },
  template: {
    plain:'The reusable building blocks. A template is the frame of a page type; a component is a block an author drops into it — a card, a tab set, a video gallery. Both are built centrally and used by every market.',
    flow:['A component is built once by the product team','It is published into the shared library','Market authors place it on pages in AEM','Whatever the component outputs — its HTML, its schema, its heading levels — appears identically on every site that uses it'],
    care:'This is the only place where a standard gets built in once instead of argued twenty times. It is also where a defect multiplies: a component that hides content or emits no schema does so everywhere at once.',
    ask:['Is the content in the served HTML, or added by script after load?','Is there an authorable region for mandatory local text?','Does it emit schema, generated centrally?'],
    watch:'Product has already logged that Pflichttext compliance limits card reusability, and proposed a configurable global solution. That is your argument, in their words, on their log.'
  },
  discovery: {
    plain:'Finding things inside the site — the search box, filters, and finder components. Not Google; the site\'s own search.',
    flow:['A user types a query or picks a filter','The site queries its content index, sometimes Veeva Vault','Results render, often at a URL carrying the query or filter as a parameter'],
    care:'Filter and search URLs multiply fast. Left unhandled they eat crawl budget and create near-duplicates. Germany already structures URLs off filters, so filtered views are URL-bearing somewhere in the estate today.',
    ask:['Do filter and search states get their own crawlable URLs?','If so, what is the canonical and what does robots.txt say?','Are search result pages noindex?'],
    watch:'Cheap to settle at design time, expensive to unwind once a market has thousands of parameter URLs indexed.'
  },
  perso: {
    plain:'Showing different content to different people on the same page — the "recommended for you" cards. Driven by MCP, which keeps a catalogue of pages and picks which to surface.',
    flow:['AEM sends its pages to MCP as a catalogue of assets','MCP decides which assets to show a given logged-in HCP','Cards and carousels render per user','Nobody has automated which pages are real articles, so GCS supplies that list manually'],
    care:'Content that varies per user on one URL is invisible to a crawler and unstable for an AI answer. And the page inventory MCP needs is exactly the inventory URL structuring already produces — which makes us the natural source rather than a bystander.',
    ask:['What does a crawler get when there is nobody to personalise for?','Is there a stable default variant?','Should this page type be indexable at all?'],
    watch:'Two open risks on the product RAID log are owned by GCS: telling MCP when a page is added, and when one is deleted. Somebody needs to be named for that.'
  },
  events: {
    plain:'Events, meetings and webinars — the calendar of things HCPs can register for, pulled from Veeva.',
    flow:['Events are created in Veeva Events and Meetings','One AZ pulls them onto the site','HCPs search, view and register','Confirmation and cancellation emails go back out through Veeva'],
    care:'Modest. Event pages are a natural Event schema surface and are frequently gated by default without anyone deciding to gate them. Worth one question, not a campaign.',
    ask:['Are event pages public or gated, and was that a decision or a default?','Does the template emit Event structured data?'],
    watch:'The webinar proof of concept is RAID-flagged for unclear requirements. When they firm up, that is the moment to ask.'
  },
  forms: {
    plain:'Contact Us, the order list, rep contact forms, and a webshop spike.',
    flow:['A user submits a form','The submission routes to the right team or system','Some forms filter by product or territory to pick a recipient'],
    care:'Low, with one exception. Contact Us is a mandatory page in the governance document because it carries adverse event reporting. It must stay reachable and crawlable — and there is a live incident on it.',
    ask:['Does Contact Us stay crawlable through the fix?'],
    watch:'The webshop is blocked on architecture. Watch only.'
  },
  reporting: {
    plain:'The product team\'s own reporting on how its product is used — which components each market has actually deployed.',
    flow:['Instrumentation records component and feature usage per site','That rolls up into reporting for the product team'],
    care:'Quietly the most useful item on the board for us. If we can see which components carry real page volume in which markets, the playbook targets those instead of guessing — and a component-level standard suddenly has a measurable audience.',
    ask:['Can we have read access to the usage reporting when it lands?'],
    watch:'Small ask, large payoff. Worth spending a bit of goodwill on.'
  },
  intake: {
    plain:'How work reaches the SEO team at all: the Web Delivery intake form, the Jira packages behind it, and the written standard everything is measured against.',
    flow:['A market or its PM raises a web request on the intake form','A selection on that form determines which package runs and when SEO is triggered','The package defines the activities delivered','The Sitemap Governance document defines what "correct" means'],
    care:'This is the ordering layer, and it is the same argument as the playbook made one level earlier. When SEO is an option on the form rather than a separate conversation, the guideline gets applied by default rather than by memory.',
    ask:['When does the pilot widen beyond WESE and Canada?','What is the default if nobody chooses an SEO option?','Can we review the next version of the governance document before it publishes?'],
    watch:'Auditing and post-launch reporting are now standard in both web page packages — so the loop closes without anyone remembering to ask. That change is already banked.'
  }
},

sub: {
  'url-slug':{ plain:'The slug is the last readable part of a URL — the "heart-failure" in /forxiga/heart-failure.html. Current work would localise it into the market language.',
    care:'High. Localised slugs change the URL of pages that already exist and already rank in markets that are already live.',
    ask:['Which locales, and from when?','What happens to the old URL — a redirect, or nothing?'] },
  'url-nav':{ plain:'The megamenu and breadcrumb. Capped at 5 columns of 10 links, 7 top tabs, and breadcrumbs list content pages only.',
    care:'High. This is the internal linking layer for the whole portal, so a change here redistributes crawl paths on every site at once.',
    ask:['Are the links real anchors in the served HTML?','Are the governance caps enforced by the component or left to market discipline?'] },
  'url-domain':{ plain:'Which system answers for which path on a hostname. The Italian proof of concept would serve One AZ pages and legacy promotional pages from the same domain at the same time.',
    care:'High. Two page systems on one host is a canonical and duplicate-content problem before it is anything else, and Spain — which has not migrated — inherits whatever is decided.',
    ask:['What is the canonical strategy?','Which system owns robots.txt and the XML sitemap?','How are redirects staged?'] },
  'acc-login':{ plain:'The login itself and the redirect that gets a visitor to it — magic links, redirect authentication, market bypasses.',
    care:'High. This is the exact mechanism the teaser layer sits above.',
    ask:['Does the 302 behaviour on a gated URL change?','Is the teaser-to-login path in the test matrix?'] },
  'acc-consent':{ plain:'Consent capture and preference pages — steps shown to users who have not yet agreed to something.',
    care:'Medium to high. An interstitial in front of a teaser page makes the teaser pointless.',
    ask:['Can this ever render for anonymous or crawler traffic?','Are lead-in URLs excluded?'] },
  'acc-session':{ plain:'Session timeouts, inactivity warnings and logout popups.',
    care:'Low. It lives behind the wall.', ask:['Confirmed that public pages are excluded?'] },
  'tpl-content':{ plain:'Cards, tab sets, accordions, and the regions that hold mandatory local text.',
    care:'High. Tabs decide whether content is reachable; mandatory-text regions decide whether Germany can use the component at all.',
    ask:['Is tab content in the DOM at load?','Is there an authorable mandatory-text region?'] },
  'tpl-media':{ plain:'Video galleries and playlists, arriving across markets via Kaltura.',
    care:'Medium. Video without schema, transcripts or lazy loading adds weight and returns nothing.',
    ask:['Does it emit VideoObject schema?','Is there a transcript field?','Is it lazy loaded?'] },
  'tpl-design':{ plain:'Design tokens and brand colour palettes — the visual layer distributed across markets.',
    care:'Low in itself. Interesting because it is the machinery that could distribute SEO defaults too.',
    ask:['Could the same federation carry heading semantics, schema hooks and metadata patterns?'] },
  'dis-search':{ plain:'The site\'s own search with advanced filtering over Veeva Vault content.',
    care:'Medium. Faceted search is the classic crawl-waste source.',
    ask:['Do filter states generate crawlable URLs?','Canonical and robots position?'] },
  'dis-finder':{ plain:'Map and locator components.',
    care:'Low unless they produce crawlable result URLs.', ask:['Does it produce crawlable URLs?'] },
  'per-mcp':{ plain:'The MCP personalisation rollout across ten EUCAN markets, with AEM feeding it a page catalogue.',
    care:'Medium. The missing article flag is a live product gap, and the inventory it needs is one we already hold.',
    ask:['Is the article / non-article flag being built this PI?','Who in GCS owns the weekly check per market?'] },
  'per-page':{ plain:'Pages assembled per user — personalised landing pages and carousels.',
    care:'Medium. A new page type with no indexation decision defaults to indexable, which is almost certainly wrong.',
    ask:['Is there a stable default variant for anonymous visitors?','Should this be noindex by default?'] },
  'per-id':{ plain:'Identifying and attributing users across sessions and channels.',
    care:'Low. Watch for measurement impact only.', ask:['Does anything change in Adobe Analytics?'] },
  'ev-veeva':{ plain:'Veeva Events and Meetings surfaced on the site — search, register, speaker profiles, confirmation emails.',
    care:'Low to medium. Schema and a deliberate public-vs-gated decision.',
    ask:['Public or gated, and was that decided or defaulted?','Event schema?'] },
  'ev-webinar':{ plain:'A proof of concept joining One AZ, Veeva Events and a webinar vendor.',
    care:'Low today. RAID-flagged for unclear requirements.', ask:['Ask again when requirements firm up.'] },
  'frm-contact':{ plain:'Contact Us and the order list.',
    care:'Low, but Contact Us is mandatory and carries adverse event reporting.',
    ask:['Does it stay crawlable through the incident fix?'] },
  'frm-shop':{ plain:'Full webshop integration, currently blocked on architecture.',
    care:'Low today.', ask:['Ask to see the architecture design when it exists.'] },
  'rep-usage':{ plain:'Reporting on which components and features each market actually uses.',
    care:'Medium, and rising. It would let the playbook target the components that carry real page volume.',
    ask:['Can we have read access when it lands?'] },
  'rep-gov':{ plain:'Centralising global email template governance.',
    care:'Low. Email, not web.', ask:['None. Useful precedent for centralising a standard.'] },
  'int-form':{ plain:'The three SEO/GEO selections on the Web Delivery intake form and the Jira packages behind them.',
    care:'High. It decides whether SEO is applied by default or by memory.',
    ask:['When does it widen beyond WESE and Canada?','What is the default if nobody selects?'] },
  'int-standard':{ plain:'The Sitemap Governance document and the SEO/GEO playbook that would attach specifics to it.',
    care:'High. It is the standard every recommendation is measured against.',
    ask:['Can we review the next version before it publishes?','What is the route for raising standards into the backlog?'] }
},

/* Rollout state per product item, read from the Q3 PI delivery plan.
   state: live | building | spike | planned | blocked
   Editable in the app — this is a first read, not a product statement. */
rollout: {
  'SITEMAP-GAMMA':{ state:'live', since:'2025-10', where:['ALL'], note:'Published as Gamma v3.1 and in force.' },
  'INTAKE-SEO':   { state:'live', since:'2026-08', where:['CH','AT','PT','NL','BE','CA'], note:'Live in the WESE and Canada workspaces as the pilot; scope expected to widen.' },
  'JIRA-PKG':     { state:'live', since:'2026-08', where:['CH','AT','PT','NL','BE','CA'], note:'Auditing and post-launch reporting now standard in both web page packages.' },
  'EBPT-4625':    { state:'building', where:[], note:'Q3 feature. Not yet in any market.' },
  'EBPT-5585':    { state:'spike', where:[], note:'Proof of concept for Italy. No build decision yet.' },
  'RAID-8':       { state:'building', where:[], note:'Configurable global solution proposed on the RAID log; owner GCIT.' },
  'EBPT-4909':    { state:'building', where:[], note:'Q3 feature.' },
  'EBPT-4742':    { state:'building', where:[], note:'Q2 spill-over, still in flight.' },
  'EBPT-3330':    { state:'building', where:[], note:'Q2 spill-over — Medical megamenu integration.' },
  'EBPT-5276':    { state:'building', where:[], note:'At risk on the RAID log; possible redesign.' },
  'EBPT-5368':    { state:'building', where:['NL'], note:'Netherlands only.' },
  'EBPT-5419':    { state:'building', where:['ES'], note:'Spain. QA capacity flagged as a risk.' },
  'EBPT-4769':    { state:'building', where:['IT'], note:'Italy.' },
  'EBPT-5127':    { state:'building', where:['CH'], note:'Switzerland.' },
  'EBPT-5149':    { state:'building', where:['DE'], note:'Germany.' },
  'EBPT-4759':    { state:'spike', where:[], note:'Feasibility on the multi-market video experience.' },
  'EBPT-4732':    { state:'building', where:[], note:'Design token federation.' },
  'EBPT-3725':    { state:'building', where:[], note:'Rolling out with One AZ markets.' },
  'EBPT-3092':    { state:'building', where:[], note:'Q3 feature.' },
  'EUC-19745':    { state:'building', where:[], note:'Component enhancement.' },
  'EBPT-2725':    { state:'building', where:[], note:'Q2 spill-over.' },
  'EBPT-4748':    { state:'blocked', where:[], note:'Blocked pending enterprise architecture design.' },
  'EBPT-4265':    { state:'spike', where:[], note:'Requirements not firm; needed by Sprint 3.' },
  'EBPT-4744':    { state:'spike', where:[], note:'User journeys not yet available.' },
  'EBPT-5100':    { state:'building', where:[], note:'Tracking remediation.' },
  'EBPT-5161':    { state:'spike', where:[], note:'Governance spike.' },
  'MCP-FLAG':     { state:'building', where:['RS','HR','PL','LT','RO','SK','HU','UK','BE','CH'], note:'Phase 1 across ten markets; the exclusion flag itself is planned for this PI.' },
  'INC4514462':   { state:'building', where:[], note:'Live incident; analysis in progress.' }
},
rolloutStates: {
  live:     ['ok',   'Rolled out',  'In production somewhere. Too late to shape — audit it and brief the markets.'],
  building: ['warn', 'Being built', 'In this PI. A requirement can still land, but it costs a change request.'],
  spike:    ['info', 'Investigating', 'No design yet. The cheapest possible moment to add a requirement.'],
  planned:  ['ghost','Planned',     'Named but not started.'],
  blocked:  ['risk', 'Blocked',     'Stopped on a dependency. Scope is open, which makes it easy to influence.']
}
};
