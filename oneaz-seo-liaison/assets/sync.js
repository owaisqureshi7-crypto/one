/* Optional server sync. Does nothing at all unless the app is served over http(s)
   AND you have entered a desk key. Opening index.html from disk stays purely local. */

window.SYNC = (function () {
  var KEYNAME = 'oneaz-liaison-v2:key';
  var st = { on: false, key: '', version: null, last: '', busy: false, error: '', backend: '' };

  /* Where the state endpoint lives.
     By default it is resolved relative to wherever this page is served, so the app
     works unchanged at the site root, at /pod-work, or at any other sub-path.
     To point it somewhere else, set window.LIAISON_CONFIG = { api: '/api/whatever' }
     in index.html before the scripts load. */
  function baseDir() {
    var p = location.pathname;
    if (/\.html?$/i.test(p)) return p.replace(/[^/]*$/, '');
    if (!/\/$/.test(p)) return p + '/';
    return p;
  }
  function apiUrl() {
    var cfg = window.LIAISON_CONFIG || {};
    if (cfg.api) return cfg.api;
    return baseDir() + 'api/state';
  }
  var api = apiUrl();

  function available() {
    return location.protocol === 'http:' || location.protocol === 'https:';
  }
  try { st.key = localStorage.getItem(KEYNAME) || ''; } catch (e) {}
  st.on = available() && !!st.key;

  function headers() {
    return { 'Content-Type': 'application/json', 'x-desk-key': st.key };
  }

  function setKey(k) {
    st.key = k || '';
    try { k ? localStorage.setItem(KEYNAME, k) : localStorage.removeItem(KEYNAME); } catch (e) {}
    st.on = available() && !!st.key;
    st.version = null;
  }

  function readJson(r) {
    return r.text().then(function (t) {
      try { return { s: r.status, j: JSON.parse(t) }; }
      catch (e) {
        return { s: r.status, j: { ok: false, error: r.status === 404
          ? 'No state endpoint at ' + api + ' — the app is running local-only.'
          : 'The server replied with something that is not JSON (HTTP ' + r.status + ').' } };
      }
    });
  }

  function pull() {
    if (!st.on) return Promise.resolve(null);
    api = apiUrl();
    st.busy = true; st.error = '';
    return fetch(api, { headers: headers(), cache: 'no-store' })
      .then(readJson)
      .then(function (x) {
        st.busy = false;
        if (x.s !== 200 || !x.j.ok) { st.error = x.j.error || ('HTTP ' + x.s); return null; }
        st.version = x.j.version; st.last = x.j.updatedAt || ''; st.backend = x.j.backend || '';
        return x.j.state;
      }, function (e) { st.busy = false; st.error = String(e.message || e); return null; });
  }

  function push(state) {
    if (!st.on) return Promise.resolve({ ok: false, skipped: true });
    api = apiUrl();
    st.busy = true; st.error = '';
    return fetch(api, {
      method: 'PUT', headers: headers(),
      body: JSON.stringify({ state: state, baseVersion: st.version })
    }).then(readJson)
      .then(function (x) {
        st.busy = false;
        if (x.s === 409) { st.error = 'Someone else saved first — pull before saving again.'; return { ok: false, conflict: true, remote: x.j.state, version: x.j.version }; }
        if (x.s !== 200 || !x.j.ok) { st.error = x.j.error || ('HTTP ' + x.s); return { ok: false }; }
        st.version = x.j.version; st.last = x.j.updatedAt || '';
        return { ok: true };
      }, function (e) { st.busy = false; st.error = String(e.message || e); return { ok: false }; });
  }

  return { state: st, available: available, setKey: setKey, pull: pull, push: push,
           endpoint: function () { return apiUrl(); } };
})();
