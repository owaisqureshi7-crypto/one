# Deploying the desk to `owais-app-srw2.vercel.app/pod-work`

The whole app is static except one endpoint. Two things to place, then one setting.

---

## 1. The app → `/pod-work`

Copy the folder `pod-work/` from this bundle into your existing app's **`public/`** directory:

```
your-app/
  public/
    pod-work/          ← drop it here, whole folder
      index.html
      assets/
      README.md
```

Deploy. It is live at `https://owais-app-srw2.vercel.app/pod-work`.

At this point everything works — all views, ingest, the checklist, the lot — with data
saved in the browser. The steps below only add server-side persistence.

The app is sub-path aware: it resolves its own asset and API paths from wherever it is
served, so it works at `/pod-work`, at the site root, or anywhere else, with no config.
(If the URL arrives without a trailing slash, a one-line script in `index.html` adds one
before anything loads — Vercel usually does this itself, so it rarely fires.)

## 2. The state endpoint → server-side persistence

Pick the one that matches your app.

### Next.js App Router (most likely)

Copy `deploy/nextjs-app-router/route.js` to:

```
your-app/app/pod-work/api/state/route.js
```

It answers at `/pod-work/api/state`, which is exactly where the app looks. No config needed.

### Next.js Pages Router

Copy `deploy/nextjs-pages-router/state.js` to `pages/api/pod-work/state.js`, then add one
line to the top of `public/pod-work/index.html`:

```html
<script>window.LIAISON_CONFIG = { api: '/api/pod-work/state' };</script>
```

### Plain static site, no framework

Copy `deploy/api-vercel-function/state.js` to `api/pod-work-state.js` and set
`window.LIAISON_CONFIG = { api: '/api/pod-work-state' }` in `index.html`.

You will also need `@vercel/blob` in your app's dependencies if you use the Blob backend:

```bash
npm i @vercel/blob
```

## 3. Environment variables

In the Vercel project → **Settings → Environment Variables**:

| Variable | Value |
|---|---|
| `DESK_KEY` | A long random string you generate. Required — without it the endpoint refuses to serve anything at all. |

Then **Storage** → create a **Blob** store and connect it to the project. That sets
`BLOB_READ_WRITE_TOKEN` for you. (A KV store works too — the code takes
`KV_REST_API_URL` + `KV_REST_API_TOKEN` instead.)

Redeploy. Open `/pod-work`, go to **Data → Server sync**, paste the same `DESK_KEY`,
press **Connect**. The panel shows which endpoint it resolved and which backend answered.

---

## Read this before you put real data in it

`DESK_KEY` protects the **data**. It does not protect the **page**.

`owais-app-srw2.vercel.app/pod-work` is a public URL. Anyone who has it can read the app —
and the seeded content is inside the JavaScript files: market names, named colleagues and
their roles, the blocker register, the 281-item delivery record. That is internal
AstraZeneca material sitting on a public hostname.

Fix it before or immediately after the first deploy, not later:

**Vercel → Settings → Deployment Protection → Vercel Authentication** (or Password
Protection). That gates the whole deployment behind a login, page included.

If you would rather not gate the entire `owais-app-srw2` app, deploy the desk as its own
Vercel project and protect that one instead.

## Verifying it worked

1. `/pod-work` loads and the dashboard shows counts — the static app is fine.
2. **Data → Server sync** shows `Not connected … Endpoint: /pod-work/api/state` — the app
   knows where to look.
3. Enter the key and press Connect:
   - `Connected (blob) · version 0 · …` — working.
   - `Bad or missing key` — the key does not match `DESK_KEY`.
   - `No state endpoint at /pod-work/api/state` — the route file is in the wrong place.
   - `DESK_KEY is not set` — the variable is missing, or you did not redeploy after adding it.
4. Edit something, open the site in a different browser, enter the key, and confirm the
   edit is there.

## What I could not do from here

I could not run the deploy myself: this environment's network policy blocks
`api.vercel.com`, and there is no Vercel token in it. Everything above is prepared and
tested — I served the folder under `/pod-work` locally against a stand-in endpoint and
confirmed the asset paths, the sub-path API resolution, the auth rejection, the save, and
a second browser pulling the same state.
