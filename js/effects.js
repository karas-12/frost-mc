/* =========================================================
   FROST MC — المؤثرات: ثلج، كتابة تلقائية، Reveal، توهج الماوس
   ========================================================= */
(function () {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Snow ---------- */
  const cv = document.getElementById('snow');
  const ctx = cv.getContext('2d');
  let W = 0, H = 0, flakes = [], burst = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
  const colors = ['255,255,255', '221,205,255', '192,132,252', '167,139,250'];

  function resize() {
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = reduce ? 0 : Math.min(150, Math.floor(W / 11));
    while (flakes.length < n) flakes.push(make(true));
    if (!burst && flakes.length > n) flakes.length = n;
  }
  function make(rand) {
    return {
      x: Math.random() * W, y: rand ? Math.random() * H : -10,
      r: Math.random() * 2.6 + .6, s: Math.random() * .9 + .35,
      a: Math.random() * Math.PI * 2, sw: Math.random() * .02 + .005,
      o: Math.random() * .6 + .3, c: colors[(Math.random() * colors.length) | 0]
    };
  }
  let mouseX = .5;
  addEventListener('pointermove', e => { mouseX = e.clientX / innerWidth; }, { passive: true });
  function tick() {
    ctx.clearRect(0, 0, W, H);
    const wind = (mouseX - .5) * 1.4;
    for (const f of flakes) {
      f.a += f.sw; f.y += f.s + f.r * .12; f.x += Math.sin(f.a) * .6 + wind * f.s;
      if (f.y > H + 10) { f.y = -10; f.x = Math.random() * W; }
      if (f.x > W + 10) f.x = -10; else if (f.x < -10) f.x = W + 10;
      ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, 6.283);
      ctx.fillStyle = 'rgba(' + f.c + ',' + f.o + ')';
      ctx.shadowColor = 'rgba(192,132,252,.8)'; ctx.shadowBlur = f.r * 3;
      ctx.fill();
    }
    if (burst > 0) { burst--; if (burst === 0) { resize(); } }
    requestAnimationFrame(tick);
  }
  addEventListener('resize', () => { resize(); });
  resize();
  if (!reduce) requestAnimationFrame(tick);

  /* Easter egg: عاصفة ثلج */
  function blizzard() {
    for (let i = 0; i < 260; i++) { const f = make(false); f.y = Math.random() * -H; f.s *= 3; f.r += 1; flakes.push(f); }
    burst = 420;
  }

  /* ---------- Typing ---------- */
  function typeText(el, speed) {
    if (el.dataset.typed) return;
    el.dataset.typed = '1';
    const full = el.dataset.full || el.textContent;
    if (reduce) { el.textContent = full; return; }
    el.dataset.full = full;
    el.textContent = '';
    el.classList.add('typing');
    let i = 0;
    speed = speed || +el.dataset.speed || 30;
    (function step() {
      if (!el.isConnected) return;
      el.textContent = full.slice(0, ++i);
      if (i < full.length) setTimeout(step, speed + Math.random() * 18);
      else el.classList.remove('typing');
    })();
  }

  /* ---------- Observers ---------- */
  const io = new IntersectionObserver(entries => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const el = e.target;
      io.unobserve(el);
      if (el.classList.contains('reveal')) el.classList.add('in');
      if (el.hasAttribute('data-type')) setTimeout(() => typeText(el), +el.dataset.delay || 0);
      if (el.hasAttribute('data-count')) countUp(el);
      if (el.hasAttribute('data-bar')) el.style.width = el.dataset.bar;
    }
  }, { threshold: .15, rootMargin: '0px 0px -5% 0px' });

  function countUp(el) {
    const to = +el.dataset.count || 0, dur = 1400, t0 = performance.now();
    if (reduce || to === 0) { el.textContent = to.toLocaleString(); return; }
    (function f(t) {
      const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * e).toLocaleString();
      if (p < 1) requestAnimationFrame(f);
    })(t0);
  }

  function scan(root) {
    root = root || document;
    root.querySelectorAll('.reveal:not(.in),[data-type]:not([data-typed]),[data-count],[data-bar]').forEach((el, i) => {
      if (el.classList.contains('reveal') && !el.style.getPropertyValue('--d')) el.style.setProperty('--d', Math.min(i % 6, 5) * .07 + 's');
      io.observe(el);
    });
    // توهج الكروت يتبع الماوس + ميل ثلاثي الأبعاد للسكن
    root.querySelectorAll('.card').forEach(c => {
      if (c._fx) return; c._fx = 1;
      c.addEventListener('pointermove', e => {
        const r = c.getBoundingClientRect();
        c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        c.style.setProperty('--my', (e.clientY - r.top) + 'px');
        const sk = c.querySelector('.skin img');
        if (sk) {
          sk.style.setProperty('--ry', (((e.clientX - r.left) / r.width - .5) * 50) + 'deg');
          sk.style.setProperty('--rx', ((.5 - (e.clientY - r.top) / r.height) * 14) + 'deg');
        }
      });
      c.addEventListener('pointerleave', () => {
        const sk = c.querySelector('.skin img');
        if (sk) { sk.style.setProperty('--ry', '-14deg'); sk.style.setProperty('--rx', '0deg'); }
      });
    });
  }

  /* ---------- Cursor glow + progress + to-top ---------- */
  const glow = document.getElementById('cursorGlow');
  addEventListener('pointermove', e => {
    if (e.pointerType === 'touch') return;
    glow.style.opacity = 1;
    glow.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)';
  }, { passive: true });
  const bar = document.getElementById('progress'), top = document.getElementById('toTop');
  addEventListener('scroll', () => {
    const h = document.documentElement;
    const p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
    bar.style.width = (p * 100) + '%';
    top.classList.toggle('show', h.scrollTop > 600);
    const bg = document.querySelector('.hero-bg');
    if (bg && h.scrollTop < innerHeight) bg.style.translate = '0 ' + (h.scrollTop * .25) + 'px';
  }, { passive: true });
  top.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

  window.FX = { scan, typeText, blizzard, countUp };
})();
