/* Owner mode: the personal tools (desk, habits, the blog editor) appear in the menus only on
   David's own devices. Open any page with ?me once on a device to turn it on, ?notme to turn it
   off. This is tidiness, not security: the pages stay reachable by URL, and nothing personal is
   stored on the site anyway (Habits and Focus Desk data live in each visitor's own browser).
   Loaded in <head> on every page so the menu never flashes. */
(function () {
  try {
    var q = location.search, on = /[?&]me(&|$)/.test(q), off = /[?&]notme(&|$)/.test(q);
    if (on) localStorage.setItem("site:owner", "1");
    if (off) localStorage.removeItem("site:owner");
    if (on || off) {
      // drop the switch from the address bar so it isn't bookmarked or shared
      var rest = q.replace(/^\?/, "").split("&").filter(function (p) { return p !== "me" && p !== "notme"; }).join("&");
      history.replaceState(null, "", location.pathname + (rest ? "?" + rest : "") + location.hash);
    }
    if (localStorage.getItem("site:owner")) document.documentElement.classList.add("owner");
  } catch (e) {}
})();
