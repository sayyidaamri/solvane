/* Solvane hero ribbon. A hand-written WebGL mesh: three sheets, each lofted between two
   control polylines, coloured by a bilinear palette with fine striations along the length.
   Usage: <canvas data-wave="hero|contact">. Needs js/site.js (SV.loop). */
(function () {
  "use strict";
  var VS =
    "attribute vec2 a;uniform vec2 uL[9];uniform vec2 uR[9];uniform float uT,uAmp;uniform vec4 uM;varying vec2 v;varying float vF;" +
    "vec2 cr(vec2 p0,vec2 p1,vec2 p2,vec2 p3,float t){return .5*((2.*p1)+(-p0+p2)*t+(2.*p0-5.*p1+4.*p2-p3)*t*t+(-p0+3.*p1-3.*p2+p3)*t*t*t);}" +
    "vec2 at(int i,int s){" +
    "  vec2 r=vec2(0.);for(int k=0;k<9;k++){if(k==i)r=(s==0)?uL[k]:uR[k];}return r;}" +
    "vec2 curve(float u,int s){float f=u*8.;int i=int(min(floor(f),7.));float t=f-float(i);" +
    "  int a0=i-1;if(a0<0)a0=0;int a3=i+2;if(a3>8)a3=8;return cr(at(a0,s),at(i,s),at(i+1,s),at(a3,s),t);}" +
    "void main(){float u=a.x;v=a;vec2 l=curve(u,0),r=curve(u,1);" +
    "  float w=sin(u*3.14159);" +
    "  l+=uAmp*w*vec2(sin(uT*.55+u*4.)*16.+sin(uT*.27+u*2.)*12.,cos(uT*.43+u*3.2)*12.);" +
    "  r+=uAmp*w*vec2(sin(uT*.38+u*3.+1.2)*14.,cos(uT*.31+u*2.6+.6)*10.);" +
    "  vec2 p=mix(l,r,a.y);" +
    "  p+=uAmp*w*vec2(0.,sin(a.y*6.28+uT*.5+u*3.)*6.);" +
    "  vF=sin(a.y*5.2+u*2.4+uT*.35);" +
    "  p=p*uM.xy+uM.zw;gl_Position=vec4(p.x*2.-1.,1.-p.y*2.,0.,1.);}";
  var FS =
    "precision highp float;varying vec2 v;varying float vF;uniform vec3 uA[6];uniform vec3 uB[6];uniform float uT,uSoft,uSeed,uFade,uStr;" +
    "float h(float n){return fract(sin(n*127.1+uSeed*31.7)*43758.5453);}" +
    "float n1(float x){float i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(h(i),h(i+1.),f);}" +
    "float h2(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}" +
    "vec3 pal(vec3 c0,vec3 c1,vec3 c2,vec3 c3,vec3 c4,vec3 c5,float t){t=clamp(t,0.,1.)*5.;vec3 c=c0;c=mix(c,c1,smoothstep(0.,1.,t));c=mix(c,c2,smoothstep(1.,2.,t));c=mix(c,c3,smoothstep(2.,3.,t));c=mix(c,c4,smoothstep(3.,4.,t));c=mix(c,c5,smoothstep(4.,5.,t));return c;}" +
    "void main(){float u=v.x,x=v.y;" +
    "  float bend=x+.035*sin(u*5.+uT*.3)+.02*sin(u*11.-uT*.22);" +
    "  vec3 a=pal(uA[0],uA[1],uA[2],uA[3],uA[4],uA[5],bend),b=pal(uB[0],uB[1],uB[2],uB[3],uB[4],uB[5],bend);" +
    "  vec3 c=mix(a,b,smoothstep(.08,.92,u+.08*sin(x*6.+uT*.4)));" +
    "  float s=n1(bend*150.+u*2.)*.5+n1(bend*420.+u*3.5)*.32+n1(bend*46.-u*1.5)*.5-.66;" +
    "  c*=1.+s*uStr*(.4+.6*smoothstep(0.,.3,u));" +
    "  c+=uStr*.55*pow(max(0.,vF),6.)*vec3(.9,.95,.75)*.35;" +
    "  c+=(h2(gl_FragCoord.xy)-.5)*.035;" +
    "  float e=smoothstep(0.,uSoft,x)*smoothstep(0.,.012,1.-x);" +
    "  gl_FragColor=vec4(c,1.)*e*uFade;}";

  function hex(s) { return [parseInt(s.slice(1, 3), 16) / 255, parseInt(s.slice(3, 5), 16) / 255, parseInt(s.slice(5, 7), 16) / 255]; }
  function cols(list) { var o = []; list.forEach(function (c) { o = o.concat(hex(c)); }); return new Float32Array(o); }
  function pts(list) { // resample any polyline to 9 points by arc length
    var d = [0], i; for (i = 1; i < list.length; i++) d.push(d[i - 1] + Math.hypot(list[i][0] - list[i - 1][0], list[i][1] - list[i - 1][1]));
    var L = d[d.length - 1], o = [];
    for (var k = 0; k < 9; k++) { var t = L * k / 8, j = 1; while (j < list.length - 1 && d[j] < t) j++; var f = (t - d[j - 1]) / (d[j] - d[j - 1] || 1); o.push(list[j - 1][0] + (list[j][0] - list[j - 1][0]) * f, list[j - 1][1] + (list[j][1] - list[j - 1][1]) * f); }
    return new Float32Array(o);
  }
  // coordinates are px inside a 1440 x 761 stage
  var SHEETS = [
    { // right-hand back sheet
      L: [[1335, 225], [1362, 330], [1370, 430], [1372, 560], [1366, 790]], R: [[1340, 225], [1392, 350], [1440, 405], [1490, 500], [1530, 790]],
      A: ["#36c48d", "#1fae84", "#0d8f75", "#35b98c", "#8ed95f", "#bfe64a"], B: ["#0b5a4c", "#0a6b58", "#0f7f66", "#2aa87c", "#59c478", "#a6dc55"], soft: .02, str: .24, amp: .6
    },
    { // main sheet
      L: [[500, -30], [580, 79], [680, 179], [780, 262], [880, 336], [980, 420], [1100, 514], [1240, 608], [1340, 678]],
      R: [[1085, -30], [1120, 60], [1185, 174], [1225, 250], [1262, 340], [1292, 430], [1318, 520], [1334, 600], [1342, 678]],
      A: ["#cdeee6", "#a4e3d6", "#8fdcb9", "#d7cf3f", "#ffbe16", "#f7a712"], B: ["#b9ef5e", "#a5ea63", "#7fdd6b", "#35c47a", "#13a56c", "#0c8f63"], soft: .035, str: .22, amp: 1
    },
    { // front spine
      L: [[1060, -30], [1120, 64], [1168, 140], [1210, 214], [1248, 290], [1276, 380], [1310, 514], [1335, 674], [1346, 790]],
      R: [[1290, -30], [1318, 110], [1338, 190], [1352, 270], [1364, 340], [1370, 420], [1374, 560], [1371, 680], [1372, 790]],
      A: ["#ffbf1c", "#ffc930", "#ffd651", "#ffc12f", "#f8d24c", "#d9e66a"], B: ["#ffcf45", "#ffe48a", "#ffd95f", "#ffc846", "#ffe9a3", "#bfe36a"], soft: .012, str: .15, amp: .8
    }
  ];

  function start(cv) {
    var gl = cv.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: true });
    if (!gl) { cv.style.background = "linear-gradient(115deg,transparent 30%,#a4e3d6 45%,#ffbe16 65%,#13a56c 90%)"; return; }
    function sh(t, s) { var o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(o)); return o; }
    var pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr); gl.useProgram(pr);
    var NU = 120, NV = 36, vb = [], ib = [], i, j;
    for (i = 0; i <= NU; i++) for (j = 0; j <= NV; j++) vb.push(i / NU, j / NV);
    for (i = 0; i < NU; i++) for (j = 0; j < NV; j++) { var q = i * (NV + 1) + j; ib.push(q, q + 1, q + NV + 1, q + 1, q + NV + 2, q + NV + 1); }
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vb), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(ib), gl.STATIC_DRAW);
    var la = gl.getAttribLocation(pr, "a"); gl.enableVertexAttribArray(la); gl.vertexAttribPointer(la, 2, gl.FLOAT, false, 0, 0);
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    var U = {}; ["uL", "uR", "uT", "uAmp", "uM", "uA", "uB", "uSoft", "uSeed", "uFade", "uStr"].forEach(function (n) { U[n] = gl.getUniformLocation(pr, n); });
    var S = SHEETS.map(function (s) { return { L: pts(s.L), R: pts(s.R), A: cols(s.A), B: cols(s.B), s: s }; });
    var W = 0, H = 0, m = [1, 1, 0, 0], t0 = null;
    function size() {
      var r = cv.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 1.5);
      W = r.width; H = r.height; cv.width = Math.round(W * d); cv.height = Math.round(H * d); gl.viewport(0, 0, cv.width, cv.height);
      // the stage is anchored to the right edge of the canvas; narrow screens use a compressed stage
      var sx, sy, ox, oy = 0;
      if (W < 768) { sx = .385; sy = H / 700; ox = 75 - 515 * sx; }
      else { sx = Math.max(1, W / 1440); sy = H / 761; ox = W - 1440 * sx; if (W < 1440) ox = W - 1440; }
      m = [sx / W, sy / H, ox / W, oy / H];
    }
    size(); window.addEventListener("resize", size);
    SV.loop(cv, function (t) {
      if (t0 === null) t0 = t; var fade = SV.reduced ? 1 : Math.min(1, (t - t0) / 900);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform4fv(U.uM, m); gl.uniform1f(U.uT, SV.reduced ? 4 : t / 1000 * 1.15 + 4); gl.uniform1f(U.uFade, 1 - Math.pow(1 - fade, 3));
      S.forEach(function (s, k) {
        gl.uniform2fv(U.uL, s.L); gl.uniform2fv(U.uR, s.R); gl.uniform3fv(U.uA, s.A); gl.uniform3fv(U.uB, s.B);
        gl.uniform1f(U.uSoft, s.s.soft); gl.uniform1f(U.uStr, s.s.str); gl.uniform1f(U.uSeed, k + 1); gl.uniform1f(U.uAmp, s.s.amp);
        gl.drawElements(gl.TRIANGLES, NU * NV * 6, gl.UNSIGNED_SHORT, 0);
      });
    });
  }
  document.querySelectorAll("canvas[data-wave]").forEach(start);
})();
