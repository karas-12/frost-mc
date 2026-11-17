/* =========================================================
   FROST MC — التطبيق الرئيسي: اللغة، الراوتر، الصفحات، الحالة
   ========================================================= */
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  /* ---------------- Helpers ---------------- */
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const safeUrl = u => { u = String(u || '').trim(); return /^(https?:\/\/|data:image\/|assets\/|\.\/|\/)/i.test(u) ? u : ''; };
  const slug = s => String(s || '').replace(/[^a-zA-Z0-9_\-]/g, '');
  const mcName = s => String(s || '').replace(/[^a-zA-Z0-9_.]/g, '').slice(0, 24);
  const digits = s => String(s || '').replace(/\D/g, '');
  const num = x => Number(x) || 0;
  const clone = o => JSON.parse(JSON.stringify(o));
  const lines = s => String(s || '').split(/\r?\n/).map(x => x.trim()).filter(Boolean);
  const ytId = u => { const m = String(u || '').match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/); return m ? m[1] : (/^[\w-]{11}$/.test(u) ? u : ''); };
  const hash = () => location.hash.replace(/^#\/?/, '');

  /* ---------------- Language ---------------- */
  let lang = (function () { try { return localStorage.getItem('frostmc:lang') || 'ar'; } catch (e) { return 'ar'; } })();
  if (!window.I18N[lang]) lang = 'ar';
  const t = k => (I18N[lang] && I18N[lang][k]) || I18N.en[k] || k;
  const other = () => (lang === 'ar' ? 'en' : 'ar');
  const L = (o, f) => o ? (o[f + '_' + lang] || o[f + '_' + other()] || o[f] || '') : '';
  const fmtDate = d => {
    if (!d) return '';
    const x = new Date(d); if (isNaN(x)) return esc(d);
    try { return x.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB', { year: 'numeric', month: 'long', day: 'numeric' }); } catch (e) { return esc(d); }
  };

  /* ---------------- Store ---------------- */
  const Store = {
    KEY: 'frostmc:draft', data: null, hasDraft: false,
    init() { this.data = clone(window.FROST_DATA); },
    async loadPublished() {
      try {
        const r = await fetch('data/content.json', { cache: 'no-store' });
        if (r.ok) Object.assign(this.data, await r.json());
      } catch (e) { /* مفيش ملف منشور — عادي */ }
    },
    loadDraft() {
      try { const s = localStorage.getItem(this.KEY); if (s) { Object.assign(this.data, JSON.parse(s)); this.hasDraft = true; } } catch (e) {}
    },
    saveDraft() { try { localStorage.setItem(this.KEY, JSON.stringify(this.data)); this.hasDraft = true; } catch (e) { toast('Storage full / التخزين ممتلئ'); } },
    clearDraft() { try { localStorage.removeItem(this.KEY); } catch (e) {} this.hasDraft = false; }
  };
  const D = () => Store.data;

  function cfg() {
    const base = window.FROST_CONFIG, s = D().settings || {}, c = Object.assign({}, base);
    ['ip', 'port', 'bedrockIp', 'bedrockPort', 'version', 'discord', 'statusMode', 'kickProxy', 'musicVideoId'].forEach(k => { if (s[k] !== undefined && s[k] !== '') c[k] = s[k]; });
    c.manualStatus = Object.assign({}, base.manualStatus);
    if ('manualOnline' in s) c.manualStatus.online = !!s.manualOnline;
    if (s.manualPlayers !== undefined && s.manualPlayers !== '') c.manualStatus.players = num(s.manualPlayers);
    if (s.manualMax !== undefined && s.manualMax !== '') c.manualStatus.max = num(s.manualMax);
    c.discord = safeUrl(c.discord) || base.discord;
    return c;
  }

  /* ---------------- UI utils ---------------- */
  function toast(msg) {
    const box = $('#toasts'), el = document.createElement('div');
    el.className = 'toast'; el.textContent = msg; box.appendChild(el);
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 320); }, 2600);
  }
  let resumeMusic = false;
  function openModal(html, wide) {
    $('#modalBody').innerHTML = html;
    const m = $('#modal'); m.classList.toggle('wide', !!wide);
    m.classList.add('open'); m.setAttribute('aria-hidden', 'false');
  }
  function closeModal() {
    const m = $('#modal'); m.classList.remove('open'); m.setAttribute('aria-hidden', 'true');
    setTimeout(() => { if (!m.classList.contains('open')) $('#modalBody').innerHTML = ''; }, 350);
    if (resumeMusic) { resumeMusic = false; FrostMusic.play(); }
  }
  async function copyText(txt) {
    try { await navigator.clipboard.writeText(txt); toast(t('copied')); }
    catch (e) {
      const ta = document.createElement('textarea'); ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = 0;
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); toast(t('copied')); } catch (er) { toast(t('copy_fail')); }
      ta.remove();
    }
  }
  const rankOf = id => (D().ranks || []).find(r => r.id === id) || { id, ar: id, en: id, color: '#9ca3af' };
  const rankTag = id => { const r = rankOf(id); return `<span class="tag" style="--tc:${esc(r.color)}">${esc(r[lang] || r.en)}</span>`; };
  const initial = n => esc(String(n || '?').trim().charAt(0).toUpperCase());
  const avatarHtml = (name, img, live) => {
    const u = safeUrl(img);
    return `<div class="avatar${live ? ' live' : ''}">${u ? `<img src="${esc(u)}" alt="" loading="lazy">` : initial(name)}</div>`;
  };
  const skinImg = (name, size) => {
    const n = mcName(name) || 'Steve';
    return `<img src="https://mc-heads.net/body/${encodeURIComponent(n)}/${size || 220}" alt="${esc(n)}" loading="lazy" onerror="this.onerror=null;this.src='https://mc-heads.net/body/MHF_Steve/${size || 220}'">`;
  };
  const empty = (icon, title, desc) => `<div class="empty reveal"><span class="big">${icon}</span><b>${esc(title)}</b><p>${esc(desc || '')}</p></div>`;
  const pageHead = (icon, title, sub) => `<div class="page-head"><h1>${icon} ${esc(title)}</h1><p data-type data-delay="250">${esc(sub)}</p></div>`;

  /* ---------------- Server status ---------------- */
  const Status = {
    s: { state: 'unset', players: 0, max: 0, version: '' }, timer: null,
    async refresh() {
      const c = cfg();
      if (c.statusMode === 'manual') {
        const m = c.manualStatus;
        this.s = { state: m.online ? 'on' : 'off', players: num(m.players), max: num(m.max), version: c.version || '' };
      } else if (!c.ip) {
        this.s = { state: 'unset', players: 0, max: 0, version: c.version || '' };
      } else {
        try {
          const host = c.ip + (num(c.port) && num(c.port) !== 25565 ? ':' + c.port : '');
          const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 9000);
          const r = await fetch(c.statusApi + encodeURIComponent(host), { signal: ctl.signal }); clearTimeout(to);
          const j = await r.json();
          this.s = { state: j.online ? 'on' : 'off', players: j.players ? num(j.players.online) : 0, max: j.players ? num(j.players.max) : 0, version: c.version || j.version || '' };
        } catch (e) { this.s = { state: 'unk', players: 0, max: 0, version: c.version || '' }; }
      }
      this.ui();
    },
    start() { clearInterval(this.timer); this.refresh(); this.timer = setInterval(() => this.refresh(), Math.max(20, num(cfg().statusRefreshSeconds) || 60) * 1000); },
    label() {
      const s = this.s;
      return s.state === 'on' ? t('online') : s.state === 'off' ? t('offline') : s.state === 'unk' ? t('unknown') : t('not_set');
    },
    ui() {
      const s = this.s, cls = s.state === 'on' ? 'on' : s.state === 'off' ? 'off' : 'unk';
      $$('.st-dot').forEach(d => { d.className = 'st-dot ' + cls; });
      const pill = $('#statusPill .st-text');
      if (pill) pill.textContent = s.state === 'on' ? `${s.players}/${s.max} ${t('online')}` : this.label();
      $$('.st-state').forEach(e => e.textContent = this.label());
      $$('.st-players').forEach(e => e.textContent = s.state === 'on' ? s.players : '—');
      $$('.st-max').forEach(e => e.textContent = s.state === 'on' ? s.max : '—');
      $$('.st-version').forEach(e => e.textContent = s.version || '—');
    }
  };

  /* ---------------- Kick ---------------- */
  const kick = { cache: {}, timer: null };
  async function kickFetch(c) {
    const proxy = cfg().kickProxy; const sl = slug(c.kick);
    if (!proxy || !sl) return;
    const hit = kick.cache[sl]; if (hit && Date.now() - hit.ts < 60000) return;
    try {
      const r = await fetch(proxy + sl); const j = await r.json();
      const ls = j.livestream;
      kick.cache[sl] = { ts: Date.now(), live: !!(ls && (ls.is_live !== false)), viewers: ls ? num(ls.viewer_count) : 0, followers: num(j.followers_count || j.followersCount) };
    } catch (e) { kick.cache[sl] = { ts: Date.now(), failed: true }; }
  }
  function creatorInfo(c) {
    const k = kick.cache[slug(c.kick)];
    if (k && !k.failed) return { live: k.live, viewers: k.viewers, followers: k.followers || num(c.followers), auto: true };
    return { live: !!c.live, viewers: num(c.viewers), followers: num(c.followers), auto: false };
  }
  async function kickRefreshAll() {
    if (!cfg().kickProxy) return;
    await Promise.all((D().creators || []).map(kickFetch));
    updateCreatorsUI();
  }

  /* ---------------- Components ---------------- */
  function creatorCard(c, i) {
    const inf = creatorInfo(c), sl = slug(c.kick);
    return `<article class="card creator-card reveal" style="--d:${(i % 6) * .07}s">
      <div class="creator-top"><span class="live-badge ${inf.live ? 'on' : ''}"><i></i>${inf.live ? t('live') : t('offline_b')}</span></div>
      ${avatarHtml(c.name, c.avatar, inf.live)}
      <div class="cbody">
        <h3><a href="#/creator/${esc(c.id)}">${esc(c.name)}</a></h3>
        <p class="muted small"><span class="kick-green">●</span> kick.com/${esc(sl)}</p>
        <div class="pstats"><div><b>${inf.live ? inf.viewers.toLocaleString() : '—'}</b>${t('viewers')}</div><div><b>${inf.followers ? inf.followers.toLocaleString() : '—'}</b>${t('followers')}</div></div>
        <div class="row" style="justify-content:center;margin-top:1rem">
          <a class="btn btn-sm ${inf.live ? 'btn-live' : ''}" href="https://kick.com/${esc(sl)}" target="_blank" rel="noopener">▶ ${t('watch_live')}</a>
          <a class="btn btn-sm" href="#/creator/${esc(c.id)}">${t('about')}</a>
        </div>
      </div></article>`;
  }
  function updateCreatorsUI() {
    const list = D().creators || [];
    const g = $('#creatorsGrid'); if (g) g.innerHTML = list.map(creatorCard).join(''), FX.scan(g), $$('.reveal', g).forEach(e => e.classList.add('in'));
    const f = $('#featuredCreator'); if (f) f.innerHTML = featuredHtml();
    const p = $('#creatorProfile'); if (p) { const c = list.find(x => x.id === p.dataset.id); if (c) p.innerHTML = creatorProfileHtml(c); }
  }
  function featuredCreator() {
    const l = D().creators || [];
    return l.find(c => c.featured) || l.find(c => creatorInfo(c).live) || l[0];
  }
  function featuredHtml() {
    const c = featuredCreator();
    if (!c) return empty('🎥', t('no_creator_t'), t('no_creator_d')) + '';
    const inf = creatorInfo(c), sl = slug(c.kick);
    return `<div class="card sotm flat reveal in">
      ${avatarHtml(c.name, c.avatar, inf.live)}
      <div style="flex:1"><span class="live-badge ${inf.live ? 'on' : ''}"><i></i>${inf.live ? t('live_now') : t('offline_b')}</span>
        <h3 style="font-size:1.6rem;margin:.3rem 0">${esc(c.name)}</h3>
        <p class="muted">${esc(L(c, 'bio'))}</p>
        <div class="row" style="margin-top:.8rem">
          <a class="btn btn-sm ${inf.live ? 'btn-live' : 'btn-primary'}" href="https://kick.com/${esc(sl)}" target="_blank" rel="noopener">▶ ${t('watch_live')}</a>
          <a class="btn btn-sm" href="#/creator/${esc(c.id)}">${t('about')}</a></div></div></div>`;
  }
  function creatorProfileHtml(c) {
    const inf = creatorInfo(c), sl = slug(c.kick);
    return `<div class="card sotm flat">
      ${avatarHtml(c.name, c.avatar, inf.live)}
      <div style="flex:1"><span class="live-badge ${inf.live ? 'on' : ''}"><i></i>${inf.live ? t('live_now') : t('offline_b')}</span>
      <h2 style="font-family:var(--f-head);margin:.3rem 0">${esc(c.name)}</h2>
      <p class="muted"><span class="kick-green">●</span> kick.com/${esc(sl)}</p>
      <p style="margin:.7rem 0">${esc(L(c, 'bio'))}</p>
      <div class="pstats" style="max-width:340px"><div><b>${inf.live ? inf.viewers.toLocaleString() : '—'}</b>${t('viewers')}</div><div><b>${inf.followers ? inf.followers.toLocaleString() : '—'}</b>${t('followers')}</div></div>
      ${!inf.auto ? `<p class="muted small" style="margin-top:.6rem">${t('live_unknown_hint')}</p>` : ''}
      <div class="row" style="margin-top:1rem"><a class="btn ${inf.live ? 'btn-live' : 'btn-primary'}" href="https://kick.com/${esc(sl)}" target="_blank" rel="noopener">▶ ${t('watch_live')}</a></div></div></div>`;
  }
  function newsCard(n, i) {
    const img = safeUrl(n.image);
    return `<article class="card news-card reveal" style="--d:${(i % 6) * .07}s">
      <div class="thumb" ${img ? `style="background-image:linear-gradient(transparent 50%,rgba(7,4,15,.8)),url('${esc(img)}')"` : ''}><span class="tag">${t('t_' + (n.type || 'news'))}</span></div>
      <div class="body"><time>${fmtDate(n.date)}</time><h3>${esc(L(n, 'title'))}</h3><p>${esc(L(n, 'body'))}</p></div></article>`;
  }
  const sortNews = () => (D().news || []).slice().sort((a, b) => String(b.date).localeCompare(String(a.date)));

  /* ---------------- Pages ---------------- */
  const pageState = { pl: { q: '', rank: '', tab: 'total' }, lb: 'total', news: 'all' };
  const hoursKey = tab => tab === 'weekly' ? 'hoursWeek' : tab === 'monthly' ? 'hoursMonth' : 'hoursTotal';

  const pages = {};

  pages.home = () => {
    const c = cfg(), d = D();
    const news = sortNews().slice(0, 3);
    const addr = c.ip ? c.ip + (num(c.port) !== 25565 ? ':' + c.port : '') : '';
    const totalVotes = (d.polls || []).reduce((a, p) => a + (p.options || []).reduce((x, o) => x + num(o.votes), 0), 0);
    return `
    <section class="hero">
      <div class="hero-bg"></div>
      <div class="hero-inner">
        <img src="assets/logo.jpg" alt="FROST MC" class="hero-logo" id="heroLogo">
        <div><span class="kicker">${t('kicker')}</span></div>
        <h1><span data-type data-speed="55">WELCOME TO</span><br><em data-type data-speed="70" data-delay="900">FROST MC</em></h1>
        <p class="tagline" data-type data-delay="1900" data-speed="38">${esc(t('tagline'))}</p>
        <div class="hero-cta">
          <button class="btn btn-primary btn-lg" data-act="play">▶ ${t('play_now')}</button>
          <a class="btn btn-discord btn-lg" href="${esc(c.discord)}" target="_blank" rel="noopener">💬 ${t('discord')}</a>
        </div>
        <div class="hero-status">
          <div class="hs-item"><b><i class="st-dot"></i> <span class="st-state">...</span></b><span>${t('status')}</span></div>
          <div class="hs-item"><b><span class="st-players">—</span><small style="font-size:.9rem;color:var(--muted)">/<span class="st-max">—</span></small></b><span>${t('players_online')}</span></div>
          <div class="hs-item"><b style="font-size:1.1rem;padding-top:.3rem">${esc(c.version || '—')}</b><span>${t('version')}</span></div>
          <div class="hs-item"><b style="font-size:1.1rem;padding-top:.3rem">Java+Bedrock</b><span>${t('edition')}</span></div>
        </div>
        ${addr ? `<div style="margin-top:1rem"><button class="ip-copy" data-act="copy" data-v="${esc(addr)}">📋 ${esc(addr)}</button></div>` : `<p class="muted small" style="margin-top:1rem">${t('ip_soon')}</p>`}
      </div>
      <span class="scroll-hint">⌄</span>
    </section>

    <div class="page" style="animation:none">
      <section class="features">
        ${[['⚔️', 'f_survival'], ['💰', 'f_economy'], ['🏆', 'f_events'], ['👥', 'f_community']].map((f, i) => `
          <div class="card feature reveal" style="--d:${i * .1}s"><span class="ficon">${f[0]}</span><b>${t(f[1])}</b><p>${t(f[1] + '_d')}</p></div>`).join('')}
      </section>

      <section class="section">
        <div class="section-title"><h2>${t('featured_creator')}</h2><a href="#/creators">${t('view_all')}</a></div>
        <div id="featuredCreator">${featuredHtml()}</div>
      </section>

      <section class="section">
        <div class="section-title"><h2>${t('latest_news')}</h2><a href="#/news">${t('view_all')}</a></div>
        ${news.length ? `<div class="grid g2">${news.map(newsCard).join('')}</div>` : empty('📰', t('no_news'))}
      </section>

      <section class="section">
        <div class="section-title"><h2>${t('server_stats')}</h2></div>
        <div class="grid g4">
          ${[['👥', (d.players || []).length, 'registered_players'], ['🎥', (d.creators || []).length, 'creators_count'], ['🛡️', (d.staff || []).length, 'staff_count'], ['🗳️', totalVotes, 'polls_votes']].map((s, i) => `
            <div class="card stat reveal" style="--d:${i * .08}s"><span class="sico">${s[0]}</span><div class="num" data-count="${s[1]}">0</div><div class="lbl">${t(s[2])}</div></div>`).join('')}
        </div>
      </section>

      <section class="section">
        <div class="section-title"><h2>${t('how_to_join')}</h2></div>
        <div class="steps">
          ${[1, 2, 3, 4].map(i => `<div class="card step reveal" style="--d:${i * .07}s"><b>${t('step' + i + '_t')}</b><p class="muted">${t('step' + i + '_d')}</p></div>`).join('')}
        </div>
      </section>

      <section class="section">
        <div class="card cta-discord reveal flat">
          <h2>${t('cta_title')}</h2><p class="muted" style="margin-bottom:1.2rem">${t('cta_desc')}</p>
          <a class="btn btn-discord btn-lg" href="${esc(c.discord)}" target="_blank" rel="noopener">💬 ${t('discord')}</a>
        </div>
      </section>

      <section class="section">
        <div class="section-title"><h2>${t('faq')}</h2></div>
        ${[1, 2, 3, 4].map(i => `<details class="faq reveal"><summary>${t('faq' + i + '_q')}</summary><p>${t('faq' + i + '_a')}</p></details>`).join('')}
      </section>
    </div>`;
  };

  /* ---- Players ---- */
  function playerList() {
    const st = pageState.pl, hk = hoursKey(st.tab), q = st.q.trim().toLowerCase();
    return (D().players || []).filter(p => (!q || String(p.name).toLowerCase().includes(q)) && (!st.rank || p.rank === st.rank))
      .sort((a, b) => num(b[hk]) - num(a[hk]) || String(a.name).localeCompare(String(b.name)));
  }
  function playerGrid() {
    const list = playerList(), hk = hoursKey(pageState.pl.tab);
    if (!(D().players || []).length) return empty('👥', t('no_players_t'), t('no_players_d'));
    if (!list.length) return empty('🔍', t('no_results'));
    return `<div class="grid g3">${list.map((p, i) => `
      <article class="card player-card reveal in" data-go="player/${esc(encodeURIComponent(p.name))}">
        <span class="rank-no">#${i + 1}</span>
        <div class="skin">${skinImg(p.name)}</div>
        <h3>${esc(p.name)}</h3>${rankTag(p.rank)}
        <div class="pstats"><div><b>${num(p[hk])}</b>${t('hours')}</div><div><b>${num(p.kills)}</b>${t('kills')}</div><div><b>${num(p.deaths)}</b>${t('deaths')}</div></div>
      </article>`).join('')}</div>`;
  }
  pages.players = () => `<div class="page">${pageHead('👥', t('players'), t('players_sub'))}
    <div class="toolbar">
      <input type="search" id="plSearch" placeholder="${esc(t('search_name'))}" value="${esc(pageState.pl.q)}">
      <select id="plRank"><option value="">${t('all_ranks')}</option>${(D().ranks || []).map(r => `<option value="${esc(r.id)}" ${pageState.pl.rank === r.id ? 'selected' : ''}>${esc(r[lang] || r.en)}</option>`).join('')}</select>
      <div class="tabs" id="plTabs">${['total', 'weekly', 'monthly'].map(k => `<button data-tab="${k}" class="${pageState.pl.tab === k ? 'on' : ''}">${t(k === 'total' ? 'all_time' : k)}</button>`).join('')}</div>
    </div><div id="plGrid">${playerGrid()}</div></div>`;

  pages.player = name => {
    name = decodeURIComponent(name || '');
    const p = (D().players || []).find(x => x.name === name);
    const back = `<a class="back" href="#/players"><span class="arr">←</span> ${t('back')}</a>`;
    if (!p) return `<div class="page">${back}${empty('❓', t('not_found'))}</div>`;
    const ach = lines(p.achievements), badges = String(p.badges || '').split(',').map(s => s.trim()).filter(Boolean);
    return `<div class="page">${back}
      <div class="profile">
        <div class="card profile-card flat"><div class="skin">${skinImg(p.name, 360)}</div><h2 style="font-family:var(--f-head);word-break:break-all">${esc(p.name)}</h2>${rankTag(p.rank)}
          ${p.joined ? `<p class="muted small" style="margin-top:.6rem">${t('joined')}: ${fmtDate(p.joined)}</p>` : ''}</div>
        <div>
          <div class="grid g4">${[['total_hours', p.hoursTotal], ['week_hours', p.hoursWeek], ['month_hours', p.hoursMonth], ['kills', p.kills], ['deaths', p.deaths]].map(s => `<div class="card stat flat"><div class="num" style="font-size:1.8rem">${num(s[1]).toLocaleString()}</div><div class="lbl">${t(s[0])}</div></div>`).join('')}</div>
          ${L(p, 'bio') ? `<div class="section"><div class="section-title"><h2>${t('about')}</h2></div><p class="muted">${esc(L(p, 'bio'))}</p></div>` : ''}
          ${badges.length ? `<div class="section"><div class="section-title"><h2>${t('badges')}</h2></div><div class="row">${badges.map(b => `<span class="tag">${esc(b)}</span>`).join('')}</div></div>` : ''}
          <div class="section"><div class="section-title"><h2>${t('achievements')}</h2></div>
            ${ach.length ? `<div class="grid g2">${ach.map(a => `<div class="ach"><span class="medal">🏅</span><span>${esc(a)}</span></div>`).join('')}</div>` : `<p class="muted">${t('no_ach')}</p>`}</div>
        </div></div></div>`;
  };

  /* ---- Creators ---- */
  pages.creators = () => {
    const l = D().creators || [];
    return `<div class="page">${pageHead('🎥', t('creators'), t('creators_sub'))}
      <div id="creatorsGrid" class="grid g2">${l.map(creatorCard).join('')}</div>
      ${l.length ? '' : empty('🎥', t('no_creators_t'), t('no_creators_d'))}</div>`;
  };
  pages.creator = id => {
    const c = (D().creators || []).find(x => x.id === id);
    const back = `<a class="back" href="#/creators"><span class="arr">←</span> ${t('back')}</a>`;
    return `<div class="page">${back}${c ? `<div id="creatorProfile" data-id="${esc(c.id)}">${creatorProfileHtml(c)}</div>` : empty('❓', t('not_found'))}</div>`;
  };

  /* ---- Staff ---- */
  function staffCard(s, i) {
    const did = digits(s.discordId), ach = lines(s.achievements);
    return `<article class="card staff-card reveal" style="--d:${(i % 6) * .07}s">
      ${s.role === 'owner' ? '<span class="crown">👑</span>' : ''}
      ${avatarHtml(s.name, s.avatar)}<h3>${esc(s.name)}</h3>${rankTag(s.role)}
      <p class="bio">${esc(L(s, 'bio'))}</p>
      ${s.joined ? `<p class="muted small">${t('joined')}: ${fmtDate(s.joined)}</p>` : ''}
      ${ach.length ? `<div class="row" style="justify-content:center;margin:.5rem 0">${ach.map(a => `<span class="tag">${esc(a)}</span>`).join('')}</div>` : ''}
      ${did ? `<a class="btn btn-discord btn-sm" style="margin-top:.6rem" href="https://discord.com/users/${did}" target="_blank" rel="noopener">💬 ${t('contact_discord')}</a>` : ''}
    </article>`;
  }
  pages.staff = () => {
    const st = D().staff || [], groups = ['management', 'moderation', 'support', 'dev', 'other'];
    const sotm = st.find(s => s.sotm);
    const byG = g => st.filter(s => (groups.includes(s.group) ? s.group : 'other') === g);
    return `<div class="page">${pageHead('🛡️', t('staff'), t('staff_sub'))}
      ${sotm ? `<div class="section" style="margin-top:0"><div class="section-title"><h2>⭐ ${t('sotm')}</h2></div>
        <div class="card sotm flat reveal">${avatarHtml(sotm.name, sotm.avatar)}<div><h3 style="font-size:1.5rem">${esc(sotm.name)}</h3>${rankTag(sotm.role)}<p class="muted" style="margin-top:.4rem">${esc(L(sotm, 'bio'))}</p></div></div></div>` : ''}
      ${groups.map(g => { const l = byG(g); return l.length ? `<section class="section"><div class="section-title"><h2>${t('g_' + g)}</h2></div><div class="grid g3">${l.map(staffCard).join('')}</div></section>` : ''; }).join('')}
      ${st.length ? '' : empty('🛡️', t('no_results'))}</div>`;
  };

  /* ---- Stats ---- */
  function leaderboard() {
    const hk = hoursKey(pageState.lb);
    const l = (D().players || []).slice().sort((a, b) => num(b[hk]) - num(a[hk])).slice(0, 10);
    if (!l.length) return empty('🏆', t('no_players_t'), t('no_players_d'));
    return `<div class="card flat" style="padding:.4rem;overflow:auto"><table class="table"><thead><tr><th>${t('pos')}</th><th>${t('player')}</th><th>${t('rank')}</th><th>${t('hours')}</th></tr></thead><tbody>
      ${l.map((p, i) => `<tr><td class="${i < 3 ? 'medal-' + (i + 1) : ''}"><b>${i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}</b></td><td><a href="#/player/${esc(encodeURIComponent(p.name))}">${esc(p.name)}</a></td><td>${rankTag(p.rank)}</td><td><b>${num(p[hk]).toLocaleString()}</b></td></tr>`).join('')}</tbody></table></div>`;
  }
  pages.stats = () => {
    const d = D(), totalVotes = (d.polls || []).reduce((a, p) => a + (p.options || []).reduce((x, o) => x + num(o.votes), 0), 0);
    const hrs = (d.players || []).reduce((a, p) => a + num(p.hoursTotal), 0);
    return `<div class="page">${pageHead('📊', t('stats'), t('stats_sub'))}
      <div class="grid g4">
        <div class="card stat reveal"><span class="sico">🟢</span><div class="num"><span class="st-players">—</span>/<span class="st-max">—</span></div><div class="lbl">${t('players_online')}</div></div>
        ${[['👥', (d.players || []).length, 'registered_players'], ['🎥', (d.creators || []).length, 'creators_count'], ['🛡️', (d.staff || []).length, 'staff_count'], ['📰', (d.news || []).length, 'news_count'], ['🗳️', totalVotes, 'polls_votes'], ['⏱️', hrs, 'total_hours']].map((s, i) => `<div class="card stat reveal" style="--d:${(i + 1) * .07}s"><span class="sico">${s[0]}</span><div class="num" data-count="${s[1]}">0</div><div class="lbl">${t(s[2])}</div></div>`).join('')}
      </div>
      <section class="section"><div class="section-title"><h2>🏆 ${t('leaderboard')}</h2>
        <div class="tabs" id="lbTabs">${['total', 'weekly', 'monthly'].map(k => `<button data-tab="${k}" class="${pageState.lb === k ? 'on' : ''}">${t(k === 'total' ? 'all_time' : k)}</button>`).join('')}</div></div>
        <div id="lbBox">${leaderboard()}</div></section></div>`;
  };

  /* ---- News ---- */
  function newsGrid() {
    const f = pageState.news, l = sortNews().filter(n => f === 'all' || n.type === f);
    return l.length ? `<div class="grid g2">${l.map(newsCard).join('')}</div>` : empty('📰', t('no_news'));
  }
  pages.news = () => `<div class="page">${pageHead('📰', t('news'), t('news_sub'))}
    <div class="toolbar"><div class="tabs" id="newsTabs">${['all', 'news', 'update', 'event', 'contest'].map(k => `<button data-tab="${k}" class="${pageState.news === k ? 'on' : ''}">${k === 'all' ? (lang === 'ar' ? 'الكل' : 'All') : t('t_' + k)}</button>`).join('')}</div></div>
    <div id="newsBox">${newsGrid()}</div></div>`;

  /* ---- Gallery ---- */
  pages.gallery = () => {
    const g = D().gallery || [];
    return `<div class="page">${pageHead('🖼️', t('gallery'), t('gallery_sub'))}
      ${g.length ? `<div class="gallery">${g.map((it, i) => {
        const vid = it.type === 'video', id = vid ? ytId(it.url) : '', src = vid ? (id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : '') : safeUrl(it.url);
        if (!src) return '';
        return `<div class="g-item reveal" style="--d:${(i % 6) * .06}s" data-gal="${esc(it.id)}"><img src="${esc(src)}" alt="${esc(it.title)}" loading="lazy">${vid ? '<div class="play">▶</div>' : ''}<div class="cap">${esc(it.title)}</div></div>`;
      }).join('')}</div>` : empty('🖼️', t('no_results'))}</div>`;
  };

  /* ---- Shop ---- */
  pages.shop = () => {
    const s = D().shop || [], c = cfg();
    return `<div class="page">${pageHead('🛒', t('shop'), t('shop_sub'))}
      <div class="admin-warn" style="margin-bottom:1.4rem">ℹ️ ${t('shop_note')}</div>
      ${s.length ? `<div class="grid g3">${s.map((r, i) => `
        <article class="card rank-card reveal" style="--rc:${esc(r.color || '#7c3aed')};--d:${i * .08}s">
          <h3>${esc(r.name)}</h3>
          <div class="price">${num(r.price) > 0 ? `${num(r.price)} <small>${esc(r.currency || '')}</small>` : `<small>${t('contact_price')}</small>`}</div>
          <ul>${lines(L(r, 'features')).map(f => `<li>${esc(f)}</li>`).join('')}</ul>
          <a class="btn btn-discord btn-block" href="${esc(c.discord)}" target="_blank" rel="noopener">💬 ${t('buy_discord')}</a>
        </article>`).join('')}</div>` : empty('🛒', t('no_results'))}</div>`;
  };

  /* ---- Polls ---- */
  const myVotes = () => { try { return JSON.parse(localStorage.getItem('frostmc:votes') || '{}'); } catch (e) { return {}; } };
  function pollCard(p) {
    const mv = myVotes(), mine = mv[p.id], voted = mine !== undefined, closed = p.active === false;
    const counts = (p.options || []).map((o, i) => num(o.votes) + (mine === i ? 1 : 0));
    const total = counts.reduce((a, b) => a + b, 0);
    const show = voted || closed;
    return `<article class="card poll flat reveal" data-poll="${esc(p.id)}">
      <h3>${esc(L(p, 'question'))} ${closed ? `<span class="tag">${t('closed')}</span>` : ''}</h3>
      ${(p.options || []).map((o, i) => `<button class="opt ${mine === i ? 'mine' : ''}" data-vote="${i}" ${show ? 'disabled' : ''}>
        <i class="bar" ${show ? `data-bar="${total ? Math.round(counts[i] / total * 100) : 0}%"` : ''}></i>
        <span><b>${esc(o[lang] || o.en || o.ar)}</b>${show ? `<em style="font-style:normal">${total ? Math.round(counts[i] / total * 100) : 0}% · ${counts[i]}</em>` : ''}</span></button>`).join('')}
      <p class="muted small">${show ? `${total} ${t('votes')} — ` : ''}${voted ? t('already_voted') : t('poll_note')}</p></article>`;
  }
  pages.polls = () => {
    const p = D().polls || [];
    return `<div class="page">${pageHead('🗳️', t('polls'), t('polls_sub'))}
      ${p.length ? `<div class="grid g2">${p.map(pollCard).join('')}</div>` : empty('🗳️', t('no_polls'))}</div>`;
  };

  /* ---- Rules ---- */
  pages.rules = () => `<div class="page">${pageHead('📜', t('rules'), t('rules_sub'))}
    <div class="grid">${(D().rules || []).map((r, i) => `<div class="card rule flat reveal" style="--d:${(i % 6) * .06}s"><span class="n">${String(i + 1).padStart(2, '0')}</span><p>${esc(L(r, 'text'))}</p></div>`).join('')}</div></div>`;

  /* ---- Admin ---- */
  pages.admin = () => `<div class="page" id="adminRoot">${pageHead('⚙️', t('admin'), t('admin_sub'))}<div id="adminMount"></div></div>`;

  /* ---------------- Play modal ---------------- */
  function playModal() {
    const c = cfg();
    let html = `<h3>▶ ${t('join_title')}</h3>`;
    if (!c.ip) {
      html += `<p class="muted" style="margin-bottom:1rem">${t('ip_soon')}</p><a class="btn btn-discord btn-block" href="${esc(c.discord)}" target="_blank" rel="noopener">💬 ${t('discord')}</a>`;
    } else {
      const jp = num(c.port) && num(c.port) !== 25565 ? `${c.ip}:${c.port}` : c.ip;
      const bi = c.bedrockIp || c.ip;
      html += `<div class="ip-row"><div><small class="muted">${t('java_addr')}</small><br><code>${esc(jp)}</code></div><button class="btn btn-sm" data-act="copy" data-v="${esc(jp)}">${t('copy')}</button></div>
        <div class="ip-row"><div><small class="muted">${t('bedrock_addr')}</small><br><code>${esc(bi)}</code> <small class="muted">${t('port')}: ${esc(c.bedrockPort)}</small></div><button class="btn btn-sm" data-act="copy" data-v="${esc(bi)}">${t('copy')}</button></div>
        <a class="btn btn-discord btn-block" style="margin-top:.6rem" href="${esc(c.discord)}" target="_blank" rel="noopener">💬 ${t('discord')}</a>`;
    }
    openModal(html);
  }

  function openGallery(id) {
    const it = (D().gallery || []).find(g => g.id === id); if (!it) return;
    if (it.type === 'video') {
      const v = ytId(it.url); if (!v) return;
      if (FrostMusic.playing) { resumeMusic = true; FrostMusic.pause(); }
      openModal(`<iframe class="vid-frame" src="https://www.youtube-nocookie.com/embed/${v}?autoplay=1&rel=0" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`, true);
    } else {
      openModal(`<img src="${esc(safeUrl(it.url))}" alt="${esc(it.title)}" style="width:100%;border-radius:12px;max-height:80vh;object-fit:contain">`, true);
    }
  }

  /* ---------------- Router / render ---------------- */
  const NAV = [['home', '🏠'], ['players', '👥'], ['creators', '🎥'], ['staff', '🛡️'], ['stats', '📊'], ['news', '📰'], ['gallery', '🖼️'], ['shop', '🛒'], ['polls', '🗳️'], ['rules', '📜'], ['admin', '⚙️']];
  function buildNav() {
    $('#nav').innerHTML = NAV.map(n => `<a href="#/${n[0]}" data-nav="${n[0]}"><span class="ic">${n[1]}</span><span>${t('nav_' + n[0])}</span></a>`).join('');
  }
  let started = false;
  function render() {
    if (!started) return;
    const parts = hash().split('/'); let page = parts[0] || 'home'; const arg = parts.slice(1).join('/');
    if (!pages[page]) page = 'home';
    const view = $('#view');
    view.innerHTML = pages[page](arg);
    $$('#nav a').forEach(a => a.classList.toggle('active', a.dataset.nav === page || (page === 'player' && a.dataset.nav === 'players') || (page === 'creator' && a.dataset.nav === 'creators')));
    closeMenu();
    window.scrollTo(0, 0);
    document.title = (page === 'home' ? '' : t('nav_' + page) + ' | ') + 'FROST MC';
    FX.scan(view);
    Status.ui();
    if (page === 'admin') FrostAdmin.mount($('#adminMount'));
    if (['home', 'creators', 'creator'].includes(page)) kickRefreshAll();
  }

  function closeMenu() { document.body.classList.remove('menu-open'); }
  function applyLang() {
    const h = document.documentElement;
    h.lang = lang; h.dir = lang === 'ar' ? 'rtl' : 'ltr';
    $$('[data-i18n]').forEach(e => {
      const k = e.dataset.i18n;
      if (e.id === 'gateBtn' || e.parentElement.id === 'gateBtn') return;
      e.textContent = t(k);
    });
    $('#langBtn').textContent = lang === 'ar' ? 'EN' : 'ع';
    buildNav();
    const gb = $('#gateBtn'); if (gb && !gb.disabled) gb.innerHTML = `<span>${t('gate_enter')}</span>`;
    const c = cfg();
    $('#sideDiscord').href = c.discord; $('#footDiscord').href = c.discord;
    Status.ui();
  }
  function setLang(l) {
    lang = l; try { localStorage.setItem('frostmc:lang', l); } catch (e) {}
    applyLang(); render();
  }

  /* ---------------- Events ---------------- */
  function bind() {
    $('#langBtn').addEventListener('click', () => setLang(other()));
    $('#gateLang').addEventListener('click', () => setLang(other()));
    $('#burger').addEventListener('click', () => document.body.classList.toggle('menu-open'));
    $('#overlay').addEventListener('click', closeMenu);
    $('#modalX').addEventListener('click', closeModal);
    $('#modal').addEventListener('click', e => { if (e.target.id === 'modal') closeModal(); });
    addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); closeMenu(); } });
    addEventListener('hashchange', () => {
      const v = $('#view').firstElementChild; if (v) v.classList.add('leaving');
      setTimeout(render, 140);
    });
    $('#statusPill').addEventListener('click', () => Status.refresh());

    document.body.addEventListener('click', e => {
      const a = e.target.closest('[data-act]');
      if (a) {
        if (a.dataset.act === 'play') playModal();
        else if (a.dataset.act === 'copy') copyText(a.dataset.v);
        return;
      }
      if (e.target.id === 'heroLogo') {
        const l = e.target; l._c = (l._c || 0) + 1; clearTimeout(l._t); l._t = setTimeout(() => l._c = 0, 1200);
        if (l._c >= 5) { l._c = 0; FX.blizzard(); toast(t('top_secret')); }
        return;
      }
      const go = e.target.closest('[data-go]'); if (go) { location.hash = '#/' + go.dataset.go; return; }
      const gal = e.target.closest('[data-gal]'); if (gal) { openGallery(gal.dataset.gal); return; }
      const tab = e.target.closest('.tabs [data-tab]');
      if (tab) {
        const box = tab.parentElement.id, v = tab.dataset.tab;
        $$('button', tab.parentElement).forEach(b => b.classList.toggle('on', b === tab));
        if (box === 'plTabs') { pageState.pl.tab = v; $('#plGrid').innerHTML = playerGrid(); FX.scan($('#plGrid')); }
        else if (box === 'lbTabs') { pageState.lb = v; $('#lbBox').innerHTML = leaderboard(); }
        else if (box === 'newsTabs') { pageState.news = v; $('#newsBox').innerHTML = newsGrid(); FX.scan($('#newsBox')); }
        return;
      }
      const vote = e.target.closest('[data-vote]');
      if (vote && !vote.disabled) {
        const card = vote.closest('[data-poll]'), id = card.dataset.poll, mv = myVotes();
        if (mv[id] !== undefined) { toast(t('already_voted')); return; }
        mv[id] = +vote.dataset.vote;
        try { localStorage.setItem('frostmc:votes', JSON.stringify(mv)); } catch (er) {}
        const p = (D().polls || []).find(x => x.id === id);
        card.outerHTML = pollCard(p); const n = $(`[data-poll="${CSS.escape(id)}"]`); n.classList.add('in'); FX.scan(n);
        toast(t('voted'));
      }
    });
    document.body.addEventListener('input', e => {
      if (e.target.id === 'plSearch') { pageState.pl.q = e.target.value; $('#plGrid').innerHTML = playerGrid(); FX.scan($('#plGrid')); }
    });
    document.body.addEventListener('change', e => {
      if (e.target.id === 'plRank') { pageState.pl.rank = e.target.value; $('#plGrid').innerHTML = playerGrid(); FX.scan($('#plGrid')); }
    });
  }

  /* ---------------- Public API ---------------- */
  window.FrostApp = {
    t, L, esc, safeUrl, slug, digits, num, lines, clone, cfg, toast, openModal, closeModal, rankOf, Store, D,
    get lang() { return lang; }, render, applyLang, Status, setLang,
    async init() {
      Store.init(); await Store.loadPublished(); Store.loadDraft();
      $('#year').textContent = new Date().getFullYear();
      bind(); applyLang();
    },
    start() { started = true; if (!location.hash) history.replaceState(null, '', '#/home'); render(); Status.start(); },
    refreshAfterAdmin() { applyLang(); Status.start(); }
  };
})();
