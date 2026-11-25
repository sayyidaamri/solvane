/* Solvane home page: cards, modals, canvases, carousels */
(function () {
  "use strict";
  var $ = SV.$, $$ = SV.$$, R = SV.reduced;
  var rand = (function () { var s = 1234567; return function () { s = (s * 16807) % 2147483647; return s / 2147483647; }; })();
  function fit(cv, cap) { var r = cv.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, cap || 1.5), w = cv.clientWidth || r.width, h = cv.clientHeight || r.height; cv.width = Math.round(w * d); cv.height = Math.round(h * d); var c = cv.getContext("2d"); c.setTransform(d, 0, 0, d, 0, 0); return { c: c, w: w, h: h }; }
  function onResize(fn) { var t; addEventListener("resize", function () { clearTimeout(t); t = setTimeout(function () { fn(); SV.kick(); }, 120); }); }

  /* live counter */
  var gdp = $("[data-gdp]");
  if (gdp) { var base = 1.75566744; SV.every(gdp, 900, function () { base += 0.00000001 * (1 + Math.floor(Math.random() * 4)); gdp.textContent = base.toFixed(8) + "%"; }); }

  /* ---------------------------------------------- bento cards */
  $$(".c1").forEach(function (card) {
    var k = 0, groups = $$(".rot", card);
    var next = function () { k = (k + 1) % 3; groups.forEach(function (g) { [].forEach.call(g.children, function (x, i) { x.classList.toggle("off", i === (k + 2) % 3); x.classList.toggle("on", i === k); }); }); };
    SV.every(card, 4200, next);
  });
  $$(".c2").forEach(function (card) {
    var out = $("[data-kwh]", card), n = 1896956097, b = $(".m-bars", card); b.classList.add("grow");
    SV.once(card, function () { b.classList.remove("grow"); });
    SV.every(card, 120, function () { n += 3500 + Math.floor(Math.random() * 5200); out.textContent = n.toLocaleString("en-US"); });
    card.addEventListener("pointerenter", function () { if (R) return; b.classList.add("grow"); b.getBoundingClientRect(); setTimeout(function () { b.classList.remove("grow"); }, 260); });
  });
  $$(".fr").forEach(function (fr) {
    var fs = $$("[data-type]", fr), log = $("[data-log]", fr), pct = $("[data-pct]", fr), bar = $(".fr-b i", fr), busy = false;
    var logs = ["Thermal scan…", "Harmonics…", "Cable model…", "Weather match…", "Site profile complete"];
    function full() { fs.forEach(function (p) { p.textContent = p.dataset.type; }); fr.classList.add("scan", "done"); log.textContent = logs[4]; pct.textContent = "100%"; bar.style.transform = "scaleX(1)"; }
    if (R) { full(); return; }
    function run() {
      if (busy) return; busy = true; fr.classList.remove("scan", "done"); fs.forEach(function (p) { p.textContent = ""; }); bar.style.transform = "scaleX(0)"; pct.textContent = "0%";
      var fi = 0, ci = 0, id = setInterval(function () {
        var t = fs[fi].dataset.type; fs[fi].textContent = t.slice(0, ++ci); if (ci >= t.length) { fi++; ci = 0; }
        if (fi >= fs.length) { clearInterval(id); setTimeout(scan, 350); }
      }, 42);
    }
    function scan() {
      fr.classList.add("scan"); var t0 = performance.now();
      var id = setInterval(function () { var k = Math.min(1, (performance.now() - t0) / 3200); pct.textContent = Math.round(k * 100) + "%"; bar.style.transform = "scaleX(" + k + ")"; log.textContent = logs[Math.min(4, Math.floor(k * 4.01))]; if (k >= 1) { clearInterval(id); fr.classList.add("done"); setTimeout(function () { busy = false; }, 6000); } }, 50);
    }
    SV.once(fr, run); SV.every(fr, 14000, run);
  });
  /* charging card tilt */
  $$(".c4").forEach(function (card) {
    var pc = $(".pc", card); if (R) return;
    card.addEventListener("pointermove", function (e) { if (e.pointerType !== "mouse") return; var r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; pc.style.transform = "perspective(900px) rotateY(" + (x * 16).toFixed(2) + "deg) rotateX(" + (-y * 12).toFixed(2) + "deg)"; });
    card.addEventListener("pointerleave", function () { pc.style.transform = ""; });
  });
  /* embed card carousel */
  $$(".c6").forEach(function (card) {
    var cs = $$(".ck6", card), rows = $$("tbody tr", card), map = [3, 1, 7], k = 1;
    var set = function () { cs.forEach(function (c, i) { c.classList.toggle("on", i === k); c.classList.toggle("next", i === (k + 1) % 3); c.classList.toggle("prev", i === (k + 2) % 3); }); rows.forEach(function (r, i) { r.classList.toggle("hl", i === map[k]); }); };
    set(); SV.every(card, 3800, function () { k = (k + 1) % 3; set(); });
  });

  /* ---------------------------------------------- modals */
  var lastFocus = null, openM = null;
  function openModal(id, from) {
    var m = $("#m-" + id); if (!m) return; lastFocus = from; openM = m; m.hidden = false; m.scrollTop = 0;
    var sw = innerWidth - document.documentElement.clientWidth; document.documentElement.style.overflow = "hidden"; if (sw) document.body.style.paddingRight = sw + "px";
    $(".mdl-x", m).focus({ preventScroll: true });
    var st = $(".mg-b strong", m), raw = st.dataset.v || (st.dataset.v = st.textContent), mt = raw.match(/^([\d.]+)(.*)$/);
    if (mt && !R) { var to = +mt[1], dec = (mt[1].split(".")[1] || "").length, t0 = performance.now(); (function f(t) { var k = Math.min(1, (t - t0) / 1300), e = 1 - Math.pow(1 - k, 4); st.textContent = (to * e).toFixed(dec) + mt[2]; if (k < 1 && openM === m) requestAnimationFrame(f); else st.textContent = raw; })(t0); }
  }
  function closeModal() { if (!openM) return; openM.hidden = true; openM = null; document.documentElement.style.overflow = ""; document.body.style.paddingRight = ""; if (lastFocus) lastFocus.focus({ preventScroll: true }); }
  $$("[data-modal]").forEach(function (c) {
    c.addEventListener("click", function () { openModal(c.dataset.modal, c); });
    c.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openModal(c.dataset.modal, c); } });
  });
  $$(".mdl").forEach(function (m) {
    m.addEventListener("mousedown", function (e) { if (e.target === m && e.clientX < m.clientWidth) closeModal(); });
    $(".mdl-x", m).addEventListener("click", closeModal);
    m.addEventListener("keydown", function (e) { if (e.key !== "Tab") return; var f = $$("a,button", m), a = f[0], z = f[f.length - 1]; if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } });
  });
  addEventListener("keydown", function (e) { if (e.key === "Escape") closeModal(); });

  /* ---------------------------------------------- silk shader (charging card, its backdrop, promo) */
  var SILK = "precision highp float;uniform vec2 r;uniform float t,k;float h(float n){return fract(sin(n*91.7)*43758.5);}float n1(float x){float i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(h(i),h(i+1.),f);}float h2(vec2 p){return fract(sin(dot(p,vec2(12.99,78.23)))*43758.5);}" +
    "void main(){vec2 p=gl_FragCoord.xy/r;p.y=1.-p.y;vec3 W=vec3(1.),a=vec3(.78,.94,.36),b=vec3(.18,.75,.55),c=vec3(.05,.45,.37),d=vec3(1.,.76,.2),e=vec3(.62,.9,.82);" +
    "float w=.055*sin(p.x*5.+t*.7)+.035*sin(p.x*9.-t*.5);" +
    "float y=p.y+.42*p.x+w;float s=n1(y*120.+p.x*6.)*.5+n1(y*300.+p.x*9.)*.3-.4;" +
    "vec3 o;if(k<.5){o=mix(e,a,smoothstep(.18,.42,y));o=mix(o,b,smoothstep(.5,.72,y+.03*sin(p.x*7.+t)));o=mix(o,c,smoothstep(.72,.9,y));o=mix(o,d,smoothstep(.92,1.06,y+.02*sin(t+p.x*4.)));o*=1.+s*.16;o+=.22*pow(max(0.,sin(y*9.-t*.6)),14.);" +
    "float ed=p.y-(.86-.26*p.x*p.x+.03*sin(p.x*4.+t*.6));o=mix(o,W,smoothstep(-.03,.06,ed));}" +
    "else if(k<1.5){float f=p.y*.8-p.x*.5+w;o=W;o=mix(o,vec3(.9,.98,.8),smoothstep(.75,.1,abs(f-.15)*2.));o=mix(o,vec3(.75,.94,.84),smoothstep(.3,0.,abs(f-.1)));o=mix(o,vec3(1.,.93,.75),smoothstep(.25,0.,abs(f-.38)));o=mix(W,o,smoothstep(.12,.4,p.y));o=mix(o,W,smoothstep(.62,.95,p.y));o+=(h2(gl_FragCoord.xy)-.5)*.05*smoothstep(.1,.3,1.-o.r+.1);}" +
    "else{float f=p.x*.8+p.y*.5+w*2.;o=mix(W,a,smoothstep(.1,.5,f));o=mix(o,b,smoothstep(.45,.75,f+.1*sin(t*.6)));o=mix(o,c,smoothstep(.7,1.05,f));o=mix(o,d,smoothstep(.3,0.,distance(p,vec2(.95,.02+.1*sin(t*.5)))));}" +
    "gl_FragColor=vec4(o,1.);}";
  $$("[data-silk]").forEach(function (cv) {
    var gl = cv.getContext("webgl", { antialias: false, alpha: false }); if (!gl) return;
    var sh = function (ty, s) { var o = gl.createShader(ty); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(o)); return o; };
    var p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, "attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}")); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, SILK)); gl.linkProgram(p); gl.useProgram(p);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW); gl.enableVertexAttribArray(0); gl.bindAttribLocation(p, 0, "a"); gl.vertexAttribPointer(gl.getAttribLocation(p, "a"), 2, gl.FLOAT, false, 0, 0);
    var ur = gl.getUniformLocation(p, "r"), ut = gl.getUniformLocation(p, "t"), uk = gl.getUniformLocation(p, "k"), kind = cv.dataset.silk === "card" ? 0 : cv.dataset.silk === "bg" ? 1 : 2;
    var size = function () { var q = kind === 1 ? .5 : 1; cv.width = Math.max(2, Math.round(cv.clientWidth * q)); cv.height = Math.max(2, Math.round(cv.clientHeight * q)); gl.viewport(0, 0, cv.width, cv.height); };
    size(); onResize(size);
    var skip = 0;
    SV.loop(cv, function (t) { if (kind && (skip = (skip + 1) % 2)) return; gl.uniform2f(ur, cv.width, cv.height); gl.uniform1f(ut, t / 1000); gl.uniform1f(uk, kind); gl.drawArrays(gl.TRIANGLES, 0, 3); });
  });

  /* ---------------------------------------------- dotted globe with arcs */
  $$("[data-globe]").forEach(function (cv) {
    var L = window.SV_LAND || "", land = function (la, lo) { var y = Math.min(89, Math.max(0, Math.floor((90 - la) / 2))), x = Math.floor((((lo + 180) % 360) + 360) % 360 / 2); var row = L.substr(y * 45, 45), n = parseInt(row[x >> 2] || "0", 16); return (n >> (3 - (x & 3))) & 1; };
    var pts = [], N = 15000, i; for (i = 0; i < N; i++) { var y = 1 - 2 * (i + .5) / N + (rand() - .5) * .006, ph = i * 2.399963 + (rand() - .5) * .03; y = Math.max(-1, Math.min(1, y)); var la = Math.asin(y) * 57.2958, lo = ((ph * 57.2958) % 360) - 180; if (land(la, lo)) { var r = Math.sqrt(1 - y * y); pts.push([r * Math.cos(lo / 57.2958), y, r * Math.sin(lo / 57.2958), rand()]); } }
    var G, RAD, cx, cy; var size = function () { G = fit(cv, 1.5); RAD = G.w * .72; cx = G.w * .56; cy = G.h * .27 + RAD; }; size(); onResize(size);
    var cities = [[38.7, -9.1], [51.5, 0], [40.4, -3.7], [6.5, 3.4], [52.5, 13.4], [-1.3, 36.8], [25.2, 55.3], [59.9, 10.7], [30, 31.2], [-33.9, 18.4], [41, 29], [5.6, -.2]];
    var v3 = function (c) { var a = c[0] / 57.2958, o = c[1] / 57.2958; return [Math.cos(a) * Math.cos(o), Math.sin(a), Math.cos(a) * Math.sin(o)]; };
    var tagBox = cv.parentNode.querySelector(".gl-tags"), cols = ["#0a7350", "#5cae2a", "#e08a12", "#0d6f86"], arcs = [];
    for (i = 0; i < 4; i++) { var s = document.createElement("span"); s.innerHTML = "<i></i><b style='font-weight:400'></b>"; tagBox.appendChild(s); arcs.push({ t0: -9999, el: s, c: cols[i] }); }
    var vals = ["€48 MWh", "€368 kW", "€212 MWh", "€746 kW", "€74 MWh"];
    function pick(a, t) { var m = Math.floor(rand() * cities.length), n = (m + 1 + Math.floor(rand() * (cities.length - 1))) % cities.length; a.a = v3(cities[m]); a.b = v3(cities[n]); a.t0 = t + rand() * 1800; a.el.lastChild.textContent = vals[Math.floor(rand() * 5)]; a.el.firstChild.style.background = a.c; }
    function slerp(a, b, t) { var d = Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])), o = Math.acos(d) || .001, s = Math.sin(o), p = Math.sin((1 - t) * o) / s, q = Math.sin(t * o) / s, h = 1 + .28 * Math.sin(Math.PI * t) * Math.min(1, o); return [(a[0] * p + b[0] * q) * h, (a[1] * p + b[1] * q) * h, (a[2] * p + b[2] * q) * h]; }
    var tilt = .38, ct = Math.cos(tilt), st = Math.sin(tilt);
    function proj(p, cr, sr) { var x = p[0] * cr - p[2] * sr, z = p[0] * sr + p[2] * cr, y = p[1] * ct - z * st, z2 = p[1] * st + z * ct; return [cx + x * RAD, cy - y * RAD, z2]; }
    SV.loop(cv, function (t) {
      var c = G.c, rot = 1.25 + (R ? 0 : t * .00004), cr = Math.cos(rot), sr = Math.sin(rot), i, p, q; c.clearRect(0, 0, G.w, G.h);
      // three passes by colour band keep state changes low
      for (var b = 0; b < 3; b++) {
        c.fillStyle = ["#f0a51f", "#4fae5a", "#0f8f72"][b]; c.globalAlpha = .78;
        for (i = 0; i < pts.length; i++) { p = pts[i]; q = proj(p, cr, sr); if (q[2] < .02 || q[1] > G.h || q[0] < 0 || q[0] > G.w) continue; var ny = (q[1] - (cy - RAD)) / (RAD * 1.2) + p[3] * .22 - .1, band = ny < .2 ? 0 : ny < .5 ? 1 : 2; if (band !== b) continue; var s = .7 + q[2] * .75; c.fillRect(q[0], q[1], s, s); }
      }
      c.globalAlpha = 1; var fadeg = c.createLinearGradient(0, 0, 0, G.h);
      arcs.forEach(function (a) {
        if (!a.a || t > a.t0 + 5200) pick(a, t); var k = (t - a.t0) / 3000; if (k < 0) { a.el.style.opacity = 0; return; }
        var k2 = Math.min(1, k), tail = Math.max(0, (t - a.t0 - 3000) / 2000), vis = false; c.beginPath(); var first = true, head;
        for (var j = 0; j <= 40; j++) { var u = tail + (k2 - tail) * j / 40; if (u < tail) break; q = proj(slerp(a.a, a.b, u), cr, sr); if (q[2] < -.05) { first = true; continue; } if (first) { c.moveTo(q[0], q[1]); first = false; } else c.lineTo(q[0], q[1]); head = q; vis = true; }
        c.strokeStyle = a.c; c.lineWidth = 1; c.globalAlpha = .75; c.stroke(); c.globalAlpha = 1;
        if (head) { c.beginPath(); c.arc(head[0], head[1], 2.6, 0, 7); c.fillStyle = "#fff"; c.fill(); c.stroke(); }
        var show = vis && head && k < 1.4 && head[1] > 150 && head[0] > 10 && head[0] < G.w - 70; a.el.style.opacity = show ? 1 : 0; if (show) a.el.style.transform = "translate(" + (head[0] + 8).toFixed(1) + "px," + (head[1] - 22).toFixed(1) + "px)";
      });
    });
  });

  /* ---------------------------------------------- stats: four visualisations + time of day */
  var stats = $(".stats");
  if (stats) (function () {
    var T = {
      night: { bg: "radial-gradient(60% 62% at 50% 100%,#e6f7cf 0,#9be3b4 14%,#2f9f78 32%,#0f6a52 52%,#08432f 70%,#042a20 100%)", fg: "#fff", fg2: "#8fbcaa", ln: "rgba(170,225,195,.2)", hl: "#fff", s: ["#f4ffe6", "#d7f7e0"], m: "rgba(4,42,32,.85)" },
      predawn: { bg: "radial-gradient(60% 62% at 50% 100%,#6fcfae 0,#b9ecd4 26%,#e4f7ea 52%,#fafcf7 78%)", fg: "#07211b", fg2: "#8da79c", ln: "rgba(7,60,45,.1)", hl: "#0f9f6a", s: ["#0a7350", "#0d6f86"], m: "rgba(255,255,255,.9)" },
      sunrise: { bg: "radial-gradient(60% 62% at 50% 100%,#ff9d4d 0,#ffd27a 22%,#fff0c9 48%,#fcfcf6 78%)", fg: "#07211b", fg2: "#a79a80", ln: "rgba(90,60,0,.12)", hl: "#e08a12", s: ["#c2541a", "#e08a12"], m: "rgba(255,255,255,.9)" },
      daytime: { bg: "radial-gradient(60% 62% at 50% 100%,#ffe56b 0,#dff27a 22%,#d3f3e4 50%,#f2fbfb 80%)", fg: "#07211b", fg2: "#7fa196", ln: "rgba(7,60,45,.1)", hl: "#5cae2a", s: ["#2c8a3d", "#0d6f86"], m: "rgba(255,255,255,.9)" },
      dusk: { bg: "radial-gradient(60% 62% at 50% 100%,#ffd9a1 0,#f2a071 18%,#8d6a7a 42%,#2f4a55 68%,#16303a 100%)", fg: "#fff", fg2: "#a7bcc0", ln: "rgba(255,255,255,.18)", hl: "#ffd9a1", s: ["#fff3df", "#ffe0b8"], m: "rgba(22,48,58,.85)" },
      sunset: { bg: "radial-gradient(60% 62% at 50% 100%,#fff0a8 0,#ffb63d 18%,#f0743a 38%,#9c3b3f 62%,#4a1f33 100%)", fg: "#fff", fg2: "#f0c3a8", ln: "rgba(255,255,255,.22)", hl: "#fff0a8", s: ["#fffbe6", "#ffe9b8"], m: "rgba(74,31,51,.85)" }
    };
    var bgBox = $(".stats-bg", stats), cur = null, tod = "night", cv = $("[data-viz]", stats), G, btns = $$(".st-row button", stats), lines = $$(".st-l", stats), at = 0, prev = 0, sw = -9999;
    function setTod(n) {
      var d = T[n]; tod = n; var el = document.createElement("div"); el.className = "s-a"; el.style.background = d.bg; el.style.opacity = cur ? 0 : 1; bgBox.appendChild(el);
      if (cur) { el.offsetWidth; el.style.opacity = 1; var old = cur; setTimeout(function () { old.remove(); }, 900); } cur = el;
      stats.style.setProperty("--fg", d.fg); stats.style.setProperty("--fg2", d.fg2); stats.style.setProperty("--ln", d.ln); stats.style.setProperty("--hl", d.hl); stats.style.setProperty("--mbg", d.m); SV.kick();
    }
    setTod("night");
    var tb = $(".tod-b", stats), menu = $(".todm ul", stats);
    tb.addEventListener("click", function () { menu.hidden = !menu.hidden; tb.setAttribute("aria-expanded", !menu.hidden); });
    document.addEventListener("click", function (e) { if (!e.target.closest(".todm")) { menu.hidden = true; tb.setAttribute("aria-expanded", "false"); } });
    $$("button", menu).forEach(function (b) { b.addEventListener("click", function () { setTod(b.dataset.t); tb.innerHTML = $("svg", b).outerHTML; $$("button", menu).forEach(function (x) { x.setAttribute("aria-checked", x === b); }); menu.hidden = true; tb.setAttribute("aria-expanded", "false"); }); });
    function go(i) { if (i === at) return; prev = at; at = i; sw = performance.now(); btns.forEach(function (b, k) { b.classList.toggle("on", k === i); b.setAttribute("aria-selected", k === i); }); lines.forEach(function (l) { l.style.transform = "translateX(" + i * 100 + "%)"; }); SV.kick(); }
    btns.forEach(function (b, i) { b.addEventListener("click", function () { go(i); }); b.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") go(i); }); });

    var rays = [], i; for (i = 0; i < 300; i++) { var a = rand() * Math.PI * 2, e = Math.asin(rand() * .99); rays.push({ a: a, e: e, l: .55 + rand() * .45, s: rand() * 6.28, dot: rand() > .35, w: .5 + rand() * .7 }); }
    var arcs = []; for (i = 0; i < 150; i++) { var z = rand(); arcs.push({ a: rand() * 6.28, d: .35 + rand() * 1.75, o: rand(), sp: .00008 + rand() * .00016, w: .5 + rand() * .7 }); }
    var ls = []; for (i = 0; i < 46; i++) ls.push({ y: i / 45, o: rand() * 6.28, r: rand(), p: rand() });
    var size = function () { G = fit(cv, 1.5); }; size(); onResize(size);
    var D = [
      function (c, t, al, col) { // rays from the ground up
        var ox = G.w / 2, oy = G.h + 2, rad = Math.min(G.h * .88, G.w * .6), wx = Math.min(1.22, G.w / 560), rot = t * .00006;
        var g = c.createRadialGradient(ox, oy, 0, ox, oy, rad); g.addColorStop(0, col[0]); g.addColorStop(1, col[1]); c.strokeStyle = g; c.fillStyle = col[0];
        for (var k = 0; k < rays.length; k++) {
          var r = rays[k], az = r.a + rot, ce = Math.cos(r.e), x = ce * Math.cos(az), y = Math.sin(r.e), z = ce * Math.sin(az), ll = r.l * (.9 + .1 * Math.sin(t * .0011 + r.s)), px = ox + x * rad * wx * ll, py = oy - (y * .96 + z * .1) * rad * ll; if (py > oy) continue;
          c.globalAlpha = al * (.28 + .5 * (z + 1) / 2) * (r.dot ? 1 : .6); c.lineWidth = r.w; c.beginPath(); c.moveTo(ox, oy); c.lineTo(px, py); c.stroke();
          if (r.dot) { c.globalAlpha = al * (.55 + .45 * (z + 1) / 2); c.beginPath(); c.arc(px, py, 1.5 + r.w * .5, 0, 7); c.fill(); }
        }
      },
      function (c, t, al, col) { // arcs sweeping over a dome from one pole
        var RX = Math.min(G.w * .37, 455), RY = G.h * .9, ox = G.w / 2, oy = G.h + 4; c.strokeStyle = col[0]; c.fillStyle = col[0];
        var P = [-.68, .52, .517], U = [.607, .795, 0], V = [-.411, .314, -.856];
        for (var k = 0; k < arcs.length; k++) {
          var r = arcs[k], pr = (t * r.sp + r.o) % 1.45, hd = Math.min(1, pr), tl = Math.max(.02, pr - .55), last = null, st = false; c.beginPath();
          for (var j = 0; j <= 18; j++) {
            var th = .04 + (tl + (hd - tl) * j / 18) * r.d * 1.2, ct = Math.cos(th), sn = Math.sin(th), ca = Math.cos(r.a) * sn, sa = Math.sin(r.a) * sn;
            var y = ct * P[1] + ca * U[1] + sa * V[1], z = ct * P[2] + ca * U[2] + sa * V[2], x = ct * P[0] + ca * U[0] + sa * V[0];
            if (y < 0 || z < -.45) { st = false; last = null; continue; }
            var px = ox + x * RX, py = oy - y * RY; if (!st) { c.moveTo(px, py); st = true; } else c.lineTo(px, py); last = [px, py];
          }
          c.globalAlpha = al * .62; c.lineWidth = r.w; c.stroke(); if (last && pr < 1) { c.globalAlpha = al; c.beginPath(); c.arc(last[0], last[1], 1.9, 0, 7); c.fill(); }
        }
      },
      function (c, t, al, col) { // spiralling curtain
        var ox = G.w / 2, n = Math.min(260, Math.round(G.w / 4)), S = Math.min(1, G.w / 1000); c.strokeStyle = col[0]; c.fillStyle = col[0]; c.lineWidth = 1;
        for (var k = 0; k < n; k++) {
          var u = k / (n - 1), ang = u * 8.4 + .12 * Math.sin(t * .0004), rr = (470 - u * 130) * S, x = ox - Math.cos(ang) * rr, dep = Math.sin(ang), y = G.h * (.52 - u * .5) + dep * 22 + Math.sin(u * 30 - t * .0014) * 4 * (1 - u), len = 250 * (1 - u * .85);
          if (y < 2) continue; var g = (Math.pow(1 - u, 1.5) * .85 + .1) * (.5 + .5 * (dep + 1) / 2);
          c.globalAlpha = al * g * .6; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + len); c.stroke(); c.globalAlpha = al * g; c.beginPath(); c.arc(x, y, 1.9 * (1 - u * .5), 0, 7); c.fill();
        }
      },
      function (c, t, al, col) { // lines through a pinch
        var x0 = G.w * .145, x1 = G.w * .855, mx = G.w / 2, my = G.h * .74; c.lineWidth = 1; var gr = c.createLinearGradient(0, 0, 0, G.h); gr.addColorStop(0, col[0]); gr.addColorStop(1, col[1]); c.strokeStyle = gr; c.fillStyle = gr;
        for (var k = 0; k < ls.length; k++) {
          var l = ls[k], w = Math.sin(t * .0007 + l.o) * 5, ya = G.h * (-.02 + l.y * 1.02) + w, yb = G.h * (.14 + l.y * .88) - w, xa = x0 + Math.sin(l.o) * 4, xb = x1 + Math.cos(l.o) * 8; if (ya < 4) continue; var q = (k - ls.length / 2) * .06;
          c.globalAlpha = al * .8; c.beginPath(); c.moveTo(xa, ya); c.bezierCurveTo(xa + G.w * .22, ya + 12, mx - G.w * .1, my + q, mx, my + q); c.bezierCurveTo(mx + G.w * .1, my + q, xb - G.w * .22, yb + 4, xb, yb); c.stroke();
          c.globalAlpha = al; c.beginPath(); c.arc(xa, ya, 2, 0, 7); c.fill(); c.beginPath(); c.arc(xb, yb, 2, 0, 7); c.fill();
          var pu = (t * .00012 + l.p) % 1; if (l.r > .5) { var s = pu < .5 ? pu * 2 : (pu - .5) * 2, m = 1 - s, p0, p1, p2, p3; if (pu < .5) { p0 = [xa, ya]; p1 = [xa + G.w * .22, ya + 12]; p2 = [mx - G.w * .1, my + q]; p3 = [mx, my + q]; } else { p0 = [mx, my + q]; p1 = [mx + G.w * .1, my + q]; p2 = [xb - G.w * .22, yb + 4]; p3 = [xb, yb]; } var bx = m * m * m * p0[0] + 3 * m * m * s * p1[0] + 3 * m * s * s * p2[0] + s * s * s * p3[0], by = m * m * m * p0[1] + 3 * m * m * s * p1[1] + 3 * m * s * s * p2[1] + s * s * s * p3[1]; c.beginPath(); c.arc(bx, by, 1.7, 0, 7); c.fill(); }
        }
      }
    ];
    SV.loop(cv, function (t) { var c = G.c, k = R ? 1 : Math.min(1, (performance.now() - sw) / 600), col = T[tod].s; c.clearRect(0, 0, G.w, G.h); if (k < 1) D[prev](c, t, 1 - k, col); D[at](c, R ? 8000 : t, k, col); c.globalAlpha = 1; });
  })();

  /* ---------------------------------------------- platform mock sequence */
  $$("[data-plat]").forEach(function (p) {
    var rep = $(".rep", p), ids = [];
    function run() { ids.forEach(clearTimeout); ids = []; rep.hidden = true; $$(".sl,.pop", p).forEach(function (x) { x.classList.remove("on"); }); [1, 2, 3, 4].forEach(function (k, i) { ids.push(setTimeout(function () { $(".p" + k, p).classList.add("on"); }, R ? 0 : 400 + i * 1500)); ids.push(setTimeout(function () { $(".s" + k, p).classList.add("on"); }, R ? 0 : 900 + i * 1500)); }); ids.push(setTimeout(function () { rep.hidden = false; }, R ? 0 : 7600)); }
    SV.once(p, run, "0px 0px -30% 0px"); rep.addEventListener("click", run);
  });

  /* ---------------------------------------------- integration diagram */
  $$("[data-dia]").forEach(function (d) {
    var tops = $$(".dia-top .slot", d), apps = $$(".dia-apps .slot", d), psp = $$(".dia-psp .slot", d);
    SV.every(d, 1500, function () { [tops, apps, psp].forEach(function (g) { if (!g.length || Math.random() < .25) return; var s = g[Math.floor(Math.random() * g.length)]; var on = s.dataset.on === "1", c = g.filter(function (x) { return x.dataset.on === "1"; }).length; if (on && c < 2) return; s.dataset.on = on ? "0" : "1"; }); });
    var svg = $("svg", d), ws = $$(".w", svg);
    if (svg && !R) ws.forEach(function (w, i) { var p = w.cloneNode(); p.setAttribute("class", "p"); var L = w.getTotalLength(); p.style.strokeDasharray = "26 " + L; svg.appendChild(p); p.animate([{ strokeDashoffset: 26 }, { strokeDashoffset: -L }], { duration: 1700 + L * 4, iterations: Infinity, delay: i * 420, easing: "ease-in-out" }); });
  });

  /* ---------------------------------------------- woven line wave */
  $$("[data-lines]").forEach(function (cv) {
    var G; var size = function () { G = fit(cv, 1.25); }; size(); onResize(size);
    var N = 46, M = 56;
    SV.loop(cv, function (t) {
      var c = G.c, w = G.w, h = G.h; c.clearRect(0, 0, w, h); var g = c.createLinearGradient(0, 0, w, 0);
      g.addColorStop(0, "rgba(255,214,120,0)"); g.addColorStop(.1, "rgba(255,206,110,.75)"); g.addColorStop(.34, "#f7c948"); g.addColorStop(.46, "#c6ea3c"); g.addColorStop(.68, "#2fbf8a"); g.addColorStop(.9, "rgba(13,111,134,.7)"); g.addColorStop(1, "rgba(13,111,134,0)"); c.strokeStyle = g; c.lineWidth = 1; var tt = R ? 2 : t * .00035;
      for (var i = 0; i < N; i++) {
        var v = i / (N - 1); c.globalAlpha = .25 + .6 * Math.abs(v - .5) * 1.6; c.beginPath();
        for (var j = 0; j <= M; j++) {
          // one twist: a thin ribbon on the left crosses itself near 36% and fans out to the right
          var u = j / M, k = u - .36 - .02 * Math.sin(tt), sp = k < 0 ? -.2 * Math.sin(Math.min(1, -k / .36) * 3.0) : .95 * Math.pow(k / .64, 1.15),
            mid = .64 - .05 * Math.sin(u * 3.4 + tt * .6) - .34 * Math.pow(Math.max(0, u - .18), 1.4),
            y = h * (mid + (v - .5) * sp + .05 * v * Math.sin(u * 4.2 + tt) * (u > .36 ? (u - .36) * 2 : 0) + .01 * Math.sin(u * 8 + v * 5 + tt * 2));
          j ? c.lineTo(u * w, y) : c.moveTo(0, y);
        }
        c.stroke();
      }
      c.globalAlpha = 1;
    });
  });

  /* ---------------------------------------------- code editor typing */
  $$("[data-code]").forEach(function (b) {
    var code = $("code", b), ac = $(".ac", b), out = $(".cout", b);
    var L = ["<u>1</u>const solvane = require('solvane')(", "<u>2</u>  <s>'sk_test_7tr9q'</s>", "<u>3</u>);", "<u>4</u><i>await</i> solvane.", "<u>5</u>", "<u>6</u>"], tail = "chargingSites.<i>create</i>({})";
    function all() { code.innerHTML = L.slice(0, 3).join("\n") + "\n" + L[3] + tail + "\n" + L[4] + "\n" + L[5]; out.classList.add("on"); }
    if (R) { all(); return; }
    var busy = false;
    function run() { if (busy) return; busy = true; out.classList.remove("on"); var k = 0; code.innerHTML = ""; var id = setInterval(function () { k++; code.innerHTML = L.slice(0, k).join("\n"); if (k >= 6) { clearInterval(id); setTimeout(function () { ac.classList.add("on"); }, 400); setTimeout(function () { ac.classList.remove("on"); all(); out.classList.remove("on"); }, 2600); setTimeout(function () { out.classList.add("on"); }, 3300); setTimeout(function () { busy = false; }, 7000); } }, 260); }
    SV.once(b, run); SV.every(b, 10500, run);
  });

  /* ---------------------------------------------- squeezing carousel */
  $$("[data-sqz]").forEach(function (box) {
    var it = $$(".sqz-i", box), caps = $$(".sqz-c>div"), n = it.length, pos = 0, target = 0, raf = 0, W = 0, mob = false, hover = -1, hv = 0;
    // width fraction (of a 1232 px row) by signed distance from the active slide
    var K = [[-2, 0], [-1, .03], [0, .648], [1, .155], [2, .078], [3, .038], [4, .0105], [5, .009], [6, .0075], [7, 0]];
    function wt(d) { if (d <= K[0][0] || d >= 7) return 0; for (var i = 1; i < K.length; i++) if (d <= K[i][0]) { var a = K[i - 1], b = K[i], f = (d - a[0]) / (b[0] - a[0]); f = f * f * (3 - 2 * f); return a[1] + (b[1] - a[1]) * f; } return 0; }
    function lay() {
      var x = 0, i, d, w, g;
      if (mob) { for (i = 0; i < n; i++) { d = i - pos; d = ((d + 1 + n * 100) % n) - 1; var iw = Math.min(W - 32, 358); var xx = 16 + d * (iw + 12); it[i].style.width = iw + "px"; it[i].style.transform = "translateX(" + xx.toFixed(1) + "px)"; it[i].style.visibility = xx > W || xx < -iw ? "hidden" : ""; } return; }
      var sum = 0, o = []; for (i = 0; i < n; i++) { d = ((i - pos + 1.0001 + n * 100) % n) - 1.0001; w = wt(d); if (d < -.5 && target === 0 && Math.abs(pos) < .001) w = 0; g = w <= 0 ? 0 : Math.min(16, 3 + w * 220); o.push({ i: i, d: d, w: w, g: g }); }
      o.sort(function (a, b) { return a.d - b.d; });
      if (hover >= 0) o.forEach(function (q) { if (q.i === hover && q.d > .5) q.w += .016 * hv; });
      var gs = 0; o.forEach(function (q) { sum += q.w; gs += q.g; }); gs -= o.length ? (o.filter(function (q) { return q.w > 0; }).pop() || { g: 0 }).g : 0; var sc = (W - gs) / sum;
      o.forEach(function (q) { var el = it[q.i], pw = q.w * sc; if (pw < .5) { el.style.visibility = "hidden"; return; } el.style.visibility = ""; el.style.width = pw.toFixed(1) + "px"; el.style.transform = "translateX(" + x.toFixed(1) + "px)"; el.classList.toggle("nar", pw < 420); x += pw + q.g; });
    }
    function cap() { var k = ((target % n) + n) % n; caps.forEach(function (c, i) { c.classList.toggle("on", i === k); }); it.forEach(function (a, i) { a.tabIndex = i === k ? 0 : -1; }); }
    function step() { raf = 0; var d = target - pos, hh = hover >= 0 ? 1 : 0, dh = hh - hv; if (Math.abs(d) < .002 || R) pos = target; else pos += d * .13; hv += dh * .18; lay(); if (pos !== target || Math.abs(dh) > .02) raf = requestAnimationFrame(step); }
    function kick() { if (!raf) raf = requestAnimationFrame(step); }
    function go(d) { target = Math.round(target) + d; cap(); kick(); }
    function size() { W = box.clientWidth; mob = innerWidth < 768; lay(); }
    size(); onResize(size); cap();
    $$("[data-sq]").forEach(function (b) { b.addEventListener("click", function () { go(+b.dataset.sq); }); });
    box.addEventListener("keydown", function (e) { if (e.key === "ArrowRight") { go(1); e.preventDefault(); } if (e.key === "ArrowLeft") { go(-1); e.preventDefault(); } });
    it.forEach(function (a, i) {
      a.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") { hover = i; kick(); } }); a.addEventListener("pointerleave", function () { hover = -1; kick(); });
      a.addEventListener("click", function (e) { if (dragged) { e.preventDefault(); return; } var k = ((target % n) + n) % n; if (i !== k) { e.preventDefault(); var d = ((i - k) % n + n) % n; go(d > n - 2 ? d - n : d); } });
      a.addEventListener("dragstart", function (e) { e.preventDefault(); });
    });
    var sx = 0, sp = 0, down = false, dragged = false;
    box.addEventListener("pointerdown", function (e) { down = true; dragged = false; sx = e.clientX; sp = target; });
    addEventListener("pointermove", function (e) { if (!down) return; var d = e.clientX - sx; if (Math.abs(d) > 6) dragged = true; if (dragged) { target = pos = sp - d / (mob ? 340 : 620); lay(); } });
    var end = function (e) { if (!down) return; down = false; if (dragged) { var d = sp - target; target = Math.abs(d) > .12 ? Math.round(sp) - Math.sign(d) : Math.round(sp); cap(); kick(); setTimeout(function () { dragged = false; }, 50); } };
    addEventListener("pointerup", end); addEventListener("pointercancel", end);
  });
})();
