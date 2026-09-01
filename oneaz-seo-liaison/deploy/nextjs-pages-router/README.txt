Pages Router: put this file at  pages/api/pod-work/state.js
It answers at /api/pod-work/state, which is NOT where the app looks by default,
so add this to the top of pod-work/index.html:

  <script>window.LIAISON_CONFIG = { api: '/api/pod-work/state' };</script>

(The App Router version in ../nextjs-app-router needs no config.)
