// GUIDA-SVILUPPO: EFFETTO "PALLA DI ENERGIA" -> bottone WhatsApp. ESPERIMENTO, file autonomo.
// COSA FA: alla PRIMA visita (flag in localStorage 'energiaWA') particelle verdi nello schermo si addensano in una palla che vola sul bottone WhatsApp (~2.3s), poi il bottone fa un lampo.
// TEST: apri in incognito (storage vuoto = riparte), oppure aggiungi ?energia=1 all'URL per forzarlo ogni volta. ?energia=0 lo salta.
// COME RIMUOVERLO: 1) cancella questo file  2) cancella la riga <script ... energia-wa.js> in _includes/footer/custom.html.  Oppure torna al tag git "prima-energia-wa".
// NOTE: il canvas ha pointer-events:none (non blocca click). Se non c'e' nessun bottone WhatsApp visibile (es. whatsapp_demo:false) NON parte nulla. Rispetta "riduci movimento" del sistema.
(function () {
  'use strict';
  var q = location.search, KEY = 'energiaWA';
  if (/energia=0/.test(q)) return;
  var forza = /energia=1/.test(q);
  try { if (!forza && localStorage.getItem(KEY)) return; } catch (e) { return; }   // storage bloccato -> meglio niente effetto che ripeterlo sempre
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // cerca il primo bottone WhatsApp VISIBILE (hero, banner contatto, barra laterale)
  function trovaTarget() {
    var els = document.querySelectorAll('.gc-btn-wa, .cb-wa, a[href*="wa.me"], a .fa-whatsapp, a .fab.fa-whatsapp');
    for (var i = 0; i < els.length; i++) {
      var a = els[i].closest ? (els[i].closest('a') || els[i]) : els[i], r = a.getBoundingClientRect();
      if (r.width > 8 && r.height > 8 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth && a.offsetParent !== null) return a;
    }
    return null;
  }

  function parti() {
    var T = trovaTarget(); if (!T) return;            // niente bottone visibile -> niente effetto
    try { localStorage.setItem(KEY, '1'); } catch (e) {}
    var st = document.createElement('style');          // lampo finale sul bottone
    st.textContent = '@keyframes waLampo{0%{box-shadow:0 0 0 0 rgba(37,211,102,.9);transform:scale(1)}40%{transform:scale(1.14)}100%{box-shadow:0 0 0 26px rgba(37,211,102,0);transform:scale(1)}}.wa-lampo{animation:waLampo .8s ease-out}';
    document.head.appendChild(st);
    var c = document.createElement('canvas'), x = c.getContext('2d'), dpr = Math.min(2, devicePixelRatio || 1), W = innerWidth, H = innerHeight;
    c.width = W * dpr; c.height = H * dpr;
    c.style.cssText = 'position:fixed;left:0;top:0;width:100%;height:100%;z-index:99999;pointer-events:none';
    document.body.appendChild(c); x.scale(dpr, dpr);

    var N = 110, P = [], i, cx = W / 2, cy = H / 2;
    for (i = 0; i < N; i++) P.push({ x: Math.random() * W, y: Math.random() * H, r: 1 + Math.random() * 2.2, f: Math.random() * 6.28, s: 0.6 + Math.random() * 0.8 });
    var T1 = 1000, T2 = 1250, T3 = 2300, t0 = performance.now();   // fasi: 0-T1 particelle che si addensano | T1-T2 palla ferma che pulsa | T2-T3 volo al bottone
    var ease = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
    var trail = [], arrivato = false;

    function glow(px, py, r, a) {                        // alone luminoso (additivo)
      var g = x.createRadialGradient(px, py, 0, px, py, r);
      g.addColorStop(0, 'rgba(220,255,230,' + a + ')'); g.addColorStop(.35, 'rgba(37,211,102,' + a * .7 + ')'); g.addColorStop(1, 'rgba(37,211,102,0)');
      x.fillStyle = g; x.beginPath(); x.arc(px, py, r, 0, 6.28); x.fill();
    }
    function frame(now) {
      var t = now - t0; x.clearRect(0, 0, W, H); x.globalCompositeOperation = 'lighter';
      var r = T.getBoundingClientRect(), tx = r.left + r.width / 2, ty = r.top + r.height / 2;   // ricalcolato: il bottone puo' muoversi
      if (t < T1) {
        var k = ease(t / T1);
        for (i = 0; i < N; i++) {
          var p = P[i], ang = p.f + k * 3 * p.s, d = (1 - k);   // spirale verso il centro
          var px = cx + (p.x - cx) * d + Math.cos(ang) * 30 * d, py = cy + (p.y - cy) * d + Math.sin(ang) * 30 * d;
          glow(px, py, 6 * p.r, .35 + .25 * Math.sin(t / 90 + p.f));
        }
        glow(cx, cy, 10 + 34 * k, .25 + .5 * k);
      } else if (t < T2) {
        var pu = 1 + .12 * Math.sin((t - T1) / 35);
        glow(cx, cy, 44 * pu, .95);
      } else if (t < T3) {
        var k2 = ease((t - T2) / (T3 - T2)), bx = cx + (tx - cx) * k2, by = cy + (ty - cy) * k2;
        trail.push({ x: bx, y: by }); if (trail.length > 14) trail.shift();
        for (i = 0; i < trail.length; i++) glow(trail[i].x, trail[i].y, (44 - 26 * k2) * (i / trail.length), .5 * (i / trail.length));
        glow(bx, by, 44 - 26 * k2, 1);
      } else {
        if (!arrivato) { arrivato = true; T.classList.add('wa-lampo'); setTimeout(function () { T.classList.remove('wa-lampo'); }, 900); }
        var k3 = (t - T3) / 450;                           // anello che si espande all'arrivo
        if (k3 < 1) { x.strokeStyle = 'rgba(37,211,102,' + (1 - k3) + ')'; x.lineWidth = 3; x.beginPath(); x.arc(tx, ty, 18 + 50 * k3, 0, 6.28); x.stroke(); }
        else { c.remove(); st.remove(); return; }
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  // parte a pagina caricata (font/immagini pronti, bottone al suo posto)
  if (document.readyState === 'complete') setTimeout(parti, 400);
  else addEventListener('load', function () { setTimeout(parti, 400); });
})();
