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
function seed() {
  return {
    v: 2, updated: TODAY,
    markets: clone(window.DATA_CORE.markets),
    stakeholders: clone(window.DATA_CORE.stakeholders),
    product: clone(window.DATA_PRODUCT.items),
    pi: clone(window.DATA_PRODUCT.pi),
    blockers: clone(window.DATA_MARKET.blockers),
    projects: clone(window.DATA_MARKET.projects),
    deliverables: clone(window.DATA_DELIVERABLES),
    assessments: [],
    log: []
  };
}
function load() {
  try {
    var raw = localStorage.getItem(KEY);
    if (raw) { var p = JSON.parse(raw); if (p && p.product) return p; }
  } catch (e) { /* private mode, blocked storage — fall through to seed */ }
  return seed();
}
function save() {
  S.updated = TODAY;
  try { localStorage.setItem(KEY, JSON.stringify(S)); }
  catch (e) { toast('Could not save to this browser — export a backup instead'); }
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
  ['', 'Dashboard'], ['product', 'Product radar'], ['markets', 'Markets'],
  ['blockers', 'Blockers'], ['projects', 'Projects'], ['check', 'GEO checklist'],
  ['people', 'Stakeholders'], ['brief', 'Briefings']
];
function renderNav() {
  var cur = (location.hash.replace('#/', '').split('/')[0]) || '';
  var counts = {
    product: S.product.filter(function (p) { return needsMarkets(p) || needsProduct(p); }).length,
    blockers: openBlockers().length,
    brief: 0
  };
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

  /* Two lanes */
  h += '<div class="section grid g-2">';

  h += '<div class="card"><div class="card-head"><h2>Flag to markets</h2>' +
    '<span class="sub">Standards out</span></div>';
  if (!flagM.length && !bM.length) h += '<div class="empty"><strong>Nothing waiting</strong>Everything current has been cascaded.</div>';
  else {
    h += '<ul class="list-plain">';
    flagM.slice(0, 8).forEach(function (p) {
      h += '<li class="clickable" data-open="product" data-id="' + esc(p.id) + '">' +
        '<div class="li-top"><span class="t">' + esc(p.title) + '</span>' +
        '<span class="pill ' + (SEV[p.seo] || 'ghost') + '">' + esc(p.seo) + ' SEO impact</span></div>' +
        '<div class="li-sub">' + esc(p.id) + ' · ' + esc(p.toMarkets.slice(0, 130)) + (p.toMarkets.length > 130 ? '…' : '') + '</div></li>';
    });
    bM.slice(0, 5).forEach(function (b) {
      h += '<li class="clickable" data-open="blocker" data-id="' + esc(b.id) + '">' +
        '<div class="li-top"><span class="t">' + esc(b.title) + '</span>' +
        '<span class="pill ' + (PRIO[b.priority] || 'ghost') + '">' + esc(b.priority) + '</span></div>' +
        '<div class="li-sub">Blocker · ' + b.markets.map(esc).join(', ') + ' — markets not briefed</div></li>';
    });
    var moreM = Math.max(0, flagM.length - 8) + Math.max(0, bM.length - 5);
    if (moreM) h += '<li class="src">' + moreM + ' more — see the <a href="#/product">product radar</a> and <a href="#/blockers">blockers</a></li>';
    h += '</ul>';
  }
  h += '</div>';

  h += '<div class="card"><div class="card-head"><h2>Raise with product</h2>' +
    '<span class="sub">Requirements in</span></div>';
  if (!flagP.length && !bP.length) h += '<div class="empty"><strong>Nothing waiting</strong>No open asks for the product team.</div>';
  else {
    h += '<ul class="list-plain">';
    flagP.slice(0, 8).forEach(function (p) {
      h += '<li class="clickable" data-open="product" data-id="' + esc(p.id) + '">' +
        '<div class="li-top"><span class="t">' + esc(p.title) + '</span>' +
        '<span class="pill ' + (STAT[p.status] || 'ghost') + '">' + esc(p.status) + '</span></div>' +
        '<div class="li-sub">' + esc(p.id) + ' · ' + esc(p.toProduct.slice(0, 130)) + (p.toProduct.length > 130 ? '…' : '') + '</div></li>';
    });
    bP.forEach(function (b) {
      h += '<li class="clickable" data-open="blocker" data-id="' + esc(b.id) + '">' +
        '<div class="li-top"><span class="t">' + esc(b.title) + '</span>' +
        '<span class="pill ' + (PRIO[b.priority] || 'ghost') + '">' + esc(b.priority) + '</span></div>' +
        '<div class="li-sub">Blocker · ' + b.markets.map(esc).join(', ') + ' — ' + esc(b.nextStep.slice(0, 110)) + '</div></li>';
    });
    if (flagP.length > 8) h += '<li class="src">' + (flagP.length - 8) + ' more — see the <a href="#/product">product radar</a></li>';
    h += '</ul>';
  }
  h += '</div></div>';

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

  var h = '<div class="page-head"><div class="eyebrow"><a href="#/markets">Markets</a> · ' + esc(m.cluster) + '</div>' +
    '<h1>' + esc(m.name) + ' <span class="pill ' + st[0] + '" style="vertical-align:6px">' + esc(st[1]) + '</span></h1>' +
    '<p>' + esc(m.headline) + '</p></div>';

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
  h += '<div class="btn-row" style="margin-bottom:14px"><button class="btn btn-primary btn-sm" data-act="new-person">+ Add a stakeholder</button></div>';

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

/* ============================================================== ROUTER */
function render() {
  var parts = location.hash.replace(/^#\/?/, '').split('/');
  var v = parts[0] || '', arg = parts[1] || '';
  var el = document.getElementById('view');
  var html;
  if (v === 'product') html = viewProduct();
  else if (v === 'markets') html = arg ? viewMarket(decodeURIComponent(arg)) : viewMarkets();
  else if (v === 'blockers') html = viewBlockers();
  else if (v === 'projects') html = viewProjects();
  else if (v === 'check') html = viewCheck(arg);
  else if (v === 'people') html = viewPeople();
  else if (v === 'brief') html = viewBrief();
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

})();
