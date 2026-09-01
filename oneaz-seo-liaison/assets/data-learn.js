/* LEARN THE PRODUCT.
   Written for an SEO lead who has to hold a conversation with a product team,
   not for an engineer. Every concept ends in "so what do I ask".

   Sources: the Q3-2026 PI planning outputs, Sitemap Governance One AZ Gamma v3.1,
   the EUCAN catch-up tracker, and the GCS SEO / One AZ deck. Where something is a
   reasonable inference rather than a documented fact it says so. */

window.DATA_LEARN = {

/* ------------------------------------------------------------- glossary */
glossary: [
  { t:'One AZ', g:'product', d:'The shared HCP portal product. One template, one component set, one identity layer — deployed as a separate site per market (myastrazeneca.de, .ch, .lt and so on). "A One AZ market" means that market runs its site on this product.',
    why:'This is the whole reason the liaison job exists. Fix something in the product and every market inherits it; fix it in a market and you have fixed one of twenty.' },
  { t:'Gamma', g:'product', d:'The product version line. The Sitemap Governance document applies to portals on "product version Gamma or above" — so Gamma is roughly "the current generation of One AZ".',
    why:'If a market is below Gamma, the sitemap standard you are quoting may not apply to it. Worth checking before you write a recommendation.' },
  { t:'AEM', g:'platform', d:'Adobe Experience Manager. The content management system One AZ is built on. Authors create pages in AEM; AEM publishes the HTML a browser and a crawler actually receive.',
    why:'Nearly every technical SEO ask ends up being an AEM ask. "Can the template output this?" is an AEM question.' },
  { t:'Component', g:'platform', d:'A reusable block an author drops onto a page — a card, a tab set, a video gallery, a megamenu. Built once centrally, used everywhere.',
    why:'The single highest-leverage place to put an SEO or GEO requirement. A rule inside a component is met by every market that uses it.' },
  { t:'Template', g:'platform', d:'The page-level frame that decides what regions a page type has and what markup wraps them.',
    why:'Metadata patterns, schema output and heading structure are template decisions, not page decisions.' },
  { t:'Authoring', g:'platform', d:'The act of a market filling a template in with its own content. What an author can and cannot change is set by the template.',
    why:'If a field is not exposed in the authoring UI, a market physically cannot follow your recommendation — no matter how well written it is.' },
  { t:'Staging', g:'platform', d:'The pre-production copy of a site where a change is checked before it goes live.',
    why:'Package 3, the pre-launch audit, happens here. Staging access is the input we chase on every migration.' },

  { t:'Veeva', g:'systems', d:'The pharma industry platform AZ uses for CRM, content approval and events. Several pieces appear in the plan: Veeva Vault and PromoMats (approved content and assets), Veeva CRM (rep activity), Veeva Events and Meetings (the events calendar One AZ pulls from).',
    why:'When a One AZ page shows an event or a piece of approved content, Veeva is usually where it came from. If the page is thin, the fix may be in Veeva, not in AEM.' },
  { t:'Reltio', g:'systems', d:'The customer master data system — the single record of who an HCP is. One AZ checks Reltio to decide whether a visitor is a verified HCP.',
    why:'It sits on the gating decision. "Match in either IQVIA or Reltio" tickets are about who gets past the login, which is who gets past the teaser.' },
  { t:'IQVIA', g:'systems', d:'An external healthcare data provider, used alongside Reltio to verify that someone really is a healthcare professional.',
    why:'Same reason as Reltio — it decides who is let in.' },
  { t:'MCP', g:'systems', d:'The personalisation engine. It takes a catalogue of AEM pages and decides which ones to show a given HCP in carousels and cards. Being rolled out to ten EUCAN markets in the current PI.',
    why:'It needs to know which AEM pages are real articles. Right now nobody has automated that, so GCS supplies the list by hand — and the page inventory it needs is exactly what URL structuring already produces.' },
  { t:'AML / OCL', g:'systems', d:'Asset libraries that hold approved marketing content, fed from Veeva PromoMats.',
    why:'Mostly not a web-page concern. Worth recognising so you can let those tickets go past.' },
  { t:'SFMC', g:'systems', d:'Salesforce Marketing Cloud — the email platform. Preference centres, opt-outs and sends.',
    why:'Email, not web. The exception is the preference centre, which is a real web page with a real URL.' },
  { t:'D360', g:'systems', d:'A customer data platform used for HCP profile and engagement data.',
    why:'Rarely touches a public page. Recognise and move on.' },
  { t:'Kaltura', g:'systems', d:'The video platform. The Kaltura V7 playlist and gallery work brings a video component to One AZ pages across markets.',
    why:'Video is a structured-data and performance surface. Whether the component emits VideoObject schema and carries a transcript is decided once, now.' },
  { t:'PIO', g:'systems', d:'The partner agency that built the Swiss Trixeo lead-in pages and led the regulatory reading behind the paywall model.',
    why:'They hold the working knowledge behind the Swiss pilot; phase 2 is waiting on their input being folded in.' },
  { t:'Swiss Rx Login', g:'systems', d:'The Swiss national identity service for verifying healthcare professionals. The Swiss site gates HCP content behind it.',
    why:'The lead-in paywall works precisely because this gate is untouched. Anything that changes it re-opens a settled compliance question.' },
  { t:'Janrain', g:'systems', d:'A customer identity platform used on some sites, for example Her2Know in Canada.',
    why:'Another flavour of the same question: who is served what before login.' },
  { t:'Magic link', g:'systems', d:'Passwordless sign-in — the user gets an emailed link that logs them straight in, instead of a password.',
    why:'The current work makes it return the user to the page they asked for. That is redirect behaviour on gated URLs, which is the mechanism the teaser layer sits on top of.' },
  { t:'302 redirect', g:'systems', d:'A temporary redirect. On One AZ it is what sends an unauthenticated visitor from a gated page to the login.',
    why:'The lead-in model depends on this exact behaviour: the teaser is served, the gated part redirects. Watch for anyone changing it to something else.' },

  { t:'PI planning', g:'process', d:'Program Increment planning. Every quarter or so the teams meet for a few days and agree what they will build over the next six sprints. The output is the delivery plan you now have in the radar.',
    why:'This is your calendar. If something is not in the PI plan it is probably not happening this quarter, and if you want it in the next one you have to ask before the planning session, not after.' },
  { t:'Sprint', g:'process', d:'A fixed two-week block of work. The Q3 PI runs six of them, from 20 July to 9 October 2026.',
    why:'"Sprint 3" is a date range, not a vague future. It tells you when to have a recommendation ready.' },
  { t:'Epic / Feature', g:'process', d:'A unit of work big enough to have its own ticket and its own owner. Every EBPT-number in the radar is one.',
    why:'One epic, one conversation. Anchor your asks to a ticket number and they get tracked; raise them in the abstract and they do not.' },
  { t:'Spike', g:'process', d:'A time-boxed investigation rather than a build. The team does not yet know how — or whether — to do the thing, so they spend a sprint finding out.',
    why:'The best possible moment to intervene. Nothing is built yet, so a requirement costs nothing to add. If you only ever act on one signal, act on "spike".' },
  { t:'RAID log', g:'process', d:'Risks, Assumptions, Issues and Dependencies. The running list of what could go wrong, who owns it and what the mitigation is.',
    why:'Product has already written down some of your best arguments. The Pflichttext component-reusability risk is on their own log — you are agreeing with them, not lobbying them.' },
  { t:'RAG status', g:'process', d:'Red, amber, green. On the delivery plan: blocked, at risk of delay, on track, or delivered to production.',
    why:'Amber and red items are the ones where a well-timed SEO requirement is still cheap to add.' },
  { t:'CCB', g:'process', d:'Change Control Board. The forum that approves work entering the plan mid-increment.',
    why:'This is the route for "can we add this now rather than next quarter". Worth knowing it exists before you need it.' },
  { t:'Release', g:'process', d:'The dated moment code actually reaches production. The Q3 PI has releases on 20 August and 17 September.',
    why:'A release date is a real deadline for a pre-launch audit and a hard limit on when a recommendation can still change the build.' },
  { t:'BAU', g:'process', d:'Business as usual. The standing queue of small ongoing work, as opposed to a project. Germany runs a BAU sync queue of URL structuring tickets.',
    why:'BAU is where most of the delivery volume actually is. It is also where a standard quietly drifts if nobody is holding it.' },
  { t:'RACI', g:'process', d:'Responsible, Accountable, Consulted, Informed. One accountable owner per task, and no shared task lines.',
    why:'The paywall RACI is the model to copy: it is split to task level so SEO Technical and Web/AEM never share a line.' },
  { t:'Jira ticket prefixes', g:'process', d:'EBPT — the One AZ product board. GCV — Veeva. MTG — orchestration and customer data. EUC — EUCAN. INC — a production incident rather than planned work.',
    why:'The prefix tells you which team owns it before you read a word of the title.' },

  { t:'CDM', g:'people', d:'Content and Digital Manager. In several markets the CDM holds the site — including, per the governance document, the URLs.',
    why:'Sonia holds URLs for Switzerland, Portugal and Austria. A URL recommendation that does not reach the CDM does not get implemented.' },
  { t:'Digital Lead', g:'people', d:'The market-side owner of the digital channel. Accountable for compliance decisions on their site.',
    why:'On the paywall RACI the Digital Lead is accountable for the lead-in versus hard paywall decision and for MLR review of metadata.' },
  { t:'OSO / ASO', g:'people', d:'Omni-channel Solution Owner and Associate Solution Owner. The people who own how a solution is delivered in a market.',
    why:'A named solution owner per package is one of the three things that make a migration run on time.' },
  { t:'One AZ Champion', g:'people', d:'The named person in each market responsible, with GCS, for adherence to the One AZ sitemap standard.',
    why:'The governance document already says adherence sits with GCS and the Champions. That is written permission for the conversation you want to have.' },

  { t:'MLR', g:'regulatory', d:'Medical, Legal and Regulatory review. The approval gate that copy must pass before publication.',
    why:'In Switzerland, meta titles and descriptions go through MLR. Metadata there is reviewed copy, not a free-text field — so a template-locked pattern cannot ship.' },
  { t:'Swissmedic', g:'regulatory', d:'The Swiss regulator for medicines.',
    why:'The existing Swiss login flow already satisfies it. That is the reason the lead-in model needs nothing new built.' },
  { t:'TPA', g:'regulatory', d:'The Swiss Therapeutic Products Act — the law behind the promotional rules.',
    why:'Same as above: compliance already held by the current access path.' },
  { t:'PAAB', g:'regulatory', d:'The Canadian advertising review board for pharmaceutical marketing.',
    why:'The Canadian paywall is PAAB approved. That is what makes it a precedent rather than an experiment.' },
  { t:'Pflichttext', g:'regulatory', d:'Mandatory prescribing text German pharmaceutical pages must display.',
    why:'A One AZ component with no authorable region for it cannot ship in Germany. Product has logged this themselves as a reusability risk.' },
  { t:'PI — the other one', g:'regulatory', d:'Prescribing Information. A mandatory sub-section on every One AZ product page. Not to be confused with PI planning.',
    why:'Worth knowing both meanings so you do not misread a sentence in a meeting.' },
  { t:'AE reporting', g:'regulatory', d:'Adverse event reporting. Contact Us carries it, which is why Contact Us is a mandatory page.',
    why:'It is the reason "keep Contact Us crawlable" is not a trivial ask.' },
  { t:'Job code', g:'regulatory', d:'The approval reference printed on compliant material, tying it to its review.',
    why:'Another mandatory element a template needs a home for.' },

  { t:'BBU / OBU', g:'content', d:'Bio-Pharmaceuticals Business Unit and Oncology Business Unit. BBU organises content by disease and indication; OBU by tumour type and sub-type. The sitemap supports both.',
    why:'It explains why the navigation has two shapes. When someone says "tumour sub-type" they mean the oncology equivalent of "indication".' },
  { t:'TA', g:'content', d:'Therapeutic Area — Cardiovascular Renal & Metabolism, Respiratory & Immunology, Oncology and so on.',
    why:'A navigation level with no page behind it. TA labels are not URLs.' },
  { t:'HCP / HPP / DTC', g:'content', d:'Healthcare Professional (gated, for clinicians), Health Portal Public pages, and Direct To Consumer (patient-facing).',
    why:'It decides what may be indexed and what must be gated. Get this wrong and the compliance question is much bigger than the SEO one.' },
  { t:'Navigation-only label', g:'content', d:'A menu entry with no content page behind it — Therapeutic Area, Disease, Tumour Type.',
    why:'The governance document is explicit: these never appear in URLs and never appear in breadcrumbs. It is the rule most often broken.' },
  { t:'Lead-in paywall', g:'content', d:'A page where the H1 and intro sit ahead of the login and are open to crawlers, while the full content stays gated exactly as before.',
    why:'It is the answer to "how is a gated HCP site ever found". Switzerland is the pilot, Canada is the proof.' },
  { t:'Teaser layer', g:'content', d:'The indexable part of a lead-in page — the H1, the intro, the metadata and the schema.',
    why:'Everything you can influence on a gated page lives in this band.' },
  { t:'GEO', g:'content', d:'Generative Engine Optimisation — writing and structuring content so AI answer engines can retrieve, understand and cite it. In practice: chunk-level completeness, answer-first passages, semantic headings, entities written out, real sourcing and dates.',
    why:'It is already in production output in Spain, Austria and Portugal. The product has no position on it yet, which is the gap you are filling.' },
  { t:'Migration package', g:'content', d:'The four-package model: URL structuring and redirects, metadata and technical SEO, pre-launch audit, post-launch audit. Same sequence in Germany, Austria, Portugal and Switzerland.',
    why:'It is your standard offer. What changes is the market, not the method.' }
],

glossaryGroups: [
  { id:'product', label:'The product itself' },
  { id:'platform', label:'The platform it runs on' },
  { id:'systems', label:'Systems it talks to' },
  { id:'process', label:'How work gets planned' },
  { id:'people', label:'Roles you will meet' },
  { id:'regulatory', label:'Regulatory and compliance' },
  { id:'content', label:'Content and structure' }
],

/* --------------------------------------------------------------- lessons */
lessons: [
  { id:'l1', title:'What One AZ actually is', mins:4,
    hook:'Start here. Everything else in this app assumes this one idea.',
    blocks:[
      { t:'p', v:'One AZ is not a website. It is a product that markets build websites out of — a template set, a component library, an identity layer and a set of integrations. Germany, Switzerland, Lithuania and the rest each run their own site, but they run it on the same product.' },
      { t:'callout', k:'The consequence', v:'A defect in the product appears in every market that uses it. A fix in the product reaches every market that uses it. That asymmetry is the entire argument you are making to the product team — and the reason your role exists.' },
      { t:'h', v:'Who owns what' },
      { t:'cards', v:[
        { k:'The Global One AZ team', v:'Owns the product: templates, components, the sitemap standard, the identity layer. Adrian is your route in.' },
        { k:'GCS and the One AZ Champions', v:'Own adherence in each market. The governance document says this explicitly — it is written permission for the conversation you want to have.' },
        { k:'The market', v:'Owns its own content: which brands, which therapy areas, how many pages, what they are called. That discretion is real and is in the document.' },
        { k:'Web Delivery', v:'Owns how a request becomes built work — the intake form, the Jira packages, the assemblers who implement.' }
      ]},
      { t:'p', v:'So when you find something wrong on a market site, the first question is always the same: is this the market\'s content decision, or is it the product\'s template behaviour? The first one you fix with a recommendation. The second one you fix once, with Adrian.' },
      { t:'quiz', q:'A market\'s product pages all put the prescribing information behind a tab that does not render until clicked. Market problem or product problem?',
        a:'Product. The tab component is central; every market using it has the same behaviour. This is a template conversation, not twenty content conversations.' }
    ]},

  { id:'l2', title:'The shape of a One AZ site', mins:5,
    hook:'The standard you measure every URL and IA recommendation against.',
    blocks:[
      { t:'p', v:'Sitemap Governance One AZ Gamma v3.1 is the document. It sets the structure; markets choose what goes in it. Knowing the difference is most of the job.' },
      { t:'diagram', v:'sitemap' },
      { t:'h', v:'The rule that matters most' },
      { t:'callout', k:'Content pages versus navigation labels', v:'"The URL structure will be determined dynamically and only real content pages will be taken into account, not any of the navigation only labels." Therapeutic Area, Disease, Tumour Type and Indication are labels. They have no URL and they never appear in a breadcrumb.' },
      { t:'h', v:'The caps, in one place' },
      { t:'table', head:['What', 'Limit'], rows:[
        ['Top navigation tabs', 'Max 7. Three are mandatory: Our Medicines, Therapeutic Areas, News'],
        ['Main navigation', 'Max 5 columns, max 10 links per column; overflow makes a second column'],
        ['In-page tabs', 'Max 7, each dropdown max 7 links'],
        ['Product page sub-sections', 'Mandatory: Overview, Clinical Trials, Prescribing Information, Other Indications'],
        ['URL pattern', '/forxiga.html · /forxiga/heart-failure.html · /forxiga/heart-failure/safety.html']
      ]},
      { t:'p', v:'Two things follow from the caps. First, they are the reason a megamenu change is an SEO event: it is the internal linking layer for the whole portal. Second, in-page tabs are where content goes to hide — which is why splitting tabs into pages keeps producing results.' },
      { t:'quiz', q:'A market wants a page for "Oncology" so they can rank for it. What does the standard say?',
        a:'Therapeutic Area is a navigation-only level — no content page behind it. If they want reach on the therapy area, the route is a disease or tumour page under Therapeutic Areas, which is a real content page. That is a structure answer, not a refusal.' }
    ]},

  { id:'l3', title:'The moving parts', mins:6,
    hook:'Ten system names come up constantly. Here is what each one actually does, and whether you should care.',
    blocks:[
      { t:'p', v:'A One AZ page is assembled from several systems. You do not need to know how any of them work internally. You need to know which one to name when you ask a question, so the question reaches the right team.' },
      { t:'diagram', v:'stack' },
      { t:'h', v:'The short version' },
      { t:'table', head:['System','What it does','Do you care?'], rows:[
        ['AEM','Builds and publishes the pages','Constantly. Every technical ask is an AEM ask'],
        ['Reltio / IQVIA','Decide who is a verified HCP','Only where gating is involved — which is where it matters most'],
        ['Swiss Rx Login / Janrain','The actual login gate','Yes. This is the boundary the teaser sits above'],
        ['Veeva','Approved content, events, CRM','Sometimes. Events and approved assets surface on pages'],
        ['MCP','Chooses personalised cards','Yes. It needs a page inventory you already produce'],
        ['Kaltura','Video hosting and playback','Yes, at design time. Schema and transcripts or nothing'],
        ['SFMC / D360 / AML','Email and customer data','Rarely. Recognise and let them pass'],
        ['Adobe Analytics, GSC, SEMrush, BrightEdge','Measurement','Yes. This is how you prove anything worked']
      ]},
      { t:'callout', k:'A useful habit', v:'When a ticket confuses you, find the system it belongs to first. Half the backlog is email and customer data plumbing that will never touch a page a crawler can see. Being able to skip it quickly is as valuable as spotting the ones that matter.' }
    ]},

  { id:'l4', title:'How the work gets planned', mins:5,
    hook:'If you understand the planning rhythm, you stop reacting to the product team and start arriving on time.',
    blocks:[
      { t:'p', v:'Work is planned in Program Increments — "PI planning". Every quarter or so the teams spend a few days agreeing what they will build over the next six two-week sprints. The Q3 2026 PI was planned 14–16 July and runs 20 July to 9 October.' },
      { t:'diagram', v:'pi' },
      { t:'h', v:'The four signals worth acting on' },
      { t:'cards', v:[
        { k:'Spike', v:'A time-boxed investigation. Nothing is built yet. This is the cheapest possible moment to add a requirement — and the moment nobody thinks to invite SEO.' },
        { k:'Amber or red', v:'At risk, or blocked. Scope is already being reconsidered, so a well-argued requirement is easier to fold in than it will ever be again.' },
        { k:'On the RAID log', v:'Product has already written the risk down. You are agreeing with them, not lobbying them. Much easier conversation.' },
        { k:'Delivered to prod', v:'Too late to shape it. Now it is an audit, a market briefing, and a note for the next planning round.' }
      ]},
      { t:'callout', k:'The timing rule', v:'Requirements for the next quarter have to land before that quarter is planned, not after. If you want SEO and GEO standards in the Q4 build, the conversation happens in the weeks before Q4 PI planning — which means asking Adrian when it is.' },
      { t:'quiz', q:'You spot a component that will produce uncrawlable URLs. It is marked as a spike in Sprint 3. What do you do?',
        a:'Ask now, in writing, on the ticket. A spike has no design yet, so a requirement is free. Waiting until it is built turns a sentence into a change request.' }
    ]},

  { id:'l5', title:'How to read a product ticket', mins:4,
    hook:'A worked example. Do this once and the whole board becomes readable.',
    blocks:[
      { t:'p', v:'Take EBPT-4625: Localised URL Slug. Four questions get you from a title you do not understand to a question worth asking.' },
      { t:'steps', v:[
        { k:'1 · Which team owns it?', v:'The prefix says EBPT, so it is the One AZ product board — Adrian\'s world, not Veeva\'s and not orchestration\'s. That alone tells you where to raise it.' },
        { k:'2 · What does it touch on a page?', v:'"URL slug" means the last segment of a URL. So this changes URLs. Use the page anatomy map if the title is vaguer than this one.' },
        { k:'3 · Does it change something we have already recommended?', v:'Yes — heavily. Germany\'s 13 brands, the Baltics, Austria and Portugal all have URL structures written against current slug behaviour. That makes this high impact rather than interesting.' },
        { k:'4 · What is the one question?', v:'"What happens to an existing URL when its slug changes?" If the answer is "nothing, we redirect", it is manageable. If the answer is a shrug, you have just prevented a second Switzerland.' }
      ]},
      { t:'callout', k:'The pattern', v:'Owner → page region → does it undo our work → one question. You do not need to understand the implementation. You need to know what it does to a page and who to ask.' }
    ]},

  { id:'l6', title:'What to ask, by component type', mins:5,
    hook:'A cheat sheet. Keep it open during the touch-base.',
    blocks:[
      { t:'p', v:'Most product work falls into a handful of shapes. Each shape has two or three questions that surface the SEO and GEO risk without needing you to know how it is built.' },
      { t:'ask', v:[
        { k:'Anything that changes URLs', qs:['What happens to the existing URL — redirect, or does it just break?','Does the .html convention still hold?','Which markets are affected, and are any of them already live?'] },
        { k:'A new template or component', qs:['Is the content in the served HTML, or added by script after load?','Is there an authorable region for mandatory local text?','Does it emit schema, and is that generated centrally or per market?'] },
        { k:'Anything touching login or consent', qs:['What exactly does an anonymous visitor — or a crawler — get served?','Does the 302 behaviour on a gated URL change?','Can this interstitial ever appear in front of a teaser page?'] },
        { k:'Search, filters or finders', qs:['Do filter and search states get their own crawlable URLs?','If they do, what is the canonical and what does robots.txt say?'] },
        { k:'Personalisation', qs:['What does a crawler get when there is no user to personalise for?','Is there a stable default variant?','Should this page type be indexable at all?'] },
        { k:'Media and video', qs:['Does the component emit VideoObject schema?','Is there a transcript field in the authoring model?','Is it lazy loaded?'] },
        { k:'Metadata and head', qs:['Can a market override the pattern per page and per locale?','Is there a review state, for markets where metadata goes through MLR?','Do character budgets survive German and Dutch expansion?'] },
        { k:'A process or intake change', qs:['Which markets, and from when?','Does SEO get triggered automatically or does someone have to remember?','What is the default if nobody chooses?'] }
      ]},
      { t:'callout', k:'If you only ask one thing', v:'"What does an anonymous visitor with no JavaScript get served on this page?" It exposes rendering, gating, personalisation and consent in a single question, and anyone technical can answer it.' }
    ]},

  { id:'l7', title:'Where your leverage actually is', mins:3,
    hook:'Closing the loop between the theory and the app you are holding.',
    blocks:[
      { t:'p', v:'Nine categories of product work exist. You cannot follow all of them and should not try. Three carry almost all of your leverage.' },
      { t:'cards', v:[
        { k:'URL, IA and navigation', v:'Every recommendation the team has written assumes it holds. This is where the standard is decided and where you must be in the room.' },
        { k:'Access and identity', v:'In an HCP portal, "who gets served what" is the same question as "what is indexable". The paywall model lives or dies here.' },
        { k:'Templates and components', v:'The only place a standard gets built in once instead of re-argued twenty times.' }
      ]},
      { t:'p', v:'Two more are worth watching but rarely worth intervening in: personalisation, and on-site search. The rest — events, forms, email governance — you can let pass with a glance.' },
      { t:'callout', k:'The sentence to keep', v:'A guideline built into the component is met by every market that uses it. A guideline written in a recommendation is met by the markets that had time to read it.' }
    ]}
]
};
