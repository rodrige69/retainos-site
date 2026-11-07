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
      "Content-Type": "application/json"
    };
    if (opts.auth !== false) headers.Authorization = "Bearer " + token();
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
    /* Invite email for a new shop owner. create_user true makes the account and
       the shop_owners link in the same breath, and the SMTP configured in
       Supabase delivers the link.

       The link is pointed at the password page so the owner's first click ends
       with a password they can reuse instead of a one-off session. If that URL
       is not on the project's redirect allow list Supabase refuses the whole
       request, so fall back to a plain invite rather than a failed onboarding. */
    inviteOwner: function (email) {
      if (this.demo) return Promise.resolve({ demo: true });
      var here = /^https?:/.test(location.origin || "") ? location.origin + "/password.html" : "";
      var body = { email: email, create_user: true };
      if (here) body.redirect_to = here;
      return call("/auth/v1/otp", { method: "POST", body: body, auth: false }).catch(function (e) {
        if (!here || !e || e.status !== 400) throw e;
        return call("/auth/v1/otp", { method: "POST", body: { email: email, create_user: true }, auth: false });
      });
    },
    sendRecovery: function (email) {
      if (this.demo) return Promise.resolve({ demo: true });
      return call("/auth/v1/recover", { method: "POST", body: { email: email }, auth: false });
    },
    updatePassword: function (password) {
      if (this.demo) return Promise.resolve({ demo: true });
      return call("/auth/v1/user", { method: "PUT", body: { password: password } });
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
      /* Remember what kind of link this was: a reset link should land on the
         password form, everything else heads for the dashboard. */
      try { localStorage.setItem("ros.recover", p.get("type") === "recovery" ? "1" : "0"); } catch (e) {}
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
    var recovery = false;
    try { recovery = localStorage.getItem("ros.recover") === "1"; } catch (e) {}
    var onPassword = /\/password(\.html)?$/.test(location.pathname);
    if (onPassword) {
      /* The invite link sends owners here on purpose: stay put so they can
         choose a password while the session from the link is still fresh. */
    } else if (recovery) {
      location.replace("password.html");
    } else if (!/\/dashboard(\.html)?$/.test(location.pathname)) {
      location.replace("dashboard.html");
    }
  }
})();
