/* Tiny Supabase client: PostgREST + magic-link auth, no dependencies. */
(function () {
  var CFG = window.RETAINOS_CONFIG || {};
  var url = (CFG.url || "").replace(/\/$/, "");
  var key = CFG.anonKey || "";
  var SKEY = "ros.session";

  function session() {
    try { return JSON.parse(localStorage.getItem(SKEY) || "null"); } catch (e) { return null; }
  }
  function setSession(s) {
    if (s) localStorage.setItem(SKEY, JSON.stringify(s));
    else localStorage.removeItem(SKEY);
  }
  function token() {
    var s = session();
    return (s && s.access_token) || key;
  }

  function call(path, opts) {
    opts = opts || {};
    var headers = {
      apikey: key,
      Authorization: "Bearer " + token(),
      "Content-Type": "application/json"
    };
    if (opts.prefer) headers.Prefer = opts.prefer;
    return fetch(url + path, {
      method: opts.method || "GET",
      headers: headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined
    }).then(function (res) {
      return res.text().then(function (text) {
        var data = null;
        try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }
        if (!res.ok) {
          var msg = (data && (data.message || data.error_description || data.error || data.hint)) || ("HTTP " + res.status);
          var err = new Error(msg);
          err.status = res.status;
          err.data = data;
          throw err;
        }
        return data;
      });
    });
  }

  window.SB = {
    demo: !url || !key,
    url: url,
    session: session,
    setSession: setSession,
    rest: function (query, opts) { return call("/rest/v1/" + query, opts); },
    rpc: function (fn, args) { return call("/rest/v1/rpc/" + fn, { method: "POST", body: args || {} }); },

    signInWithPassword: function (email, password) {
      if (this.demo) return Promise.resolve({ demo: true });
      return call("/auth/v1/token?grant_type=password", {
        method: "POST",
        body: { email: email, password: password }
      }).then(function (d) { if (d && d.access_token) setSession(d); return d; });
    },
    sendMagicLink: function (email) {
      if (this.demo) return Promise.resolve({ demo: true });
      return call("/auth/v1/otp", { method: "POST", body: { email: email, create_user: false } });
    },
    verifyCode: function (email, code) {
      if (this.demo) return Promise.resolve({ demo: true });
      return call("/auth/v1/verify", { method: "POST", body: { type: "email", email: email, token: code } })
        .then(function (d) { if (d && d.access_token) setSession(d); return d; });
    },
    captureRedirect: function () {
      var h = (location.hash || "").replace(/^#/, "");
      if (!h) return false;
      var p = new URLSearchParams(h);
      var at = p.get("access_token");
      if (!at) return false;
      setSession({
        access_token: at,
        refresh_token: p.get("refresh_token"),
        expires_at: Date.now() + parseInt(p.get("expires_in") || "3600", 10) * 1000
      });
      history.replaceState({}, "", location.pathname + location.search);
      return true;
    },
    signOut: function () { setSession(null); location.replace("signin.html"); }
  };

  /* A magic link or password-reset email lands on whichever page Supabase is
     configured to send it to, so pick the session up wherever we arrive
     instead of only on the sign-in page. */
  if (window.SB.captureRedirect()) {
    if (!/\/dashboard(\.html)?$/.test(location.pathname)) location.replace("dashboard.html");
  }
})();
