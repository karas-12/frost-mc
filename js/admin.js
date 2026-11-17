/* =========================================================
   FROST MC — لوحة الإدارة (محرر محتوى)
   - التعديلات بتتحفظ كمسودة في متصفحك (localStorage)
   - «تصدير content.json» → ارفعه في data/ عشان يظهر لكل الزوار
   - الصلاحيات الحقيقية (Discord OAuth) محتاجة Backend — راجع README
   ========================================================= */
(function () {
  'use strict';
  const A = () => window.FrostApp;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  const f = (k, ar, en, type, extra) => Object.assign({ k, ar, en, type: type || 'text' }, extra || {});
  const NEWS_TYPES = [['news', 'خبر / News'], ['update', 'تحديث / Update'], ['event', 'فعالية / Event'], ['contest', 'مسابقة / Contest']];
  const GROUPS = [['management', 'الإدارة العليا / Management'], ['moderation', 'الإشراف / Moderation'], ['support', 'الدعم / Support'], ['dev', 'التطوير / Dev'], ['other', 'أخرى / Other']];

  const SCHEMAS = {
    players: {
      tab: 'tab_players', label: p => p.name, sub: p => A().rankOf(p.rank)[A().lang] + ' • ' + A().num(p.hoursTotal) + 'h',
      fields: () => [
        f('name', 'اسم اللاعب (Minecraft)', 'Minecraft name', 'text', { req: 1 }),
        f('rank', 'الرتبة', 'Rank', 'select', { options: A().D().ranks.map(r => [r.id, r.ar + ' / ' + r.en]) }),
        f('hoursTotal', 'إجمالي الساعات', 'Total hours', 'number'), f('hoursWeek', 'ساعات الأسبوع', 'Weekly hours', 'number'),
        f('hoursMonth', 'ساعات الشهر', 'Monthly hours', 'number'), f('kills', 'قتل', 'Kills', 'number'), f('deaths', 'موت', 'Deaths', 'number'),
        f('joined', 'تاريخ الانضمام', 'Joined', 'date'),
        f('bio', 'نبذة', 'Bio', 'textarea', { bi: 1 }),
        f('achievements', 'الإنجازات (سطر لكل إنجاز)', 'Achievements (one per line)', 'textarea', { full: 1 }),
        f('badges', 'الشارات (بفاصلة)', 'Badges (comma-separated)', 'text', { full: 1 })
      ]
    },
    creators: {
      tab: 'tab_creators', label: c => c.name, sub: c => 'kick.com/' + c.kick,
      fields: () => [
        f('name', 'الاسم', 'Name', 'text', { req: 1 }), f('kick', 'يوزر Kick', 'Kick username', 'text', { req: 1 }),
        f('bio', 'نبذة', 'Bio', 'textarea', { bi: 1 }), f('avatar', 'الصورة', 'Avatar', 'image', { w: 300 }),
        f('featured', 'مبدع مميز (Featured)', 'Featured creator', 'checkbox'),
        f('live', 'Live الآن (يدوي)', 'Live now (manual)', 'checkbox'),
        f('viewers', 'المشاهدين (يدوي)', 'Viewers (manual)', 'number'), f('followers', 'المتابعين (يدوي)', 'Followers (manual)', 'number')
      ]
    },
    staff: {
      tab: 'tab_staff', label: s => s.name, sub: s => A().rankOf(s.role)[A().lang],
      fields: () => [
        f('name', 'الاسم', 'Name', 'text', { req: 1 }),
        f('role', 'الرتبة', 'Role', 'select', { options: A().D().ranks.map(r => [r.id, r.ar + ' / ' + r.en]) }),
        f('group', 'القسم', 'Group', 'select', { options: GROUPS }),
        f('discordId', 'Discord ID', 'Discord ID', 'text'), f('joined', 'تاريخ الانضمام', 'Joined', 'date'),
        f('bio', 'نبذة', 'Bio', 'textarea', { bi: 1 }), f('avatar', 'الصورة', 'Avatar', 'image', { w: 300 }),
        f('achievements', 'الإنجازات (سطر لكل إنجاز)', 'Achievements (one per line)', 'textarea', { full: 1 }),
        f('sotm', 'Staff Of The Month', 'Staff Of The Month', 'checkbox')
      ]
    },
    news: {
      tab: 'tab_news', label: n => n.title_ar || n.title_en, sub: n => n.date + ' • ' + n.type,
      fields: () => [
        f('title', 'العنوان', 'Title', 'text', { bi: 1, req: 1 }), f('type', 'النوع', 'Type', 'select', { options: NEWS_TYPES }),
        f('date', 'التاريخ', 'Date', 'date'), f('body', 'المحتوى', 'Content', 'textarea', { bi: 1 }),
        f('image', 'الصورة', 'Image', 'image', { w: 900, full: 1 })
      ]
    },
    gallery: {
      tab: 'tab_gallery', label: g => g.title, sub: g => g.type,
      fields: () => [
        f('title', 'العنوان', 'Title', 'text', { req: 1 }), f('type', 'النوع', 'Type', 'select', { options: [['image', 'صورة / Image'], ['video', 'فيديو YouTube / Video']] }),
        f('url', 'رابط الصورة أو فيديو YouTube', 'Image URL or YouTube link', 'image', { w: 1100, full: 1 })
      ]
    },
    shop: {
      tab: 'tab_shop', label: s => s.name, sub: s => (s.price || 0) + ' ' + (s.currency || ''),
      fields: () => [
        f('name', 'اسم الرتبة', 'Rank name', 'text', { req: 1 }), f('price', 'السعر (0 = تواصل معنا)', 'Price (0 = contact us)', 'number'),
        f('currency', 'العملة', 'Currency', 'text'), f('color', 'اللون', 'Color', 'color'),
        f('features', 'المميزات (سطر لكل ميزة)', 'Features (one per line)', 'textarea', { bi: 1 })
      ]
    },
    polls: {
      tab: 'tab_polls', label: p => p.question_ar || p.question_en, sub: p => (p.options || []).length + ' options',
      fields: () => [
        f('question', 'السؤال', 'Question', 'text', { bi: 1, req: 1 }),
        f('options_ar', 'الاختيارات بالعربي (سطر لكل اختيار)', 'Options (Arabic, one per line)', 'textarea', { full: 1 }),
        f('options_en', 'الاختيارات بالإنجليزي (بنفس الترتيب)', 'Options (English, same order)', 'textarea', { full: 1 }),
        f('active', 'التصويت مفتوح', 'Voting open', 'checkbox')
      ],
      toForm: p => ({ question_ar: p.question_ar, question_en: p.question_en, active: p.active !== false, options_ar: (p.options || []).map(o => o.ar).join('\n'), options_en: (p.options || []).map(o => o.en).join('\n') }),
      fromForm: (v, old) => {
        const a = A().lines(v.options_ar), e = A().lines(v.options_en), n = Math.max(a.length, e.length), oo = (old && old.options) || [];
        return { question_ar: v.question_ar, question_en: v.question_en, active: !!v.active, options: Array.from({ length: n }, (_, i) => ({ ar: a[i] || e[i], en: e[i] || a[i], votes: oo[i] ? A().num(oo[i].votes) : 0 })) };
      }
    },
    rules: {
      tab: 'tab_rules', label: r => r.text_ar || r.text_en, sub: () => '',
      fields: () => [f('text', 'نص القانون', 'Rule text', 'textarea', { bi: 1, full: 1, req: 1 })]
    }
  };

  const SETTINGS_FIELDS = () => [
    f('ip', 'IP / دومين السيرفر', 'Server IP / domain', 'text', { ph: 'play.example.com' }),
    f('port', 'بورت Java', 'Java port', 'number'), f('bedrockIp', 'IP الـ Bedrock (اختياري)', 'Bedrock IP (optional)', 'text'),
    f('bedrockPort', 'بورت Bedrock', 'Bedrock port', 'number'), f('version', 'نسخة اللعبة', 'Game version', 'text', { ph: '1.21.x' }),
    f('discord', 'رابط Discord', 'Discord invite', 'text'),
    f('statusMode', 'وضع حالة السيرفر', 'Status mode', 'select', { options: [['auto', 'تلقائي / Auto'], ['manual', 'يدوي / Manual']] }),
    f('manualOnline', 'السيرفر أونلاين (يدوي)', 'Server online (manual)', 'checkbox'),
    f('manualPlayers', 'اللاعبين الآن (يدوي)', 'Players now (manual)', 'number'), f('manualMax', 'الحد الأقصى (يدوي)', 'Max players (manual)', 'number'),
    f('kickProxy', 'رابط Kick Proxy (اختياري)', 'Kick proxy URL (optional)', 'text', { full: 1, ph: 'https://your-worker.workers.dev/?u=' }),
    f('musicVideoId', 'ID فيديو الموسيقى (YouTube)', 'Music YouTube video ID', 'text')
  ];

  let tab = 'settings', editing = null, root = null;
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 5);

  /* ---------- field rendering ---------- */
  const lbl = fd => A().lang === 'ar' ? fd.ar : fd.en;
  function inputHtml(fd, name, val) {
    const e = A().esc, v = val == null ? '' : val, ph = fd.ph ? ` placeholder="${e(fd.ph)}"` : '', req = fd.req ? ' required' : '';
    switch (fd.type) {
      case 'textarea': return `<textarea name="${name}"${ph}>${e(v)}</textarea>`;
      case 'number': return `<input type="number" step="any" name="${name}" value="${e(v)}"${ph}>`;
      case 'date': return `<input type="date" name="${name}" value="${e(v)}">`;
      case 'color': return `<input type="color" name="${name}" value="${e(v || '#7c3aed')}" style="height:46px;padding:.2rem">`;
      case 'select': return `<select name="${name}">${fd.options.map(o => `<option value="${e(o[0])}" ${String(v) === String(o[0]) ? 'selected' : ''}>${e(o[1])}</option>`).join('')}</select>`;
      case 'image': return `<input type="text" name="${name}" value="${e(String(v).startsWith('data:') ? '' : v)}" placeholder="https://..." data-keep="${e(String(v).startsWith('data:') ? v : '')}">
        <div class="row" style="margin-top:.4rem"><input type="file" accept="image/*" data-img="${name}" data-w="${fd.w || 800}" style="padding:.4rem"></div>
        ${String(v).startsWith('data:') || (v && fd.k !== 'url') ? `<img class="thumb-prev" src="${e(A().safeUrl(v))}" alt="">` : ''}`;
      default: return `<input type="text" name="${name}" value="${e(v)}"${ph}${req}>`;
    }
  }
  function fieldsHtml(list, values) {
    const e = A().esc;
    return list.map(fd => {
      if (fd.type === 'checkbox') return `<div class="field chk${fd.full ? ' full' : ''}"><input type="checkbox" id="f_${fd.k}" name="${fd.k}" ${values[fd.k] ? 'checked' : ''}><label for="f_${fd.k}" style="margin:0">${e(lbl(fd))}</label></div>`;
      if (fd.bi) return ['ar', 'en'].map(l => `<div class="field ${fd.type === 'textarea' ? 'full' : ''}"><label>${e(lbl(fd))} (${l.toUpperCase()})</label>${inputHtml(fd, fd.k + '_' + l, values[fd.k + '_' + l])}</div>`).join('');
      return `<div class="field ${fd.full || fd.type === 'textarea' ? 'full' : ''}"><label>${e(lbl(fd))}</label>${inputHtml(fd, fd.k, values[fd.k])}</div>`;
    }).join('');
  }
  function collect(form, list) {
    const out = {};
    list.forEach(fd => {
      const names = fd.bi ? [fd.k + '_ar', fd.k + '_en'] : [fd.k];
      names.forEach(n => {
        const el = form.elements[n]; if (!el) return;
        if (fd.type === 'checkbox') out[n] = el.checked;
        else if (fd.type === 'number') out[n] = el.value === '' ? '' : Number(el.value);
        else if (fd.type === 'image') out[n] = el.value.trim() || el.dataset.keep || '';
        else out[n] = el.value.trim();
      });
    });
    return out;
  }
  function resizeImage(file, maxW) {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onerror = rej;
      r.onload = () => {
        const img = new Image(); img.onerror = rej;
        img.onload = () => {
          const k = Math.min(1, maxW / img.width), c = document.createElement('canvas');
          c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          res(c.toDataURL('image/jpeg', .82));
        };
        img.src = r.result;
      };
      r.readAsDataURL(file);
    });
  }

  /* ---------- panels ---------- */
  function collectionPanel(key) {
    const sc = SCHEMAS[key], T = A().t, e = A().esc, list = A().D()[key] || [];
    const fields = sc.fields();
    const today = new Date().toISOString().slice(0, 10);
    const DEF = { players: { rank: 'member', joined: today }, staff: { role: 'helper', group: 'moderation', joined: today }, news: { type: 'news', date: today },
      polls: { active: true }, shop: { currency: 'EGP', color: '#a78bfa', price: 0 }, gallery: { type: 'image' }, creators: {} };
    const base = editing && editing.key === key ? (editing.item ? (sc.toForm ? sc.toForm(editing.item) : editing.item) : (DEF[key] || {})) : null;
    return `
      <div class="section-title" style="margin-top:0"><h2>${T(sc.tab)} (${list.length})</h2>
        ${base ? '' : `<button class="btn btn-primary btn-sm" data-ad="new">＋ ${T('add')}</button>`}</div>
      ${base ? `<form class="card flat" id="adForm"><div class="form-grid">${fieldsHtml(fields, base)}</div>
        <div class="row" style="margin-top:1rem"><button class="btn btn-primary" type="submit">💾 ${T('save')}</button><button class="btn" type="button" data-ad="cancel">${T('cancel')}</button></div></form>`
      : (list.length ? list.map(it => `<div class="item-row"><div style="min-width:0"><div class="nm">${e(sc.label(it))}</div><div class="sub">${e(sc.sub(it))}</div></div>
          <div class="row"><button class="btn btn-sm" data-ad="edit" data-id="${e(it.id)}">✏️ ${T('edit')}</button><button class="btn btn-sm btn-danger" data-ad="del" data-id="${e(it.id)}">🗑</button></div></div>`).join('')
        : `<div class="empty"><span class="big">📭</span>${T('empty_list')}</div>`)}`;
  }
  function settingsPanel() {
    const T = A().t, c = A().cfg(), fields = SETTINGS_FIELDS();
    const vals = { ip: c.ip, port: c.port, bedrockIp: c.bedrockIp, bedrockPort: c.bedrockPort, version: c.version, discord: c.discord, statusMode: c.statusMode,
      manualOnline: c.manualStatus.online, manualPlayers: c.manualStatus.players, manualMax: c.manualStatus.max, kickProxy: c.kickProxy, musicVideoId: c.musicVideoId };
    return `<div class="section-title" style="margin-top:0"><h2>${T('tab_settings')}</h2></div>
      <form class="card flat" id="adSettings"><div class="form-grid">${fieldsHtml(fields, vals)}</div>
      <div class="row" style="margin-top:1rem"><button class="btn btn-primary" type="submit">💾 ${T('save')}</button></div></form>`;
  }
  function dataPanel() {
    const T = A().t;
    return `<div class="section-title" style="margin-top:0"><h2>${T('tab_data')}</h2></div>
      <div class="card flat"><p class="muted" style="margin-bottom:1rem">${T('data_note')}</p>
      <div class="row"><button class="btn btn-primary" data-ad="export">⬇ ${T('export')}</button>
      <label class="btn" style="cursor:pointer">⬆ ${T('import')}<input type="file" accept="application/json" id="adImport" hidden></label>
      <button class="btn btn-danger" data-ad="reset">🧹 ${T('reset')}</button></div></div>`;
  }

  function draw() {
    const T = A().t, tabs = ['settings', 'players', 'creators', 'staff', 'news', 'gallery', 'shop', 'polls', 'rules', 'data'];
    root.innerHTML = `<div class="admin-warn">${A().esc(T('admin_warn'))}</div>
      <div class="admin-grid"><div class="admin-tabs">${tabs.map(k => `<button data-tab="${k}" class="${tab === k ? 'on' : ''}">${T('tab_' + k)}</button>`).join('')}</div>
      <div id="adPanel">${tab === 'settings' ? settingsPanel() : tab === 'data' ? dataPanel() : collectionPanel(tab)}</div></div>`;
    FX.scan(root);
  }

  /* ---------- events ---------- */
  function onClick(e) {
    const tb = e.target.closest('.admin-tabs [data-tab]');
    if (tb) { tab = tb.dataset.tab; editing = null; draw(); return; }
    const b = e.target.closest('[data-ad]'); if (!b) return;
    const act = b.dataset.ad, T = A().t, list = A().D()[tab];
    if (act === 'new') { editing = { key: tab, item: null }; draw(); }
    else if (act === 'cancel') { editing = null; draw(); }
    else if (act === 'edit') { editing = { key: tab, item: list.find(x => x.id === b.dataset.id) }; draw(); }
    else if (act === 'del') {
      if (!confirm(T('confirm_del'))) return;
      A().D()[tab] = list.filter(x => x.id !== b.dataset.id); A().Store.saveDraft(); A().toast(T('deleted')); draw();
    }
    else if (act === 'export') {
      const blob = new Blob([JSON.stringify(A().D(), null, 2)], { type: 'application/json' }), a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = 'content.json'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    }
    else if (act === 'reset') { if (!confirm(T('confirm_del'))) return; A().Store.clearDraft(); A().toast(T('reset_ok')); setTimeout(() => location.reload(), 600); }
  }
  async function onChange(e) {
    const t = e.target;
    if (t.id === 'adImport' && t.files[0]) {
      try {
        const j = JSON.parse(await t.files[0].text()); if (typeof j !== 'object' || Array.isArray(j)) throw 0;
        Object.assign(A().D(), j); A().Store.saveDraft(); A().toast(A().t('import_ok')); A().refreshAfterAdmin(); draw();
      } catch (er) { A().toast(A().t('import_fail')); }
      return;
    }
    if (t.dataset && t.dataset.img && t.files[0]) {
      try {
        const url = await resizeImage(t.files[0], +t.dataset.w || 800);
        const inp = t.form.elements[t.dataset.img]; inp.value = ''; inp.dataset.keep = url;
        let prev = t.closest('.field').querySelector('.thumb-prev');
        if (!prev) { prev = document.createElement('img'); prev.className = 'thumb-prev'; t.closest('.field').appendChild(prev); }
        prev.src = url;
      } catch (er) { A().toast(A().t('import_fail')); }
    }
  }
  function onSubmit(e) {
    const T = A().t;
    if (e.target.id === 'adSettings') {
      e.preventDefault();
      const v = collect(e.target, SETTINGS_FIELDS()), D = A().D(); D.settings = D.settings || {};
      Object.keys(v).forEach(k => { D.settings[k] = v[k]; });
      A().Store.saveDraft(); A().refreshAfterAdmin(); A().toast(T('saved')); return;
    }
    if (e.target.id === 'adForm') {
      e.preventDefault();
      const sc = SCHEMAS[tab], vals = collect(e.target, sc.fields()), list = A().D()[tab];
      const old = editing && editing.item;
      const item = sc.fromForm ? sc.fromForm(vals, old) : vals;
      if (old) { Object.assign(old, item); } else { item.id = uid(); list.push(item); }
      if (tab === 'creators') item.kick = A().slug(item.kick);
      if (tab === 'staff') item.discordId = A().digits(item.discordId);
      A().Store.saveDraft(); A().toast(T('saved')); editing = null; draw();
    }
  }

  window.FrostAdmin = {
    mount(el) {
      root = el; tab = 'settings'; editing = null;
      if (!el._bound) { el._bound = true; el.addEventListener('click', onClick); el.addEventListener('change', onChange); el.addEventListener('submit', onSubmit); }
      draw();
    }
  };
})();
