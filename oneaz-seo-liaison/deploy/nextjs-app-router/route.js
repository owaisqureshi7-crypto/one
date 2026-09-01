/* Next.js App Router version of the state endpoint.
 * Put this at:  app/pod-work/api/state/route.js
 * It then answers at /pod-work/api/state, which is exactly where the app looks
 * by default when it is served from /pod-work. No config needed in index.html.
 *
 * Environment variables on the Vercel project:
 *   DESK_KEY                 required — a long random string; without it this refuses to run
 *   BLOB_READ_WRITE_TOKEN    set automatically when you connect a Vercel Blob store
 *   or KV_REST_API_URL + KV_REST_API_TOKEN for a KV store instead
 */

export const dynamic = 'force-dynamic';

const KEY = 'liaison-state.json';

async function kvGet() {
  const r = await fetch(`${process.env.KV_REST_API_URL}/get/${KEY}`, {
    headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` },
    cache: 'no-store'
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
    access: 'public',
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
function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
  });
}
function authorised(req) {
  const expected = process.env.DESK_KEY;
  if (!expected) return 'no-key-configured';
  const given = req.headers.get('x-desk-key');
  if (typeof given !== 'string' || given.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= given.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

export async function GET(req) {
  const auth = authorised(req);
  if (auth === 'no-key-configured') {
    return json({ ok: false, error: 'DESK_KEY is not set on this deployment, so sync is disabled.' }, 501);
  }
  if (!auth) return json({ ok: false, error: 'Bad or missing key' }, 401);

  const be = backend();
  if (!be) return json({ ok: false, error: 'No storage backend configured. Connect a Vercel Blob or KV store.' }, 501);

  try {
    const doc = be === 'blob' ? await blobGet() : await kvGet();
    return json({
      ok: true, backend: be,
      state: doc ? doc.state : null,
      version: doc ? doc.version : 0,
      updatedAt: doc ? doc.updatedAt : null
    });
  } catch (e) {
    return json({ ok: false, error: String(e?.message || e) }, 500);
  }
}

export async function PUT(req) {
  const auth = authorised(req);
  if (auth === 'no-key-configured') {
    return json({ ok: false, error: 'DESK_KEY is not set on this deployment, so sync is disabled.' }, 501);
  }
  if (!auth) return json({ ok: false, error: 'Bad or missing key' }, 401);

  const be = backend();
  if (!be) return json({ ok: false, error: 'No storage backend configured.' }, 501);

  try {
    const body = await req.json();
    if (!body?.state?.product) {
      return json({ ok: false, error: 'Body must be { state } and look like a desk state' }, 400);
    }
    const current = be === 'blob' ? await blobGet() : await kvGet();
    const currentVersion = current ? current.version : 0;

    // Optimistic concurrency: refuse a write built on a stale read.
    if (body.baseVersion !== undefined && body.baseVersion !== null && body.baseVersion !== currentVersion) {
      return json({
        ok: false, error: 'stale',
        version: currentVersion,
        updatedAt: current ? current.updatedAt : null,
        state: current ? current.state : null
      }, 409);
    }

    const doc = { version: currentVersion + 1, updatedAt: new Date().toISOString(), state: body.state };
    if (be === 'blob') await blobSet(doc); else await kvSet(doc);
    return json({ ok: true, version: doc.version, updatedAt: doc.updatedAt });
  } catch (e) {
    return json({ ok: false, error: String(e?.message || e) }, 500);
  }
}

export async function POST(req) { return PUT(req); }
