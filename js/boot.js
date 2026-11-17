/* =========================================================
   FROST MC — تشغيل الموقع (شاشة الدخول + الموسيقى الفورية)
   ========================================================= */
(async function () {
  const $ = s => document.querySelector(s);
  const gate = $('#gate'), btn = $('#gateBtn'), bar = $('#gateBar');
  document.body.classList.add('locked');

  await FrostApp.init();
  FrostMusic.init(); // نحمّل YouTube API من بدري عشان تكون جاهزة أول ما الزائر يضغط

  // تحميل مسبق للصور المهمة + شريط التقدم
  const imgs = ['assets/logo.jpg', 'assets/banner-hero.jpg', 'assets/banner-welcome.jpg'];
  let done = 0;
  const step = () => { done++; bar.style.width = Math.round(done / (imgs.length + 1) * 100) + '%'; };
  const loads = imgs.map(src => new Promise(r => { const i = new Image(); i.onload = i.onerror = () => { step(); r(); }; i.src = src; }));
  loads.push(Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise(r => setTimeout(r, 2500))]).then(step));
  await Promise.all([...loads, new Promise(r => setTimeout(r, 900))]);
  bar.style.width = '100%';

  btn.disabled = false;
  btn.innerHTML = '<span>' + FrostApp.t('gate_enter') + '</span>';
  btn.focus({ preventScroll: true });

  let entered = false;
  function enter() {
    if (entered) return; entered = true;
    // الضغطة دي هي اللي بتسمح للمتصفح يشغّل الصوت فوراً
    if (FrostMusic.pref() !== 'off') FrostMusic.play();
    gate.classList.add('out');
    document.body.classList.remove('locked');
    FrostApp.start();
    setTimeout(() => gate.remove(), 1000);
  }
  btn.addEventListener('click', enter);
  addEventListener('keydown', e => { if (e.key === 'Enter' && !entered && !btn.disabled) enter(); });
})();
