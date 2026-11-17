/* =========================================================
   FROST MC — الإعدادات الأساسية (عدّل القيم هنا أو من لوحة الإدارة)
   ملاحظة: ممنوع وضع أي مفاتيح سرية (Tokens / Secrets) في هذا الملف،
   لأنه بيتحمّل في متصفح كل زائر.
   ========================================================= */
window.FROST_CONFIG = {
  name: "FROST MC",

  /* ---- Discord ---- */
  discord: "https://discord.gg/3MWZMWkdt",

  /* ---- عنوان السيرفر (اتركه فاضي لحد ما تجيب الـ IP من Wispbyte) ---- */
  ip: "",              // مثال: play.example.com  أو  123.45.67.89
  port: 25565,         // بورت Java
  bedrockIp: "",       // لو فاضي بنستخدم نفس الـ IP
  bedrockPort: 19132,  // بورت Bedrock
  version: "",         // مثال: 1.21.x   (لو فاضي بنعرض النسخة اللي بيرجعها السيرفر)
  hosting: "Wispbyte",

  /* ---- حالة السيرفر ----
     auto   = الموقع بيسأل api.mcsrvstat.us كل دقيقة (محتاج ip فوق)
     manual = انت اللي بتحدد الحالة بنفسك                                */
  statusMode: "auto",
  statusApi: "https://api.mcsrvstat.us/3/",
  manualStatus: { online: false, players: 0, max: 0 },
  statusRefreshSeconds: 60,

  /* ---- Kick ----
     متصفح الزائر مش بيسمح بقراءة Kick مباشرة (CORS) فبنحتاج وسيط.
     لو عندك Cloudflare Worker / Proxy حط رابطه هنا وبيتم استدعاء:
        <kickProxy><username>   ويرجّع JSON بتاع kick.com/api/v2/channels/<username>
     لو فاضي: بنستخدم زر Live/Offline اليدوي من لوحة الإدارة.          */
  kickProxy: "",

  /* ---- الموسيقى (YouTube) ---- */
  musicVideoId: "ANkxRGvl1VY",
  musicVolume: 60
};
