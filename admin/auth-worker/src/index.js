/**
 * Admin sign-in for the Alliance Street content editor and staff portal.
 *
 * There is one account: username "admin". Its password lives in Firebase
 * Authentication (hashed by Firebase), so changing it in the staff portal
 * changes it everywhere. This worker never stores or logs a password.
 *
 * After a correct password it hands out the GitHub token (a Cloudflare secret,
 * GITHUB_TOKEN) that the editor and portal use to save and publish. The token
 * is only ever delivered to ALLOWED_ORIGIN.
 *
 *   GET  /auth   login form, opened as a pop-up by the content editor
 *                (Sveltia's "Sign In" button — Netlify/Decap pop-up protocol)
 *   POST /auth   checks the password, then posts the token to the editor
 *   POST /token  for the staff portal: exchanges a Firebase ID token of the
 *                admin account for the GitHub token
 */

const USERNAME = "admin";

const json = (body, status, env) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN,
      "Access-Control-Allow-Headers": "Authorization",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      Vary: "Origin",
    },
  });

const page = (html) =>
  new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>Sign in — Alliance Street</title>
<style>
  *{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f6f6f7;
  font:16px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif;color:#111114}
  form{background:#fff;border:1px solid #e3e3e8;border-radius:14px;padding:28px;width:min(360px,calc(100vw - 32px));
  display:flex;flex-direction:column;gap:14px;box-shadow:0 4px 16px -8px rgb(0 0 0/12%)}
  h1{font-size:20px;margin:0}label{display:flex;flex-direction:column;gap:6px;font-weight:600;font-size:14px}
  input{font:inherit;border:1px solid #cfcfd6;border-radius:9px;padding:10px 12px}
  input:focus-visible,button:focus-visible{outline:3px solid #c21d2466;outline-offset:2px}
  button{font:inherit;font-weight:600;border:0;border-radius:999px;padding:11px;background:#c21d24;color:#fff;cursor:pointer}
  .err{background:#fdeceb;color:#7a1a14;border-radius:9px;padding:10px 12px;font-size:14px;margin:0}
  p.muted{color:#5d5d66;font-size:13px;margin:0}
</style></head><body>${html}</body></html>`, {
    headers: {
      "Content-Type": "text/html;charset=utf-8",
      "Cache-Control": "no-store",
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "no-referrer",
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'",
    },
  });

const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const loginForm = (error = "") => page(`
  <form method="post" action="/auth" autocomplete="on">
    <h1>Alliance Street — sign in</h1>
    ${error ? `<p class="err" role="alert">${escapeHtml(error)}</p>` : ""}
    <label>Username<input name="username" autocomplete="username" required autofocus></label>
    <label>Password<input name="password" type="password" autocomplete="current-password" required></label>
    <button type="submit">Sign in</button>
    <p class="muted">Website content editor</p>
  </form>`);

/** Hands the token to the editor window that opened this pop-up — and only if it is ALLOWED_ORIGIN. */
const deliver = (token, env) => page(`<p class="muted" style="text-align:center">Signing you in…</p><script>
  (() => {
    const allowed = ${JSON.stringify(env.ALLOWED_ORIGIN)};
    const message = "authorization:github:success:" + ${JSON.stringify(JSON.stringify({ provider: "github", token }))};
    window.addEventListener("message", (e) => {
      if (e.origin !== allowed || e.data !== "authorizing:github") return;
      window.opener && window.opener.postMessage(message, allowed);
    });
    window.opener && window.opener.postMessage("authorizing:github", allowed);
  })();
</script>`);

/** Checks the admin password with Firebase Authentication. Returns the Firebase user id, or an error code. */
async function checkPassword(password, env) {
  const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${env.FIREBASE_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: env.ADMIN_EMAIL, password, returnSecureToken: false }),
  });
  const body = await res.json().catch(() => ({}));
  if (res.ok) return { uid: body.localId };
  return { error: body.error?.message ?? "UNKNOWN" };
}

async function limited(request, env) {
  if (!env.LOGIN_LIMITER) return false;
  const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
  const { success } = await env.LOGIN_LIMITER.limit({ key: ip });
  return !success;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/auth" && request.method === "GET") return loginForm();

    if (url.pathname === "/auth" && request.method === "POST") {
      if (await limited(request, env)) return loginForm("Too many attempts. Wait a minute and try again.");
      const form = await request.formData();
      const username = String(form.get("username") ?? "").trim().toLowerCase();
      const password = String(form.get("password") ?? "");
      if (username !== USERNAME || !password) return loginForm("Incorrect username or password.");
      const result = await checkPassword(password, env);
      if (result.error?.startsWith("TOO_MANY_ATTEMPTS")) return loginForm("Too many attempts. Try again later.");
      if (!result.uid || result.uid !== env.ADMIN_UID) return loginForm("Incorrect username or password.");
      if (!env.GITHUB_TOKEN) return loginForm("Sign-in is not finished being set up (missing GitHub token).");
      return deliver(env.GITHUB_TOKEN, env);
    }

    if (url.pathname === "/token") {
      if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: json({}, 204, env).headers });
      if (request.method !== "POST") return json({ error: "method" }, 405, env);
      if (request.headers.get("Origin") !== env.ALLOWED_ORIGIN) return json({ error: "origin" }, 403, env);
      if (await limited(request, env)) return json({ error: "Too many attempts. Wait a minute." }, 429, env);
      const idToken = (request.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
      if (!idToken) return json({ error: "Not signed in." }, 401, env);
      const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${env.FIREBASE_API_KEY}`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken }),
      });
      const body = await res.json().catch(() => ({}));
      const uid = body.users?.[0]?.localId;
      if (!res.ok || uid !== env.ADMIN_UID) return json({ error: "Not signed in as the admin." }, 401, env);
      if (!env.GITHUB_TOKEN) return json({ error: "Sign-in is not finished being set up (missing GitHub token)." }, 503, env);
      return json({ token: env.GITHUB_TOKEN }, 200, env);
    }

    return new Response("Not found", { status: 404 });
  },
};
