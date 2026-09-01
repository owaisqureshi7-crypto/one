/* One AZ <> SEO Liaison Desk — vanilla JS, no build step, no network.
   State lives in localStorage; the seed files are the starting point only. */

(function () {
'use strict';

var KEY = 'oneaz-liaison-v2';
var TODAY = new Date().toISOString().slice(0, 10);
var S = null;

/* ------------------------------------------------------------ utilities */
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}
function uid(p) { return (p || 'x') + '-' + Math.random().toString(36).slice(2, 8); }
function clone(o) { return JSON.parse(JSON.stringify(o)); }
function byId(arr, id) { for (var i = 0; i < arr.length; i++) if (arr[i].id === id) return arr[i]; return null; }
function daysSince(d) { if (!d) return null; return Math.floor((Date.parse(TODAY) - Date.parse(d)) / 864e5); }
function daysUntil(d) { if (!d) return null; return Math.floor((Date.parse(d) - Date.parse(TODAY)) / 864e5); }
function fmt(d) {
  if (!d) return '—';
  var p = d.split('-');
  var M = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  if (p.length === 2) return M[+p[1] - 1] + ' ' + p[0].slice(2);
  if (p.length < 3) return d;
  return +p[2] + ' ' + M[+p[1] - 1] + ' ' + p[0].slice(2);
}
function toast(msg) {
  var t = document.getElementById('toast');
  t.textContent = msg; t.hidden = false;
  clearTimeout(toast._t); toast._t = setTimeout(function () { t.hidden = true; }, 2200);
}
function marketName(code) {
  var m = byId2(S.markets, code); return m ? m.name : code;
}
function byId2(arr, code) { for (var i = 0; i < arr.length; i++) if (arr[i].code === code) return arr[i]; return null; }

/* ------------------------------------------------------------- storage */
function withRollout(items) {
  var R = window.DATA_EXPLAIN.rollout;
  items.forEach(function (p) {
    if (p.rollout) return;
    var r = R[p.id];
    p.rollout = r ? r.state : (p.status === 'delivered' ? 'live' : p.status === 'spike' ? 'spike' :
      p.status === 'blocked' ? 'blocked' : 'building');
  });
  return items;
}
function seed() {
  return {
    v: 2, updated: TODAY,
    markets: clone(window.DATA_CORE.markets),
    stakeholders: clone(window.DATA_CORE.stakeholders),
    product: withRollout(clone(window.DATA_PRODUCT.items)),
    pi: clone(window.DATA_PRODUCT.pi),
    blockers: clone(window.DATA_MARKET.blockers),
    projects: clone(window.DATA_MARKET.projects),
    deliverables: clone(window.DATA_DELIVERABLES),
    events: clone(window.DATA_VIEWS.events),
    docs: clone(window.DATA_DOCS.docs),
    sharedLinks: clone(window.DATA_SITEMAP.shared),
    marketSites: clone(window.DATA_SITEMAP.sites),
    marketLinks: {},
    learnDone: {},
    assessments: [],
    log: []
  };
}
function load() {
  try {
    var raw = localStorage.getItem(KEY);
    if (raw) {
      var p = JSON.parse(raw);
      if (p && p.product) {
        if (!p.events) p.events = clone(window.DATA_VIEWS.events);
        if (!p.docs) p.docs = clone(window.DATA_DOCS.docs);
        if (!p.sharedLinks) p.sharedLinks = clone(window.DATA_SITEMAP.shared);
        if (!p.marketSites) p.marketSites = clone(window.DATA_SITEMAP.sites);
        if (!p.marketLinks) p.marketLinks = {};
        if (!p.learnDone) p.learnDone = {};
        if (!p.assessments) p.assessments = [];
        withRollout(p.product);
        p.product.forEach(function (x) { if (x.due === undefined) x.due = ''; });
        return p;
      }
    }
  } catch (e) { /* private mode, blocked storage — fall through to seed */ }
  return seed();
}
function save() {
  S.updated = TODAY;
  try { localStorage.setItem(KEY, JSON.stringify(S)); }
  catch (e) { toast('Could not save to this browser — export a backup instead'); }
  if (window.SYNC && SYNC.state.on) {
    clearTimeout(save._t);
    save._t = setTimeout(function () {
      SYNC.push(S).then(function (r) {
        if (r && r.conflict) toast('Not saved to the server — someone else saved first. Pull, then redo.');
        else if (r && !r.ok && !r.skipped) toast('Server save failed: ' + SYNC.state.error);
        var d = document.getElementById('sync-line');
        if (d) d.textContent = syncLine();
      });
    }, 900);
  }
}
function syncLine() {
  if (!window.SYNC) return '';
  var s = SYNC.state;
  if (!SYNC.available()) return 'Local file — sync is off. Serve this folder over https to enable it.';
  if (!s.on) return 'Not connected. Enter your desk key to sync with the server. Endpoint: ' + SYNC.endpoint();
  if (s.error) return 'Last attempt failed: ' + s.error;
  return 'Connected (' + (s.backend || 'server') + ') · version ' + (s.version === null ? '?' : s.version) +
    (s.last ? ' · saved ' + s.last.replace('T', ' ').slice(0, 16) + ' UTC' : '') +
    ' · ' + SYNC.endpoint();
}

/* --------------------------------------------------------- derived data */
function needsMarkets(it) { return (it.flag === 'to-markets' || it.flag === 'both') && !it.comms.markets; }
function needsProduct(it) { return (it.flag === 'to-product' || it.flag === 'both') && !it.comms.product; }
function blockerNeedsProduct(b) { return !b.toldProduct && b.status !== 'Closed' && (b.priority === 'Critical' || b.priority === 'High'); }
function blockerNeedsMarkets(b) { return !b.toldMarkets && b.status !== 'Closed'; }
function openBlockers() { return S.blockers.filter(function (b) { return b.status !== 'Closed'; }); }

function marketBlockers(code) {
  return S.blockers.filter(function (b) {
    return b.markets.indexOf(code) >= 0 || b.markets.indexOf('ALL') >= 0;
  });
}
function marketProduct(code) {
  return S.product.filter(function (p) {
    return p.markets.indexOf(code) >= 0 || p.markets.indexOf('ALL') >= 0;
  });
}
function marketDeliverables(code) {
  var extra = ['HR','RS','SI','BG'].indexOf(code) >= 0 ? 'BALKANS' : null;
  return S.deliverables.filter(function (d) { return d.m === code || (extra && d.m === extra); });
}
function marketProjects(code) {
  return S.projects.filter(function (p) { return p.market === code || p.market === 'ALL'; });
}
function upcoming(days) {
  var out = [];
  S.projects.forEach(function (p) {
    (p.milestones || []).forEach(function (m) {
      if (m.done || !m.date) return;
      var d = daysUntil(m.date);
      if (d !== null && d <= days) out.push({ p: p, m: m, d: d });
    });
  });
  return out.sort(function (a, b) { return a.d - b.d; });
}

var SEV = { high: 'risk', medium: 'warn', low: 'ghost' };
var PRIO = { Critical: 'risk', High: 'warn', Medium: 'info', Low: 'ghost' };
var STAT = { delivered: 'ok', 'on-track': 'ok', 'at-risk': 'warn', blocked: 'risk', spike: 'info' };
var DSTAT = { done: 'ok', implemented: 'ok', 'in-progress': 'warn', 'not-started': 'risk', unknown: 'ghost', other: 'ghost' };
var ONEAZ = {
  implemented: ['ok', 'Implemented'], 'in-process': ['warn', 'In process'],
  proposed: ['info', 'Proposed'], 'not-started': ['risk', 'Not started'],
  baseline: ['ghost', 'Baseline only'], watch: ['info', 'Watch'], 'out-of-scope': ['ghost', 'Out of scope']
};

/* ------------------------------------------------------------ chrome */
var NAV = [
  ['', 'Dashboard'], ['learn', 'Learn'], ['product', 'Product'],
  ['markets', 'Markets'], ['blockers', 'Blockers'], ['projects', 'Projects'],
  ['paywall', 'Paywall'], ['check', 'Checklist'], ['people', 'People'],
  ['docs', 'Documents'], ['brief', 'Briefings']
];
var NAV_ALIAS = {
  pmap: 'product', ptime: 'product', pstruct: 'product',
  map: 'markets', links: 'markets', cal: 'people', glossary: 'learn'
};
function renderNav() {
  var cur = (location.hash.replace('#/', '').split('/')[0]) || '';
  var counts = {
    product: S.product.filter(function (p) { return needsMarkets(p) || needsProduct(p); }).length,
    blockers: openBlockers().length
  };
  if (NAV_ALIAS[cur]) cur = NAV_ALIAS[cur];
  document.getElementById('nav').innerHTML = NAV.map(function (n) {
    var on = n[0] === cur ? ' class="on"' : '';
    var c = counts[n[0]] ? '<span class="n">' + counts[n[0]] + '</span>' : '';
    return '<a href="#/' + n[0] + '"' + on + '>' + esc(n[1]) + c + '</a>';
  }).join('');
}

/* ------------------------------------------------------------- drawer */
function openDrawer(html) {
  var d = document.getElementById('drawer');
  d.innerHTML = html; d.hidden = false;
  document.getElementById('drawer-scrim').hidden = false;
  d.scrollTop = 0;
}
function closeDrawer() {
  document.getElementById('drawer').hidden = true;
  document.getElementById('drawer-scrim').hidden = true;
}
function dv(name) {
  var el = document.querySelector('#drawer [name="' + name + '"]');
  return el ? el.value.trim() : '';
}
function dchecks(name) {
  return Array.prototype.slice.call(document.querySelectorAll('#drawer input[data-group="' + name + '"]:checked'))
    .map(function (i) { return i.value; });
}

/* ============================================================ DASHBOARD */
function viewDashboard() {
  var flagM = S.product.filter(needsMarkets);
  var flagP = S.product.filter(needsProduct);
  var bP = openBlockers().filter(blockerNeedsProduct);
  var bM = openBlockers().filter(blockerNeedsMarkets);
  var soon = upcoming(45);
  var crit = openBlockers().filter(function (b) { return b.priority === 'Critical'; });

  function tile(k, l, f, cls) {
    return '<div class="card stat' + (cls ? ' ' + cls : '') + '"><div class="k num">' + k + '</div>' +
      '<div class="l">' + esc(l) + '</div>' + (f ? '<div class="f">' + esc(f) + '</div>' : '') + '</div>';
  }

  var h = '<div class="page-head"><div class="eyebrow">Liaison desk</div>' +
    '<h1>Where everything stands today</h1>' +
    '<p>Two directions, one person in the middle. Standards out to the markets through the SEO team; ' +
    'market reality back to the product through you. This page is only the things that are waiting on you.</p></div>';

  h += '<div class="grid g-4">' +
    tile(flagM.length, 'Product changes to flag to markets', flagM.length ? 'Not yet cascaded' : 'All cascaded', flagM.length ? 'alert' : '') +
    tile(flagP.length, 'Items to raise with the product team', flagP.length ? 'Ask not yet made' : 'Nothing outstanding', flagP.length ? 'alert' : '') +
    tile(openBlockers().length, 'Open market blockers', crit.length + ' critical') +
    tile(soon.length, 'Milestones in the next 45 days', soon.length ? 'Next: ' + fmt(soon[0].m.date) : '—') +
    '</div>';

  /* Filters + two lanes */
  h += '<div class="filters" style="margin-top:20px">' +
    sel('df-market', df.market, [['', 'All markets']].concat(
      S.markets.filter(function (m) { return marketProduct(m.code).length || marketBlockers(m.code).length; })
        .map(function (m) { return [m.code, m.name]; }))) +
    sel('df-band', df.band, [['', 'All urgency'], ['now', 'Now'], ['soon', 'Soon'], ['watch', 'Watch']]) +
    sel('df-sort', df.sort, [['urgency', 'Sort: urgency'], ['due', 'Sort: due date'], ['market', 'Sort: market'], ['title', 'Sort: A–Z']]) +
    '<input type="search" id="df-q" placeholder="Search…" value="' + esc(df.q) + '">' +
    (df.market || df.band || df.q ? '<button class="btn btn-sm" data-act="df-clear">Clear</button>' : '') +
    '<span class="spacer"></span>' +
    '<span class="src">Urgency = SEO impact + delivery status + how close the due date is</span></div>';

  h += '<div class="grid g-2">' +
    laneCard('markets', 'Flag to markets', 'standards out') +
    laneCard('product', 'Raise with product', 'requirements in') +
    '</div>';

  /* Milestones + cadence */
  h += '<div class="section grid g-side">';
  h += '<div class="card"><div class="card-head"><h2>Next 45 days</h2><span class="sub">Across every project</span></div>';
  if (!soon.length) h += '<div class="empty">Nothing dated in the next 45 days.</div>';
  else {
    h += '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Date</th><th>Milestone</th><th>Project</th><th>Owner</th></tr></thead><tbody>';
    soon.forEach(function (x) {
      var late = x.d < 0;
      h += '<tr class="clickable" data-open="project" data-id="' + esc(x.p.id) + '"><td class="nowrap">' +
        (late ? '<span class="pill risk">' + Math.abs(x.d) + 'd late</span> ' : '') + fmt(x.m.date) + '</td>' +
        '<td>' + esc(x.m.what) + '</td><td class="nowrap">' + esc(x.p.name) + '</td><td class="nowrap">' + esc(x.m.owner) + '</td></tr>';
    });
    h += '</tbody></table></div>';
  }
  h += '</div>';

  var cad = window.DATA_CORE.cadence;
  h += '<div><div class="card card-pad"><div class="eyebrow">Standing cadence</div>' +
    '<div style="font-weight:600;margin-bottom:8px">' + esc(cad.standing) + '</div>' +
    '<div class="src">Agenda template lives in Briefings — generate it before the meeting.</div>' +
    '<div class="btn-row" style="margin-top:12px"><a class="btn btn-sm" href="#/brief">Open briefings</a></div></div>';

  h += '<div class="card card-pad" style="margin-top:14px"><div class="eyebrow">Where changes come from</div><ul class="list-plain" style="margin-top:6px">' +
    cad.sources.map(function (s) { return '<li style="padding:7px 0;border-bottom:1px solid var(--line)">' + esc(s) + '</li>'; }).join('') +
    '</ul></div></div></div>';

  return h;
}

/* ======================================================== PRODUCT RADAR */
var pf = { seo: '', status: '', flag: '', q: '' };
function viewProduct() {
  var pi = S.pi;
  var h = '<div class="page-head"><div class="eyebrow">Product side</div>' +
    '<h1>Product radar</h1>' +
    '<p>Every One AZ item that could change what the markets have to do, with the SEO and GEO read attached, ' +
    'and a record of whether you have actually told anyone. Items marked <em>draft</em> are a first-pass read — confirm them before you quote them.</p></div>';

  h += subtabs(PRODTABS, 'product');
  h += '<div class="card card-pad" style="margin-bottom:14px"><div class="grid g-2" style="gap:18px">' +
    '<div><div class="eyebrow">' + esc(pi.name) + '</div><div style="font-weight:600">' + esc(pi.window) + '</div>' +
    '<div class="src" style="margin-top:4px">Planned ' + esc(pi.planned) + ' · releases: ' + pi.releases.map(esc).join(' · ') + '</div></div>' +
    '<div class="pipe" style="margin:0">' + pi.sprints.map(function (s) {
      return '<div class="step">S' + s.n + '<br><span style="font-weight:400;text-transform:none;letter-spacing:0">' + esc(s.dates) + '</span></div>';
    }).join('') + '</div></div></div>';

  h += '<div class="filters">' +
    sel('pf-seo', pf.seo, [['', 'All SEO impact'], ['high', 'High impact'], ['medium', 'Medium'], ['low', 'Low']]) +
    sel('pf-status', pf.status, [['', 'All status'], ['on-track', 'On track'], ['at-risk', 'At risk'], ['blocked', 'Blocked'], ['spike', 'Spike'], ['delivered', 'Delivered']]) +
    sel('pf-flag', pf.flag, [['', 'All items'], ['needM', 'Needs flagging to markets'], ['needP', 'Needs raising with product'], ['draft', 'Assessment still draft']]) +
    '<input type="search" id="pf-q" placeholder="Search title, ticket, market…" value="' + esc(pf.q) + '">' +
    '<span class="spacer"></span><button class="btn btn-primary btn-sm" data-act="new-product">+ Log a change</button></div>';

  var rows = S.product.filter(function (p) {
    if (pf.seo && p.seo !== pf.seo) return false;
    if (pf.status && p.status !== pf.status) return false;
    if (pf.flag === 'needM' && !needsMarkets(p)) return false;
    if (pf.flag === 'needP' && !needsProduct(p)) return false;
    if (pf.flag === 'draft' && p.assessment !== 'draft') return false;
    if (pf.q) {
      var t = (p.id + ' ' + p.title + ' ' + p.ws + ' ' + p.markets.join(' ') + ' ' + p.why).toLowerCase();
      if (t.indexOf(pf.q.toLowerCase()) < 0) return false;
    }
    return true;
  });
  var rank = { high: 0, medium: 1, low: 2 };
  function rk(v) { return rank.hasOwnProperty(v) ? rank[v] : 3; }
  rows.sort(function (x, y) {
    var f = (needsMarkets(y) || needsProduct(y)) - (needsMarkets(x) || needsProduct(x));
    if (f) return f;
    return rk(x.seo) - rk(y.seo);
  });

  h += '<div class="card"><div class="tbl-wrap"><table class="tbl"><thead><tr>' +
    '<th>Item</th><th>Workstream</th><th>Timing</th><th>SEO/GEO</th><th>Status</th><th>Markets</th><th>Told</th></tr></thead><tbody>';
  if (!rows.length) h += '<tr><td colspan="7"><div class="empty">Nothing matches those filters.</div></td></tr>';
  rows.forEach(function (p) {
    var told = '';
    told += p.comms.markets ? '<span class="pill ok">Mkts ' + fmt(p.comms.markets) + '</span>' :
      (needsMarkets(p) ? '<span class="pill risk">Mkts due</span>' : '');
    told += p.comms.product ? '<span class="pill ok">Prod ' + fmt(p.comms.product) + '</span>' :
      (needsProduct(p) ? '<span class="pill risk">Prod due</span>' : '');
    if (!told) told = '<span class="src">—</span>';
    h += '<tr class="clickable" data-open="product" data-id="' + esc(p.id) + '">' +
      '<td><div class="t">' + esc(p.title) + '</div><div class="d mono">' + esc(p.id) +
      (p.assessment === 'draft' ? ' · <span class="pill ghost">draft read</span>' : '') + '</div></td>' +
      '<td class="nowrap">' + esc(p.ws) + '</td>' +
      '<td class="nowrap">' + esc(p.sprint) + '</td>' +
      '<td><span class="pill ' + (SEV[p.seo] || 'ghost') + '">' + esc(p.seo) + '</span></td>' +
      '<td><span class="pill ' + (STAT[p.status] || 'ghost') + '">' + esc(p.status) + '</span></td>' +
      '<td class="src">' + p.markets.map(esc).join(', ') + '</td>' +
      '<td class="nowrap">' + told + '</td></tr>';
  });
  h += '</tbody></table></div></div>';
  return h;
}

function sel(id, val, opts) {
  return '<select id="' + id + '">' + opts.map(function (o) {
    return '<option value="' + esc(o[0]) + '"' + (o[0] === val ? ' selected' : '') + '>' + esc(o[1]) + '</option>';
  }).join('') + '</select>';
}

function drawerProduct(id) {
  var p = byId(S.product, id);
  if (!p) return;
  var mk = S.markets.map(function (m) { return m.code; });
  var h = '<div class="drawer-head"><div><h2>' + esc(p.title) + '</h2>' +
    '<div class="meta mono">' + esc(p.id) + ' · ' + esc(p.ws) + ' · ' + esc(p.sprint) + '</div></div>' +
    '<button class="btn btn-ghost" data-act="close">✕</button></div><div class="drawer-body">';

  h += '<div class="btn-row" style="margin-bottom:14px">' +
    '<span class="pill ' + (SEV[p.seo] || 'ghost') + '">' + esc(p.seo) + ' SEO/GEO impact</span>' +
    '<span class="pill ' + (STAT[p.status] || 'ghost') + '">' + esc(p.status) + '</span>' +
    '<span class="pill ' + (p.assessment === 'draft' ? 'warn' : 'ok') + '">' + (p.assessment === 'draft' ? 'Draft read — confirm' : 'Confirmed') + '</span>' +
    (function () {
      var r = window.DATA_EXPLAIN.rolloutStates[p.rollout || 'building'];
      return r ? '<span class="pill ' + r[0] + '">' + esc(r[1]) + '</span>' : '';
    })() +
    (p.due ? '<span class="pill ' + (daysUntil(p.due) < 0 ? 'risk' : 'ghost') + '">due ' + fmt(p.due) + '</span>' : '') +
    '</div>';

  h += '<div class="prose"><p>' + esc(p.why) + '</p></div>';

  h += '<div class="divider"></div><div class="def">' +
    '<dt>Markets</dt><dd>' + p.markets.map(function (c) { return c === 'ALL' ? 'All markets' : esc(marketName(c)); }).join(', ') + '</dd>' +
    '<dt>Tags</dt><dd>' + p.tags.map(function (t) { return '<span class="pill ghost">' + esc(t) + '</span>'; }).join(' ') + '</dd>' +
    '</div>';

  h += '<div class="divider"></div>';
  h += '<div class="note-box"><strong>Flag to markets</strong><br>' + esc(p.toMarkets || '—') + '</div>';
  h += '<div class="note-box warn" style="margin-top:10px"><strong>Raise with product</strong><br>' + esc(p.toProduct || '—') + '</div>';

  h += '<div class="divider"></div><div class="field-row">' +
    '<div class="field"><label>Told the markets on</label><input type="date" name="cm" value="' + esc(p.comms.markets) + '"></div>' +
    '<div class="field"><label>Raised with product on</label><input type="date" name="cp" value="' + esc(p.comms.product) + '"></div></div>';
  h += '<div class="field"><label>Your notes</label><textarea name="notes" placeholder="What was actually said, what came back, what is still open.">' + esc(p.notes || '') + '</textarea></div>';

  h += '<details class="cl-group" style="margin-top:14px"><summary>Edit the item</summary><div class="items" style="padding:16px">' +
    '<div class="field"><label>Title</label><input type="text" name="title" value="' + esc(p.title) + '"></div>' +
    '<div class="field-row">' +
    '<div class="field"><label>SEO/GEO impact</label>' + selN('seo', p.seo, ['high', 'medium', 'low']) + '</div>' +
    '<div class="field"><label>Status</label>' + selN('status', p.status, ['on-track', 'at-risk', 'blocked', 'spike', 'delivered']) + '</div></div>' +
    '<div class="field-row">' +
    '<div class="field"><label>Workstream</label><input type="text" name="ws" value="' + esc(p.ws) + '"></div>' +
    '<div class="field"><label>Timing</label><input type="text" name="sprint" value="' + esc(p.sprint) + '"></div></div>' +
    '<div class="field-row">' +
    '<div class="field"><label>Rollout state</label>' + selN('rollout', p.rollout || 'building', ['live', 'building', 'spike', 'planned', 'blocked']) + '</div>' +
    '<div class="field"><label>Tell someone by</label><input type="date" name="due" value="' + esc(p.due || '') + '"></div></div>' +
    '<div class="field"><label>Flag direction</label>' + selN('flag', p.flag, ['none', 'to-markets', 'to-product', 'both']) + '</div>' +
    '<div class="field"><label>Assessment</label>' + selN('assessment', p.assessment, ['draft', 'confirmed']) + '</div>' +
    '<div class="field"><label>Why it matters for SEO / GEO</label><textarea name="why">' + esc(p.why) + '</textarea></div>' +
    '<div class="field"><label>What the markets need to know</label><textarea name="toMarkets">' + esc(p.toMarkets) + '</textarea></div>' +
    '<div class="field"><label>What to ask the product team</label><textarea name="toProduct">' + esc(p.toProduct) + '</textarea></div>' +
    '<div class="field"><label>Markets affected</label><div class="chips">' +
    ['ALL'].concat(mk).map(function (c) {
      var on = p.markets.indexOf(c) >= 0;
      return '<label class="chip' + (on ? ' on' : '') + '"><input type="checkbox" data-group="markets" value="' + esc(c) + '"' + (on ? ' checked' : '') + '>' + esc(c === 'ALL' ? 'All' : c) + '</label>';
    }).join('') + '</div></div>' +
    '<div class="field"><label>Tags</label><div class="chips">' +
    window.DATA_CORE.featureTags.map(function (t) {
      var on = p.tags.indexOf(t.id) >= 0;
      return '<label class="chip' + (on ? ' on' : '') + '"><input type="checkbox" data-group="tags" value="' + esc(t.id) + '"' + (on ? ' checked' : '') + '>' + esc(t.label) + '</label>';
    }).join('') + '</div></div>' +
    '<button class="btn btn-danger btn-sm" data-act="del-product" data-id="' + esc(p.id) + '">Delete this item</button>' +
    '</div></details>';

  h += '</div><div class="drawer-foot">' +
    '<button class="btn" data-act="close">Cancel</button>' +
    '<button class="btn btn-primary" data-act="save-product" data-id="' + esc(p.id) + '">Save</button></div>';
  openDrawer(h);
}
function selN(name, val, opts) {
  return '<select name="' + name + '">' + opts.map(function (o) {
    return '<option value="' + esc(o) + '"' + (o === val ? ' selected' : '') + '>' + esc(o) + '</option>';
  }).join('') + '</select>';
}

/* ============================================================= MARKETS */
function viewMarkets() {
  var h = '<div class="page-head"><div class="eyebrow">Market side</div><h1>Markets</h1>' +
    '<p>One row per market: where One AZ adoption stands, what is running, what is blocked, and whether the blockers have been communicated. Click a row for the full market view.</p></div>';
  h += subtabs(MKTTABS, 'markets');

  var groups = {};
  S.markets.forEach(function (m) { (groups[m.cluster] = groups[m.cluster] || []).push(m); });

  window.DATA_CORE.clusters.forEach(function (cl) {
    if (!groups[cl]) return;
    h += '<div class="section"><h2>' + esc(cl) + '</h2><div class="card"><div class="tbl-wrap"><table class="tbl"><thead><tr>' +
      '<th>Market</th><th>One AZ</th><th>Delivered</th><th>Live now</th><th>Blockers</th><th>Not communicated</th><th>Projects</th></tr></thead><tbody>';
    groups[cl].forEach(function (m) {
      var dl = marketDeliverables(m.code);
      var live = dl.filter(function (d) { return d.st === 'in-progress' || d.st === 'not-started'; }).length;
      var bl = marketBlockers(m.code).filter(function (b) { return b.status !== 'Closed'; });
      var uncomm = bl.filter(function (b) { return blockerNeedsMarkets(b) || blockerNeedsProduct(b); }).length;
      var st = ONEAZ[m.oneAz] || ['ghost', m.oneAz];
      h += '<tr class="clickable" data-open="market" data-id="' + esc(m.code) + '">' +
        '<td><div class="t">' + esc(m.name) + '</div><div class="d mono">' + esc(m.sites.join(' · ')) + '</div></td>' +
        '<td><span class="pill ' + st[0] + '">' + esc(st[1]) + '</span></td>' +
        '<td class="num">' + dl.length + '</td>' +
        '<td class="num">' + (live || '<span class="src">—</span>') + '</td>' +
        '<td class="num">' + (bl.length ? '<span class="pill ' + (bl.some(function (b) { return b.priority === 'Critical'; }) ? 'risk' : 'warn') + '">' + bl.length + '</span>' : '<span class="src">0</span>') + '</td>' +
        '<td class="num">' + (uncomm ? '<span class="pill risk">' + uncomm + '</span>' : '<span class="src">—</span>') + '</td>' +
        '<td class="src">' + marketProjects(m.code).filter(function (p) { return p.market === m.code; }).length + '</td></tr>';
    });
    h += '</tbody></table></div></div></div>';
  });
  return h;
}

function viewMarket(code) {
  var m = byId2(S.markets, code);
  if (!m) return '<div class="empty">Unknown market.</div>';
  var dl = marketDeliverables(code), bl = marketBlockers(code), pj = marketProjects(code), pr = marketProduct(code);
  var st = ONEAZ[m.oneAz] || ['ghost', m.oneAz];

  var h = '<div class="page-head"><div class="eyebrow"><a href="#/markets">Markets</a> · <a href="#/map">Map</a> · ' + esc(m.cluster) + '</div>' +
    '<div class="li-top" style="align-items:flex-start"><h1 style="margin:0 0 4px">' + esc(m.name) +
    ' <span class="pill ' + st[0] + '" style="vertical-align:6px">' + esc(st[1]) + '</span></h1>' +
    '<button class="btn btn-sm" data-act="edit-market" data-id="' + esc(code) + '">Edit market</button></div>' +
    '<p>' + esc(m.headline) + '</p>' + (m.notes ? '<div class="note-box" style="margin-top:10px">' + esc(m.notes) + '</div>' : '') + '</div>';

  h += '<div class="grid g-4">' +
    '<div class="card stat"><div class="k num">' + dl.length + '</div><div class="l">Deliverables logged</div></div>' +
    '<div class="card stat"><div class="k num">' + dl.filter(function (d) { return d.st === 'implemented'; }).length + '</div><div class="l">Market-confirmed implemented</div></div>' +
    '<div class="card stat' + (bl.filter(function (b) { return b.status !== 'Closed'; }).length ? ' alert' : '') + '"><div class="k num">' + bl.filter(function (b) { return b.status !== 'Closed'; }).length + '</div><div class="l">Open blockers</div></div>' +
    '<div class="card stat"><div class="k num">' + pj.filter(function (p) { return p.market === code; }).length + '</div><div class="l">Projects owned here</div></div>' +
    '</div>';

  h += '<div class="section grid g-side">';
  h += '<div>';

  /* projects */
  h += '<div class="card"><div class="card-head"><h2>Projects</h2></div>';
  var own = pj.filter(function (p) { return p.market === code; });
  var shared = pj.filter(function (p) { return p.market === 'ALL'; });
  if (!own.length && !shared.length) h += '<div class="empty">No projects mapped to this market.</div>';
  else {
    h += '<ul class="list-plain">';
    own.concat(shared).forEach(function (p) {
      h += '<li class="clickable" data-open="project" data-id="' + esc(p.id) + '">' +
        '<div class="li-top"><span class="t">' + esc(p.name) + (p.market === 'ALL' ? ' <span class="pill ghost">cross-market</span>' : '') + '</span>' +
        '<span class="pill ' + (p.rag === 'green' ? 'ok' : p.rag === 'amber' ? 'warn' : 'risk') + '">' + esc(p.status) + '</span></div>' +
        '<div class="li-sub">' + esc(p.phase) + '</div></li>';
    });
    h += '</ul>';
  }
  h += '</div>';

  /* market plan — gantt across every project touching this market */
  var mt = [];
  pj.forEach(function (p) {
    (window.DATA_VIEWS.projectTasks[p.id] || []).forEach(function (t) {
      mt.push({ name: t.name, start: t.start, end: t.end, owner: t.owner, status: t.status,
        lane: (p.market === 'ALL' ? '◇ ' : '') + p.name.split(' —')[0] });
    });
  });
  if (mt.length) {
    h += '<div class="card" style="margin-top:14px"><div class="card-head"><h2>Plan</h2>' +
      '<span class="sub">Every project touching this market, on one timeline</span></div>' +
      '<div class="card-pad">' + gantt(mt, 'Task') + '</div></div>';
  }

  /* blockers */
  h += '<div class="card" style="margin-top:14px"><div class="card-head"><h2>Blockers and limitations</h2>' +
    '<span class="sub">Communicated state shown per row</span></div>';
  if (!bl.length) h += '<div class="empty">Nothing recorded for this market.</div>';
  else {
    h += '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Blocker</th><th>Topic</th><th>Priority</th><th>Markets told</th><th>Product told</th></tr></thead><tbody>';
    bl.forEach(function (b) {
      h += '<tr class="clickable" data-open="blocker" data-id="' + esc(b.id) + '">' +
        '<td><div class="t">' + esc(b.title) + '</div><div class="d">' + esc(b.status) + (b.markets.indexOf('ALL') >= 0 ? ' · applies to all markets' : '') + '</div></td>' +
        '<td class="src">' + esc(b.topic) + '</td>' +
        '<td><span class="pill ' + (PRIO[b.priority] || 'ghost') + '">' + esc(b.priority) + '</span></td>' +
        '<td class="nowrap">' + (b.toldMarkets ? '<span class="pill ok">' + fmt(b.toldMarkets) + '</span>' : '<span class="pill risk">not yet</span>') + '</td>' +
        '<td class="nowrap">' + (b.toldProduct ? '<span class="pill ok">' + fmt(b.toldProduct) + '</span>' : '<span class="pill risk">not yet</span>') + '</td></tr>';
    });
    h += '</tbody></table></div>';
  }
  h += '</div>';

  /* product items landing here */
  h += '<div class="card" style="margin-top:14px"><div class="card-head"><h2>Product items that land here</h2>' +
    '<span class="sub">' + pr.length + ' item' + (pr.length === 1 ? '' : 's') + '</span></div>';
  h += '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Item</th><th>SEO/GEO</th><th>Status</th><th>Told markets</th></tr></thead><tbody>';
  pr.forEach(function (p) {
    h += '<tr class="clickable" data-open="product" data-id="' + esc(p.id) + '">' +
      '<td><div class="t">' + esc(p.title) + '</div><div class="d mono">' + esc(p.id) + (p.markets.indexOf('ALL') >= 0 ? ' · all markets' : '') + '</div></td>' +
      '<td><span class="pill ' + (SEV[p.seo] || 'ghost') + '">' + esc(p.seo) + '</span></td>' +
      '<td><span class="pill ' + (STAT[p.status] || 'ghost') + '">' + esc(p.status) + '</span></td>' +
      '<td class="nowrap">' + (p.comms.markets ? '<span class="pill ok">' + fmt(p.comms.markets) + '</span>' : (needsMarkets(p) ? '<span class="pill risk">due</span>' : '<span class="src">n/a</span>')) + '</td></tr>';
  });
  h += '</tbody></table></div></div>';

  /* deliverables */
  var open = dl.filter(function (d) { return d.st === 'in-progress' || d.st === 'not-started'; });
  h += '<div class="card" style="margin-top:14px"><div class="card-head"><h2>Delivery record</h2>' +
    '<span class="sub">' + dl.length + ' logged · ' + open.length + ' live now</span></div>';
  h += '<div class="tbl-wrap" style="max-height:520px;overflow-y:auto"><table class="tbl"><thead><tr><th>Deliverable</th><th>Date</th><th>Status</th></tr></thead><tbody>';
  dl.slice().sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); }).forEach(function (d) {
    h += '<tr><td><div>' + esc(d.d) + '</div>' + (d.note ? '<div class="d">' + esc(d.note) + '</div>' : '') +
      (d.site && d.site !== m.sites[0] ? '<div class="d mono">' + esc(d.site) + '</div>' : '') + '</td>' +
      '<td class="nowrap src">' + fmt(d.date) + '</td>' +
      '<td><span class="pill ' + (DSTAT[d.st] || 'ghost') + '">' + esc(d.st) + '</span></td></tr>';
  });
  h += '</tbody></table></div></div>';
  h += '</div>';

  /* sidebar */
  h += '<div><div class="card card-pad"><div class="eyebrow">Team</div><div class="def" style="grid-template-columns:110px 1fr">' +
    '<dt>Strategist</dt><dd>' + esc(m.strategist) + '</dd>' +
    '<dt>Delivery</dt><dd>' + esc(m.delivery) + '</dd>' +
    '<dt>Cluster</dt><dd>' + esc(m.cluster) + '</dd></div></div>';

  if (m.contacts && m.contacts.length) {
    h += '<div class="card card-pad" style="margin-top:14px"><div class="eyebrow">Market contacts</div>' +
      '<div class="def" style="grid-template-columns:1fr;gap:9px">' +
      m.contacts.map(function (c) {
        return '<div><div class="src" style="text-transform:uppercase;letter-spacing:.05em;font-weight:700">' + esc(c.role) + '</div>' + esc(c.name) + '</div>';
      }).join('') + '</div></div>';
  }
  h += '<div class="card card-pad" style="margin-top:14px"><div class="eyebrow">Properties</div>' +
    m.sites.map(function (s) { return '<div class="mono" style="padding:3px 0">' + esc(s) + '</div>'; }).join('') + '</div>';

  h += '<div class="card card-pad" style="margin-top:14px"><div class="eyebrow">Migration package model</div>' +
    window.DATA_MARKET.migrationModel.map(function (p) {
      return '<div style="padding:8px 0;border-bottom:1px solid var(--line)"><div style="font-weight:600;font-size:12.5px">' + esc(p.pkg) + ' · ' + esc(p.what) + '</div>' +
        '<div class="src">Needs: ' + esc(p.needs) + '</div></div>';
    }).join('') + '</div>';

  h += '</div></div>';
  return h;
}

/* ============================================================ BLOCKERS */
var bf = { topic: '', prio: '', comm: '' };
function viewBlockers() {
  var h = '<div class="page-head"><div class="eyebrow">Market limitations</div><h1>Blockers</h1>' +
    '<p>What stops a One AZ feature landing in a given market, and whether anyone has been told. ' +
    'Fields match the EUCAN SEO Blocker Review workbook, plus the two columns this desk needs: told markets, told product.</p></div>';

  h += '<div class="filters">' +
    sel('bf-topic', bf.topic, [['', 'All topics']].concat(window.DATA_CORE.blockerTopics.map(function (t) { return [t, t]; }))) +
    sel('bf-prio', bf.prio, [['', 'All priorities'], ['Critical', 'Critical'], ['High', 'High'], ['Medium', 'Medium'], ['Low', 'Low']]) +
    sel('bf-comm', bf.comm, [['', 'All'], ['needM', 'Markets not told'], ['needP', 'Product not told'], ['unver', 'Unverified — confirm or delete']]) +
    '<span class="spacer"></span><button class="btn btn-primary btn-sm" data-act="new-blocker">+ Log a blocker</button></div>';

  /* matrix */
  var cats = window.DATA_CORE.blockerTopics.filter(function (t) {
    return S.blockers.some(function (b) { return b.topic === t; });
  });
  function ownB(code) {
    return S.blockers.filter(function (b) { return b.status !== 'Closed' && b.markets.indexOf(code) >= 0; });
  }
  var crossAll = S.blockers.filter(function (b) { return b.status !== 'Closed' && b.markets.indexOf('ALL') >= 0; });
  var mks = S.markets.filter(function (m) { return ownB(m.code).length; });

  function cellFor(list, code) {
    var lv = 0;
    list.forEach(function (b) { lv = Math.max(lv, b.priority === 'Critical' ? 3 : b.priority === 'High' ? 2 : 1); });
    return '<td class="cell lv' + lv + '"' + (list.length && code ? ' data-mfilter="' + esc(code) + '"' : '') +
      '>' + (list.length || '&middot;') + '</td>';
  }

  h += '<div class="card" style="margin-bottom:16px"><div class="card-head"><h2>Where the friction is</h2>' +
    '<span class="sub">Blockers named against each market. The first row is the cross-market set, which applies everywhere.</span></div>' +
    '<div class="card-pad tbl-wrap"><table class="matrix"><thead><tr><th class="rowh">Market</th>' +
    cats.map(function (c) { return '<th>' + esc(c) + '</th>'; }).join('') + '</tr></thead><tbody>';
  h += '<tr><th class="rowh" style="font-style:italic">All markets</th>' +
    cats.map(function (c) { return cellFor(crossAll.filter(function (b) { return b.topic === c; }), null); }).join('') +
    '</tr>';
  mks.forEach(function (m) {
    h += '<tr><th class="rowh">' + esc(m.name) + '</th>' +
      cats.map(function (c) { return cellFor(ownB(m.code).filter(function (b) { return b.topic === c; }), m.code); }).join('') +
      '</tr>';
  });
  h += '</tbody></table></div></div>';

  var rows = S.blockers.filter(function (b) {
    if (bf.topic && b.topic !== bf.topic) return false;
    if (bf.prio && b.priority !== bf.prio) return false;
    if (bf.comm === 'needM' && !blockerNeedsMarkets(b)) return false;
    if (bf.comm === 'needP' && !blockerNeedsProduct(b)) return false;
    if (bf.comm === 'unver' && b.verified) return false;
    return true;
  });
  var pr = { Critical: 0, High: 1, Medium: 2, Low: 3 };
  function pk(v) { return pr.hasOwnProperty(v) ? pr[v] : 4; }
  rows.sort(function (x, y) {
    var f = pk(x.priority) - pk(y.priority);
    if (f) return f;
    return (x.status === 'Closed') - (y.status === 'Closed');
  });

  h += '<div class="card"><div class="tbl-wrap"><table class="tbl"><thead><tr>' +
    '<th>Blocker</th><th>Topic</th><th>Markets</th><th>Priority</th><th>Status</th><th>Markets told</th><th>Product told</th></tr></thead><tbody>';
  if (!rows.length) h += '<tr><td colspan="7"><div class="empty">Nothing matches those filters.</div></td></tr>';
  rows.forEach(function (b) {
    h += '<tr class="clickable" data-open="blocker" data-id="' + esc(b.id) + '">' +
      '<td><div class="t">' + esc(b.title) + '</div><div class="d">' + esc(b.description.slice(0, 110)) + '…' +
      (b.verified ? '' : ' <span class="pill warn">unverified</span>') + '</div></td>' +
      '<td class="src nowrap">' + esc(b.topic) + '</td>' +
      '<td class="src">' + b.markets.map(esc).join(', ') + '</td>' +
      '<td><span class="pill ' + (PRIO[b.priority] || 'ghost') + '">' + esc(b.priority) + '</span></td>' +
      '<td class="src nowrap">' + esc(b.status) + '</td>' +
      '<td class="nowrap">' + (b.toldMarkets ? '<span class="pill ok">' + fmt(b.toldMarkets) + '</span>' : '<span class="pill risk">no</span>') + '</td>' +
      '<td class="nowrap">' + (b.toldProduct ? '<span class="pill ok">' + fmt(b.toldProduct) + '</span>' : '<span class="pill risk">no</span>') + '</td></tr>';
  });
  h += '</tbody></table></div></div>';
  return h;
}

function drawerBlocker(id) {
  var b = byId(S.blockers, id);
  if (!b) return;
  var h = '<div class="drawer-head"><div><h2>' + esc(b.title) + '</h2>' +
    '<div class="meta">' + esc(b.topic) + ' · ' + b.markets.map(esc).join(', ') + '</div></div>' +
    '<button class="btn btn-ghost" data-act="close">✕</button></div><div class="drawer-body">';

  h += '<div class="btn-row" style="margin-bottom:14px">' +
    '<span class="pill ' + (PRIO[b.priority] || 'ghost') + '">' + esc(b.priority) + '</span>' +
    '<span class="pill ghost">' + esc(b.status) + '</span>' +
    (b.verified ? '<span class="pill ok">verified</span>' : '<span class="pill warn">unverified — confirm or delete</span>') +
    (b.escalate === 'Yes' ? '<span class="pill risk">escalation required</span>' : '') + '</div>';

  h += '<div class="prose"><p>' + esc(b.description) + '</p></div>';
  h += '<div class="def">' +
    '<dt>Root cause</dt><dd>' + esc(b.rootCause) + '</dd>' +
    '<dt>Implementation</dt><dd>' + esc(b.implImpact) + '</dd>' +
    '<dt>SEO impact</dt><dd>' + esc(b.seoImpact) + '</dd>' +
    '<dt>Evidence</dt><dd>' + esc(b.evidence) + '</dd>' +
    '<dt>Direction</dt><dd>' + esc(b.direction) + '</dd>' +
    '<dt>Owner</dt><dd>' + esc(b.owner) + '</dd>' +
    '<dt>Supporting</dt><dd>' + esc(b.supporting) + '</dd>' +
    '<dt>Next step</dt><dd>' + esc(b.nextStep) + '</dd>' +
    '<dt>Target date</dt><dd>' + fmt(b.targetDate) + '</dd>' +
    '<dt>Source</dt><dd class="src">' + esc(b.source) + '</dd></div>';

  h += '<div class="divider"></div><div class="field-row">' +
    '<div class="field"><label>Told the markets on</label><input type="date" name="tm" value="' + esc(b.toldMarkets) + '"></div>' +
    '<div class="field"><label>Raised with product on</label><input type="date" name="tp" value="' + esc(b.toldProduct) + '"></div></div>';
  h += '<div class="field"><label>Your notes</label><textarea name="notes">' + esc(b.notes || '') + '</textarea></div>';

  h += '<details class="cl-group" style="margin-top:14px"><summary>Edit the blocker</summary><div class="items" style="padding:16px">' +
    '<div class="field"><label>Title</label><input type="text" name="title" value="' + esc(b.title) + '"></div>' +
    '<div class="field-row"><div class="field"><label>Topic</label>' + selN('topic', b.topic, window.DATA_CORE.blockerTopics) + '</div>' +
    '<div class="field"><label>Priority</label>' + selN('priority', b.priority, ['Critical', 'High', 'Medium', 'Low']) + '</div></div>' +
    '<div class="field"><label>Status</label>' + selN('status', b.status, ['To review', 'To assess', 'Evidence being consolidated', 'Resolution route to confirm', 'Planned', 'In progress', 'Monitoring', 'Resolved', 'Closed']) + '</div>' +
    '<div class="field"><label>Verified</label>' + selN('verified', b.verified ? 'yes' : 'no', ['yes', 'no']) + '</div>' +
    '<div class="field"><label>Description</label><textarea name="description">' + esc(b.description) + '</textarea></div>' +
    '<div class="field"><label>Root cause / dependency</label><textarea name="rootCause">' + esc(b.rootCause) + '</textarea></div>' +
    '<div class="field"><label>Implementation impact</label><textarea name="implImpact">' + esc(b.implImpact) + '</textarea></div>' +
    '<div class="field"><label>SEO impact</label><textarea name="seoImpact">' + esc(b.seoImpact) + '</textarea></div>' +
    '<div class="field"><label>Evidence</label><textarea name="evidence">' + esc(b.evidence) + '</textarea></div>' +
    '<div class="field"><label>Recommended direction</label><textarea name="direction">' + esc(b.direction) + '</textarea></div>' +
    '<div class="field-row"><div class="field"><label>Owner</label><input type="text" name="owner" value="' + esc(b.owner) + '"></div>' +
    '<div class="field"><label>Supporting</label><input type="text" name="supporting" value="' + esc(b.supporting) + '"></div></div>' +
    '<div class="field"><label>Immediate next step</label><textarea name="nextStep">' + esc(b.nextStep) + '</textarea></div>' +
    '<div class="field-row"><div class="field"><label>Target date</label><input type="date" name="targetDate" value="' + esc(b.targetDate) + '"></div>' +
    '<div class="field"><label>Escalation</label>' + selN('escalate', b.escalate, ['No', 'To assess', 'Yes']) + '</div></div>' +
    '<div class="field"><label>Markets</label><div class="chips">' +
    ['ALL'].concat(S.markets.map(function (m) { return m.code; })).map(function (c) {
      var on = b.markets.indexOf(c) >= 0;
      return '<label class="chip' + (on ? ' on' : '') + '"><input type="checkbox" data-group="markets" value="' + esc(c) + '"' + (on ? ' checked' : '') + '>' + esc(c === 'ALL' ? 'All' : c) + '</label>';
    }).join('') + '</div></div>' +
    '<button class="btn btn-danger btn-sm" data-act="del-blocker" data-id="' + esc(b.id) + '">Delete this blocker</button>' +
    '</div></details>';

  h += '</div><div class="drawer-foot"><button class="btn" data-act="close">Cancel</button>' +
    '<button class="btn btn-primary" data-act="save-blocker" data-id="' + esc(b.id) + '">Save</button></div>';
  openDrawer(h);
}

/* ============================================================ PROJECTS */
function viewProjects() {
  var h = '<div class="page-head"><div class="eyebrow">Delivery</div><h1>Projects</h1>' +
    '<p>Every One AZ workstream you are carrying, with its next dated milestone and what to watch. ' +
    'The paywall pilot carries its full RACI and delivery plan.</p></div>';

  h += '<div class="grid g-2">';
  S.projects.forEach(function (p) {
    var next = (p.milestones || []).filter(function (m) { return !m.done && m.date; })
      .sort(function (a, b) { return a.date.localeCompare(b.date); })[0];
    var done = (p.milestones || []).filter(function (m) { return m.done; }).length;
    var tot = (p.milestones || []).length;
    h += '<div class="card clickable" data-open="project" data-id="' + esc(p.id) + '" style="cursor:pointer">' +
      '<div class="card-head"><h2>' + esc(p.name) + '</h2>' +
      '<span class="pill ' + (p.rag === 'green' ? 'ok' : p.rag === 'amber' ? 'warn' : 'risk') + '">' + esc(p.rag) + '</span></div>' +
      '<div class="card-pad"><div class="src" style="margin-bottom:8px">' +
      esc(p.market === 'ALL' ? 'Cross-market' : marketName(p.market)) + ' · ' + esc(p.kind) + '</div>' +
      '<div style="font-size:13px;margin-bottom:10px">' + esc(p.phase) + '</div>' +
      (tot ? '<div class="meter' + (done / tot < .34 ? ' low' : done / tot < .67 ? ' mid' : '') + '"><span style="width:' + Math.round(done / tot * 100) + '%"></span></div>' +
        '<div class="src" style="margin-top:5px">' + done + ' of ' + tot + ' milestones done' +
        (next ? ' · next ' + fmt(next.date) + (daysUntil(next.date) < 0 ? ' <span class="pill risk">overdue</span>' : '') : '') + '</div>' : '') +
      '</div></div>';
  });
  h += '</div>';

  h += '<div class="section"><h2>How a URL structuring request runs</h2><div class="card card-pad">' +
    '<div class="pipe">' + window.DATA_MARKET.requestFlow.map(function (s, i) {
      return '<div class="step done" style="text-transform:none;letter-spacing:0;font-size:11px;text-align:left;padding:9px 11px"><b>' + (i + 1) + '.</b> ' + esc(s) + '</div>';
    }).join('') + '</div></div></div>';
  return h;
}

function drawerProject(id) {
  var p = byId(S.projects, id);
  if (!p) return;
  var h = '<div class="drawer-head"><div><h2>' + esc(p.name) + '</h2>' +
    '<div class="meta">' + esc(p.market === 'ALL' ? 'Cross-market' : marketName(p.market)) + ' · ' + esc(p.kind) + '</div></div>' +
    '<button class="btn btn-ghost" data-act="close">✕</button></div><div class="drawer-body">';

  h += '<div class="note-box"><strong>Where it stands.</strong> ' + esc(p.phase) + '</div>';
  h += '<div class="prose" style="margin-top:14px"><p>' + esc(p.summary) + '</p>' +
    (p.evidence ? '<p class="src">' + esc(p.evidence) + '</p>' : '') + '</div>';

  if (p.watch && p.watch.length) {
    h += '<div class="divider"></div><div class="eyebrow">Watch</div><ul style="margin:0;padding-left:18px;font-size:13px;line-height:1.6">' +
      p.watch.map(function (w) { return '<li>' + esc(w) + '</li>'; }).join('') + '</ul>';
  }

  if (p.milestones && p.milestones.length) {
    h += '<div class="divider"></div><div class="eyebrow">Milestones</div>' +
      '<table class="tbl" style="margin-top:6px"><tbody>';
    p.milestones.forEach(function (m, i) {
      var late = !m.done && m.date && daysUntil(m.date) < 0;
      h += '<tr><td style="width:26px"><input type="checkbox" data-ms="' + esc(p.id) + '|' + i + '"' + (m.done ? ' checked' : '') + '></td>' +
        '<td class="nowrap src">' + fmt(m.date) + (late ? ' <span class="pill risk">late</span>' : '') + '</td>' +
        '<td' + (m.done ? ' style="opacity:.55"' : '') + '>' + esc(m.what) + '<div class="d">' + esc(m.owner) + '</div></td></tr>';
    });
    h += '</tbody></table>';
  }

  var gt = window.DATA_VIEWS.projectTasks[p.id];
  if (gt && gt.length) {
    h += '<div class="divider"></div><div class="eyebrow">Timeline</div>' + gantt(gt, 'Task');
  }

  if (p.raci && p.raci.length) {
    h += '<div class="divider"></div><div class="eyebrow">RACI</div><div class="tbl-wrap"><table class="tbl" style="font-size:12px"><thead><tr><th>Task</th>' +
      p.raciCols.map(function (c) { return '<th>' + esc(c) + '</th>'; }).join('') + '</tr></thead><tbody>';
    p.raci.forEach(function (r) {
      h += '<tr><td>' + esc(r[0]) + '</td>' + r.slice(1).map(function (v) {
        var cls = v === 'R,A' || v === 'A' ? 'accent' : v === 'R' ? 'info' : v === 'C' ? 'warn' : 'ghost';
        return '<td class="nowrap">' + (v === '—' ? '<span class="src">—</span>' : '<span class="pill ' + cls + '">' + esc(v) + '</span>') + '</td>';
      }).join('') + '</tr>';
    });
    h += '</tbody></table></div>';
  }

  h += '<div class="divider"></div><div class="field"><label>Your notes</label><textarea name="notes">' + esc(p.notes || '') + '</textarea></div>';
  h += '<div class="field-row"><div class="field"><label>Phase / where it stands</label><input type="text" name="phase" value="' + esc(p.phase) + '"></div>' +
    '<div class="field"><label>RAG</label>' + selN('rag', p.rag, ['green', 'amber', 'red']) + '</div></div>';

  h += '</div><div class="drawer-foot"><button class="btn" data-act="close">Close</button>' +
    '<button class="btn btn-primary" data-act="save-project" data-id="' + esc(p.id) + '">Save</button></div>';
  openDrawer(h);
}

/* =========================================================== CHECKLIST */
function viewCheck(aid) {
  var C = window.CHECKLIST;
  var a = aid ? byId(S.assessments, aid) : null;

  var h = '<div class="page-head"><div class="eyebrow">Standards</div><h1>GEO &amp; SEO readiness checklist</h1>' +
    '<p>Run a One AZ feature against this before it is built. 50 items across 9 groups; the ones marked ' +
    '<span class="pill risk">must</span> are blockers, and <span class="pill teal">GEO</span> marks the items ' +
    'that exist because AI answer engines behave differently from a classic crawler.</p></div>';

  if (!a) {
    h += '<div class="grid g-side">';
    h += '<div><div class="card"><div class="card-head"><h2>Assessments</h2>' +
      '<button class="btn btn-primary btn-sm" data-act="new-assessment">+ New assessment</button></div>';
    if (!S.assessments.length) h += '<div class="empty"><strong>No assessments yet</strong>Start one against a product item, or free-text any feature.</div>';
    else {
      h += '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Feature</th><th>Date</th><th>Score</th><th>Blockers</th><th>Answered</th></tr></thead><tbody>';
      S.assessments.forEach(function (x) {
        var sc = score(x);
        h += '<tr class="clickable" data-open="assessment" data-id="' + esc(x.id) + '">' +
          '<td><div class="t">' + esc(x.feature) + '</div>' + (x.ref ? '<div class="d mono">' + esc(x.ref) + '</div>' : '') + '</td>' +
          '<td class="src nowrap">' + fmt(x.date) + '</td>' +
          '<td><span class="pill ' + (sc.pct >= 80 ? 'ok' : sc.pct >= 50 ? 'warn' : 'risk') + '">' + sc.pct + '%</span></td>' +
          '<td class="num">' + (sc.blockers ? '<span class="pill risk">' + sc.blockers + '</span>' : '<span class="src">0</span>') + '</td>' +
          '<td class="src">' + sc.answered + ' / ' + sc.total + '</td></tr>';
      });
      h += '</tbody></table></div>';
    }
    h += '</div>';

    /* the checklist itself, readable without an assessment */
    h += '<div class="section"><h2>The checklist</h2>';
    C.groups.forEach(function (g) {
      h += '<details class="cl-group"><summary><span>' + esc(g.title) + '</span>' +
        '<span class="src">' + g.items.length + ' items · ' + g.items.filter(function (i) { return i.w === 'must'; }).length + ' must</span></summary>' +
        '<div class="items">' + (g.intro ? '<div class="cl-item src">' + esc(g.intro) + '</div>' : '');
      g.items.forEach(function (it) {
        h += '<div class="cl-item"><div class="q">' + esc(it.q) + '</div>' +
          '<div class="why">' + esc(it.why) + '</div>' +
          (it.gov ? '<div class="why" style="margin-top:5px"><span class="pill accent">governance</span> ' + esc(it.gov) + '</div>' : '') +
          '<div class="tags"><span class="pill ' + (it.w === 'must' ? 'risk' : 'ghost') + '">' + it.w + '</span>' +
          (it.geo ? '<span class="pill teal">GEO</span>' : '') + '</div></div>';
      });
      h += '</div></details>';
    });
    h += '</div>';
    h += '</div>';

    /* governance sidebar */
    var G = C.governance;
    h += '<div><div class="card card-pad"><div class="eyebrow">Reference</div>' +
      '<div style="font-weight:600;margin-bottom:3px">' + esc(G.doc) + '</div>' +
      '<div class="src" style="margin-bottom:10px">' + esc(G.meta) + '</div>' +
      '<div class="note-box" style="font-size:12px">' + esc(G.note) + '</div>' +
      '<div style="margin-top:12px">' + G.rules.map(function (r) {
        return '<div style="padding:8px 0;border-bottom:1px solid var(--line)">' +
          '<div class="src" style="text-transform:uppercase;letter-spacing:.05em;font-weight:700">' + esc(r.k) + '</div>' +
          '<div style="font-size:12.5px;line-height:1.5">' + esc(r.v) + '</div></div>';
      }).join('') + '</div></div></div>';

    h += '</div>';
    return h;
  }

  /* ---- single assessment ---- */
  var sc = score(a);
  h = '<div class="page-head"><div class="eyebrow"><a href="#/check">Checklist</a> · assessment</div>' +
    '<h1>' + esc(a.feature) + '</h1>' +
    '<p>' + (a.ref ? '<span class="mono">' + esc(a.ref) + '</span> · ' : '') + 'Started ' + fmt(a.date) + '</p></div>';

  h += '<div class="grid g-4">' +
    '<div class="card stat"><div class="k num">' + sc.pct + '%</div><div class="l">Weighted score</div>' +
    '<div class="meter' + (sc.pct >= 80 ? '' : sc.pct >= 50 ? ' mid' : ' low') + '" style="margin-top:8px"><span style="width:' + sc.pct + '%"></span></div></div>' +
    '<div class="card stat' + (sc.blockers ? ' alert' : '') + '"><div class="k num">' + sc.blockers + '</div><div class="l">Must-have failures</div><div class="f">These are blockers, not notes</div></div>' +
    '<div class="card stat"><div class="k num">' + sc.geoFail + '</div><div class="l">GEO items failing</div></div>' +
    '<div class="card stat"><div class="k num">' + sc.answered + '/' + sc.total + '</div><div class="l">Answered</div></div>' +
    '</div>';

  h += '<div class="btn-row" style="margin:16px 0">' +
    '<button class="btn" data-act="assess-readout" data-id="' + esc(a.id) + '">Copy readout</button>' +
    '<button class="btn btn-danger btn-sm" data-act="del-assessment" data-id="' + esc(a.id) + '">Delete assessment</button></div>';

  C.groups.forEach(function (g) {
    var gAns = g.items.filter(function (i) { return a.answers[i.id] && a.answers[i.id].v; }).length;
    var gFail = g.items.filter(function (i) { return a.answers[i.id] && a.answers[i.id].v === 'fail'; }).length;
    h += '<details class="cl-group" open><summary><span>' + esc(g.title) + '</span>' +
      '<span class="src">' + gAns + ' / ' + g.items.length + ' answered' + (gFail ? ' · <span class="pill risk">' + gFail + ' failing</span>' : '') + '</span></summary><div class="items">';
    if (g.intro) h += '<div class="cl-item src">' + esc(g.intro) + '</div>';
    g.items.forEach(function (it) {
      var ans = a.answers[it.id] || {};
      h += '<div class="cl-item"><div class="top"><div class="txt">' +
        '<div class="q">' + esc(it.q) + '</div><div class="why">' + esc(it.why) + '</div>' +
        (it.gov ? '<div class="why" style="margin-top:5px"><span class="pill accent">governance</span> ' + esc(it.gov) + '</div>' : '') +
        '<div class="tags"><span class="pill ' + (it.w === 'must' ? 'risk' : 'ghost') + '">' + it.w + '</span>' +
        (it.geo ? '<span class="pill teal">GEO</span>' : '') + '</div></div>' +
        '<div class="seg">' +
        ['pass', 'part', 'fail', 'na'].map(function (v) {
          var on = ans.v === v ? ' on-' + v : '';
          return '<label class="' + (on ? on.slice(1) : '') + '" data-ans="' + esc(a.id) + '|' + esc(it.id) + '|' + v + '">' +
            (v === 'pass' ? 'Pass' : v === 'part' ? 'Partial' : v === 'fail' ? 'Fail' : 'N/A') + '</label>';
        }).join('') + '</div></div>' +
        '<div class="cl-note"><textarea data-note="' + esc(a.id) + '|' + esc(it.id) + '" placeholder="Note — who said what, which market, what to do about it">' + esc(ans.n || '') + '</textarea></div>' +
        '</div>';
    });
    h += '</div></details>';
  });
  return h;
}

function score(a) {
  var C = window.CHECKLIST, total = 0, answered = 0, got = 0, max = 0, blockers = 0, geoFail = 0;
  C.groups.forEach(function (g) {
    g.items.forEach(function (it) {
      total++;
      var v = (a.answers[it.id] || {}).v;
      if (!v) return;
      answered++;
      if (v === 'na') return;
      var w = it.w === 'must' ? 2 : 1;
      max += w;
      if (v === 'pass') got += w;
      else if (v === 'part') got += w * 0.5;
      else { if (it.w === 'must') blockers++; if (it.geo) geoFail++; }
    });
  });
  return { total: total, answered: answered, pct: max ? Math.round(got / max * 100) : 0, blockers: blockers, geoFail: geoFail };
}

/* ========================================================= STAKEHOLDERS */
function viewPeople() {
  var h = '<div class="page-head"><div class="eyebrow">Connect tracker</div><h1>Stakeholders</h1>' +
    '<p>Who you have to keep warm, on what rhythm, and what is open with each of them. ' +
    'Overdue is measured against the cadence you set, not a fixed rule.</p></div>';

  var sides = [['product', 'Product side'], ['programme', 'Programme and Web Delivery'], ['seo', 'SEO team'], ['market', 'Markets']];
  h += '<div class="filters"><button class="btn btn-sm btn-primary">People</button>' +
    '<a class="btn btn-sm" href="#/cal">Calendar</a><span class="spacer"></span>' +
    '<a class="btn btn-sm" href="#/docs">Documents</a>' +
    '<button class="btn btn-primary btn-sm" data-act="new-person">+ Add a stakeholder</button></div>';

  sides.forEach(function (sd) {
    var list = S.stakeholders.filter(function (p) { return p.side === sd[0]; });
    if (!list.length) return;
    h += '<div class="section"><h2>' + esc(sd[1]) + '</h2><div class="card"><div class="tbl-wrap"><table class="tbl"><thead><tr>' +
      '<th>Person</th><th>Cadence</th><th>Last contact</th><th>Next</th><th>Open with them</th></tr></thead><tbody>';
    list.forEach(function (p) {
      var since = daysSince(p.lastContact);
      var until = daysUntil(p.nextContact);
      h += '<tr class="clickable" data-open="person" data-id="' + esc(p.id) + '">' +
        '<td><div class="t">' + esc(p.name) + '</div><div class="d">' + esc(p.role) + ' · ' + esc(p.org) + '</div></td>' +
        '<td class="src nowrap">' + esc(p.cadence) + '</td>' +
        '<td class="nowrap">' + (p.lastContact ? fmt(p.lastContact) + ' <span class="src">(' + since + 'd)</span>' : '<span class="pill ghost">never logged</span>') + '</td>' +
        '<td class="nowrap">' + (p.nextContact ? (until < 0 ? '<span class="pill risk">' + fmt(p.nextContact) + '</span>' : until <= 7 ? '<span class="pill warn">' + fmt(p.nextContact) + '</span>' : fmt(p.nextContact)) : '<span class="pill ghost">not set</span>') + '</td>' +
        '<td>' + (p.open && p.open.length ? '<span class="pill accent">' + p.open.length + '</span> <span class="src">' + esc(p.open[0].slice(0, 70)) + (p.open[0].length > 70 ? '…' : '') + '</span>' : '<span class="src">—</span>') + '</td></tr>';
    });
    h += '</tbody></table></div></div></div>';
  });
  return h;
}

function drawerPerson(id) {
  var p = byId(S.stakeholders, id);
  if (!p) return;
  var h = '<div class="drawer-head"><div><h2>' + esc(p.name) + '</h2>' +
    '<div class="meta">' + esc(p.role) + ' · ' + esc(p.org) + '</div></div>' +
    '<button class="btn btn-ghost" data-act="close">✕</button></div><div class="drawer-body">';
  h += '<div class="note-box">' + esc(p.why) + '</div>';
  h += '<div class="divider"></div><div class="field-row">' +
    '<div class="field"><label>Last contact</label><input type="date" name="last" value="' + esc(p.lastContact) + '"></div>' +
    '<div class="field"><label>Next contact</label><input type="date" name="next" value="' + esc(p.nextContact) + '"></div></div>' +
    '<div class="field"><label>Cadence</label><input type="text" name="cadence" value="' + esc(p.cadence) + '"></div>' +
    '<div class="field"><label>Open items — one per line</label><textarea name="open" style="min-height:110px">' + esc((p.open || []).join('\n')) + '</textarea></div>' +
    '<div class="field"><label>Notes</label><textarea name="notes">' + esc(p.notes || '') + '</textarea></div>';
  h += '<details class="cl-group"><summary>Edit details</summary><div class="items" style="padding:16px">' +
    '<div class="field"><label>Name</label><input type="text" name="name" value="' + esc(p.name) + '"></div>' +
    '<div class="field"><label>Role</label><input type="text" name="role" value="' + esc(p.role) + '"></div>' +
    '<div class="field"><label>Org</label><input type="text" name="org" value="' + esc(p.org) + '"></div>' +
    '<div class="field"><label>Side</label>' + selN('side', p.side, ['product', 'programme', 'seo', 'market']) + '</div>' +
    '<div class="field"><label>Why they matter</label><textarea name="why">' + esc(p.why) + '</textarea></div>' +
    '<button class="btn btn-danger btn-sm" data-act="del-person" data-id="' + esc(p.id) + '">Delete</button>' +
    '</div></details>';
  h += '</div><div class="drawer-foot"><button class="btn" data-act="close">Cancel</button>' +
    '<button class="btn btn-primary" data-act="save-person" data-id="' + esc(p.id) + '">Save</button></div>';
  openDrawer(h);
}

/* ============================================================ BRIEFINGS */
var briefKind = 'markets';
function viewBrief() {
  var h = '<div class="page-head"><div class="eyebrow">Output</div><h1>Briefings</h1>' +
    '<p>Turn the current state into something you can paste into an email, a Teams message or an agenda. ' +
    'Nothing here is sent anywhere — it produces text and marks items as communicated when you say so.</p></div>';

  h += '<div class="filters">' +
    ['markets', 'product', 'agenda', 'status'].map(function (k) {
      var labels = { markets: 'Brief to the SEO team and markets', product: 'Note to the product team', agenda: 'Bi-weekly agenda', status: 'Status summary' };
      return '<button class="btn btn-sm' + (briefKind === k ? ' btn-primary' : '') + '" data-brief="' + k + '">' + esc(labels[k]) + '</button>';
    }).join('') + '</div>';

  h += '<div class="card card-pad"><textarea class="out" id="brief-out" spellcheck="false">' + esc(buildBrief(briefKind)) + '</textarea>' +
    '<div class="btn-row" style="margin-top:12px">' +
    '<button class="btn btn-primary" data-act="copy-brief">Copy to clipboard</button>' +
    '<button class="btn" data-act="download-brief">Download .md</button>' +
    (briefKind === 'markets' ? '<button class="btn" data-act="mark-markets">Mark these as told to markets (today)</button>' : '') +
    (briefKind === 'product' ? '<button class="btn" data-act="mark-product">Mark these as raised with product (today)</button>' : '') +
    '<button class="btn" data-act="log-brief">Log in Documents</button>' +
    '</div></div>';
  return h;
}

function buildBrief(kind) {
  var L = [];
  var d = fmt(TODAY);
  if (kind === 'markets') {
    L.push('ONE AZ PRODUCT UPDATE — FOR THE SEO TEAM AND MARKETS');
    L.push(d + ' · from Owais, One AZ SEO liaison');
    L.push('');
    var items = S.product.filter(needsMarkets);
    if (!items.length) L.push('Nothing new to cascade this cycle.');
    items.forEach(function (p) {
      L.push('— ' + p.title + ' (' + p.id + ')');
      L.push('   Timing: ' + p.sprint + ' · status: ' + p.status + ' · SEO/GEO impact: ' + p.seo);
      L.push('   Markets: ' + p.markets.map(function (c) { return c === 'ALL' ? 'all' : c; }).join(', '));
      L.push('   What it is: ' + p.why);
      L.push('   What we need you to do: ' + p.toMarkets);
      L.push('');
    });
    var bl = openBlockers().filter(blockerNeedsMarkets);
    if (bl.length) {
      L.push('MARKET-SIDE ITEMS TO BE AWARE OF');
      L.push('');
      bl.forEach(function (b) {
        L.push('— ' + b.title + ' [' + b.priority + ']');
        L.push('   Markets: ' + b.markets.join(', '));
        L.push('   ' + b.description);
        L.push('   Next step: ' + b.nextStep);
        L.push('');
      });
    }
  }

  if (kind === 'product') {
    L.push('SEO AND GEO INPUT INTO THE ONE AZ PRODUCT BACKLOG');
    L.push(d + ' · from Owais, on behalf of the GCS SEO team');
    L.push('');
    L.push('Each item below is a request against a specific product change or a market limitation we have hit.');
    L.push('');
    var items = S.product.filter(needsProduct);
    if (items.length) {
      L.push('AGAINST ITEMS ALREADY ON YOUR BOARD');
      L.push('');
      items.forEach(function (p) {
        L.push('— ' + p.id + ' · ' + p.title);
        L.push('   Why SEO/GEO cares: ' + p.why);
        L.push('   Ask: ' + p.toProduct);
        L.push('');
      });
    }
    var bl = openBlockers().filter(blockerNeedsProduct);
    if (bl.length) {
      L.push('MARKET LIMITATIONS THAT NEED A PRODUCT-LEVEL ANSWER');
      L.push('');
      bl.forEach(function (b) {
        L.push('— ' + b.title + ' [' + b.priority + '] · ' + b.markets.join(', '));
        L.push('   Problem: ' + b.description);
        L.push('   Root cause: ' + b.rootCause);
        L.push('   Impact if unaddressed: ' + b.seoImpact);
        L.push('   Proposed direction: ' + b.direction);
        L.push('   Ask: ' + b.nextStep);
        L.push('');
      });
    }
    if (!items.length && !bl.length) L.push('Nothing outstanding for the product team this cycle.');
  }

  if (kind === 'agenda') {
    var cad = window.DATA_CORE.cadence;
    L.push('TOUCH-BASE AGENDA — ' + d);
    L.push(cad.standing);
    L.push('');
    cad.agenda.forEach(function (a, i) { L.push((i + 1) + '. ' + a); });
    L.push('');
    L.push('CARRY-INS');
    L.push('');
    S.stakeholders.filter(function (p) { return p.side === 'product' && p.open && p.open.length; })
      .forEach(function (p) {
        L.push('With ' + p.name + ':');
        p.open.forEach(function (o) { L.push('  · ' + o); });
        L.push('');
      });
    var due = upcoming(30);
    if (due.length) {
      L.push('DATED IN THE NEXT 30 DAYS');
      L.push('');
      due.forEach(function (x) { L.push('  ' + fmt(x.m.date) + ' — ' + x.m.what + ' (' + x.p.name + ', ' + x.m.owner + ')'); });
      L.push('');
    }
    var flagP = S.product.filter(needsProduct);
    if (flagP.length) {
      L.push('ITEMS I WILL RAISE');
      L.push('');
      flagP.forEach(function (p) { L.push('  · ' + p.id + ' — ' + p.toProduct); });
    }
  }

  if (kind === 'status') {
    L.push('ONE AZ SEO LIAISON — STATUS SUMMARY');
    L.push(d);
    L.push('');
    L.push('PRODUCT SIDE');
    L.push('  ' + S.product.length + ' items tracked · ' +
      S.product.filter(function (p) { return p.seo === 'high'; }).length + ' high SEO/GEO impact · ' +
      S.product.filter(function (p) { return p.status === 'at-risk' || p.status === 'blocked'; }).length + ' at risk or blocked');
    L.push('  ' + S.product.filter(needsMarkets).length + ' still to cascade to markets · ' +
      S.product.filter(needsProduct).length + ' still to raise with product');
    L.push('');
    L.push('MARKET SIDE');
    L.push('  ' + openBlockers().length + ' open blockers · ' +
      openBlockers().filter(function (b) { return b.priority === 'Critical'; }).length + ' critical · ' +
      openBlockers().filter(function (b) { return !b.verified; }).length + ' unverified');
    L.push('  ' + S.deliverables.length + ' deliverables logged across ' +
      S.markets.filter(function (m) { return marketDeliverables(m.code).length; }).length + ' markets');
    L.push('');
    L.push('BY MARKET');
    S.markets.forEach(function (m) {
      var dl = marketDeliverables(m.code);
      if (!dl.length && !marketBlockers(m.code).length) return;
      var ob = marketBlockers(m.code).filter(function (b) { return b.status !== 'Closed'; });
      L.push('  ' + (m.name + '                    ').slice(0, 22) + (ONEAZ[m.oneAz] ? ONEAZ[m.oneAz][1] : m.oneAz) +
        ' · ' + dl.length + ' delivered · ' + ob.length + ' open blockers');
    });
    L.push('');
    L.push('PROJECTS');
    S.projects.forEach(function (p) {
      var next = (p.milestones || []).filter(function (m) { return !m.done && m.date; }).sort(function (a, b) { return a.date.localeCompare(b.date); })[0];
      L.push('  [' + p.rag + '] ' + p.name + (next ? ' — next: ' + fmt(next.date) + ', ' + next.what : ''));
    });
  }
  return L.join('\n');
}

/* =============================================================== DATA */
function viewData() {
  var h = '<div class="page-head"><div class="eyebrow">Housekeeping</div><h1>Data</h1>' +
    '<p>Everything lives in this browser\'s local storage on this machine. Nothing is sent anywhere. ' +
    'Export a JSON backup before you change browsers or clear site data.</p></div>';

  h += '<div class="card card-pad" style="margin-bottom:16px">' +
    '<div class="li-top"><h2 style="margin:0;font-size:14px">Server sync</h2>' +
    '<span class="pill ' + (window.SYNC && SYNC.state.on ? 'ok' : 'ghost') + '">' +
    (window.SYNC && SYNC.state.on ? 'on' : 'off') + '</span></div>' +
    '<div class="src" id="sync-line" style="margin:8px 0 12px">' + esc(syncLine()) + '</div>' +
    (window.SYNC && SYNC.available()
      ? '<div class="field-row" style="align-items:flex-end">' +
        '<div class="field" style="margin:0"><label>Desk key</label>' +
        '<input type="password" id="sync-key" value="' + esc(window.SYNC.state.key) + '" placeholder="the DESK_KEY set on the deployment"></div>' +
        '<div class="btn-row" style="padding-bottom:1px">' +
        '<button class="btn btn-primary btn-sm" data-act="sync-connect">Connect</button>' +
        '<button class="btn btn-sm" data-act="sync-pull">Pull from server</button>' +
        '<button class="btn btn-sm" data-act="sync-push">Push to server</button>' +
        '<button class="btn btn-ghost btn-sm" data-act="sync-off">Disconnect</button>' +
        '</div></div>' +
        '<div class="src" style="margin-top:10px">The key never leaves this browser except as a request header to your own deployment. ' +
        'Pull replaces what is in this browser with the server copy; push does the reverse.</div>'
      : '<div class="note-box">You are running from a local file, so there is nothing to sync to. ' +
        'Deploy the same folder to Vercel and open it there to turn this on.</div>') +
    '</div>';

  h += '<div class="grid g-2"><div class="card card-pad"><h2 style="margin:0 0 8px;font-size:14px">Backup and restore</h2>' +
    '<div class="btn-row"><button class="btn btn-primary" data-act="export">Export JSON backup</button>' +
    '<label class="btn">Import backup<input type="file" id="import-file" accept="application/json" hidden></label></div>' +
    '<div class="src" style="margin-top:10px">Last saved: ' + esc(S.updated) + '</div></div>';

  h += '<div class="card card-pad"><h2 style="margin:0 0 8px;font-size:14px">Reset</h2>' +
    '<div class="src" style="margin-bottom:10px">Restores the shipped seed data and discards every edit and every assessment.</div>' +
    '<button class="btn btn-danger" data-act="reset">Reset to seed data</button></div></div>';

  h += '<div class="section"><h2>What is in here</h2><div class="card"><table class="tbl"><tbody>' +
    [['Markets', S.markets.length], ['Product items', S.product.length], ['Blockers', S.blockers.length],
     ['Projects', S.projects.length], ['Deliverables', S.deliverables.length],
     ['Stakeholders', S.stakeholders.length], ['Checklist assessments', S.assessments.length]]
      .map(function (r) { return '<tr><td>' + esc(r[0]) + '</td><td class="num" style="width:90px">' + r[1] + '</td></tr>'; }).join('') +
    '</tbody></table></div></div>';

  h += '<div class="section"><h2>Where the seeded data came from</h2><div class="card card-pad prose">' +
    '<p>GCS SEO / One AZ deck, August 2026 · EUCAN Internal Catch-up Tracker (281 deliverables, market contacts, migration packages) · ' +
    'EUCAN Customer Engagement Q3-2026 PI Planning outputs (product items, sprint windows, RAID log) · ' +
    'EUCAN SEO Blocker Review and Forward Tracker (the blocker field schema) · ' +
    'Sitemap Governance for One AZ Portals, Gamma v3.1 · EUCAN SEO Strategic Framing, August 2026.</p>' +
    '<p class="src">Email addresses were deliberately not imported. Add them locally if you want them — they will stay in this browser.</p>' +
    '</div></div>';
  return h;
}

/* ===================================================== SHARED: GANTT */
var GSTAT = { done: 'ok', active: 'warn', todo: 'ghost', blocked: 'risk' };
function monthsBetween(a, b) {
  var out = [], d = new Date(a.slice(0, 7) + '-01T00:00:00Z');
  var end = new Date(b.slice(0, 7) + '-01T00:00:00Z');
  while (d <= end) { out.push(d.toISOString().slice(0, 7)); d.setUTCMonth(d.getUTCMonth() + 1); }
  return out;
}
function gantt(tasks, title) {
  tasks = (tasks || []).filter(function (t) { return t.start && t.end; });
  if (!tasks.length) return '<div class="empty">No dated tasks on this one yet.</div>';
  var min = tasks.reduce(function (m, t) { return t.start < m ? t.start : m; }, tasks[0].start);
  var max = tasks.reduce(function (m, t) { return t.end > m ? t.end : m; }, tasks[0].end);
  var months = monthsBetween(min, max);
  var t0 = Date.parse(months[0] + '-01');
  var lastM = months[months.length - 1].split('-');
  var t1 = Date.UTC(+lastM[0], +lastM[1], 1);
  var span = t1 - t0;
  function pct(d) { return Math.max(0, Math.min(100, (Date.parse(d) - t0) / span * 100)); }

  var lanes = [], byLane = {};
  tasks.forEach(function (t) {
    var l = t.lane || 'Tasks';
    if (!byLane[l]) { byLane[l] = []; lanes.push(l); }
    byLane[l].push(t);
  });

  var MN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var h = '<div class="gantt-wrap"><div class="gantt" style="min-width:' + Math.max(680, months.length * 78) + 'px">';
  h += '<div class="g-head"><div class="g-lbl">' + esc(title || 'Task') + '</div><div class="g-track">' +
    months.map(function (m) {
      var p = m.split('-');
      return '<div class="g-mon">' + MN[+p[1] - 1] + ' <span>' + p[0].slice(2) + '</span></div>';
    }).join('') +
    (TODAY >= min.slice(0, 7) + '-01' && TODAY <= max ? '<div class="g-now" style="left:' + pct(TODAY) + '%"><span>today</span></div>' : '') +
    '</div></div>';

  lanes.forEach(function (l) {
    h += '<div class="g-lane"><div class="g-lbl g-lane-name">' + esc(l) + '</div><div class="g-track"></div></div>';
    byLane[l].forEach(function (t) {
      var a = pct(t.start), b = pct(t.end);
      h += '<div class="g-row"><div class="g-lbl" title="' + esc(t.name) + '">' + esc(t.name) +
        '<span class="g-own">' + esc(t.owner || '') + '</span></div>' +
        '<div class="g-track">' +
        months.map(function () { return '<div class="g-cell"></div>'; }).join('') +
        '<div class="g-bar ' + (t.status || 'todo') + '" style="left:' + a + '%;width:' + Math.max(1.2, b - a) + '%" ' +
        'title="' + esc(fmt(t.start) + ' → ' + fmt(t.end)) + '"></div>' +
        (TODAY >= min.slice(0, 7) + '-01' && TODAY <= max ? '<div class="g-now" style="left:' + pct(TODAY) + '%"></div>' : '') +
        '</div></div>';
    });
  });
  h += '</div></div>';
  h += '<div class="btn-row" style="margin-top:10px">' +
    [['done', 'Done'], ['active', 'In flight'], ['todo', 'Not started'], ['blocked', 'Blocked']].map(function (s) {
      return '<span class="pill ' + GSTAT[s[0]] + '">' + s[1] + '</span>';
    }).join('') + '</div>';
  return h;
}

/* ================================================== URGENCY / SORTING */
function urgencyOf(p) {
  var s = { high: 3, medium: 2, low: 1 }[p.seo] || 1;
  if (p.status === 'blocked' || p.status === 'at-risk') s += 1;
  var d = p.due ? daysUntil(p.due) : null;
  if (d !== null) { if (d < 0) s += 2; else if (d <= 14) s += 1; }
  return s;
}
function bandOf(n) { return n >= 5 ? 'now' : n >= 3 ? 'soon' : 'watch'; }
function blockerBand(b) {
  var d = b.targetDate ? daysUntil(b.targetDate) : null;
  if (b.priority === 'Critical') return 'now';
  if (b.priority === 'High') return (d !== null && d < 0) ? 'now' : 'soon';
  return (d !== null && d < 0) ? 'soon' : 'watch';
}
var BAND = { now: ['risk', 'Now'], soon: ['warn', 'Soon'], watch: ['ghost', 'Watch'] };

/* ==================================================== DASHBOARD LANES */
var df = { market: '', band: '', q: '', sort: 'urgency' };

function laneRows(dir) {
  var out = [];
  S.product.forEach(function (p) {
    if (dir === 'markets' ? !needsMarkets(p) : !needsProduct(p)) return;
    out.push({
      kind: 'product', id: p.id, title: p.title, ref: p.id,
      sub: dir === 'markets' ? p.toMarkets : p.toProduct,
      markets: p.markets, band: bandOf(urgencyOf(p)), score: urgencyOf(p),
      due: p.due || '', tag: p.seo + ' impact', tagCls: SEV[p.seo] || 'ghost'
    });
  });
  S.blockers.forEach(function (b) {
    if (b.status === 'Closed') return;
    if (dir === 'markets' ? !blockerNeedsMarkets(b) : !blockerNeedsProduct(b)) return;
    out.push({
      kind: 'blocker', id: b.id, title: b.title, ref: b.topic,
      sub: dir === 'markets' ? b.description : b.nextStep,
      markets: b.markets, band: blockerBand(b), score: { Critical: 6, High: 4, Medium: 2, Low: 1 }[b.priority] || 1,
      due: b.targetDate || '', tag: b.priority, tagCls: PRIO[b.priority] || 'ghost'
    });
  });
  return out.filter(function (r) {
    if (df.market && r.markets.indexOf(df.market) < 0 && r.markets.indexOf('ALL') < 0) return false;
    if (df.band && r.band !== df.band) return false;
    if (df.q) {
      var t = (r.title + ' ' + r.ref + ' ' + r.sub + ' ' + r.markets.join(' ')).toLowerCase();
      if (t.indexOf(df.q.toLowerCase()) < 0) return false;
    }
    return true;
  }).sort(function (a, b) {
    if (df.sort === 'due') {
      var ad = a.due || '9999', bd = b.due || '9999';
      if (ad !== bd) return ad < bd ? -1 : 1;
      return b.score - a.score;
    }
    if (df.sort === 'market') {
      var am = a.markets[0] || 'zz', bm = b.markets[0] || 'zz';
      if (am !== bm) return am < bm ? -1 : 1;
      return b.score - a.score;
    }
    if (df.sort === 'title') return a.title < b.title ? -1 : 1;
    return b.score - a.score;
  });
}

function laneCard(dir, heading, note) {
  var rows = laneRows(dir);
  var h = '<div class="card"><div class="card-head"><h2>' + esc(heading) + '</h2>' +
    '<span class="sub">' + rows.length + ' item' + (rows.length === 1 ? '' : 's') + ' · ' + esc(note) + '</span></div>';
  if (!rows.length) h += '<div class="empty"><strong>Nothing waiting</strong>Nothing matches, or everything current has been handled.</div>';
  else {
    h += '<ul class="list-plain">';
    rows.forEach(function (r) {
      h += '<li class="clickable" data-open="' + esc(r.kind) + '" data-id="' + esc(r.id) + '">' +
        '<div class="li-top"><span class="t">' + esc(r.title) + '</span>' +
        '<span class="nowrap"><span class="pill ' + BAND[r.band][0] + '">' + BAND[r.band][1] + '</span>' +
        '<span class="pill ' + r.tagCls + '">' + esc(r.tag) + '</span></span></div>' +
        '<div class="li-sub"><span class="mono">' + esc(r.ref) + '</span> · ' +
        esc(r.markets.map(function (c) { return c === 'ALL' ? 'all' : c; }).join(', ')) +
        (r.due ? ' · due ' + fmt(r.due) : '') + '<br>' + esc(String(r.sub).slice(0, 150)) + (String(r.sub).length > 150 ? '…' : '') +
        '</div></li>';
    });
    h += '</ul>';
  }
  return h + '</div>';
}

/* ========================================================= PRODUCT MAP */
var pmSel = '';
function viewProductMap() {
  var V = window.DATA_VIEWS;
  var h = '<div class="page-head"><div class="eyebrow">Product side · orientation</div>' +
    '<h1>What the product actually is</h1>' +
    '<p>The One AZ product surface grouped the way it matters to us, not the way the backlog is organised. ' +
    'Nine categories; the ones marked <span class="pill risk">core</span> are where our standard is decided, ' +
    '<span class="pill warn">watch</span> can undo our work if it ships unreviewed, ' +
    '<span class="pill ghost">light</span> is worth knowing and rarely worth intervening in.</p></div>';

  h += subtabs(PRODTABS, 'pmap');
  var CARE = { core: 'risk', watch: 'warn', light: 'ghost' };

  /* category grid */
  h += '<div class="grid g-3">';
  V.categories.forEach(function (c) {
    var items = S.product.filter(function (p) { return (V.itemCat[p.id] || [])[0] === c.id; });
    var hi = items.filter(function (p) { return p.seo === 'high'; }).length;
    var due = items.filter(function (p) { return needsMarkets(p) || needsProduct(p); }).length;
    h += '<div class="card pm-cat clickable" data-catdive="' + esc(c.id) + '|">' +
      '<div class="card-pad">' +
      '<div class="li-top" style="align-items:flex-start"><div><span class="pm-icon">' + c.icon + '</span> ' +
      '<strong style="font-size:14px">' + esc(c.title) + '</strong></div>' +
      '<span class="pill ' + CARE[c.care] + '">' + c.care + '</span></div>' +
      '<div class="src" style="margin:8px 0 10px;line-height:1.55">' + esc(c.blurb) + '</div>' +
      '<div class="btn-row"><span class="pill ghost">' + items.length + ' items</span>' +
      (hi ? '<span class="pill risk">' + hi + ' high impact</span>' : '') +
      (due ? '<span class="pill accent">' + due + ' to action</span>' : '') + '</div>' +
      '</div></div>';
  });
  h += '</div>';

  /* selected category detail */
  if (pmSel) {
    var c = null;
    V.categories.forEach(function (x) { if (x.id === pmSel) c = x; });
    if (c) {
      h += '<div class="section"><div class="card"><div class="card-head"><h2>' + c.icon + '&nbsp; ' + esc(c.title) + '</h2>' +
        '<button class="btn btn-ghost btn-sm" data-pmcat="">Close</button></div>' +
        '<div class="card-pad">' +
        '<div class="note-box"><strong>Why this matters to us.</strong> ' + esc(c.stake) + '</div>' +
        '<div class="grid g-3" style="margin-top:14px">' +
        c.subs.map(function (s) {
          var its = S.product.filter(function (p) { return (V.itemCat[p.id] || [])[1] === s.id; });
          return '<div class="card card-pad" style="box-shadow:none;background:var(--surface-2)">' +
            '<div class="li-top"><strong style="font-size:13px">' + esc(s.title) + '</strong>' +
            '<span class="pill ' + CARE[s.care] + '">' + s.care + '</span></div>' +
            '<div class="src" style="margin:6px 0 9px">' + esc(s.note) + '</div>' +
            (its.length ? '<ul class="list-plain" style="border-top:1px solid var(--line)">' + its.map(function (p) {
              return '<li class="clickable" style="padding:8px 0" data-open="product" data-id="' + esc(p.id) + '">' +
                '<div style="font-size:12.5px;font-weight:550">' + esc(p.title) + '</div>' +
                '<div class="src mono">' + esc(p.id) + ' · <span class="pill ' + (SEV[p.seo] || 'ghost') + '">' + p.seo + '</span></div></li>';
            }).join('') + '</ul>' : '<div class="src">Nothing logged here yet.</div>') +
            '</div>';
        }).join('') +
        '</div></div></div></div>';
    }
  }

  /* page anatomy */
  h += '<div class="section"><h2>Where it lands on the page</h2>' +
    '<p class="src" style="max-width:74ch;margin:-6px 0 14px">A One AZ HCP page, region by region. Click a region to see what product work touches it and which checklist items apply. ' +
    'This is the translation layer: product tickets on one side, the page a crawler actually fetches on the other.</p>';

  h += '<div class="grid g-side">';
  h += '<div class="card card-pad"><div class="wire">' +
    wireRegion('utility', 'Utility nav', 1, 'wr-utility') +
    wireRegion('topnav', 'Top navigation · max 7 tabs', 2, 'wr-topnav') +
    wireRegion('breadcrumb', 'Breadcrumb', 3, 'wr-crumb') +
    wireRegion('hero', 'H1 + intro — the teaser layer', 4, 'wr-hero') +
    wireRegion('tabs', 'In-page tabs · max 7', 5, 'wr-tabs') +
    '<div class="wr-split">' +
    wireRegion('body', 'Body content chunks', 6, 'wr-body') +
    '<div class="wr-side">' +
    wireRegion('media', 'Media', 7, 'wr-media') +
    wireRegion('perso', 'Personalisation', 8, 'wr-perso') +
    '</div></div>' +
    wireRegion('gate', 'The gated boundary — login / 302', 9, 'wr-gate') +
    wireRegion('mandatory', 'Mandatory local text', 10, 'wr-mand') +
    wireRegion('head', 'The invisible layer — head, schema, robots, sitemap', 11, 'wr-head') +
    '</div></div>';

  var sel = null;
  V.anatomy.forEach(function (a) { if (a.id === pmZone) sel = a; });
  h += '<div>';
  if (!sel) {
    h += '<div class="card card-pad"><div class="eyebrow">Page anatomy</div>' +
      '<p style="font-size:13px;line-height:1.6;margin:6px 0 0">Pick a region on the wireframe. Each one lists the product items that can change it and the checklist questions to ask before it ships.</p>' +
      '<div class="divider"></div><div class="src">Regions marked in the strong colour are ones where our standard is decided. The dashed band is the login boundary — everything above it is what a crawler is served.</div></div>';
  } else {
    h += '<div class="card"><div class="card-head"><h2>' + sel.n + '. ' + esc(sel.label) + '</h2>' +
      '<span class="pill ' + CARE[sel.care] + '">' + sel.care + '</span></div><div class="card-pad">' +
      '<div class="src" style="line-height:1.6">' + esc(sel.what) + '</div>' +
      '<div class="note-box" style="margin-top:12px"><strong>SEO / GEO read.</strong> ' + esc(sel.seo) + '</div>';
    var its = sel.items.map(function (i) { return byId(S.product, i); }).filter(Boolean);
    if (its.length) {
      h += '<div class="divider"></div><div class="eyebrow">Product items here</div><ul class="list-plain">' +
        its.map(function (p) {
          return '<li class="clickable" data-open="product" data-id="' + esc(p.id) + '" style="padding:9px 0">' +
            '<div style="font-size:13px;font-weight:550">' + esc(p.title) + '</div>' +
            '<div class="src mono">' + esc(p.id) + ' · <span class="pill ' + (SEV[p.seo] || 'ghost') + '">' + p.seo + '</span></div></li>';
        }).join('') + '</ul>';
    }
    var C = window.CHECKLIST, qs = [];
    C.groups.forEach(function (g) { g.items.forEach(function (it) { if (sel.check.indexOf(it.id) >= 0) qs.push(it); }); });
    if (qs.length) {
      h += '<div class="divider"></div><div class="eyebrow">Ask before it ships</div>' +
        '<ul style="margin:6px 0 0;padding-left:18px;font-size:12.5px;line-height:1.6">' +
        qs.map(function (q) { return '<li>' + esc(q.q) + ' <span class="pill ' + (q.w === 'must' ? 'risk' : 'ghost') + '">' + q.w + '</span>' + (q.geo ? ' <span class="pill teal">GEO</span>' : '') + '</li>'; }).join('') +
        '</ul>';
    }
    h += '</div></div>';
  }
  h += '</div></div></div>';
  return h;
}
var pmZone = '';
function wireRegion(id, label, n, cls) {
  var V = window.DATA_VIEWS, care = 'light';
  V.anatomy.forEach(function (a) { if (a.id === id) care = a.care; });
  return '<div class="wr ' + cls + ' care-' + care + (pmZone === id ? ' on' : '') + '" data-zone="' + esc(id) + '" title="Click for the full detail">' +
    '<span class="wr-n">' + n + '</span><span class="wr-t">' + esc(label) + '</span></div>';
}

/* ============================================================ MAP VIEW */
function viewMap() {
  var V = window.DATA_VIEWS;
  var W = 760, H = 560, lon0 = -12, lon1 = 31, lat0 = 34.5, lat1 = 62.5;
  var kx = Math.cos((lat0 + lat1) / 2 * Math.PI / 180);
  function X(lon) { return (lon - lon0) / (lon1 - lon0) * W; }
  function Y(lat) { return H - (lat - lat0) / (lat1 - lat0) * H; }

  var FILL = { implemented: 'var(--ok)', 'in-process': 'var(--warn)', proposed: 'var(--info)',
    'not-started': 'var(--risk)', baseline: 'var(--faint)', watch: 'var(--info)', 'out-of-scope': 'var(--line-strong)' };

  var pts = [];
  S.markets.forEach(function (m) {
    var g = V.geo[m.code]; if (!g) return;
    var dl = marketDeliverables(m.code).length;
    var bl = marketBlockers(m.code).filter(function (b) { return b.status !== 'Closed' && b.markets.indexOf(m.code) >= 0; }).length;
    pts.push({ m: m, x: X(g[1]) + (g[2] || 0), y: Y(g[0]) + (g[3] || 0),
      r: Math.max(9, Math.min(30, 7 + Math.sqrt(dl) * 3.1)), dl: dl, bl: bl });
  });
  pts.sort(function (a, b) { return b.r - a.r; });

  var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="euromap" role="img" aria-label="Schematic map of EUCAN markets">';
  for (var lg = -10; lg <= 30; lg += 10) svg += '<line x1="' + X(lg) + '" y1="0" x2="' + X(lg) + '" y2="' + H + '" class="grat"/>';
  for (var lt = 35; lt <= 60; lt += 5) svg += '<line x1="0" y1="' + Y(lt) + '" x2="' + W + '" y2="' + Y(lt) + '" class="grat"/>';

  pts.forEach(function (p) {
    var st = ONEAZ[p.m.oneAz] || ['ghost', p.m.oneAz];
    svg += '<g class="mk' + (p.bl ? ' has-bl' : '') + '" data-open="market" data-id="' + esc(p.m.code) + '">' +
      '<title>' + esc(p.m.name + ' — ' + st[1] + ' · ' + p.dl + ' deliverables' + (p.bl ? ' · ' + p.bl + ' open blockers' : '')) + '</title>' +
      '<circle cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="' + p.r.toFixed(1) + '" fill="' + FILL[p.m.oneAz] + '" class="mk-c"/>' +
      (p.bl ? '<circle cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="' + (p.r + 4).toFixed(1) + '" class="mk-ring"/>' : '') +
      '<text x="' + p.x.toFixed(1) + '" y="' + (p.y + 3.6).toFixed(1) + '" class="mk-lbl">' + esc(p.m.code) + '</text>' +
      '</g>';
  });
  svg += '</svg>';

  var h = subtabs(MKTTABS, 'map') +
    '<div class="filters" style="margin-bottom:14px"><span class="src">Bubble size = deliverables logged · ' +
    'fill = One AZ status · ring = open market-specific blockers</span></div>';

  h = '<div class="page-head"><div class="eyebrow">Market side</div><h1>Map</h1>' +
    '<p>Click a market to open it. Positions are approximate capital coordinates — a schematic for navigation, not a survey.</p></div>' + h;

  h += '<div class="grid g-side"><div class="card card-pad">' + svg + '</div>';

  h += '<div><div class="card card-pad"><div class="eyebrow">One AZ status</div>' +
    Object.keys(ONEAZ).map(function (k) {
      var n = S.markets.filter(function (m) { return m.oneAz === k && V.geo[m.code]; }).length;
      if (!n) return '';
      return '<div style="display:flex;align-items:center;gap:8px;padding:5px 0;font-size:12.5px">' +
        '<span style="width:12px;height:12px;border-radius:50%;background:' + FILL[k] + ';flex:0 0 auto"></span>' +
        esc(ONEAZ[k][1]) + '<span class="src" style="margin-left:auto">' + n + '</span></div>';
    }).join('') + '</div>';

  h += '<div class="card card-pad" style="margin-top:14px"><div class="eyebrow">Off the map</div>' +
    V.offMap.map(function (c) {
      var m = byId2(S.markets, c); if (!m) return '';
      return '<div class="clickable" data-open="market" data-id="' + esc(c) + '" style="padding:9px 0;border-bottom:1px solid var(--line);cursor:pointer">' +
        '<div style="font-weight:600;font-size:13px">' + esc(m.name) + '</div>' +
        '<div class="src">' + esc((ONEAZ[m.oneAz] || ['', m.oneAz])[1]) + ' · ' + marketDeliverables(c).length + ' deliverables</div></div>';
    }).join('') + '</div>';

  h += '<div class="card card-pad" style="margin-top:14px"><div class="eyebrow">Clusters</div>' +
    window.DATA_CORE.clusters.map(function (cl) {
      var ms = S.markets.filter(function (m) { return m.cluster === cl; });
      if (!ms.length) return '';
      return '<div style="padding:7px 0;border-bottom:1px solid var(--line)"><div style="font-weight:600;font-size:12.5px">' + esc(cl) + '</div>' +
        '<div class="src mono">' + ms.map(function (m) { return m.code; }).join(' · ') + '</div></div>';
    }).join('') + '</div></div></div>';
  return h;
}

/* ============================================================= PAYWALL */
function viewPaywall() {
  var P = window.DATA_VIEWS.paywall;
  var proj = byId(S.projects, 'p-paywall-ch');
  var h = '<div class="page-head"><div class="eyebrow">Programme</div><h1>Paywall</h1>' +
    '<p>' + esc(P.model) + '</p></div>';

  h += '<div class="grid g-4">' +
    '<div class="card stat"><div class="k num">1</div><div class="l">Live pilot</div><div class="f">Switzerland — Trixeo DE and FR</div></div>' +
    '<div class="card stat"><div class="k num">39x</div><div class="l">Organic clicks, Canada</div><div class="f">7 → 280 on 25 brand pages</div></div>' +
    '<div class="card stat"><div class="k num">5–8</div><div class="l">Pages per 3-week cycle</div><div class="f">Confirmed by batch 1</div></div>' +
    '<div class="card stat alert"><div class="k num">' + fmt('2026-09-08') + '</div><div class="l">Next gate</div><div class="f">Compliance and SLT meeting</div></div>' +
    '</div>';

  h += '<div class="section"><h2>The five-stage service</h2><div class="grid g-3">' +
    P.stages.map(function (s) {
      return '<div class="card card-pad"><div class="eyebrow">Stage ' + s.n + '</div>' +
        '<div style="font-weight:600;margin-bottom:6px">' + esc(s.title) + '</div>' +
        '<div class="src" style="line-height:1.55">' + esc(s.what) + '</div></div>';
    }).join('') + '</div></div>';

  h += '<div class="section grid g-2">' +
    '<div class="card card-pad"><div class="eyebrow">Page audit — five scoring criteria</div><ol style="margin:8px 0 0;padding-left:20px;font-size:13px;line-height:1.7">' +
    P.criteria.map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('') + '</ol></div>' +
    '<div class="card card-pad"><div class="eyebrow">Batch types</div>' +
    P.batchTypes.map(function (b) {
      return '<div style="padding:8px 0;border-bottom:1px solid var(--line)"><div style="font-weight:600;font-size:13px">' + esc(b.k) + '</div>' +
        '<div class="src">' + esc(b.v) + '</div></div>';
    }).join('') + '</div></div>';

  h += '<div class="section"><h2>Switzerland — delivery plan</h2>' +
    '<div class="card card-pad">' + gantt(window.DATA_VIEWS.projectTasks['p-paywall-ch'], 'Task') +
    '<div class="note-box warn" style="margin-top:14px"><strong>Dates shift together.</strong> If the September compliance meeting moves, everything after it moves by the same number of days.</div>' +
    '</div></div>';

  h += '<div class="section"><h2>Markets</h2>' +
    '<p class="src" style="max-width:74ch;margin:-6px 0 12px">' + esc(P.scopeNote) + '</p>' +
    '<div class="card"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Market</th><th>State</th><th>Where it stands</th><th>Owner</th></tr></thead><tbody>';
  P.markets.forEach(function (m) {
    var cls = m.state === 'live-pilot' ? 'accent' : m.state === 'precedent' ? 'ok' : m.state === 'candidate' ? 'info' : 'ghost';
    h += '<tr class="clickable" data-open="market" data-id="' + esc(m.code) + '">' +
      '<td class="nowrap"><div class="t">' + esc(marketName(m.code)) + '</div><div class="d mono">' + esc(m.code) + '</div></td>' +
      '<td><span class="pill ' + cls + '">' + esc(m.label) + '</span></td>' +
      '<td>' + esc(m.note) + '</td>' +
      '<td class="src nowrap">' + esc(m.owner) + '</td></tr>';
  });
  h += '</tbody></table></div></div></div>';

  if (proj && proj.raci && proj.raci.length) {
    h += '<div class="section"><h2>Ownership</h2><div class="card"><div class="tbl-wrap"><table class="tbl" style="font-size:12px"><thead><tr><th>Task</th>' +
      proj.raciCols.map(function (c) { return '<th>' + esc(c) + '</th>'; }).join('') + '</tr></thead><tbody>';
    proj.raci.forEach(function (r) {
      h += '<tr><td>' + esc(r[0]) + '</td>' + r.slice(1).map(function (v) {
        var cls = v === 'R,A' || v === 'A' ? 'accent' : v === 'R' ? 'info' : v === 'C' ? 'warn' : 'ghost';
        return '<td class="nowrap">' + (v === '—' ? '<span class="src">—</span>' : '<span class="pill ' + cls + '">' + esc(v) + '</span>') + '</td>';
      }).join('') + '</tr>';
    });
    h += '</tbody></table></div></div></div>';
  }

  h += '<div class="section"><div class="note-box warn"><strong>Phase 2 — to be confirmed.</strong> ' + esc(P.phase2) + '</div></div>';
  return h;
}

/* ============================================================ CALENDAR */
var calMonth = TODAY.slice(0, 7);
function viewCalendar() {
  var h = '<div class="page-head"><div class="eyebrow">Connect tracker</div><h1>Calendar</h1>' +
    '<p>Meetings, connects, emails and deadlines, with the next steps that came out of each. ' +
    'Project milestones and blocker target dates are laid in automatically.</p></div>';

  h += '<div class="filters">' +
    '<a class="btn btn-sm" href="#/people">People</a>' +
    '<button class="btn btn-sm btn-primary">Calendar</button>' +
    '<span class="spacer"></span>' +
    '<button class="btn btn-sm" data-cal="prev">‹ Prev</button>' +
    '<strong style="min-width:140px;text-align:center">' + monthName(calMonth) + '</strong>' +
    '<button class="btn btn-sm" data-cal="next">Next ›</button>' +
    '<button class="btn btn-sm" data-cal="today">Today</button>' +
    '<button class="btn btn-primary btn-sm" data-act="new-event">+ Add</button></div>';

  /* build the month grid */
  var y = +calMonth.slice(0, 4), mo = +calMonth.slice(5, 7);
  var first = new Date(Date.UTC(y, mo - 1, 1));
  var startDow = (first.getUTCDay() + 6) % 7;               /* Monday first */
  var days = new Date(Date.UTC(y, mo, 0)).getUTCDate();
  var cells = [];
  for (var i = 0; i < startDow; i++) cells.push(null);
  for (var d = 1; d <= days; d++) cells.push(calMonth + '-' + String(d).padStart(2, '0'));
  while (cells.length % 7) cells.push(null);

  var auto = autoDates();
  h += '<div class="card card-pad"><div class="cal">' +
    ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(function (d) { return '<div class="cal-h">' + d + '</div>'; }).join('');
  cells.forEach(function (date) {
    if (!date) { h += '<div class="cal-d empty-d"></div>'; return; }
    var evs = S.events.filter(function (e) { return e.date === date; });
    var autos = auto[date] || [];
    h += '<div class="cal-d' + (date === TODAY ? ' today' : '') + '" data-day="' + date + '">' +
      '<div class="cal-n">' + (+date.slice(8)) + '</div>';
    evs.forEach(function (e) {
      h += '<div class="cal-e ev-' + esc(e.type) + (e.done ? ' done' : '') + '" data-open="event" data-id="' + esc(e.id) + '" title="' + esc(e.title) + '">' +
        esc(e.title) + '</div>';
    });
    autos.forEach(function (a) {
      h += '<div class="cal-e ev-auto" title="' + esc(a.t) + '">' + esc(a.t) + '</div>';
    });
    h += '</div>';
  });
  h += '</div></div>';

  /* upcoming + next steps */
  var up = S.events.filter(function (e) { return e.date >= TODAY; })
    .sort(function (a, b) { return a.date < b.date ? -1 : 1; });
  var past = S.events.filter(function (e) { return e.date < TODAY; })
    .sort(function (a, b) { return a.date > b.date ? -1 : 1; }).slice(0, 8);
  var openNext = [];
  S.events.forEach(function (e) { (e.next || []).forEach(function (n) { if (!e.done) openNext.push({ e: e, n: n }); }); });

  h += '<div class="section grid g-3">';
  h += '<div class="card"><div class="card-head"><h2>Coming up</h2></div>' +
    (up.length ? '<ul class="list-plain">' + up.slice(0, 10).map(function (e) {
      return '<li class="clickable" data-open="event" data-id="' + esc(e.id) + '">' +
        '<div class="li-top"><span class="t">' + esc(e.title) + '</span><span class="pill ' + evCls(e.type) + '">' + esc(e.type) + '</span></div>' +
        '<div class="li-sub">' + fmt(e.date) + ' · ' + esc(whoNames(e.who)) + '</div></li>';
    }).join('') + '</ul>' : '<div class="empty">Nothing scheduled.</div>') + '</div>';

  h += '<div class="card"><div class="card-head"><h2>Open next steps</h2><span class="sub">' + openNext.length + '</span></div>' +
    (openNext.length ? '<ul class="list-plain">' + openNext.map(function (x) {
      return '<li class="clickable" data-open="event" data-id="' + esc(x.e.id) + '">' +
        '<div>' + esc(x.n) + '</div><div class="li-sub">from ' + esc(x.e.title) + ' · ' + fmt(x.e.date) + '</div></li>';
    }).join('') + '</ul>' : '<div class="empty">Nothing outstanding.</div>') + '</div>';

  h += '<div class="card"><div class="card-head"><h2>Recently</h2></div>' +
    (past.length ? '<ul class="list-plain">' + past.map(function (e) {
      return '<li class="clickable" data-open="event" data-id="' + esc(e.id) + '">' +
        '<div class="li-top"><span class="t">' + esc(e.title) + '</span><span class="pill ' + (e.done ? 'ok' : 'ghost') + '">' + (e.done ? 'done' : 'open') + '</span></div>' +
        '<div class="li-sub">' + fmt(e.date) + ' · ' + esc(whoNames(e.who)) + '</div></li>';
    }).join('') + '</ul>' : '<div class="empty">Nothing logged.</div>') + '</div>';
  h += '</div>';
  return h;
}
function monthName(ym) {
  var M = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return M[+ym.slice(5, 7) - 1] + ' ' + ym.slice(0, 4);
}
function evCls(t) { return { meeting: 'accent', connect: 'info', email: 'teal', deadline: 'risk' }[t] || 'ghost'; }
function whoNames(ids) {
  if (!ids || !ids.length) return '—';
  return ids.map(function (i) { var p = byId(S.stakeholders, i); return p ? p.name : i; }).join(', ');
}
function autoDates() {
  var out = {};
  function push(d, t) { if (!d) return; (out[d] = out[d] || []).push({ t: t }); }
  S.projects.forEach(function (p) {
    (p.milestones || []).forEach(function (m) { if (!m.done) push(m.date, '◆ ' + p.name.split(' —')[0] + ': ' + m.what.slice(0, 40)); });
  });
  S.blockers.forEach(function (b) { if (b.status !== 'Closed') push(b.targetDate, '▲ ' + b.title.slice(0, 40)); });
  S.stakeholders.forEach(function (p) { push(p.nextContact, '● ' + p.name); });
  return out;
}
function drawerEvent(id) {
  var e = byId(S.events, id);
  if (!e) return;
  var h = '<div class="drawer-head"><div><h2>' + esc(e.title) + '</h2>' +
    '<div class="meta">' + fmt(e.date) + (e.time ? ' · ' + esc(e.time) : '') + ' · ' + esc(e.type) + '</div></div>' +
    '<button class="btn btn-ghost" data-act="close">✕</button></div><div class="drawer-body">' +
    '<div class="field"><label>Title</label><input type="text" name="title" value="' + esc(e.title) + '"></div>' +
    '<div class="field-row"><div class="field"><label>Date</label><input type="date" name="date" value="' + esc(e.date) + '"></div>' +
    '<div class="field"><label>Time</label><input type="text" name="time" value="' + esc(e.time || '') + '" placeholder="10:00"></div>' +
    '<div class="field"><label>Type</label>' + selN('type', e.type, ['meeting', 'connect', 'email', 'deadline']) + '</div></div>' +
    '<div class="field"><label>Who</label><div class="chips">' +
    S.stakeholders.map(function (p) {
      var on = (e.who || []).indexOf(p.id) >= 0;
      return '<label class="chip' + (on ? ' on' : '') + '"><input type="checkbox" data-group="who" value="' + esc(p.id) + '"' + (on ? ' checked' : '') + '>' + esc(p.name) + '</label>';
    }).join('') + '</div></div>' +
    '<div class="field"><label>Notes</label><textarea name="notes">' + esc(e.notes || '') + '</textarea></div>' +
    '<div class="field"><label>Next steps — one per line</label><textarea name="next" style="min-height:100px">' + esc((e.next || []).join('\n')) + '</textarea></div>' +
    '<div class="field"><label>Status</label>' + selN('done', e.done ? 'done' : 'open', ['open', 'done']) + '</div>' +
    '<button class="btn btn-danger btn-sm" data-act="del-event" data-id="' + esc(e.id) + '">Delete</button>' +
    '</div><div class="drawer-foot"><button class="btn" data-act="close">Cancel</button>' +
    '<button class="btn btn-primary" data-act="save-event" data-id="' + esc(e.id) + '">Save</button></div>';
  openDrawer(h);
}

/* =========================================================== MARKET EDIT */
function drawerMarket(code) {
  var m = byId2(S.markets, code);
  if (!m) return;
  var h = '<div class="drawer-head"><div><h2>Edit ' + esc(m.name) + '</h2>' +
    '<div class="meta">Everything here is yours to keep current</div></div>' +
    '<button class="btn btn-ghost" data-act="close">✕</button></div><div class="drawer-body">' +
    '<div class="field-row"><div class="field"><label>Name</label><input type="text" name="name" value="' + esc(m.name) + '"></div>' +
    '<div class="field"><label>Cluster</label>' + selN('cluster', m.cluster, window.DATA_CORE.clusters) + '</div></div>' +
    '<div class="field"><label>One AZ status</label>' + selN('oneAz', m.oneAz, ['implemented', 'in-process', 'proposed', 'not-started', 'baseline', 'watch', 'out-of-scope']) + '</div>' +
    '<div class="field-row"><div class="field"><label>Strategist</label><input type="text" name="strategist" value="' + esc(m.strategist) + '"></div>' +
    '<div class="field"><label>Delivery</label><input type="text" name="delivery" value="' + esc(m.delivery) + '"></div></div>' +
    '<div class="field"><label>Properties — one per line</label><textarea name="sites">' + esc(m.sites.join('\n')) + '</textarea></div>' +
    '<div class="field"><label>Headline</label><textarea name="headline" style="min-height:90px">' + esc(m.headline) + '</textarea></div>' +
    '<div class="field"><label>Contacts — one per line, as <span class="mono">Role: Name</span></label>' +
    '<textarea name="contacts" style="min-height:150px">' +
    esc((m.contacts || []).map(function (c) { return c.role + ': ' + c.name; }).join('\n')) + '</textarea>' +
    '<div class="hint">CDM, Digital Lead, PM, Solution Owner, Requestor — whatever you need to be able to reach.</div></div>' +
    '<div class="field"><label>Your notes</label><textarea name="notes">' + esc(m.notes || '') + '</textarea></div>' +
    '</div><div class="drawer-foot"><button class="btn" data-act="close">Cancel</button>' +
    '<button class="btn btn-primary" data-act="save-market" data-id="' + esc(code) + '">Save</button></div>';
  openDrawer(h);
}

/* ============================================================== INGEST
   Reads .xlsx, .pptx, .docx, .csv, .txt, .md, .eml and .json in the browser.
   Office files are ZIPs; we unzip them with DecompressionStream, which every
   current browser has built in — so this works offline from a local file with
   no library and no upload. Nothing leaves the machine. */

var ING = { files: [], active: null, map: {}, sheet: 0, target: 'deliverables' };

function crc32Skip() {}
async function unzip(buf) {
  var dv = new DataView(buf), n = buf.byteLength, eocd = -1;
  for (var i = n - 22; i >= 0 && i > n - 66000; i--) {
    if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error('Not a zip file');
  var count = dv.getUint16(eocd + 10, true), off = dv.getUint32(eocd + 16, true);
  var out = {}, p = off;
  for (var c = 0; c < count; c++) {
    if (dv.getUint32(p, true) !== 0x02014b50) break;
    var method = dv.getUint16(p + 10, true);
    var csize = dv.getUint32(p + 20, true);
    var nlen = dv.getUint16(p + 28, true), elen = dv.getUint16(p + 30, true), clen = dv.getUint16(p + 32, true);
    var lho = dv.getUint32(p + 42, true);
    var name = new TextDecoder().decode(new Uint8Array(buf, p + 46, nlen));
    var lnlen = dv.getUint16(lho + 26, true), lelen = dv.getUint16(lho + 28, true);
    var dstart = lho + 30 + lnlen + lelen;
    var raw = new Uint8Array(buf, dstart, csize);
    if (method === 0) out[name] = raw;
    else if (method === 8) {
      var ds = new DecompressionStream('deflate-raw');
      var blob = new Blob([raw]).stream().pipeThrough(ds);
      out[name] = new Uint8Array(await new Response(blob).arrayBuffer());
    }
    p += 46 + nlen + elen + clen;
  }
  return out;
}
function td(u8) { return new TextDecoder('utf-8').decode(u8); }
function unent(s) {
  return s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'").replace(/&apos;/g, "'").replace(/&amp;/g, '&');
}
function colIdx(ref) {
  var m = /^([A-Z]+)/.exec(ref); if (!m) return 0;
  var n = 0; for (var i = 0; i < m[1].length; i++) n = n * 26 + (m[1].charCodeAt(i) - 64);
  return n - 1;
}
function excelDate(v) {
  var n = +v; if (!isFinite(n) || n < 20000 || n > 80000) return String(v);
  var d = new Date(Date.UTC(1899, 11, 30) + n * 864e5);
  return d.toISOString().slice(0, 10);
}

async function parseFile(file) {
  var name = file.name, low = name.toLowerCase();
  if (/\.(txt|md|csv|tsv|eml|json)$/.test(low)) {
    var text = await file.text();
    if (low.endsWith('.json')) return { kind: 'json', name: name, json: JSON.parse(text) };
    if (/\.(csv|tsv)$/.test(low)) {
      var sep = low.endsWith('.tsv') ? '\t' : ',';
      return { kind: 'sheet', name: name, sheets: [{ name: name, rows: parseCSV(text, sep) }] };
    }
    return { kind: 'text', name: name, text: text };
  }
  var buf = await file.arrayBuffer();
  var z = await unzip(buf);
  if (low.endsWith('.xlsx') || low.endsWith('.xlsm')) return { kind: 'sheet', name: name, sheets: readXlsx(z) };
  if (low.endsWith('.pptx') || low.endsWith('.potx')) return { kind: 'text', name: name, text: readPptx(z) };
  if (low.endsWith('.docx')) return { kind: 'text', name: name, text: readDocx(z) };
  throw new Error('Unsupported file type');
}
function parseCSV(text, sep) {
  var rows = [], row = [], cur = '', q = false;
  for (var i = 0; i < text.length; i++) {
    var ch = text[i];
    if (q) {
      if (ch === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; }
      else cur += ch;
    } else if (ch === '"') q = true;
    else if (ch === sep) { row.push(cur.trim()); cur = ''; }
    else if (ch === '\n') { row.push(cur.trim()); rows.push(row); row = []; cur = ''; }
    else if (ch !== '\r') cur += ch;
  }
  if (cur || row.length) { row.push(cur.trim()); rows.push(row); }
  return rows.filter(function (r) { return r.some(function (c) { return c; }); });
}
function readXlsx(z) {
  var ss = [];
  if (z['xl/sharedStrings.xml']) {
    var sx = td(z['xl/sharedStrings.xml']);
    (sx.match(/<si>[\s\S]*?<\/si>/g) || []).forEach(function (si) {
      var t = (si.match(/<t[^>]*>([\s\S]*?)<\/t>/g) || []).map(function (x) {
        return unent(x.replace(/<[^>]+>/g, ''));
      }).join('');
      ss.push(t.replace(/\s+/g, ' ').trim());
    });
  }
  var wb = td(z['xl/workbook.xml'] || new Uint8Array());
  var rels = td(z['xl/_rels/workbook.xml.rels'] || new Uint8Array());
  var rmap = {};
  (rels.match(/<Relationship[^>]*>/g) || []).forEach(function (r) {
    var id = (/Id="([^"]+)"/.exec(r) || [])[1], tg = (/Target="([^"]+)"/.exec(r) || [])[1];
    if (id && tg) rmap[id] = tg.replace(/^\/?xl\//, '').replace(/^\//, '');
  });
  var sheets = [];
  (wb.match(/<sheet [^>]*\/?>/g) || []).forEach(function (s) {
    var nm = unent((/name="([^"]*)"/.exec(s) || [])[1] || 'Sheet');
    var rid = (/r:id="([^"]*)"/.exec(s) || [])[1];
    var path = 'xl/' + (rmap[rid] || '');
    if (!z[path]) return;
    var x = td(z[path]), rows = [];
    (x.match(/<row[^>]*>[\s\S]*?<\/row>/g) || []).forEach(function (r) {
      var cells = {}, max = -1;
      var re = /<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g, m;
      while ((m = re.exec(r))) {
        var attrs = m[1] || '', body = m[2] || '';
        var ref = (/r="([A-Z]+\d+)"/.exec(attrs) || [])[1];
        var idx = ref ? colIdx(ref) : max + 1;
        var ty = (/t="([^"]+)"/.exec(attrs) || [])[1] || 'n';
        var v = (/<v>([\s\S]*?)<\/v>/.exec(body) || [])[1];
        var val = '';
        if (ty === 's' && v != null) val = ss[+v] || '';
        else if (ty === 'inlineStr') val = unent(body.replace(/<[^>]+>/g, '')).trim();
        else if (v != null) val = unent(v).trim();
        if (val) cells[idx] = val;
        if (idx > max) max = idx;
      }
      if (max >= 0) {
        var arr = [];
        for (var i = 0; i <= max; i++) arr.push(cells[i] || '');
        rows.push(arr);
      }
    });
    sheets.push({ name: nm, rows: rows });
  });
  return sheets;
}
function readPptx(z) {
  var names = Object.keys(z).filter(function (n) { return /^ppt\/slides\/slide\d+\.xml$/.test(n); })
    .sort(function (a, b) { return (+/(\d+)/.exec(a)[1]) - (+/(\d+)/.exec(b)[1]); });
  return names.map(function (n, i) {
    var x = td(z[n]), out = ['--- Slide ' + (i + 1) + ' ---'];
    (x.match(/<a:p>[\s\S]*?<\/a:p>/g) || []).forEach(function (p) {
      var t = (p.match(/<a:t>([\s\S]*?)<\/a:t>/g) || []).map(function (y) {
        return unent(y.replace(/<[^>]+>/g, ''));
      }).join('').trim();
      if (t) out.push(t);
    });
    return out.join('\n');
  }).join('\n\n');
}
function readDocx(z) {
  var x = td(z['word/document.xml'] || new Uint8Array()), out = [];
  (x.match(/<w:p\b[\s\S]*?<\/w:p>/g) || []).forEach(function (p) {
    var t = (p.match(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g) || []).map(function (y) {
      return unent(y.replace(/<[^>]+>/g, ''));
    }).join('').replace(/\s+/g, ' ').trim();
    if (t) out.push(t);
  });
  return out.join('\n');
}

/* --- column mapping targets --- */
var ING_TARGETS = {
  deliverables: { label: 'Delivery record', fields: [
    { k: 'm', l: 'Market', req: true }, { k: 'site', l: 'Site' },
    { k: 'd', l: 'Deliverable', req: true }, { k: 'date', l: 'Date' },
    { k: 'st', l: 'Status' }, { k: 'note', l: 'Note' }] },
  blockers: { label: 'Blockers', fields: [
    { k: 'title', l: 'Blocker title', req: true }, { k: 'topic', l: 'Topic' },
    { k: 'markets', l: 'Markets' }, { k: 'priority', l: 'Priority' },
    { k: 'description', l: 'Description' }, { k: 'rootCause', l: 'Root cause' },
    { k: 'seoImpact', l: 'SEO impact' }, { k: 'nextStep', l: 'Next step' },
    { k: 'owner', l: 'Owner' }, { k: 'status', l: 'Status' }, { k: 'targetDate', l: 'Target date' }] },
  product: { label: 'Product items', fields: [
    { k: 'id', l: 'Ticket / ID', req: true }, { k: 'title', l: 'Title', req: true },
    { k: 'ws', l: 'Workstream' }, { k: 'sprint', l: 'Timing' },
    { k: 'status', l: 'Status' }, { k: 'why', l: 'Description' }, { k: 'markets', l: 'Markets' }] }
};
var MARKET_ALIAS = { 'slovekia': 'SK', 'czech republic': 'CZ', 'belux': 'BE', 'belgium': 'BE', 'balkans': 'BALKANS' };
function toMarketCode(v) {
  if (!v) return '';
  var s = String(v).trim();
  if (S.markets.some(function (m) { return m.code === s.toUpperCase(); })) return s.toUpperCase();
  var low = s.toLowerCase();
  if (MARKET_ALIAS[low]) return MARKET_ALIAS[low];
  var hit = null;
  S.markets.forEach(function (m) { if (m.name.toLowerCase().indexOf(low) === 0) hit = m.code; });
  return hit || s.toUpperCase().slice(0, 8);
}
function normStatus(v) {
  var t = String(v || '').toLowerCase();
  if (!t) return 'unknown';
  if (t.indexOf('implement') >= 0) return 'implemented';
  if (t.indexOf('progress') >= 0) return 'in-progress';
  if (t.indexOf('not start') >= 0) return 'not-started';
  if (t.indexOf('done') >= 0) return 'done';
  return 'other';
}
function normDate(v) {
  if (!v) return '';
  var s = String(v).trim();
  if (/^\d{4}-\d{2}(-\d{2})?$/.test(s)) return s;
  if (/^\d+(\.\d+)?$/.test(s)) { var d = excelDate(s); return /^\d{4}-/.test(d) ? d : ''; }
  var M = { jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12' };
  var m = /^([A-Za-z]{3,})'?\s*(\d{2,4})$/.exec(s);
  if (m && M[m[1].slice(0, 3).toLowerCase()]) {
    var yr = m[2].length === 2 ? '20' + m[2] : m[2];
    return yr + '-' + M[m[1].slice(0, 3).toLowerCase()];
  }
  return '';
}

function viewIngest() {
  var h = '<div class="page-head"><div class="eyebrow">Keeping it current</div><h1>Ingest</h1>' +
    '<p>Drop a tracker, a deck, a document or an email in here. Spreadsheets get column-mapped and merged into the desk; ' +
    'decks and documents get their text extracted so you can turn a paragraph into a product item or a blocker in two clicks. ' +
    'Everything is parsed in this browser — no upload, works offline.</p></div>';

  h += '<div class="card card-pad" id="drop" style="border:2px dashed var(--line-strong);text-align:center;padding:30px">' +
    '<div style="font-size:15px;font-weight:600;margin-bottom:6px">Drop files here</div>' +
    '<div class="src" style="margin-bottom:14px">.xlsx · .pptx · .docx · .csv · .txt · .md · .eml · .json backup</div>' +
    '<label class="btn btn-primary">Choose files<input type="file" id="ing-file" multiple hidden ' +
    'accept=".xlsx,.xlsm,.pptx,.potx,.docx,.csv,.tsv,.txt,.md,.eml,.json"></label></div>';

  if (ING.files.length) {
    h += '<div class="section"><h2>Loaded</h2><div class="card"><ul class="list-plain">' +
      ING.files.map(function (f, i) {
        return '<li class="clickable' + (ING.active === i ? ' on' : '') + '" data-ingfile="' + i + '">' +
          '<div class="li-top"><span class="t">' + esc(f.name) + '</span>' +
          '<span class="pill ' + (f.kind === 'sheet' ? 'info' : f.kind === 'json' ? 'accent' : 'ghost') + '">' + esc(f.kind) + '</span></div>' +
          '<div class="li-sub">' + (f.kind === 'sheet' ? f.sheets.length + ' sheet(s), ' +
            f.sheets.reduce(function (a, s) { return a + s.rows.length; }, 0) + ' rows'
            : f.kind === 'text' ? (f.text.length + ' characters extracted') : 'backup file') + '</div></li>';
      }).join('') + '</ul></div></div>';
  }

  var f = ING.active !== null ? ING.files[ING.active] : null;
  if (f && f.kind === 'json') {
    h += '<div class="section"><div class="card card-pad">' +
      '<div class="note-box warn"><strong>This is a desk backup.</strong> Restoring replaces everything currently in this browser.</div>' +
      '<div class="btn-row" style="margin-top:12px"><button class="btn btn-primary" data-act="ing-restore">Restore this backup</button></div></div></div>';
  }

  if (f && f.kind === 'sheet') {
    var sh = f.sheets[ING.sheet] || f.sheets[0];
    var tgt = ING_TARGETS[ING.target];
    h += '<div class="section"><h2>Map the columns</h2>';
    h += '<div class="filters">' +
      '<select id="ing-sheet">' + f.sheets.map(function (s, i) {
        return '<option value="' + i + '"' + (i === ING.sheet ? ' selected' : '') + '>' + esc(s.name) + ' (' + s.rows.length + ' rows)</option>';
      }).join('') + '</select>' +
      '<select id="ing-target">' + Object.keys(ING_TARGETS).map(function (k) {
        return '<option value="' + k + '"' + (k === ING.target ? ' selected' : '') + '>Into: ' + esc(ING_TARGETS[k].label) + '</option>';
      }).join('') + '</select>' +
      '<span class="spacer"></span><span class="src">Blank rows and rows missing a required field are skipped. Market cells carry down when merged.</span></div>';

    var head = sh.rows[0] || [];
    h += '<div class="card card-pad"><div class="grid g-3">' +
      tgt.fields.map(function (fl) {
        var cur = ING.map[ING.target + ':' + fl.k];
        if (cur === undefined) { cur = guessCol(head, fl); ING.map[ING.target + ':' + fl.k] = cur; }
        return '<div class="field" style="margin:0"><label>' + esc(fl.l) + (fl.req ? ' <span style="color:var(--risk)">*</span>' : '') + '</label>' +
          '<select data-ingmap="' + esc(fl.k) + '"><option value="-1">— none —</option>' +
          head.map(function (hn, i) {
            return '<option value="' + i + '"' + (String(cur) === String(i) ? ' selected' : '') + '>' +
              esc((hn || ('Column ' + (i + 1))).slice(0, 40)) + '</option>';
          }).join('') + '</select></div>';
      }).join('') + '</div>';

    var prev = buildRows(sh, ING.target);
    h += '<div class="divider"></div><div class="li-top"><strong style="font-size:13px">Preview — ' + prev.length + ' usable rows</strong>' +
      '<button class="btn btn-primary btn-sm" data-act="ing-merge">Merge ' + prev.length + ' rows</button></div>' +
      '<div class="tbl-wrap" style="max-height:340px;overflow-y:auto;margin-top:10px"><table class="tbl"><thead><tr>' +
      tgt.fields.map(function (fl) { return '<th>' + esc(fl.l) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      prev.slice(0, 40).map(function (r) {
        return '<tr>' + tgt.fields.map(function (fl) {
          return '<td>' + esc(String(r[fl.k] === undefined ? '' : (Array.isArray(r[fl.k]) ? r[fl.k].join(', ') : r[fl.k])).slice(0, 90)) + '</td>';
        }).join('') + '</tr>';
      }).join('') + '</tbody></table></div></div></div>';
  }

  if (f && f.kind === 'text') {
    h += '<div class="section"><h2>Extracted text</h2>' +
      '<p class="src" style="margin:-6px 0 12px;max-width:74ch">Select any passage, then send it straight into a new product item, blocker or calendar entry — the text lands in the description and you fill in the rest.</p>' +
      '<div class="grid g-side"><div class="card card-pad">' +
      '<textarea id="ing-text" class="out" style="min-height:460px" spellcheck="false">' + esc(f.text) + '</textarea></div>' +
      '<div><div class="card card-pad"><div class="eyebrow">Create from selection</div>' +
      '<div class="btn-row" style="margin-top:10px;flex-direction:column;align-items:stretch">' +
      '<button class="btn" data-act="ing-mk-product">→ New product item</button>' +
      '<button class="btn" data-act="ing-mk-blocker">→ New blocker</button>' +
      '<button class="btn" data-act="ing-mk-event">→ New calendar entry</button>' +
      '</div><div class="src" style="margin-top:12px">With nothing selected, the first 600 characters are used.</div></div></div></div></div>';
  }
  return h;
}
function guessCol(head, fl) {
  var want = { m: ['market', 'country'], site: ['site', 'website', 'url', 'property'], d: ['deliver', 'activity', 'task', 'work'],
    date: ['delivery date', 'date', 'expected'], st: ['status'], note: ['comment', 'note'],
    title: ['title', 'blocker topic', 'name', 'summary', 'epic'], topic: ['topic', 'theme'],
    markets: ['market'], priority: ['priority'], description: ['description', 'theme / description'],
    rootCause: ['root cause'], seoImpact: ['seo', 'audience'], nextStep: ['next step'],
    owner: ['owner', 'accountable'], targetDate: ['target'], id: ['id', 'key', 'ticket'],
    ws: ['workstream'], sprint: ['sprint', 'timing'], why: ['description', 'detail'] }[fl.k] || [];
  for (var w = 0; w < want.length; w++) {
    for (var i = 0; i < head.length; i++) {
      if (String(head[i] || '').toLowerCase().indexOf(want[w]) >= 0) return i;
    }
  }
  return -1;
}
function buildRows(sh, target) {
  var tgt = ING_TARGETS[target], out = [], carry = {};
  for (var i = 1; i < sh.rows.length; i++) {
    var r = sh.rows[i], rec = {}, ok = true;
    tgt.fields.forEach(function (fl) {
      var ci = +ING.map[target + ':' + fl.k];
      var v = (ci >= 0 && r[ci] !== undefined) ? String(r[ci]).trim() : '';
      if ((fl.k === 'm' || fl.k === 'site') && !v) v = carry[fl.k] || '';
      else if (fl.k === 'm' || fl.k === 'site') carry[fl.k] = v;
      rec[fl.k] = v;
    });
    tgt.fields.forEach(function (fl) { if (fl.req && !rec[fl.k]) ok = false; });
    if (!ok) continue;
    if (target === 'deliverables') {
      rec.m = toMarketCode(rec.m); rec.st = normStatus(rec.st); rec.date = normDate(rec.date);
    }
    if (target === 'blockers' || target === 'product') {
      if (rec.markets) rec.markets = String(rec.markets).split(/[,;/]/).map(function (s) { return toMarketCode(s); }).filter(Boolean);
      else rec.markets = [];
    }
    out.push(rec);
  }
  return out;
}
function mergeRows(rows, target) {
  var added = 0, updated = 0;
  if (target === 'deliverables') {
    var idx = {};
    S.deliverables.forEach(function (d) { idx[d.m + '|' + d.d.slice(0, 90)] = d; });
    rows.forEach(function (r) {
      var k = r.m + '|' + r.d.slice(0, 90), ex = idx[k];
      if (ex) {
        if (ex.st !== r.st || ex.date !== r.date) { ex.st = r.st || ex.st; ex.date = r.date || ex.date; ex.note = r.note || ex.note; updated++; }
      } else { S.deliverables.push({ m: r.m, site: r.site, d: r.d, date: r.date, st: r.st, note: r.note }); idx[k] = r; added++; }
    });
  }
  if (target === 'blockers') {
    rows.forEach(function (r) {
      var ex = null;
      S.blockers.forEach(function (b) { if (b.title.toLowerCase() === String(r.title).toLowerCase()) ex = b; });
      if (ex) {
        ['topic','priority','description','rootCause','seoImpact','nextStep','owner','status','targetDate'].forEach(function (k) {
          if (r[k]) ex[k] = r[k];
        });
        if (r.markets && r.markets.length) ex.markets = r.markets;
        updated++;
      } else {
        S.blockers.push({
          id: uid('blk'), title: r.title, topic: r.topic || 'Other', markets: r.markets || [],
          priority: r.priority || 'Medium', status: r.status || 'To review', verified: false, tags: [],
          description: r.description || '', rootCause: r.rootCause || '', implImpact: '',
          seoImpact: r.seoImpact || '', evidence: '', direction: '', owner: r.owner || '',
          supporting: '', nextStep: r.nextStep || '', targetDate: normDate(r.targetDate) || '',
          escalate: 'To assess', source: 'Imported', toldMarkets: '', toldProduct: ''
        });
        added++;
      }
    });
  }
  if (target === 'product') {
    rows.forEach(function (r) {
      var ex = byId(S.product, r.id);
      if (ex) {
        ['title','ws','sprint','status','why'].forEach(function (k) { if (r[k]) ex[k] = r[k]; });
        if (r.markets && r.markets.length) ex.markets = r.markets;
        updated++;
      } else {
        S.product.push({
          id: r.id, title: r.title, ws: r.ws || 'OneAZ', sprint: r.sprint || '',
          status: r.status || 'on-track', seo: 'medium', tags: [],
          markets: (r.markets && r.markets.length) ? r.markets : ['ALL'], assessment: 'draft',
          why: r.why || '', toMarkets: '', toProduct: '', flag: 'none',
          comms: { markets: '', product: '' }, due: ''
        });
        added++;
      }
    });
  }
  return { added: added, updated: updated };
}
function ingSelection() {
  var ta = document.getElementById('ing-text');
  if (!ta) return '';
  var s = ta.value.slice(ta.selectionStart, ta.selectionEnd).trim();
  return s || ta.value.slice(0, 600).trim();
}

/* ====================================================== SUB-TAB HELPER */
function subtabs(items, cur) {
  return '<div class="filters">' + items.map(function (i) {
    return i[0] === cur
      ? '<button class="btn btn-sm btn-primary">' + esc(i[1]) + '</button>'
      : '<a class="btn btn-sm" href="#/' + i[0] + '">' + esc(i[1]) + '</a>';
  }).join('') + '<span class="spacer"></span></div>';
}
var PRODTABS = [['product', 'Radar'], ['pmap', 'Map'], ['ptime', 'Timeline'], ['pstruct', 'Structure']];
var MKTTABS = [['markets', 'List'], ['map', 'Map'], ['links', 'Links']];

/* =========================================================== LEARN */
var learnSel = 'l1';
function viewLearn() {
  var L = window.DATA_LEARN;
  var h = '<div class="page-head"><div class="eyebrow">Learn the product</div>' +
    '<h1>The product, explained</h1>' +
    '<p>Seven short lessons and a decoder. Written for someone who has to hold a conversation with a product team, ' +
    'not build the thing. Every idea ends in a question you can actually ask.</p></div>';

  h += subtabs([['learn', 'Lessons'], ['glossary', 'Decoder']], 'learn');

  var done = S.learnDone || {};
  var nDone = L.lessons.filter(function (l) { return done[l.id]; }).length;

  h += '<div class="grid g-side">';
  /* lesson list */
  h += '<div><div class="card"><div class="card-head"><h2>Lessons</h2>' +
    '<span class="sub">' + nDone + ' of ' + L.lessons.length + ' read</span></div>' +
    '<ul class="list-plain">' + L.lessons.map(function (l, i) {
      return '<li class="clickable' + (learnSel === l.id ? ' on' : '') + '" data-lesson="' + esc(l.id) + '">' +
        '<div class="li-top"><span class="t">' + (done[l.id] ? '✓ ' : (i + 1) + '. ') + esc(l.title) + '</span>' +
        '<span class="pill ghost">' + l.mins + ' min</span></div>' +
        '<div class="li-sub">' + esc(l.hook) + '</div></li>';
    }).join('') + '</ul></div>';

  var les = null;
  L.lessons.forEach(function (l) { if (l.id === learnSel) les = l; });
  if (les) {
    h += '<div class="card" style="margin-top:16px"><div class="card-head"><h2>' + esc(les.title) + '</h2>' +
      '<span class="sub">' + les.mins + ' min read</span></div><div class="card-pad lesson">' +
      les.blocks.map(renderBlock).join('') +
      '<div class="divider"></div><div class="btn-row">' +
      '<button class="btn ' + (done[les.id] ? '' : 'btn-primary') + '" data-act="lesson-done" data-id="' + esc(les.id) + '">' +
      (done[les.id] ? '✓ Marked as read' : 'Mark as read') + '</button>' +
      (nextLesson(les.id) ? '<button class="btn" data-lesson="' + esc(nextLesson(les.id)) + '">Next lesson →</button>' : '') +
      '</div></div></div>';
  }
  h += '</div>';

  /* sidebar */
  h += '<div><div class="card card-pad"><div class="eyebrow">Where this leads</div>' +
    '<div style="font-size:13px;line-height:1.65;margin-top:6px">Once a lesson clicks, the matching view in this app stops being a wall of tickets:</div>' +
    '<div style="margin-top:10px">' +
    [['Lesson 2 →','#/pstruct','Structure — the full sitemap and feature inventory'],
     ['Lesson 4 →','#/ptime','Timeline — what is built, being built, or still a spike'],
     ['Lesson 6 →','#/pmap','Product map — click any category for the questions to ask'],
     ['Lesson 7 →','#/product','Radar — the live items, ranked by what needs you']].map(function (r) {
      return '<a href="' + r[1] + '" style="display:block;padding:9px 0;border-bottom:1px solid var(--line);text-decoration:none">' +
        '<span class="src" style="font-weight:700">' + esc(r[0]) + '</span><br>' +
        '<span style="font-size:12.5px;color:var(--ink)">' + esc(r[2]) + '</span></a>';
    }).join('') + '</div></div>';

  h += '<div class="card card-pad" style="margin-top:14px"><div class="eyebrow">If you remember one thing</div>' +
    '<div class="note-box" style="margin-top:8px">A guideline built into the component is met by every market that uses it. ' +
    'A guideline written in a recommendation is met by the markets that had time to read it.</div></div></div>';

  h += '</div>';
  return h;
}
function nextLesson(id) {
  var L = window.DATA_LEARN.lessons;
  for (var i = 0; i < L.length - 1; i++) if (L[i].id === id) return L[i + 1].id;
  return null;
}
function renderBlock(b) {
  if (b.t === 'p') return '<p>' + esc(b.v) + '</p>';
  if (b.t === 'h') return '<h3>' + esc(b.v) + '</h3>';
  if (b.t === 'callout') return '<div class="note-box"><strong>' + esc(b.k) + '.</strong> ' + esc(b.v) + '</div>';
  if (b.t === 'list') return '<ul>' + b.v.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>';
  if (b.t === 'cards') return '<div class="grid g-2" style="margin:12px 0">' + b.v.map(function (c) {
    return '<div class="card card-pad" style="box-shadow:none;background:var(--surface-2)">' +
      '<div style="font-weight:650;font-size:13px;margin-bottom:5px">' + esc(c.k) + '</div>' +
      '<div class="src" style="line-height:1.6">' + esc(c.v) + '</div></div>';
  }).join('') + '</div>';
  if (b.t === 'steps') return '<div style="margin:12px 0">' + b.v.map(function (s) {
    return '<div style="padding:11px 0;border-bottom:1px solid var(--line)">' +
      '<div style="font-weight:650;font-size:13px;color:var(--accent)">' + esc(s.k) + '</div>' +
      '<div style="font-size:13px;line-height:1.6;margin-top:3px">' + esc(s.v) + '</div></div>';
  }).join('') + '</div>';
  if (b.t === 'ask') return '<div style="margin:12px 0">' + b.v.map(function (a) {
    return '<div class="card card-pad" style="box-shadow:none;background:var(--surface-2);margin-bottom:8px">' +
      '<div style="font-weight:650;font-size:13px;margin-bottom:6px">' + esc(a.k) + '</div>' +
      '<ul style="margin:0;padding-left:18px">' + a.qs.map(function (q) {
        return '<li style="font-size:12.5px;line-height:1.6">' + esc(q) + '</li>';
      }).join('') + '</ul></div>';
  }).join('') + '</div>';
  if (b.t === 'table') return '<div class="tbl-wrap" style="margin:12px 0"><table class="tbl"><thead><tr>' +
    b.head.map(function (x) { return '<th>' + esc(x) + '</th>'; }).join('') + '</tr></thead><tbody>' +
    b.rows.map(function (r) {
      return '<tr>' + r.map(function (c) { return '<td>' + esc(c) + '</td>'; }).join('') + '</tr>';
    }).join('') + '</tbody></table></div>';
  if (b.t === 'quiz') return '<details class="quiz"><summary><strong>Check yourself.</strong> ' + esc(b.q) + '</summary>' +
    '<div class="quiz-a">' + esc(b.a) + '</div></details>';
  if (b.t === 'diagram') return diagram(b.v);
  return '';
}

/* --------------------------------------------------------- diagrams */
function diagram(kind) {
  if (kind === 'stack') {
    var sats = [
      { x: 60,  y: 30,  w: 150, t: 'Veeva',            s: 'approved content, events' },
      { x: 60,  y: 130, w: 150, t: 'Reltio / IQVIA',   s: 'is this a real HCP?' },
      { x: 60,  y: 230, w: 150, t: 'Swiss Rx Login',   s: 'the gate itself' },
      { x: 590, y: 30,  w: 150, t: 'MCP',              s: 'which cards to show' },
      { x: 590, y: 130, w: 150, t: 'Kaltura',          s: 'video' },
      { x: 590, y: 230, w: 150, t: 'Analytics + GSC',  s: 'did it work?' }
    ];
    var s = '<div class="dgm"><svg viewBox="0 0 800 340" role="img" aria-label="How a One AZ page is assembled">';
    s += '<rect x="300" y="110" width="200" height="120" rx="10" class="d-core"/>' +
      '<text x="400" y="158" class="d-t d-ct">AEM</text>' +
      '<text x="400" y="180" class="d-s d-ct">builds and publishes</text>' +
      '<text x="400" y="198" class="d-s d-ct">the page</text>';
    sats.forEach(function (b) {
      var right = b.x > 400;
      var cx = right ? b.x : b.x + b.w, cy = b.y + 28;
      s += '<rect x="' + b.x + '" y="' + b.y + '" width="' + b.w + '" height="56" rx="8" class="d-box"/>' +
        '<text x="' + (b.x + b.w / 2) + '" y="' + (b.y + 24) + '" class="d-t d-ct">' + esc(b.t) + '</text>' +
        '<text x="' + (b.x + b.w / 2) + '" y="' + (b.y + 42) + '" class="d-s d-ct">' + esc(b.s) + '</text>' +
        '<path d="M' + cx + ' ' + cy + ' L' + (right ? 500 : 300) + ' 170" class="d-line"/>';
    });
    s += '<rect x="300" y="270" width="200" height="46" rx="8" class="d-out"/>' +
      '<text x="400" y="290" class="d-t d-ct">The page a crawler gets</text>' +
      '<text x="400" y="307" class="d-s d-ct">this is the only thing we can influence</text>' +
      '<path d="M400 230 L400 270" class="d-line d-strong"/>';
    s += '</svg><div class="src">Everything on the left decides who is let in. Everything on the right decides what is added afterwards. ' +
      'AEM is where a requirement has to land to reach the page.</div></div>';
    return s;
  }
  if (kind === 'sitemap') {
    var T = window.DATA_SITEMAP.tree;
    var s = '<div class="dgm tree">';
    T.forEach(function (n) {
      s += '<div class="tn tn-l1 t-' + n.type + '"><span class="tn-lvl">L' + n.lvl + '</span>' +
        '<span class="tn-name">' + esc(n.label) + '</span>' +
        '<span class="pill ' + (n.type === 'page' ? 'ok' : n.type === 'link' ? 'info' : 'ghost') + '">' +
        (n.type === 'page' ? 'content page' : n.type === 'link' ? 'link level' : 'navigation only') + '</span>' +
        (n.req ? '<span class="pill accent">mandatory</span>' : '') + '</div>';
      (n.kids || []).forEach(function (k) {
        s += '<div class="tn tn-l2 t-' + k.type + '"><span class="tn-lvl">L' + k.lvl + '</span>' +
          '<span class="tn-name">' + esc(k.label) + '</span>' +
          '<span class="pill ' + (k.type === 'page' ? 'ok' : k.type === 'link' ? 'info' : 'ghost') + '">' +
          (k.type === 'page' ? 'content page' : k.type === 'link' ? 'link level' : 'navigation only') + '</span>' +
          (k.req ? '' : '<span class="pill ghost">optional</span>') +
          (k.url ? '<span class="mono src" style="margin-left:auto">' + esc(k.url) + '</span>' : '') + '</div>';
      });
    });
    s += '</div><div class="src">Green carries a URL. Grey is a menu label with nothing behind it — it never appears in a URL or a breadcrumb.</div>';
    return s;
  }
  if (kind === 'pi') {
    var pi = S.pi;
    var s = '<div class="dgm"><div class="pi-row">';
    pi.sprints.forEach(function (sp) {
      s += '<div class="pi-sp"><div class="pi-n">Sprint ' + sp.n + '</div><div class="pi-d">' + esc(sp.dates) + '</div></div>';
    });
    s += '</div><div class="pi-bar"><span class="pi-mark" style="left:8%">PI planning<br><b>14–16 Jul</b></span>' +
      '<span class="pi-mark" style="left:44%">Release<br><b>20 Aug</b></span>' +
      '<span class="pi-mark" style="left:76%">Release<br><b>17 Sep</b></span></div>' +
      '<div class="src" style="margin-top:34px">The whole increment is agreed in three days in July. Anything you want in the next one has to be raised before its planning session, not after.</div></div>';
    return s;
  }
  return '';
}

/* ------------------------------------------------------------ GLOSSARY */
var glosQ = '';
function viewGlossary() {
  var L = window.DATA_LEARN;
  var h = '<div class="page-head"><div class="eyebrow">Learn the product</div><h1>The decoder</h1>' +
    '<p>Every acronym and system name that comes up in a One AZ conversation, what it actually is, and whether you need to care.</p></div>';
  h += subtabs([['learn', 'Lessons'], ['glossary', 'Decoder']], 'glossary');
  h += '<div class="filters"><input type="search" id="glos-q" placeholder="Search the decoder…" value="' + esc(glosQ) + '" style="min-width:280px">' +
    '<span class="spacer"></span><span class="src">' + L.glossary.length + ' terms</span></div>';

  L.glossaryGroups.forEach(function (g) {
    var items = L.glossary.filter(function (t) {
      if (t.g !== g.id) return false;
      if (!glosQ) return true;
      return (t.t + ' ' + t.d + ' ' + t.why).toLowerCase().indexOf(glosQ.toLowerCase()) >= 0;
    });
    if (!items.length) return;
    h += '<div class="section"><h2>' + esc(g.label) + '</h2><div class="grid g-2">' +
      items.map(function (t) {
        return '<div class="card card-pad"><div style="font-weight:650;font-size:14px;margin-bottom:6px">' + esc(t.t) + '</div>' +
          '<div style="font-size:13px;line-height:1.6">' + esc(t.d) + '</div>' +
          '<div class="note-box" style="margin-top:10px;font-size:12px"><strong>Why you care.</strong> ' + esc(t.why) + '</div></div>';
      }).join('') + '</div></div>';
  });
  return h;
}

/* =========================================================== TIMELINE */
var tlFilter = '';
function viewTimeline() {
  var E = window.DATA_EXPLAIN, V = window.DATA_VIEWS;
  var h = '<div class="page-head"><div class="eyebrow">Product side</div><h1>Rollout timeline</h1>' +
    '<p>What is already in production, what is being built now, and what is still just an investigation. ' +
    'The earlier something is in this list, the cheaper it is to influence.</p></div>';
  h += subtabs(PRODTABS, 'ptime');

  var order = ['live', 'building', 'spike', 'blocked', 'planned'];
  var counts = {};
  S.product.forEach(function (p) {
    var r = (p.rollout || 'planned'); counts[r] = (counts[r] || 0) + 1;
  });

  h += '<div class="grid g-' + Math.min(5, order.length) + '" style="grid-template-columns:repeat(5,1fr)">' +
    order.map(function (k) {
      var d = E.rolloutStates[k];
      return '<div class="card stat clickable' + (tlFilter === k ? ' alert' : '') + '" data-tlf="' + k + '">' +
        '<div class="k num">' + (counts[k] || 0) + '</div><div class="l">' + esc(d[1]) + '</div>' +
        '<div class="f">' + esc(d[2]) + '</div></div>';
    }).join('') + '</div>';

  /* sprint board */
  h += '<div class="section"><h2>Across the ' + esc(S.pi.name) + '</h2>' +
    '<p class="src" style="margin:-6px 0 12px">' + esc(S.pi.window) + ' · planned ' + esc(S.pi.planned) +
    ' · releases ' + S.pi.releases.map(esc).join(' and ') + '</p>';

  var buckets = { 'Q2 spill-over': [], 'Q3 features': [], 'Live / standing': [], 'Other': [] };
  S.product.forEach(function (p) {
    if (tlFilter && (p.rollout || 'planned') !== tlFilter) return;
    var s = String(p.sprint || '');
    var b = /spill/i.test(s) ? 'Q2 spill-over'
      : /Q3 features/i.test(s) ? 'Q3 features'
      : /live|standing/i.test(s) ? 'Live / standing' : 'Other';
    buckets[b].push(p);
  });

  h += '<div class="grid g-4">' + Object.keys(buckets).map(function (b) {
    var list = buckets[b];
    return '<div class="card"><div class="card-head"><h2>' + esc(b) + '</h2><span class="sub">' + list.length + '</span></div>' +
      (list.length ? '<ul class="list-plain">' + list.sort(function (a, c) {
        var rk = { high: 0, medium: 1, low: 2 };
        return (rk[a.seo] === undefined ? 3 : rk[a.seo]) - (rk[c.seo] === undefined ? 3 : rk[c.seo]);
      }).map(function (p) {
        var r = E.rolloutStates[p.rollout || 'planned'];
        return '<li class="clickable" data-open="product" data-id="' + esc(p.id) + '">' +
          '<div class="li-top"><span class="t" style="font-size:12.5px">' + esc(p.title) + '</span></div>' +
          '<div class="li-sub"><span class="mono">' + esc(p.id) + '</span> ' +
          '<span class="pill ' + r[0] + '">' + esc(r[1]) + '</span> ' +
          '<span class="pill ' + (SEV[p.seo] || 'ghost') + '">' + esc(p.seo) + '</span></div></li>';
      }).join('') + '</ul>' : '<div class="empty">Nothing here.</div>') + '</div>';
  }).join('') + '</div></div>';

  /* rolled out where */
  h += '<div class="section"><h2>Rolled out where</h2>' +
    '<p class="src" style="margin:-6px 0 12px">Only the items with a known market footprint. Everything else is either cross-market or not yet anywhere.</p>' +
    '<div class="card"><div class="tbl-wrap"><table class="tbl"><thead><tr>' +
    '<th>Item</th><th>State</th><th>Since</th><th>Markets</th><th>Note</th></tr></thead><tbody>';
  var any = false;
  S.product.forEach(function (p) {
    var ro = E.rollout[p.id];
    if (!ro || !ro.where || !ro.where.length) return;
    if (tlFilter && (p.rollout || 'planned') !== tlFilter) return;
    any = true;
    var r = E.rolloutStates[p.rollout || 'planned'];
    h += '<tr class="clickable" data-open="product" data-id="' + esc(p.id) + '">' +
      '<td><div class="t">' + esc(p.title) + '</div><div class="d mono">' + esc(p.id) + '</div></td>' +
      '<td><span class="pill ' + r[0] + '">' + esc(r[1]) + '</span></td>' +
      '<td class="src nowrap">' + (ro.since ? fmt(ro.since) : '—') + '</td>' +
      '<td class="src">' + ro.where.map(function (c) { return c === 'ALL' ? 'all markets' : esc(c); }).join(', ') + '</td>' +
      '<td class="src">' + esc(ro.note || '') + '</td></tr>';
  });
  if (!any) h += '<tr><td colspan="5"><div class="empty">Nothing matches.</div></td></tr>';
  h += '</tbody></table></div></div></div>';
  return h;
}

/* ========================================================== STRUCTURE */
var stTab = 'tree', stMarket = '';
function viewStructure() {
  var D = window.DATA_SITEMAP;
  var h = '<div class="page-head"><div class="eyebrow">Product side</div><h1>Structure and features</h1>' +
    '<p>What a One AZ site is made of: the standard sitemap every portal follows, the full component and feature inventory, ' +
    'and what each market has actually built on top of it.</p></div>';
  h += subtabs(PRODTABS, 'pstruct');
  h += '<div class="filters">' +
    [['tree', 'The sitemap'], ['features', 'Feature inventory'], ['profiles', 'What each market has']].map(function (t) {
      return '<button class="btn btn-sm' + (stTab === t[0] ? ' btn-primary' : '') + '" data-sttab="' + t[0] + '">' + esc(t[1]) + '</button>';
    }).join('') + '</div>';

  if (stTab === 'tree') {
    h += '<div class="note-box" style="margin-bottom:16px">' + esc(D.docNote) + '</div>';
    h += '<div class="grid g-side"><div class="card card-pad">';
    D.tree.forEach(function (n) {
      h += '<div class="st-node clickable" data-stnode="' + esc(n.id) + '">' +
        '<div class="li-top"><div><span class="tn-lvl">L' + n.lvl + '</span> <strong>' + esc(n.label) + '</strong></div>' +
        '<span class="nowrap"><span class="pill ' + (n.type === 'page' ? 'ok' : n.type === 'link' ? 'info' : 'ghost') + '">' +
        (n.type === 'page' ? 'content page' : n.type === 'link' ? 'link level' : 'navigation only') + '</span>' +
        (n.req ? '<span class="pill accent">mandatory</span>' : '<span class="pill ghost">optional</span>') + '</span></div>' +
        '<div class="src" style="margin-top:4px">' + esc(n.note) + '</div></div>';
      (n.kids || []).forEach(function (k) {
        h += '<div class="st-node st-kid clickable" data-stnode="' + esc(k.id) + '">' +
          '<div class="li-top"><div><span class="tn-lvl">L' + k.lvl + '</span> ' + esc(k.label) +
          (k.url ? ' <span class="mono src">' + esc(k.url) + '</span>' : '') + '</div>' +
          '<span class="nowrap"><span class="pill ' + (k.type === 'page' ? 'ok' : k.type === 'link' ? 'info' : 'ghost') + '">' +
          (k.type === 'page' ? 'content page' : k.type === 'link' ? 'link level' : 'navigation only') + '</span>' +
          (k.req ? '' : '<span class="pill ghost">optional</span>') + '</span></div>' +
          (k.tabs ? '<div class="src" style="margin-top:5px">Sub-sections: ' + k.tabs.map(esc).join(' · ') + '</div>' : '') +
          '</div>';
      });
    });
    h += '</div><div><div class="card card-pad"><div class="eyebrow">The rules that bind it</div>' +
      D.navRules.map(function (r) {
        return '<div style="padding:9px 0;border-bottom:1px solid var(--line)">' +
          '<div class="src" style="text-transform:uppercase;letter-spacing:.05em;font-weight:700">' + esc(r.k) + '</div>' +
          '<div style="font-size:12.5px;line-height:1.5">' + esc(r.v) + '</div></div>';
      }).join('') + '</div>' +
      '<div class="card card-pad" style="margin-top:14px"><div class="eyebrow">How to read it</div>' +
      '<div style="font-size:12.5px;line-height:1.6;margin-top:6px">Click any level for the SEO read on it. ' +
      '<span class="pill ok">content page</span> carries a URL. <span class="pill ghost">navigation only</span> is a menu label ' +
      'that never appears in a URL or a breadcrumb — the rule most often broken.</div></div></div></div>';
  }

  if (stTab === 'features') {
    var E = window.DATA_EXPLAIN;
    h += '<p class="src" style="max-width:78ch;margin:-4px 0 14px">Every component and feature known to be part of One AZ, ' +
      'grouped by what it does. Click one for the detail and the questions to ask.</p>';
    D.featureGroups.forEach(function (g) {
      var fs = D.features.filter(function (f) { return f.group === g; });
      if (!fs.length) return;
      h += '<div class="section"><h2>' + esc(g) + '</h2><div class="grid g-3">' +
        fs.map(function (f) {
          var st = E.rolloutStates[f.state] || ['ghost', f.state, ''];
          return '<div class="card card-pad clickable" data-feat="' + esc(f.id) + '">' +
            '<div class="li-top" style="align-items:flex-start"><strong style="font-size:13.5px">' + esc(f.name) + '</strong>' +
            '<span class="pill ' + (f.state === 'standard' ? 'teal' : f.state === 'incident' ? 'risk' : st[0]) + '">' +
            (f.state === 'standard' ? 'in the standard' : f.state === 'incident' ? 'incident' : st[1]) + '</span></div>' +
            '<div class="src" style="margin:7px 0 0;line-height:1.55">' + esc(f.what) + '</div>' +
            (f.item ? '<div class="src mono" style="margin-top:7px">' + esc(f.item) + '</div>' : '') +
            '</div>';
        }).join('') + '</div></div>';
    });
  }

  if (stTab === 'profiles') {
    h += '<p class="src" style="max-width:78ch;margin:-4px 0 14px">Built from what has actually been delivered in each market — ' +
      'the sites were not crawled, so this is the shape of the work, not a page-by-page audit.</p>';
    h += '<div class="grid g-2">' + Object.keys(D.profiles).map(function (code) {
      var p = D.profiles[code], m = byId2(S.markets, code);
      return '<div class="card"><div class="card-head"><h2>' + esc(m ? m.name : code) + '</h2>' +
        '<a class="btn btn-ghost btn-sm" href="#/markets/' + esc(code) + '">Open market</a></div>' +
        '<div class="card-pad">' +
        '<div class="def" style="grid-template-columns:96px 1fr;font-size:12.5px">' +
        '<dt>Languages</dt><dd>' + p.langs.map(esc).join(', ') + '</dd>' +
        '<dt>Gating</dt><dd>' + esc(p.gating) + '</dd>' +
        '<dt>Areas</dt><dd>' + p.tas.map(esc).join(' · ') + '</dd>' +
        (p.brands && p.brands[0] !== '—' ? '<dt>Brands</dt><dd>' + p.brands.map(esc).join(', ') + '</dd>' : '') +
        '<dt>Scale</dt><dd>' + esc(p.scale) + '</dd></div>' +
        '<div class="divider"></div><div style="font-size:13px;line-height:1.6">' + esc(p.structure) + '</div>' +
        '<ul style="margin:10px 0 0;padding-left:18px;font-size:12.5px;line-height:1.6">' +
        p.notable.map(function (n) { return '<li>' + esc(n) + '</li>'; }).join('') + '</ul>' +
        '</div></div>';
    }).join('') + '</div>';
  }
  return h;
}

/* ============================================================== LINKS */
function viewLinks() {
  var D = window.DATA_SITEMAP;
  var h = '<div class="page-head"><div class="eyebrow">Market side</div><h1>Links</h1>' +
    '<p>Every One AZ property, with its robots file, sitemap and index check one click away. ' +
    'Add your own links per market — Search Console, staging, AEM author, whatever you actually open.</p></div>';
  h += subtabs(MKTTABS, 'links');

  h += '<div class="card card-pad" style="margin-bottom:16px"><div class="eyebrow">Standing links</div>' +
    '<div class="grid g-3" style="margin-top:10px">' +
    (S.sharedLinks || []).map(function (l, i) {
      return '<div class="card card-pad" style="box-shadow:none;background:var(--surface-2)">' +
        '<div style="font-weight:600;font-size:13px;margin-bottom:4px">' + esc(l.n) + '</div>' +
        (l.u ? '<a href="' + esc(l.u) + '" target="_blank" rel="noreferrer" class="mono" style="font-size:11.5px;word-break:break-all">' + esc(l.u.slice(0, 60)) + '…</a>'
             : '<span class="pill ghost">no URL yet</span>') +
        '<div class="src" style="margin-top:6px;line-height:1.5">' + esc(l.note || '') + '</div>' +
        '<button class="btn btn-sm btn-ghost" style="margin-top:8px" data-act="edit-shared" data-id="' + i + '">Edit</button>' +
        '</div>';
    }).join('') + '</div></div>';

  h += '<div class="note-box warn" style="margin-bottom:16px">' + esc(D.siteNote) + '</div>';

  var order = S.markets.filter(function (m) { return (S.marketSites && S.marketSites[m.code]) && S.marketSites[m.code].length; });
  order.forEach(function (m) {
    var sites = S.marketSites[m.code] || [];
    var extra = (S.marketLinks && S.marketLinks[m.code]) || [];
    h += '<div class="section"><div class="li-top" style="margin-bottom:8px">' +
      '<h2 style="margin:0"><a href="#/markets/' + esc(m.code) + '" style="text-decoration:none">' + esc(m.name) + '</a></h2>' +
      '<button class="btn btn-sm" data-act="edit-links" data-id="' + esc(m.code) + '">Edit links</button></div>' +
      '<div class="card"><div class="tbl-wrap"><table class="tbl"><thead><tr>' +
      '<th>Property</th><th>Live</th><th>Technical</th><th>Index check</th></tr></thead><tbody>';
    sites.forEach(function (s) {
      var origin = '';
      try { origin = new URL(s.u).origin; } catch (e) { origin = s.u.replace(/\/[^/]*$/, ''); }
      var host = origin.replace(/^https?:\/\//, '');
      h += '<tr><td><div class="t">' + esc(s.n) + '</div><div class="d mono">' + esc(host) + '</div></td>' +
        '<td><a href="' + esc(s.u) + '" target="_blank" rel="noreferrer">Open site ↗</a></td>' +
        '<td class="nowrap"><a href="' + esc(origin) + '/robots.txt" target="_blank" rel="noreferrer">robots.txt</a> · ' +
        '<a href="' + esc(origin) + '/sitemap.xml" target="_blank" rel="noreferrer">sitemap.xml</a></td>' +
        '<td class="nowrap"><a href="https://www.google.com/search?q=site%3A' + encodeURIComponent(host) +
        '" target="_blank" rel="noreferrer">site: search ↗</a> · ' +
        '<a href="https://search.google.com/search-console?resource_id=' + encodeURIComponent(origin) +
        '" target="_blank" rel="noreferrer">GSC ↗</a></td></tr>';
    });
    extra.forEach(function (l) {
      h += '<tr><td><div class="t">' + esc(l.n) + '</div><div class="d src">added by you</div></td>' +
        '<td colspan="3">' + (l.u ? '<a href="' + esc(l.u) + '" target="_blank" rel="noreferrer" class="mono" style="word-break:break-all">' + esc(l.u) + '</a>' : '<span class="src">—</span>') + '</td></tr>';
    });
    h += '</tbody></table></div></div></div>';
  });
  return h;
}

function drawerLinks(code) {
  var m = byId2(S.markets, code);
  var sites = (S.marketSites && S.marketSites[code]) || [];
  var extra = (S.marketLinks && S.marketLinks[code]) || [];
  var h = '<div class="drawer-head"><div><h2>Links — ' + esc(m ? m.name : code) + '</h2>' +
    '<div class="meta">One per line, as <span class="mono">Name | URL</span></div></div>' +
    '<button class="btn btn-ghost" data-act="close">✕</button></div><div class="drawer-body">' +
    '<div class="field"><label>Properties</label><textarea name="sites" style="min-height:110px">' +
    esc(sites.map(function (s) { return s.n + ' | ' + s.u; }).join('\n')) + '</textarea>' +
    '<div class="hint">These get the robots, sitemap and index-check links generated for them automatically.</div></div>' +
    '<div class="field"><label>Your own links</label><textarea name="extra" style="min-height:150px" placeholder="Search Console | https://…&#10;Staging | https://…&#10;AEM author | https://…&#10;Migration tracking list | https://…">' +
    esc(extra.map(function (s) { return s.n + ' | ' + s.u; }).join('\n')) + '</textarea></div>' +
    '</div><div class="drawer-foot"><button class="btn" data-act="close">Cancel</button>' +
    '<button class="btn btn-primary" data-act="save-links" data-id="' + esc(code) + '">Save</button></div>';
  openDrawer(h);
}
function drawerShared(i) {
  var l = (S.sharedLinks || [])[i];
  if (!l) return;
  var h = '<div class="drawer-head"><div><h2>' + esc(l.n) + '</h2><div class="meta">Standing link</div></div>' +
    '<button class="btn btn-ghost" data-act="close">✕</button></div><div class="drawer-body">' +
    '<div class="field"><label>Name</label><input type="text" name="n" value="' + esc(l.n) + '"></div>' +
    '<div class="field"><label>URL</label><input type="text" name="u" value="' + esc(l.u || '') + '"></div>' +
    '<div class="field"><label>Note</label><textarea name="note">' + esc(l.note || '') + '</textarea></div>' +
    '</div><div class="drawer-foot"><button class="btn" data-act="close">Cancel</button>' +
    '<button class="btn btn-primary" data-act="save-shared" data-id="' + i + '">Save</button></div>';
  openDrawer(h);
}

/* ============================================ DEEP DIVE DRAWERS */
function drawerCat(id, subId) {
  var V = window.DATA_VIEWS, E = window.DATA_EXPLAIN;
  var c = null; V.categories.forEach(function (x) { if (x.id === id) c = x; });
  if (!c) return;
  var sub = null; (c.subs || []).forEach(function (s) { if (s.id === subId) sub = s; });
  var ex = sub ? E.sub[subId] : E.cat[id];
  if (!ex) ex = E.cat[id] || {};
  var CARE = { core: 'risk', watch: 'warn', light: 'ghost' };
  var title = sub ? sub.title : c.title;
  var care = sub ? sub.care : c.care;

  var h = '<div class="drawer-head"><div><h2>' + (sub ? '' : c.icon + '&nbsp; ') + esc(title) + '</h2>' +
    '<div class="meta">' + (sub ? esc(c.title) + ' · ' : '') + 'product category</div></div>' +
    '<button class="btn btn-ghost" data-act="close">✕</button></div><div class="drawer-body">';

  h += '<div class="btn-row" style="margin-bottom:14px"><span class="pill ' + CARE[care] + '">' + esc(care) + '</span></div>';
  h += '<div class="eyebrow">In plain terms</div><div class="prose"><p>' + esc(ex.plain || c.blurb) + '</p></div>';

  if (ex.flow && ex.flow.length) {
    h += '<div class="divider"></div><div class="eyebrow">How it works</div>' +
      '<div class="flow">' + ex.flow.map(function (f, i) {
        return '<div class="flow-s"><span class="flow-n">' + (i + 1) + '</span><span>' + esc(f) + '</span></div>';
      }).join('') + '</div>';
  }

  h += '<div class="divider"></div><div class="note-box"><strong>Why it reaches us.</strong> ' + esc(ex.care || c.stake) + '</div>';

  if (ex.watch) h += '<div class="note-box warn" style="margin-top:10px"><strong>Watch.</strong> ' + esc(ex.watch) + '</div>';

  if (ex.ask && ex.ask.length) {
    h += '<div class="divider"></div><div class="eyebrow">What to ask</div>' +
      '<ul style="margin:6px 0 0;padding-left:18px;font-size:13px;line-height:1.7">' +
      ex.ask.map(function (q) { return '<li>' + esc(q) + '</li>'; }).join('') + '</ul>';
  }

  /* sub-categories */
  if (!sub && c.subs && c.subs.length) {
    h += '<div class="divider"></div><div class="eyebrow">Inside this category</div>';
    c.subs.forEach(function (s) {
      var items = S.product.filter(function (p) { return (V.itemCat[p.id] || [])[1] === s.id; });
      h += '<div class="clickable" data-catdive="' + esc(c.id) + '|' + esc(s.id) + '" ' +
        'style="padding:11px 0;border-bottom:1px solid var(--line);cursor:pointer">' +
        '<div class="li-top"><strong style="font-size:13px">' + esc(s.title) + '</strong>' +
        '<span class="nowrap"><span class="pill ' + CARE[s.care] + '">' + s.care + '</span>' +
        '<span class="pill ghost">' + items.length + '</span></span></div>' +
        '<div class="src" style="margin-top:3px">' + esc(s.note) + '</div></div>';
    });
  }

  /* items */
  var its = S.product.filter(function (p) {
    var m = V.itemCat[p.id] || [];
    return sub ? m[1] === subId : m[0] === id;
  });
  if (its.length) {
    h += '<div class="divider"></div><div class="eyebrow">Live items here</div><ul class="list-plain">' +
      its.map(function (p) {
        var r = E.rolloutStates[p.rollout || 'planned'];
        return '<li class="clickable" data-open="product" data-id="' + esc(p.id) + '" style="padding:10px 0">' +
          '<div class="li-top"><span class="t" style="font-size:13px">' + esc(p.title) + '</span>' +
          '<span class="pill ' + (SEV[p.seo] || 'ghost') + '">' + esc(p.seo) + '</span></div>' +
          '<div class="li-sub mono">' + esc(p.id) + ' · <span class="pill ' + r[0] + '">' + esc(r[1]) + '</span></div></li>';
      }).join('') + '</ul>';
  }

  h += '</div><div class="drawer-foot">' +
    (sub ? '<button class="btn" data-catdive="' + esc(c.id) + '|">← ' + esc(c.title) + '</button>' : '') +
    '<button class="btn" data-act="close">Close</button></div>';
  openDrawer(h);
}

function drawerZone(id) {
  var V = window.DATA_VIEWS, C = window.CHECKLIST;
  var z = null; V.anatomy.forEach(function (a) { if (a.id === id) z = a; });
  if (!z) return;
  var CARE = { core: 'risk', watch: 'warn', light: 'ghost' };
  var h = '<div class="drawer-head"><div><h2>' + z.n + '. ' + esc(z.label) + '</h2>' +
    '<div class="meta">page region</div></div>' +
    '<button class="btn btn-ghost" data-act="close">✕</button></div><div class="drawer-body">' +
    '<div class="btn-row" style="margin-bottom:14px"><span class="pill ' + CARE[z.care] + '">' + z.care + '</span></div>' +
    '<div class="eyebrow">What sits here</div><div class="prose"><p>' + esc(z.what) + '</p></div>' +
    '<div class="note-box"><strong>SEO / GEO read.</strong> ' + esc(z.seo) + '</div>';

  var its = z.items.map(function (i) { return byId(S.product, i); }).filter(Boolean);
  if (its.length) {
    h += '<div class="divider"></div><div class="eyebrow">Product items touching this region</div><ul class="list-plain">' +
      its.map(function (p) {
        var r = (window.DATA_EXPLAIN.rolloutStates[p.rollout || 'planned']) || ['ghost', ''];
        return '<li class="clickable" data-open="product" data-id="' + esc(p.id) + '" style="padding:10px 0">' +
          '<div class="li-top"><span class="t" style="font-size:13px">' + esc(p.title) + '</span>' +
          '<span class="pill ' + (SEV[p.seo] || 'ghost') + '">' + esc(p.seo) + '</span></div>' +
          '<div class="li-sub mono">' + esc(p.id) + ' · <span class="pill ' + r[0] + '">' + esc(r[1]) + '</span></div></li>';
      }).join('') + '</ul>';
  }
  var qs = [];
  C.groups.forEach(function (g) { g.items.forEach(function (it) { if (z.check.indexOf(it.id) >= 0) qs.push(it); }); });
  if (qs.length) {
    h += '<div class="divider"></div><div class="eyebrow">Ask before it ships</div>' +
      '<ul style="margin:6px 0 0;padding-left:18px;font-size:13px;line-height:1.7">' +
      qs.map(function (q) {
        return '<li>' + esc(q.q) + ' <span class="pill ' + (q.w === 'must' ? 'risk' : 'ghost') + '">' + q.w + '</span>' +
          (q.geo ? ' <span class="pill teal">GEO</span>' : '') + '</li>';
      }).join('') + '</ul>';
  }
  h += '</div><div class="drawer-foot"><button class="btn" data-act="close">Close</button></div>';
  openDrawer(h);
}

function drawerFeature(id) {
  var D = window.DATA_SITEMAP, E = window.DATA_EXPLAIN;
  var f = null; D.features.forEach(function (x) { if (x.id === id) f = x; });
  if (!f) return;
  var st = E.rolloutStates[f.state] || ['ghost', f.state, ''];
  var h = '<div class="drawer-head"><div><h2>' + esc(f.name) + '</h2>' +
    '<div class="meta">' + esc(f.group) + (f.item ? ' · ' + esc(f.item) : '') + '</div></div>' +
    '<button class="btn btn-ghost" data-act="close">✕</button></div><div class="drawer-body">' +
    '<div class="btn-row" style="margin-bottom:14px">' +
    '<span class="pill ' + (f.state === 'standard' ? 'teal' : f.state === 'incident' ? 'risk' : st[0]) + '">' +
    (f.state === 'standard' ? 'in the standard' : f.state === 'incident' ? 'incident' : st[1]) + '</span></div>' +
    '<div class="eyebrow">What it is</div><div class="prose"><p>' + esc(f.what) + '</p></div>' +
    '<div class="note-box"><strong>Why we care.</strong> ' + esc(f.seo) + '</div>' +
    '<div class="divider"></div><div class="def"><dt>Markets</dt><dd>' +
    f.markets.map(function (c) { return c === 'ALL' ? 'All markets' : esc(marketName(c)); }).join(', ') + '</dd>' +
    (st[2] ? '<dt>State</dt><dd>' + esc(st[2]) + '</dd>' : '') + '</div>';
  if (f.item) {
    var p = byId(S.product, f.item);
    if (p) h += '<div class="divider"></div><div class="btn-row">' +
      '<button class="btn btn-primary btn-sm" data-open="product" data-id="' + esc(p.id) + '">Open ' + esc(p.id) + ' in the radar</button></div>';
  }
  h += '</div><div class="drawer-foot"><button class="btn" data-act="close">Close</button></div>';
  openDrawer(h);
}

function drawerNode(id) {
  var D = window.DATA_SITEMAP, n = null;
  D.tree.forEach(function (t) {
    if (t.id === id) n = t;
    (t.kids || []).forEach(function (k) { if (k.id === id) n = k; });
  });
  if (!n) return;
  var h = '<div class="drawer-head"><div><h2>' + esc(n.label) + '</h2>' +
    '<div class="meta">Level ' + n.lvl + ' · ' +
    (n.type === 'page' ? 'content page' : n.type === 'link' ? 'link level' : 'navigation only') +
    ' · ' + (n.req ? 'mandatory' : 'optional') + '</div></div>' +
    '<button class="btn btn-ghost" data-act="close">✕</button></div><div class="drawer-body">' +
    '<div class="prose"><p>' + esc(n.note) + '</p></div>' +
    '<div class="note-box"><strong>SEO read.</strong> ' + esc(n.seo || '—') + '</div>' +
    (n.url ? '<div class="divider"></div><div class="eyebrow">URL pattern</div><div class="mono" style="font-size:13px">' + esc(n.url) + '</div>' : '') +
    (n.tabs ? '<div class="divider"></div><div class="eyebrow">Sub-sections</div><ul style="margin:6px 0 0;padding-left:18px;font-size:13px;line-height:1.7">' +
      n.tabs.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' +
      '<div class="src" style="margin-top:8px">* mandatory. Max 7 tabs, each dropdown max 7 links.</div>' : '') +
    '</div><div class="drawer-foot"><button class="btn" data-act="close">Close</button></div>';
  openDrawer(h);
}

/* ============================================================== DOCS */
var docSide = '', docStatus = '';
function viewDocs() {
  var D = window.DATA_DOCS;
  var h = '<div class="page-head"><div class="eyebrow">Output</div><h1>Documents</h1>' +
    '<p>What this desk produces and where each thing got to — the notes and standards going to the product team on one side, ' +
    'the briefs and deliverables going to the markets on the other.</p></div>';

  h += '<div class="filters">' +
    sel('doc-side', docSide, [['', 'Both sides'], ['product', 'Product-facing'], ['market', 'Market-facing'], ['both', 'Serves both']]) +
    sel('doc-status', docStatus, [['', 'All statuses']].concat(Object.keys(D.statuses).map(function (k) { return [k, D.statuses[k][1]]; }))) +
    '<span class="spacer"></span>' +
    '<button class="btn btn-primary btn-sm" data-act="new-doc">+ Log a document</button></div>';

  function lane(side, heading, note) {
    var rows = S.docs.filter(function (d) {
      if (side === 'product' && d.side === 'market') return false;
      if (side === 'market' && d.side === 'product') return false;
      if (docSide && d.side !== docSide) return false;
      if (docStatus && d.status !== docStatus) return false;
      return true;
    }).sort(function (a, b) {
      var rk = { idea: 0, drafting: 1, 'in-review': 2, recurring: 3, sent: 4, acknowledged: 5, superseded: 6 };
      var f = (rk[a.status] || 9) - (rk[b.status] || 9);
      if (f) return f;
      return (a.due || 'zz') < (b.due || 'zz') ? -1 : 1;
    });
    var x = '<div class="card"><div class="card-head"><h2>' + esc(heading) + '</h2>' +
      '<span class="sub">' + rows.length + ' · ' + esc(note) + '</span></div>';
    if (!rows.length) x += '<div class="empty">Nothing matches.</div>';
    else {
      x += '<ul class="list-plain">' + rows.map(function (d) {
        var st = D.statuses[d.status] || ['ghost', d.status];
        var late = d.due && daysUntil(d.due) < 0 && d.status !== 'sent' && d.status !== 'acknowledged';
        return '<li class="clickable" data-open="doc" data-id="' + esc(d.id) + '">' +
          '<div class="li-top"><span class="t">' + esc(d.title) + '</span>' +
          '<span class="nowrap"><span class="pill ' + st[0] + '">' + esc(st[1]) + '</span>' +
          (d.side === 'both' ? '<span class="pill accent">both</span>' : '') + '</span></div>' +
          '<div class="li-sub">' + esc(d.type) + ' · ' + esc(d.owner) +
          (d.market ? ' · ' + esc(d.market) : '') +
          (d.due ? ' · due ' + fmt(d.due) + (late ? ' <span class="pill risk">overdue</span>' : '') : '') +
          '<br>→ ' + esc(d.audience) + '</div></li>';
      }).join('') + '</ul>';
    }
    return x + '</div>';
  }

  h += '<div class="grid g-2">' +
    lane('product', 'To the product team', 'requirements in') +
    lane('market', 'To the SEO team and markets', 'standards out') +
    '</div>';

  h += '<div class="section"><h2>Where this desk came from</h2>' +
    '<p class="src" style="margin:-6px 0 12px">The source documents behind everything seeded here.</p>' +
    '<div class="grid g-2"><div class="card"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Document</th><th>What it gave us</th><th>Side</th></tr></thead><tbody>' +
    D.sources.map(function (s) {
      return '<tr><td class="t">' + esc(s.t) + '</td><td class="src">' + esc(s.d) + '</td>' +
        '<td><span class="pill ' + (s.side === 'product' ? 'accent' : s.side === 'market' ? 'info' : 'ghost') + '">' + esc(s.side) + '</span></td></tr>';
    }).join('') + '</tbody></table></div></div>' +
    '<div class="card card-pad"><div class="eyebrow">Keeping it current</div>' +
    '<div style="font-size:13px;line-height:1.65;margin-top:8px">When any of these is reissued, drop the new version into ' +
    '<a href="#/ingest">Ingest</a>. A tracker re-imports over the top of itself; a deck or a document opens as text you can pull items out of.</div>' +
    '<div class="btn-row" style="margin-top:12px"><a class="btn btn-sm" href="#/ingest">Open Ingest</a>' +
    '<a class="btn btn-sm" href="#/brief">Generate a note</a></div></div></div></div>';
  return h;
}

function drawerDoc(id) {
  var D = window.DATA_DOCS, d = byId(S.docs, id);
  if (!d) return;
  var h = '<div class="drawer-head"><div><h2>' + esc(d.title) + '</h2>' +
    '<div class="meta">' + esc(d.type) + ' · ' + esc(d.side === 'both' ? 'both sides' : d.side + '-facing') + '</div></div>' +
    '<button class="btn btn-ghost" data-act="close">✕</button></div><div class="drawer-body">' +
    '<div class="prose"><p>' + esc(d.what || '') + '</p></div>' +
    (d.next ? '<div class="note-box"><strong>Next.</strong> ' + esc(d.next) + '</div>' : '') +
    '<div class="divider"></div>' +
    '<div class="field-row"><div class="field"><label>Status</label>' +
    selN('status', d.status, Object.keys(D.statuses)) + '</div>' +
    '<div class="field"><label>Side</label>' + selN('side', d.side, ['product', 'market', 'both']) + '</div></div>' +
    '<div class="field-row"><div class="field"><label>Dated</label><input type="date" name="date" value="' + esc(d.date || '') + '"></div>' +
    '<div class="field"><label>Due</label><input type="date" name="due" value="' + esc(d.due || '') + '"></div></div>' +
    '<div class="field-row"><div class="field"><label>Owner</label><input type="text" name="owner" value="' + esc(d.owner || '') + '"></div>' +
    '<div class="field"><label>Audience</label><input type="text" name="audience" value="' + esc(d.audience || '') + '"></div></div>' +
    '<div class="field-row"><div class="field"><label>Type</label><input type="text" name="type" value="' + esc(d.type || '') + '"></div>' +
    '<div class="field"><label>Market</label><input type="text" name="market" value="' + esc(d.market || '') + '" placeholder="blank = cross-market"></div></div>' +
    '<div class="field"><label>Link</label><input type="text" name="link" value="' + esc(d.link || '') + '" placeholder="SharePoint, Teams, wherever it lives"></div>' +
    '<div class="field"><label>Title</label><input type="text" name="title" value="' + esc(d.title) + '"></div>' +
    '<div class="field"><label>What it is</label><textarea name="what">' + esc(d.what || '') + '</textarea></div>' +
    '<div class="field"><label>Next step</label><textarea name="next">' + esc(d.next || '') + '</textarea></div>' +
    '<div class="field"><label>Your notes</label><textarea name="notes">' + esc(d.notes || '') + '</textarea></div>' +
    '<button class="btn btn-danger btn-sm" data-act="del-doc" data-id="' + esc(d.id) + '">Delete</button>' +
    '</div><div class="drawer-foot"><button class="btn" data-act="close">Cancel</button>' +
    '<button class="btn btn-primary" data-act="save-doc" data-id="' + esc(d.id) + '">Save</button></div>';
  openDrawer(h);
}

/* ============================================================== ROUTER */
function render() {
  var parts = location.hash.replace(/^#\/?/, '').split('/');
  var v = parts[0] || '', arg = parts[1] || '';
  var el = document.getElementById('view');
  var html;
  if (v === 'product') html = viewProduct();
  else if (v === 'learn') html = viewLearn();
  else if (v === 'glossary') html = viewGlossary();
  else if (v === 'ptime') html = viewTimeline();
  else if (v === 'pstruct') html = viewStructure();
  else if (v === 'links') html = viewLinks();
  else if (v === 'docs') html = viewDocs();
  else if (v === 'pmap') html = viewProductMap();
  else if (v === 'map') html = viewMap();
  else if (v === 'markets') html = arg ? viewMarket(decodeURIComponent(arg)) : viewMarkets();
  else if (v === 'blockers') html = viewBlockers();
  else if (v === 'projects') html = viewProjects();
  else if (v === 'paywall') html = viewPaywall();
  else if (v === 'check') html = viewCheck(arg);
  else if (v === 'people') html = viewPeople();
  else if (v === 'cal') html = viewCalendar();
  else if (v === 'brief') html = viewBrief();
  else if (v === 'ingest') html = viewIngest();
  else if (v === 'data') html = viewData();
  else html = viewDashboard();
  el.innerHTML = html;
  window.scrollTo(0, 0);
  renderNav();
}

/* ============================================================== EVENTS */
document.addEventListener('click', function (e) {
  var t = e.target;

  var seg = t.closest && t.closest('[data-ans]');
  if (seg) {
    var p = seg.getAttribute('data-ans').split('|');
    var a = byId(S.assessments, p[0]);
    if (a) {
      a.answers[p[1]] = a.answers[p[1]] || {};
      a.answers[p[1]].v = a.answers[p[1]].v === p[2] ? '' : p[2];
      save(); render();
    }
    return;
  }

  var act = t.closest && t.closest('[data-act]');
  if (act) {
    var a2 = act.getAttribute('data-act'), id = act.getAttribute('data-id');
    if (a2 === 'close') { closeDrawer(); return; }
    if (a2 === 'toggle-theme') {
      var cur = document.documentElement.getAttribute('data-theme');
      var next = cur === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem(KEY + ':theme', next); } catch (err) {}
      return;
    }
    if (a2 === 'goto-data') { location.hash = '#/data'; return; }

    if (a2 === 'save-product') {
      var p2 = byId(S.product, id);
      p2.comms.markets = dv('cm'); p2.comms.product = dv('cp'); p2.notes = dv('notes');
      if (dv('title')) {
        p2.title = dv('title'); p2.seo = dv('seo'); p2.status = dv('status'); p2.ws = dv('ws');
        p2.sprint = dv('sprint'); p2.flag = dv('flag'); p2.assessment = dv('assessment');
        p2.why = dv('why'); p2.toMarkets = dv('toMarkets'); p2.toProduct = dv('toProduct');
        var mk = dchecks('markets'); if (mk.length) p2.markets = mk;
        p2.tags = dchecks('tags');
        p2.rollout = dv('rollout') || p2.rollout;
        p2.due = dv('due');
      }
      save(); closeDrawer(); render(); toast('Saved'); return;
    }
    if (a2 === 'del-product') {
      S.product = S.product.filter(function (x) { return x.id !== id; });
      save(); closeDrawer(); render(); toast('Deleted'); return;
    }
    if (a2 === 'new-product') {
      var np = {
        id: uid('item'), title: 'New product item', ws: 'OneAZ', sprint: '', status: 'on-track',
        seo: 'medium', tags: [], markets: ['ALL'], assessment: 'draft', why: '', toMarkets: '', toProduct: '',
        flag: 'none', comms: { markets: '', product: '' }
      };
      S.product.unshift(np); save(); render(); drawerProduct(np.id); return;
    }

    if (a2 === 'save-blocker') {
      var b2 = byId(S.blockers, id);
      b2.toldMarkets = dv('tm'); b2.toldProduct = dv('tp'); b2.notes = dv('notes');
      if (dv('title')) {
        ['title','topic','priority','status','description','rootCause','implImpact','seoImpact',
         'evidence','direction','owner','supporting','nextStep','targetDate','escalate'].forEach(function (k) {
          b2[k] = dv(k);
        });
        b2.verified = dv('verified') === 'yes';
        var mk2 = dchecks('markets'); if (mk2.length) b2.markets = mk2;
      }
      save(); closeDrawer(); render(); toast('Saved'); return;
    }
    if (a2 === 'del-blocker') {
      S.blockers = S.blockers.filter(function (x) { return x.id !== id; });
      save(); closeDrawer(); render(); toast('Deleted'); return;
    }
    if (a2 === 'new-blocker') {
      var nb = {
        id: uid('blk'), topic: 'Governance / workflow', title: 'New blocker', markets: [], priority: 'High',
        status: 'To review', verified: false, tags: [], description: '', rootCause: '', implImpact: '',
        seoImpact: '', evidence: '', direction: '', owner: '', supporting: '', nextStep: '',
        targetDate: '', escalate: 'To assess', source: 'Added in the desk', toldMarkets: '', toldProduct: ''
      };
      S.blockers.unshift(nb); save(); render(); drawerBlocker(nb.id); return;
    }

    if (a2 === 'save-project') {
      var pr2 = byId(S.projects, id);
      pr2.notes = dv('notes'); if (dv('phase')) pr2.phase = dv('phase'); pr2.rag = dv('rag') || pr2.rag;
      save(); closeDrawer(); render(); toast('Saved'); return;
    }

    if (a2 === 'save-person') {
      var pp = byId(S.stakeholders, id);
      pp.lastContact = dv('last'); pp.nextContact = dv('next'); pp.cadence = dv('cadence');
      pp.open = dv('open').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
      pp.notes = dv('notes');
      if (dv('name')) { pp.name = dv('name'); pp.role = dv('role'); pp.org = dv('org'); pp.side = dv('side'); pp.why = dv('why'); }
      save(); closeDrawer(); render(); toast('Saved'); return;
    }
    if (a2 === 'del-person') {
      S.stakeholders = S.stakeholders.filter(function (x) { return x.id !== id; });
      save(); closeDrawer(); render(); toast('Deleted'); return;
    }
    if (a2 === 'new-person') {
      var nper = { id: uid('sh'), name: 'New stakeholder', role: '', org: '', side: 'market', cadence: '', why: '', lastContact: '', nextContact: '', open: [] };
      S.stakeholders.push(nper); save(); render(); drawerPerson(nper.id); return;
    }

    if (a2 === 'new-assessment') { newAssessment(); return; }
    if (a2 === 'del-assessment') {
      S.assessments = S.assessments.filter(function (x) { return x.id !== id; });
      save(); location.hash = '#/check'; render(); return;
    }
    if (a2 === 'assess-readout') { copy(readout(byId(S.assessments, id))); return; }

    if (a2 === 'copy-brief') { copy(document.getElementById('brief-out').value); return; }
    if (a2 === 'download-brief') {
      download('liaison-' + briefKind + '-' + TODAY + '.md', document.getElementById('brief-out').value);
      return;
    }
    if (a2 === 'mark-markets') {
      S.product.filter(needsMarkets).forEach(function (p) { p.comms.markets = TODAY; });
      S.blockers.filter(blockerNeedsMarkets).forEach(function (b) { b.toldMarkets = TODAY; });
      save(); render(); toast('Marked as told to markets'); return;
    }
    if (a2 === 'mark-product') {
      S.product.filter(needsProduct).forEach(function (p) { p.comms.product = TODAY; });
      S.blockers.filter(blockerNeedsProduct).forEach(function (b) { b.toldProduct = TODAY; });
      save(); render(); toast('Marked as raised with product'); return;
    }

    if (a2 === 'sync-connect') {
      var k = document.getElementById('sync-key');
      SYNC.setKey(k ? k.value.trim() : '');
      SYNC.pull().then(function (remote) {
        if (SYNC.state.error) { toast(SYNC.state.error); render(); return; }
        if (remote && remote.product) {
          if (confirm('The server has a saved desk. Load it into this browser?\n\nCancel keeps what is here and pushes it up instead.')) {
            S = remote; save();
          } else { SYNC.push(S); }
        } else { SYNC.push(S); }
        toast('Connected'); render();
      });
      return;
    }
    if (a2 === 'sync-off') { SYNC.setKey(''); render(); toast('Disconnected'); return; }
    if (a2 === 'sync-pull') {
      SYNC.pull().then(function (remote) {
        if (!remote) { toast(SYNC.state.error || 'Nothing saved on the server yet'); render(); return; }
        if (confirm('Replace this browser\'s copy with the server copy?')) {
          S = remote;
          try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {}
          toast('Pulled from server');
        }
        render();
      });
      return;
    }
    if (a2 === 'sync-push') {
      SYNC.push(S).then(function (r) {
        if (r.conflict) {
          if (confirm('The server copy is newer. Overwrite it with this browser\'s copy?')) {
            SYNC.state.version = r.version;
            SYNC.push(S).then(function () { toast('Pushed'); render(); });
          } else render();
          return;
        }
        toast(r.ok ? 'Pushed to server' : ('Failed: ' + SYNC.state.error));
        render();
      });
      return;
    }

    if (a2 === 'export') {
      download('oneaz-liaison-backup-' + TODAY + '.json', JSON.stringify(S, null, 2));
      return;
    }
    if (a2 === 'reset') {
      if (confirm('Reset to the shipped seed data? Every edit and assessment in this browser is discarded.')) {
        S = seed(); save(); render(); toast('Reset');
      }
      return;
    }

    if (a2 === 'lesson-done') {
      S.learnDone = S.learnDone || {};
      S.learnDone[id] = !S.learnDone[id];
      save(); render(); return;
    }
    if (a2 === 'edit-links') { drawerLinks(id); return; }
    if (a2 === 'save-links') {
      function parseLines(v) {
        return v.split('\n').map(function (l) {
          var i = l.indexOf('|');
          if (!l.trim()) return null;
          return i < 0 ? { n: l.trim(), u: '' } : { n: l.slice(0, i).trim(), u: l.slice(i + 1).trim() };
        }).filter(Boolean);
      }
      S.marketSites = S.marketSites || {}; S.marketLinks = S.marketLinks || {};
      S.marketSites[id] = parseLines(dv('sites'));
      S.marketLinks[id] = parseLines(dv('extra'));
      save(); closeDrawer(); render(); toast('Links saved'); return;
    }
    if (a2 === 'edit-shared') { drawerShared(+id); return; }
    if (a2 === 'save-shared') {
      var sl = S.sharedLinks[+id];
      if (sl) { sl.n = dv('n') || sl.n; sl.u = dv('u'); sl.note = dv('note'); }
      save(); closeDrawer(); render(); toast('Saved'); return;
    }
    if (a2 === 'new-doc') {
      var nd2 = { id: uid('doc'), side: 'product', title: 'New document', type: 'Note', status: 'idea',
        owner: '', audience: '', date: '', due: '', link: '', market: '', what: '', next: '', relates: [] };
      S.docs.unshift(nd2); save(); render(); drawerDoc(nd2.id); return;
    }
    if (a2 === 'save-doc') {
      var dd = byId(S.docs, id);
      if (dd) {
        ['status','side','date','due','owner','audience','type','market','link','title','what','next','notes'].forEach(function (k) {
          dd[k] = dv(k);
        });
      }
      save(); closeDrawer(); render(); toast('Saved'); return;
    }
    if (a2 === 'del-doc') {
      S.docs = S.docs.filter(function (x) { return x.id !== id; });
      save(); closeDrawer(); render(); return;
    }
    if (a2 === 'log-brief') {
      var titles = { markets: 'Product update brief to the SEO team and markets',
        product: 'Product feedback note', agenda: 'Touch-base agenda', status: 'Status summary' };
      var nd3 = { id: uid('doc'), side: briefKind === 'product' ? 'product' : 'market',
        title: titles[briefKind] + ' — ' + fmt(TODAY), type: 'Note', status: 'sent',
        owner: 'Owais', audience: briefKind === 'product' ? 'Adrian' : 'Ana, Sushanta, Aswine → markets',
        date: TODAY, due: '', link: '', market: '',
        what: (document.getElementById('brief-out') || { value: '' }).value.slice(0, 1500), next: '', relates: [] };
      S.docs.unshift(nd3); save(); toast('Logged in Documents'); return;
    }

    if (a2 === 'df-clear') { df.market = ''; df.band = ''; df.q = ''; render(); return; }
    if (a2 === 'edit-market') { drawerMarket(id); return; }
    if (a2 === 'save-market') {
      var mm = byId2(S.markets, id);
      if (mm) {
        mm.name = dv('name') || mm.name; mm.cluster = dv('cluster'); mm.oneAz = dv('oneAz');
        mm.strategist = dv('strategist'); mm.delivery = dv('delivery');
        mm.sites = dv('sites').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
        mm.headline = dv('headline'); mm.notes = dv('notes');
        mm.contacts = dv('contacts').split('\n').map(function (l) {
          var i = l.indexOf(':');
          if (!l.trim()) return null;
          if (i < 0) return { role: '', name: l.trim() };
          return { role: l.slice(0, i).trim(), name: l.slice(i + 1).trim() };
        }).filter(Boolean);
      }
      save(); closeDrawer(); render(); toast('Market updated'); return;
    }

    if (a2 === 'new-event') {
      var ne = { id: uid('ev'), date: TODAY, time: '', type: 'meeting',
        who: [], title: 'New entry', notes: '', next: [], done: false };
      S.events.push(ne); save(); render(); drawerEvent(ne.id); return;
    }
    if (a2 === 'save-event') {
      var ev = byId(S.events, id);
      if (ev) {
        ev.title = dv('title') || ev.title; ev.date = dv('date') || ev.date; ev.time = dv('time');
        ev.type = dv('type'); ev.notes = dv('notes'); ev.done = dv('done') === 'done';
        ev.next = dv('next').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
        ev.who = dchecks('who');
      }
      save(); closeDrawer(); render(); toast('Saved'); return;
    }
    if (a2 === 'del-event') {
      S.events = S.events.filter(function (x) { return x.id !== id; });
      save(); closeDrawer(); render(); return;
    }

    if (a2 === 'ing-restore') {
      var jf = ING.files[ING.active];
      if (jf && jf.json && jf.json.product) {
        if (confirm('Replace everything in this browser with the contents of ' + jf.name + '?')) {
          S = jf.json; save(); render(); toast('Backup restored');
        }
      } else toast('That JSON is not a desk backup');
      return;
    }
    if (a2 === 'ing-merge') {
      var ff = ING.files[ING.active];
      var res = mergeRows(buildRows(ff.sheets[ING.sheet], ING.target), ING.target);
      save(); render();
      toast(res.added + ' added, ' + res.updated + ' updated');
      return;
    }
    if (a2 === 'ing-mk-product') {
      var txt = ingSelection();
      var np2 = { id: uid('item'), title: txt.split('\n')[0].slice(0, 80) || 'New product item', ws: 'OneAZ',
        sprint: '', status: 'on-track', seo: 'medium', tags: [], markets: ['ALL'], assessment: 'draft',
        why: txt, toMarkets: '', toProduct: '', flag: 'none', comms: { markets: '', product: '' }, due: '' };
      S.product.unshift(np2); save(); drawerProduct(np2.id); return;
    }
    if (a2 === 'ing-mk-blocker') {
      var txt2 = ingSelection();
      var nb2 = { id: uid('blk'), topic: 'Other', title: txt2.split('\n')[0].slice(0, 80) || 'New blocker',
        markets: [], priority: 'High', status: 'To review', verified: false, tags: [], description: txt2,
        rootCause: '', implImpact: '', seoImpact: '', evidence: '', direction: '', owner: '', supporting: '',
        nextStep: '', targetDate: '', escalate: 'To assess', source: 'From ingest', toldMarkets: '', toldProduct: '' };
      S.blockers.unshift(nb2); save(); drawerBlocker(nb2.id); return;
    }
    if (a2 === 'ing-mk-event') {
      var txt3 = ingSelection();
      var ne2 = { id: uid('ev'), date: TODAY, time: '', type: 'meeting', who: [],
        title: txt3.split('\n')[0].slice(0, 80) || 'New entry', notes: txt3, next: [], done: false };
      S.events.push(ne2); save(); drawerEvent(ne2.id); return;
    }
  }

  var cd = t.closest && t.closest('[data-catdive]');
  if (cd) {
    var parts = cd.getAttribute('data-catdive').split('|');
    drawerCat(parts[0], parts[1] || '');
    return;
  }

  var wz = t.closest && t.closest('[data-zone]');
  if (wz) { drawerZone(wz.getAttribute('data-zone')); return; }

  var ls = t.closest && t.closest('[data-lesson]');
  if (ls) { learnSel = ls.getAttribute('data-lesson'); render(); window.scrollTo(0, 0); return; }

  var ft = t.closest && t.closest('[data-feat]');
  if (ft) { drawerFeature(ft.getAttribute('data-feat')); return; }

  var sn = t.closest && t.closest('[data-stnode]');
  if (sn) { drawerNode(sn.getAttribute('data-stnode')); return; }

  var stt = t.closest && t.closest('[data-sttab]');
  if (stt) { stTab = stt.getAttribute('data-sttab'); render(); return; }

  var tlf = t.closest && t.closest('[data-tlf]');
  if (tlf) { var k2 = tlf.getAttribute('data-tlf'); tlFilter = (tlFilter === k2 ? '' : k2); render(); return; }

  var cal = t.closest && t.closest('[data-cal]');
  if (cal) {
    var k = cal.getAttribute('data-cal');
    if (k === 'today') calMonth = TODAY.slice(0, 7);
    else {
      var yy = +calMonth.slice(0, 4), mm2 = +calMonth.slice(5, 7) + (k === 'next' ? 1 : -1);
      calMonth = new Date(Date.UTC(yy, mm2 - 1, 1)).toISOString().slice(0, 7);
    }
    render(); return;
  }

  var ingf = t.closest && t.closest('[data-ingfile]');
  if (ingf) { ING.active = +ingf.getAttribute('data-ingfile'); ING.sheet = 0; ING.map = {}; render(); return; }

  var dayEl = t.closest && t.closest('[data-day]');
  if (dayEl && !(t.closest && t.closest('[data-open]'))) {
    var nd = { id: uid('ev'), date: dayEl.getAttribute('data-day'), time: '', type: 'meeting',
      who: [], title: 'New entry', notes: '', next: [], done: false };
    S.events.push(nd); save(); render(); drawerEvent(nd.id); return;
  }

  var br = t.closest && t.closest('[data-brief]');
  if (br) { briefKind = br.getAttribute('data-brief'); render(); return; }

  var op = t.closest && t.closest('[data-open]');
  if (op) {
    var kind = op.getAttribute('data-open'), oid = op.getAttribute('data-id');
    if (kind === 'product') drawerProduct(oid);
    else if (kind === 'blocker') drawerBlocker(oid);
    else if (kind === 'project') drawerProject(oid);
    else if (kind === 'person') drawerPerson(oid);
    else if (kind === 'event') drawerEvent(oid);
    else if (kind === 'doc') drawerDoc(oid);
    else if (kind === 'market') location.hash = '#/markets/' + encodeURIComponent(oid);
    else if (kind === 'assessment') location.hash = '#/check/' + encodeURIComponent(oid);
    return;
  }

  var mf = t.closest && t.closest('[data-mfilter]');
  if (mf) { location.hash = '#/markets/' + encodeURIComponent(mf.getAttribute('data-mfilter')); return; }

  if (t.id === 'drawer-scrim') closeDrawer();
});

document.addEventListener('change', function (e) {
  var t = e.target;
  if (t.id === 'pf-seo') { pf.seo = t.value; render(); }
  if (t.id === 'pf-status') { pf.status = t.value; render(); }
  if (t.id === 'pf-flag') { pf.flag = t.value; render(); }
  if (t.id === 'bf-topic') { bf.topic = t.value; render(); }
  if (t.id === 'bf-prio') { bf.prio = t.value; render(); }
  if (t.id === 'bf-comm') { bf.comm = t.value; render(); }
  if (t.id === 'df-market') { df.market = t.value; render(); }
  if (t.id === 'df-band') { df.band = t.value; render(); }
  if (t.id === 'df-sort') { df.sort = t.value; render(); }
  if (t.id === 'doc-side') { docSide = t.value; render(); }
  if (t.id === 'doc-status') { docStatus = t.value; render(); }
  if (t.id === 'ing-sheet') { ING.sheet = +t.value; ING.map = {}; render(); }
  if (t.id === 'ing-target') { ING.target = t.value; render(); }
  if (t.hasAttribute && t.hasAttribute('data-ingmap')) {
    ING.map[ING.target + ':' + t.getAttribute('data-ingmap')] = +t.value; render();
  }
  if (t.id === 'ing-file' && t.files && t.files.length) { loadIngest(t.files); }

  if (t.hasAttribute && t.hasAttribute('data-ms')) {
    var p = t.getAttribute('data-ms').split('|');
    var pr = byId(S.projects, p[0]);
    if (pr) { pr.milestones[+p[1]].done = t.checked; save(); }
    return;
  }
  if (t.closest && t.closest('.chip')) {
    t.closest('.chip').classList.toggle('on', t.checked);
  }
  if (t.id === 'import-file' && t.files && t.files[0]) {
    var fr = new FileReader();
    fr.onload = function () {
      try {
        var o = JSON.parse(fr.result);
        if (!o.product) throw new Error('not a liaison backup');
        S = o; save(); render(); toast('Backup restored');
      } catch (err) { toast('That file is not a liaison backup'); }
    };
    fr.readAsText(t.files[0]);
  }
});

document.addEventListener('input', function (e) {
  var t = e.target;
  if (t.id === 'pf-q') {
    clearTimeout(window._q);
    window._q = setTimeout(function () {
      pf.q = t.value; render();
      var el = document.getElementById('pf-q');
      if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); }
    }, 260);
  }
  if (t.id === 'glos-q') {
    clearTimeout(window._gq);
    window._gq = setTimeout(function () {
      glosQ = t.value; render();
      var el = document.getElementById('glos-q');
      if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); }
    }, 260);
  }
  if (t.id === 'df-q') {
    clearTimeout(window._dq);
    window._dq = setTimeout(function () {
      df.q = t.value; render();
      var el = document.getElementById('df-q');
      if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); }
    }, 260);
  }
  if (t.hasAttribute && t.hasAttribute('data-note')) {
    var p = t.getAttribute('data-note').split('|');
    var a = byId(S.assessments, p[0]);
    if (a) { a.answers[p[1]] = a.answers[p[1]] || {}; a.answers[p[1]].n = t.value; clearTimeout(window._n); window._n = setTimeout(save, 500); }
  }
});

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') closeDrawer();
});

/* ------------------------------------------------------------- actions */
function newAssessment() {
  var opts = S.product.map(function (p) { return '<option value="' + esc(p.id) + '">' + esc(p.id + ' — ' + p.title) + '</option>'; }).join('');
  var h = '<div class="drawer-head"><div><h2>New assessment</h2>' +
    '<div class="meta">Run a feature against the 50-item checklist</div></div>' +
    '<button class="btn btn-ghost" data-act="close">✕</button></div><div class="drawer-body">' +
    '<div class="field"><label>Link to a product item (optional)</label>' +
    '<select name="ref"><option value="">— free text instead —</option>' + opts + '</select></div>' +
    '<div class="field"><label>Feature name</label><input type="text" name="feature" placeholder="e.g. Localised URL slug"></div>' +
    '</div><div class="drawer-foot"><button class="btn" data-act="close">Cancel</button>' +
    '<button class="btn btn-primary" data-act="create-assessment">Start</button></div>';
  openDrawer(h);
  document.querySelector('#drawer [data-act="create-assessment"]').addEventListener('click', function () {
    var ref = dv('ref'), feature = dv('feature');
    if (ref && !feature) { var p = byId(S.product, ref); feature = p ? p.title : ref; }
    if (!feature) { toast('Give it a name'); return; }
    var a = { id: uid('as'), feature: feature, ref: ref, date: TODAY, answers: {} };
    S.assessments.unshift(a); save(); closeDrawer(); location.hash = '#/check/' + a.id; render();
  });
}

function readout(a) {
  if (!a) return '';
  var C = window.CHECKLIST, sc = score(a), L = [];
  L.push('GEO & SEO READINESS — ' + a.feature);
  if (a.ref) L.push('Product item: ' + a.ref);
  L.push('Assessed ' + fmt(a.date) + ' · weighted score ' + sc.pct + '% · ' + sc.answered + ' of ' + sc.total + ' answered');
  L.push('');
  if (sc.blockers) {
    L.push('BLOCKERS — must-have items failing (' + sc.blockers + ')');
    L.push('');
    C.groups.forEach(function (g) {
      g.items.forEach(function (it) {
        var ans = a.answers[it.id];
        if (it.w === 'must' && ans && ans.v === 'fail') {
          L.push('— ' + it.q);
          L.push('   Why it matters: ' + it.why);
          if (ans.n) L.push('   Note: ' + ans.n);
          L.push('');
        }
      });
    });
  } else L.push('No must-have failures recorded.\n');

  var partials = [];
  C.groups.forEach(function (g) {
    g.items.forEach(function (it) {
      var ans = a.answers[it.id];
      if (ans && (ans.v === 'part' || (ans.v === 'fail' && it.w !== 'must'))) partials.push('— ' + it.q + (ans.n ? ' — ' + ans.n : ''));
    });
  });
  if (partials.length) { L.push('PARTIAL OR NOT MET (should-have)'); L.push(''); L.push(partials.join('\n')); L.push(''); }

  var un = [];
  C.groups.forEach(function (g) { g.items.forEach(function (it) { if (!a.answers[it.id] || !a.answers[it.id].v) un.push(it.q); }); });
  if (un.length) { L.push('STILL UNANSWERED (' + un.length + ')'); L.push(''); un.forEach(function (q) { L.push('— ' + q); }); }
  return L.join('\n');
}

function copy(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function () { toast('Copied'); }, fallback);
  } else fallback();
  function fallback() {
    var ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); toast('Copied'); } catch (e) { toast('Select the text and copy manually'); }
    document.body.removeChild(ta);
  }
}
function download(name, text) {
  var b = new Blob([text], { type: 'text/plain;charset=utf-8' });
  var u = URL.createObjectURL(b);
  var a = document.createElement('a');
  a.href = u; a.download = name; document.body.appendChild(a); a.click();
  document.body.removeChild(a); setTimeout(function () { URL.revokeObjectURL(u); }, 1000);
}

function loadIngest(files) {
  var list = Array.prototype.slice.call(files), done = 0;
  list.forEach(function (f) {
    parseFile(f).then(function (r) {
      ING.files.push(r);
      if (ING.active === null) ING.active = ING.files.length - 1;
    }, function (err) {
      toast('Could not read ' + f.name + ': ' + err.message);
    }).then(function () {
      if (++done === list.length) { ING.map = {}; render(); }
    });
  });
}
document.addEventListener('dragover', function (e) {
  if (location.hash.indexOf('ingest') < 0) return;
  e.preventDefault();
  var d = document.getElementById('drop'); if (d) d.style.borderColor = 'var(--accent)';
});
document.addEventListener('dragleave', function () {
  var d = document.getElementById('drop'); if (d) d.style.borderColor = '';
});
document.addEventListener('drop', function (e) {
  if (location.hash.indexOf('ingest') < 0) return;
  e.preventDefault();
  var d = document.getElementById('drop'); if (d) d.style.borderColor = '';
  if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) loadIngest(e.dataTransfer.files);
});

/* --------------------------------------------------------------- boot */
try {
  var th = localStorage.getItem(KEY + ':theme');
  if (th) document.documentElement.setAttribute('data-theme', th);
  else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
    document.documentElement.setAttribute('data-theme', 'dark');
} catch (e) {}

S = load();
window.addEventListener('hashchange', function () { closeDrawer(); render(); });
render();

if (window.SYNC && SYNC.state.on) {
  SYNC.pull().then(function (remote) {
    if (remote && remote.product && JSON.stringify(remote) !== JSON.stringify(S)) {
      S = remote;
      try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {}
      render();
      toast('Loaded the server copy');
    }
  });
}

})();
