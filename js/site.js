/* Solvane shared behaviour: loop manager, header, menus, cookie + chat, forms, tabs, carousels */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var SV = (window.SV = { $: $, $$: $$, reduced: matchMedia("(prefers-reduced-motion:reduce)").matches });

  /* one rAF loop for everything; an item only runs while its element is near the viewport */
  var items = [], running = false;
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { items.forEach(function (it) { if (it.el === e.target) { it.on = e.isIntersecting; if (it.on && it.enter) it.enter(); } }); });
    kick();
  }, { rootMargin: "60px 0px" });
  function frame(t) {
    var any = false;
    for (var i = 0; i < items.length; i++) if (items[i].on) { any = true; items[i].fn(t); }
    if (any && !SV.reduced && !document.hidden) requestAnimationFrame(frame); else running = false;
  }
  function kick() { if (!running && !document.hidden) { running = true; requestAnimationFrame(frame); } }
  document.addEventListener("visibilitychange", kick);
  SV.loop = function (el, fn, enter) { items.push({ el: el, fn: fn, on: false, enter: enter }); io.observe(el); };
  SV.kick = kick;
  SV.once = function (el, fn, margin) {
    var o = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { o.disconnect(); fn(); } }, { rootMargin: margin || "0px 0px -15% 0px" });
    o.observe(el);
  };
  /* timers that only tick while an element is on screen */
  SV.every = function (el, ms, fn) {
    var id = 0, vis = false;
    new IntersectionObserver(function (es) { vis = es[0].isIntersecting; clearInterval(id); if (vis && !SV.reduced) id = setInterval(function () { if (!document.hidden) fn(); }, ms); }).observe(el);
  };
  SV.store = { get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };

  /* announcement */
  var ann = $(".ann");
  if (ann) $(".ann-x", ann).addEventListener("click", function () { ann.remove(); document.body.classList.remove("has-ann"); });

  /* mega menu */
  var hd = $(".hd"), mega = $(".mega"), veil = $(".veil");
  if (hd && mega) {
    var view = $(".mega-view", mega), btns = $$(".nav button[data-m]"), cur = -1, tOpen, tClose;
    var open = function (i) {
      clearTimeout(tClose);
      if (cur === i) return;
      var first = cur < 0, panels = $$(".mega-p", mega), p = panels[i];
      panels.forEach(function (x, k) { x.style.setProperty("--from", first ? "0px" : (k < i ? "-60px" : "60px")); x.classList.toggle("on", k === i); });
      if (first) view.style.transition = "none";
      view.style.height = p.offsetHeight + "px";
      if (first) { view.offsetHeight; view.style.transition = ""; }
      btns.forEach(function (b, k) { b.setAttribute("aria-expanded", k === i); });
      hd.classList.add("open"); veil.classList.add("on"); cur = i;
    };
    var close = function () { cur = -1; hd.classList.remove("open"); veil.classList.remove("on"); btns.forEach(function (b) { b.setAttribute("aria-expanded", "false"); }); };
    var later = function () { clearTimeout(tOpen); clearTimeout(tClose); tClose = setTimeout(close, 180); };
    btns.forEach(function (b, i) {
      b.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") { clearTimeout(tOpen); tOpen = setTimeout(function () { open(i); }, cur < 0 ? 60 : 0); } });
      b.addEventListener("click", function () { if (cur === i && b.dataset.k) close(); else open(i); b.dataset.k = cur === i ? "1" : ""; });
    });
    [mega, $(".nav", hd)].forEach(function (z) { z.addEventListener("pointerenter", function () { clearTimeout(tClose); }); z.addEventListener("pointerleave", later); });
    $$(".nav>li>a", hd).forEach(function (a) { a.addEventListener("pointerenter", later); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
    veil.addEventListener("click", close);
    addEventListener("resize", close);
  }

  /* mobile menu with drill-in panels */
  var mm = $(".mm"), burger = $(".burger");
  if (mm && burger) {
    var body = $(".mm-body", mm), logo = $(".mm-top .logo", mm), back = $(".mm-back", mm), root = $(".mm-list", mm).parentNode;
    var show = function (n) {
      $$(".mm-sub", mm).forEach(function (s) { s.hidden = s.dataset.n !== n; });
      root.hidden = !!n; logo.hidden = !!n; back.hidden = !n; body.scrollTop = 0;
    };
    // sub panels are cloned from the mega menu so there is one source of links
    $$(".mega-p").forEach(function (p, i) {
      var s = document.createElement("div"); s.className = "mm-sub"; s.dataset.n = String(i); s.hidden = true;
      $$(":scope>.mc,:scope>.all", p).forEach(function (c) {
        if (c.classList.contains("all")) { var a = document.createElement("a"); a.href = c.href; a.className = "all"; a.innerHTML = "<b>" + c.textContent + "</b>"; s.appendChild(a); }
        else [].forEach.call(c.children, function (k) { s.appendChild(k.cloneNode(true)); });
      });
      body.appendChild(s);
    });
    var toggle = function (on) { mm.classList.toggle("on", on); document.documentElement.style.overflow = on ? "hidden" : ""; show(""); if (on) $(".mm-x", mm).focus(); else burger.focus(); };
    burger.addEventListener("click", function () { toggle(true); });
    $(".mm-x", mm).addEventListener("click", function () { toggle(false); });
    back.addEventListener("click", function () { show(""); });
    $$(".mm-list button", mm).forEach(function (b) { b.addEventListener("click", function () { show(b.dataset.n); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && mm.classList.contains("on")) toggle(false); });
    addEventListener("resize", function () { if (innerWidth > 1180 && mm.classList.contains("on")) toggle(false); });
  }

  /* cookie banner */
  var ck = $(".ck");
  if (ck) {
    if (!SV.store.get("sv-cookie")) ck.hidden = false;
    $$("button", ck).forEach(function (b) { b.addEventListener("click", function () { SV.store.set("sv-cookie", b.dataset.v); ck.remove(); }); });
  }
  $$("[data-cookie-reset]").forEach(function (a) { a.addEventListener("click", function (e) { e.preventDefault(); try { localStorage.removeItem("sv-cookie"); } catch (x) {} location.reload(); }); });

  /* chat */
  var chat = $(".chat");
  if (chat) {
    var card = $(".chat-c", chat), cb = $(".chat-b", chat), panel = $(".chat-p", chat), n = 3 + Math.floor(Math.random() * 12);
    $("[data-reps]", chat).textContent = n;
    if (SV.store.get("sv-chat")) card.hidden = true;
    addEventListener("scroll", function h() { if (scrollY > 120) { card.hidden = true; removeEventListener("scroll", h); } }, { passive: true });
    $(".chat-x", card).addEventListener("click", function () { card.hidden = true; SV.store.set("sv-chat", "1"); });
    cb.addEventListener("click", function () { var o = panel.hidden; panel.hidden = !o; card.hidden = true; cb.textContent = o ? "Close chat" : "Chat now"; if (o) $("input", panel).focus(); });
    $("form", panel).addEventListener("submit", function (e) {
      e.preventDefault(); var i = $("input", panel), log = $(".log", panel); if (!i.value.trim()) return;
      var p = document.createElement("p"); p.className = "me"; p.textContent = i.value; log.appendChild(p); i.value = "";
      setTimeout(function () { var r = document.createElement("p"); r.textContent = "Thanks! This is a demo chat, so nothing was sent. A specialist would normally reply here."; log.appendChild(r); log.scrollTop = log.scrollHeight; }, 700);
      log.scrollTop = log.scrollHeight;
    });
  }

  /* local-only forms */
  $$("form[data-demo]").forEach(function (f) {
    f.noValidate = true;
    f.addEventListener("submit", function (e) {
      e.preventDefault(); var m = $(".form-msg", f), i = $("input[type=email]", f), ok = !i || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(i.value);
      m.classList.toggle("err", !ok); m.textContent = ok ? (f.dataset.demo || "Thanks, you’re on the list.") : "Enter a valid work email address.";
      if (ok) f.reset(); else i.focus();
    });
  });

  /* horizontal carousels: native scroll + arrows */
  $$("[data-car]").forEach(function (c) {
    var tr = $("[data-track]", c), pv = $("[data-prev]", c), nx = $("[data-next]", c); if (!tr) return;
    var step = function () { var k = tr.children; return k.length > 1 ? k[1].offsetLeft - k[0].offsetLeft : tr.clientWidth; };
    var sync = function () { if (!pv) return; pv.disabled = tr.scrollLeft < 4; nx.disabled = tr.scrollLeft > tr.scrollWidth - tr.clientWidth - 4; };
    if (pv) { pv.addEventListener("click", function () { tr.scrollBy({ left: -step(), behavior: SV.reduced ? "auto" : "smooth" }); }); nx.addEventListener("click", function () { tr.scrollBy({ left: step(), behavior: SV.reduced ? "auto" : "smooth" }); }); }
    var tick; tr.addEventListener("scroll", function () { clearTimeout(tick); tick = setTimeout(sync, 80); }, { passive: true }); sync(); addEventListener("resize", sync);
    // mouse drag
    var sx = 0, sl = 0, down = false, moved = false;
    tr.addEventListener("pointerdown", function (e) { if (e.pointerType !== "mouse") return; down = true; moved = false; sx = e.clientX; sl = tr.scrollLeft; });
    addEventListener("pointermove", function (e) { if (!down) return; var d = e.clientX - sx; if (Math.abs(d) > 5) { moved = true; tr.classList.add("drag"); } if (moved) tr.scrollLeft = sl - d; });
    addEventListener("pointerup", function () { if (!down) return; down = false; tr.classList.remove("drag"); });
    tr.addEventListener("click", function (e) { if (moved) { e.preventDefault(); moved = false; } }, true);
    tr.addEventListener("dragstart", function (e) { e.preventDefault(); });
  });

  /* tabs: [data-tabs] > [data-tab] buttons, [data-pane] panes; data-auto="ms" auto-advances */
  $$("[data-tabs]").forEach(function (w) {
    var bs = $$("[data-tab]", w), ps = $$("[data-pane]", w), at = 0, auto = +w.dataset.auto || 0, id;
    var go = function (i) {
      at = (i + bs.length) % bs.length;
      bs.forEach(function (b, k) { b.setAttribute("aria-selected", k === at); if (auto) { b.classList.remove("run"); if (k === at) { b.offsetWidth; b.classList.add("run"); } } });
      ps.forEach(function (p, k) { p.classList.toggle("on", k === at); p.setAttribute("aria-hidden", k !== at); });
    };
    bs.forEach(function (b, i) { b.addEventListener("click", function () { go(i); if (auto) restart(); }); });
    var vis = false, restart = function () { clearInterval(id); if (vis && auto && !SV.reduced) id = setInterval(function () { if (!document.hidden) go(at + 1); }, auto); };
    if (auto) { w.style.setProperty("--auto", auto + "ms"); new IntersectionObserver(function (e) { vis = e[0].isIntersecting; if (vis) go(at); restart(); }).observe(w); }
    go(0);
  });

  /* accordions: .acc-i > button.acc-h[aria-expanded] + .acc-b; data-acc="one" keeps exactly one open */
  $$("[data-acc]").forEach(function (a) {
    $$(".acc-h", a).forEach(function (h) {
      h.addEventListener("click", function () {
        var was = h.getAttribute("aria-expanded") === "true";
        if (a.dataset.acc === "one") { if (was) return; $$(".acc-h", a).forEach(function (x) { x.setAttribute("aria-expanded", x === h); x.closest(".acc-i").classList.toggle("on", x === h); }); }
        else { h.setAttribute("aria-expanded", !was); h.closest(".acc-i").classList.toggle("on", !was); }
      });
    });
  });

  /* sticky sub-navigation with scroll spy and progress */
  var sn = $(".subnav");
  if (sn) {
    var links = $$("a[href^='#']", sn), targets = links.map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); }).filter(Boolean), bar = $(".bar", sn), shown = false, lastI = -1, pend = false;
    var tops = [], total = 1, trig = 0;
    var measure = function () { tops = targets.map(function (t) { return t.getBoundingClientRect().top + scrollY; }); total = Math.max(1, document.documentElement.scrollHeight - innerHeight); trig = tops[0] - 200; };
    var upd = function () {
      pend = false; var y = scrollY, s = y > trig;
      if (s !== shown) { shown = s; sn.classList.toggle("on", s); }
      var i = -1; tops.forEach(function (t, k) { if (y + 160 >= t) i = k; });
      if (i !== lastI) { lastI = i; links.forEach(function (a, k) { a.classList.toggle("cur", k === i); }); }
      if (bar) bar.style.transform = "scaleX(" + (y / total).toFixed(4) + ")";
    };
    addEventListener("scroll", function () { if (!pend) { pend = true; requestAnimationFrame(upd); } }, { passive: true });
    addEventListener("resize", measure); addEventListener("load", function () { measure(); upd(); }); document.fonts.ready.then(function () { measure(); upd(); }); measure(); upd();
  }

  /* side index scroll spy (pricing, products) */
  var side = $("[data-spy]");
  if (side) {
    var sl2 = $$("a[href^='#']", side);
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) sl2.forEach(function (a) { a.classList.toggle("cur", a.getAttribute("href") === "#" + e.target.id); }); });
    }, { rootMargin: "-15% 0px -75% 0px" });
    sl2.forEach(function (a) { var t = document.getElementById(a.getAttribute("href").slice(1)); if (t) so.observe(t); });
  }

  /* number count-up */
  $$("[data-count]").forEach(function (el) {
    var to = +el.dataset.count, dec = +(el.dataset.dec || 0), pre = el.dataset.pre || "", suf = el.dataset.suf || "";
    if (SV.reduced) return;
    SV.once(el, function () { var t0; (function f(t) { if (!t0) t0 = t; var k = Math.min(1, (t - t0) / 1400), e = 1 - Math.pow(1 - k, 4); el.textContent = pre + (to * e).toFixed(dec) + suf; if (k < 1) requestAnimationFrame(f); })(performance.now()); });
  });

  /* filter lists: [data-filter] buttons set on [data-cat] items */
  $$("[data-filters]").forEach(function (w) {
    var bs = $$("[data-filter]", w), list = $$("[data-cat]", w), none = $("[data-none]", w), q = $("[data-q]", w), sels = $$("select[data-sel]", w), f = "all";
    var run = function () {
      var t = q ? q.value.trim().toLowerCase() : "", c = 0;
      list.forEach(function (x) {
        var ok = f === "all" || x.dataset.cat.split(" ").indexOf(f) > -1;
        if (t && x.textContent.toLowerCase().indexOf(t) < 0) ok = false;
        sels.forEach(function (s) { if (s.value && x.dataset[s.dataset.sel].split(" ").indexOf(s.value) < 0) ok = false; });
        x.hidden = !ok; if (ok) c++;
      });
      $$("[data-group]", w).forEach(function (g) { g.hidden = !$$("[data-cat]", g).some(function (x) { return !x.hidden; }); });
      if (none) none.hidden = c > 0;
    };
    bs.forEach(function (b) { b.addEventListener("click", function () { f = b.dataset.filter; bs.forEach(function (x) { x.setAttribute("aria-pressed", x === b); }); run(); }); });
    if (q) q.addEventListener("input", run); sels.forEach(function (s) { s.addEventListener("change", run); });
  });

  /* cycle highlighted labels */
  $$("[data-cyc]").forEach(function (w) { var ls = $$(".sn-t", w), i = 0; if (ls[0]) ls[0].classList.add("on"); SV.every(w, 1100, function () { ls[i].classList.remove("on"); i = (i + 1) % ls.length; ls[i].classList.add("on"); }); });

  /* multi-step contact form (local only) */
  var ms = $("[data-steps]");
  if (ms) {
    var steps = $$(".step", ms), tabs = $$(".st-tabs li", ms), k = 0;
    var go2 = function (i) { k = i; steps.forEach(function (s, x) { s.hidden = x !== i; }); tabs.forEach(function (t, x) { t.classList.toggle("on", x === i); t.classList.toggle("done", x < i); }); var f = $("input,select,textarea", steps[i]); if (f) f.focus({ preventScroll: true }); };
    $$("[data-go]", ms).forEach(function (b) {
      b.addEventListener("click", function () {
        var bad = null; if (+b.dataset.go > k) $$("[required]", steps[k]).forEach(function (i) {
          var ok = i.type === "email" ? /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(i.value) : !!i.value.trim();
          i.classList.toggle("bad", !ok); var er = i.parentNode.querySelector(".er"); if (er) er.hidden = ok; if (!ok && !bad) bad = i;
        });
        if (bad) bad.focus(); else go2(+b.dataset.go);
      });
    });
    ms.addEventListener("submit", function (e) { e.preventDefault(); });
  }
})();
