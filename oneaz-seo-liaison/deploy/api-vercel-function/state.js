/* Server-side state for the Liaison Desk, on Vercel.
 *
 * GET  /api/state  -> { ok, state, updatedAt, version }
 * PUT  /api/state  -> body { state, baseVersion } ; saves and returns the new version
 *
 * Storage: Vercel Blob if BLOB_READ_WRITE_TOKEN is set, otherwise Upstash/Vercel KV
 * if KV_REST_API_URL and KV_REST_API_TOKEN are set. With neither, it returns 501 and
 * the app keeps working entirely from the browser.
 *
 * Auth: every request must send  x-desk-key: <DESK_KEY>.  Set DESK_KEY in the Vercel
 * project's environment variables. Without DESK_KEY set, the endpoint refuses to run
 * rather than serving your data to anyone who finds the URL.
 */

const KEY = 'liaison-state.json';

function unauthorised(res, why) {
  res.status(401).json({ ok: false, error: why });
}

async function kvGet() {
  const r = await fetch(`${process.env.KV_REST_API_URL}/get/${KEY}`, {
    headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` }
  });
  if (!r.ok) return null;
  const j = await r.json();
  return j.result ? JSON.parse(j.result) : null;
}
async function kvSet(doc) {
  const r = await fetch(`${process.env.KV_REST_API_URL}/set/${KEY}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(doc)
  });
  if (!r.ok) throw new Error('KV write failed: ' + r.status);
}

async function blobGet() {
  const { list } = await import('@vercel/blob');
  const { blobs } = await list({ prefix: KEY, limit: 1 });
  if (!blobs.length) return null;
  const r = await fetch(blobs[0].url + '?t=' + Date.now(), { cache: 'no-store' });
  if (!r.ok) return null;
  return await r.json();
}
async function blobSet(doc) {
  const { put } = await import('@vercel/blob');
  await put(KEY, JSON.stringify(doc), {
    access: 'public',            // unguessable URL; the API key still gates this endpoint
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true
  });
}

function backend() {
  if (process.env.BLOB_READ_WRITE_TOKEN) return 'blob';
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) return 'kv';
  return null;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  const expected = process.env.DESK_KEY;
  if (!expected) {
    return res.status(501).json({
      ok: false,
      error: 'DESK_KEY is not set on this deployment, so sync is disabled. ' +
             'Set DESK_KEY (and a storage backend) in the Vercel project settings.'
    });
  }
  const given = req.headers['x-desk-key'];
  if (typeof given !== 'string' || given.length !== expected.length) return unauthorised(res, 'Bad or missing key');
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= given.charCodeAt(i) ^ expected.charCodeAt(i);
  if (diff !== 0) return unauthorised(res, 'Bad or missing key');

  const be = backend();
  if (!be) {
    return res.status(501).json({
      ok: false,
      error: 'No storage backend configured. Add a Vercel Blob store (BLOB_READ_WRITE_TOKEN) ' +
             'or a KV store (KV_REST_API_URL + KV_REST_API_TOKEN).'
    });
  }
  const read = be === 'blob' ? blobGet : kvGet;
  const write = be === 'blob' ? blobSet : kvSet;

  try {
    if (req.method === 'GET') {
      const doc = await read();
      return res.status(200).json({
        ok: true, backend: be,
        state: doc ? doc.state : null,
        version: doc ? doc.version : 0,
        updatedAt: doc ? doc.updatedAt : null
      });
    }

    if (req.method === 'PUT' || req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!body || !body.state || !body.state.product) {
        return res.status(400).json({ ok: false, error: 'Body must be { state } and look like a desk state' });
      }
      const current = await read();
      const currentVersion = current ? current.version : 0;

      // Optimistic concurrency: refuse a write built on a stale read.
      if (body.baseVersion !== undefined && body.baseVersion !== null &&
          body.baseVersion !== currentVersion) {
        return res.status(409).json({
          ok: false, error: 'stale',
          version: currentVersion, updatedAt: current ? current.updatedAt : null,
          state: current ? current.state : null
        });
      }

      const doc = {
        version: currentVersion + 1,
        updatedAt: new Date().toISOString(),
        state: body.state
      };
      await write(doc);
      return res.status(200).json({ ok: true, version: doc.version, updatedAt: doc.updatedAt });
    }

    res.setHeader('Allow', 'GET, PUT');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e && e.message || e) });
  }
}
