/* =========================================================
   FROST MC — الموسيقى (YouTube IFrame API)
   المتصفحات بتمنع التشغيل التلقائي بالصوت قبل أي ضغطة،
   عشان كده الموسيقى بتشتغل فوراً أول ما الزائر يضغط «ادخل» في شاشة البداية.
   ========================================================= */
(function () {
  const KEY = 'frostmc:music';
  const btn = document.getElementById('musicBtn');
  const vol = document.getElementById('vol');
  const cfg = () => window.FrostApp ? window.FrostApp.cfg() : window.FROST_CONFIG;

  const M = {
    player: null, ready: false, wanted: false, playing: false, loaded: false,

    pref() { try { return localStorage.getItem(KEY); } catch (e) { return null; } },
    setPref(v) { try { localStorage.setItem(KEY, v); } catch (e) {} },

    init() {
      if (this.loaded) return; this.loaded = true;
      const id = cfg().musicVideoId;
      if (!id) { btn.hidden = true; vol.parentElement.hidden = true; return; }
      const v = +(localStorage.getItem('frostmc:vol') || cfg().musicVolume || 60);
      vol.value = v;
      window.onYouTubeIframeAPIReady = () => {
        this.player = new YT.Player('yt-player', {
          width: '200', height: '200', videoId: id,
          playerVars: { autoplay: 0, controls: 0, loop: 1, playlist: id, playsinline: 1, rel: 0, modestbranding: 1, disablekb: 1 },
          events: {
            onReady: () => {
              this.ready = true; this.player.setVolume(+vol.value);
              if (this.wanted) this.play();
            },
            onStateChange: e => {
              this.playing = e.data === 1 || e.data === 3;
              if (e.data === 0) this.player.playVideo(); // loop
              this.ui();
            },
            onError: () => { this.playing = false; this.ui(); window.FrostApp && FrostApp.toast(FrostApp.t('music_blocked')); }
          }
        });
      };
      const s = document.createElement('script');
      s.src = 'https://www.youtube.com/iframe_api'; s.async = true;
      s.onerror = () => { btn.classList.add('unavailable'); };
      document.head.appendChild(s);
    },

    play(user) {
      this.wanted = true;
      if (user) this.setPref('on');
      if (!this.ready) return;
      try { this.player.unMute(); this.player.setVolume(+vol.value); this.player.playVideo(); } catch (e) {}
    },
    pause(user) {
      this.wanted = false;
      if (user) this.setPref('off');
      if (!this.ready) { this.ui(); return; }
      try { this.player.pauseVideo(); } catch (e) {}
    },
    toggle() {
      if (this.playing || this.wanted) { this.pause(true); this.playing = false; this.ui(); FrostApp.toast(FrostApp.t('music_off')); }
      else { this.play(true); FrostApp.toast(FrostApp.t('music_on')); }
    },
    ui() {
      const on = this.playing || (this.wanted && !this.ready);
      btn.classList.toggle('playing', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    }
  };

  btn.addEventListener('click', () => M.toggle());
  vol.addEventListener('input', () => {
    try { localStorage.setItem('frostmc:vol', vol.value); } catch (e) {}
    if (M.ready) M.player.setVolume(+vol.value);
  });
  window.FrostMusic = M;
})();
