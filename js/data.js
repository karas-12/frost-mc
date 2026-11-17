/* =========================================================
   FROST MC — المحتوى الافتراضي
   تقدر تعدّل كل ده من لوحة الإدارة (#/admin) وتصدّر ملف content.json
   وترفعه في فولدر data/ عشان يظهر لكل الزوار.
   ========================================================= */
window.FROST_DATA = {
  /* الرتب (الألوان والترتيب) */
  ranks: [
    { id: "owner",   ar: "المالك",  en: "Owner",   color: "#ff4d6d" },
    { id: "founder", ar: "مؤسس",    en: "Founder", color: "#f59e0b" },
    { id: "admin",   ar: "أدمن",    en: "Admin",   color: "#ef4444" },
    { id: "mod",     ar: "مود",     en: "Moderator", color: "#38bdf8" },
    { id: "helper",  ar: "هيلبر",   en: "Helper",  color: "#4ade80" },
    { id: "elite",   ar: "إيليت",   en: "Elite",   color: "#e879f9" },
    { id: "mvp",     ar: "MVP",     en: "MVP",     color: "#c084fc" },
    { id: "vip",     ar: "VIP",     en: "VIP",     color: "#a78bfa" },
    { id: "member",  ar: "عضو",     en: "Member",  color: "#9ca3af" }
  ],

  /* الإدارة — الأسماء والـ IDs دي حقيقية (من صاحب السيرفر) */
  staff: [
    {
      id: "santa", name: "Santa", role: "owner", group: "management",
      discordId: "1454771328921112618",
      bio_ar: "صاحب سيرفر FROST MC.", bio_en: "Owner of FROST MC.",
      joined: "", avatar: "", sotm: false, achievements: ""
    },
    {
      id: "zidan", name: "زيدان", role: "founder", group: "management",
      discordId: "1508494188390514870",
      bio_ar: "مؤسس سيرفر FROST MC.", bio_en: "Founder of FROST MC.",
      joined: "", avatar: "", sotm: false, achievements: ""
    },
    {
      id: "naruto", name: "ناروتو", role: "founder", group: "management",
      discordId: "1147500461650358332",
      bio_ar: "مؤسس سيرفر FROST MC.", bio_en: "Founder of FROST MC.",
      joined: "", avatar: "", sotm: false, achievements: ""
    }
  ],

  /* اللاعبين — فاضية لحد ما تضيف اللاعبين الحقيقيين من لوحة الإدارة */
  players: [],

  /* الاستريمرز (Kick فقط) — فاضية لحد ما تضيف */
  creators: [],

  /* الأخبار */
  news: [
    {
      id: "n-welcome", type: "update", date: "2026-11-18", image: "assets/banner-welcome.jpg",
      title_ar: "مرحباً بك في سيرفر FROST",
      title_en: "Welcome to FROST MC",
      body_ar: "منزل جديد .. لمجتمع أفضل. موقع FROST MC الرسمي اشتغل! تابعونا على الديسكورد لمعرفة موعد الافتتاح والفعاليات.",
      body_en: "A new home for a better community. The official FROST MC website is live! Join our Discord for the opening date and events."
    }
  ],

  /* المعرض — الصور الأساسية من هوية السيرفر */
  gallery: [
    { id: "g1", type: "image", title: "FROST MC", url: "assets/logo.jpg" },
    { id: "g2", type: "image", title: "Snow Valley", url: "assets/banner-hero.jpg" },
    { id: "g3", type: "image", title: "Welcome", url: "assets/banner-welcome.jpg" },
    { id: "g4", type: "image", title: "Ender Dragon", url: "assets/dragon.jpg" }
  ],

  /* المتجر — بدون دفع إلكتروني حالياً (السعر 0 = "تواصل معنا على Discord")
     عدّل الأسماء والأسعار والمميزات من لوحة الإدارة */
  shop: [
    { id: "s-vip", name: "VIP", price: 0, currency: "EGP", color: "#a78bfa",
      features_ar: "رتبة مميزة في الشات\nمكان مخصص في الـ Discord", features_en: "Special chat rank\nExclusive Discord role" },
    { id: "s-mvp", name: "MVP", price: 0, currency: "EGP", color: "#c084fc",
      features_ar: "كل مميزات VIP\nمميزات إضافية", features_en: "Everything in VIP\nExtra perks" },
    { id: "s-elite", name: "ELITE", price: 0, currency: "EGP", color: "#e879f9",
      features_ar: "كل مميزات MVP\nأعلى رتبة في المتجر", features_en: "Everything in MVP\nTop store rank" }
  ],

  /* التصويتات */
  polls: [
    {
      id: "p-first", active: true,
      question_ar: "أكتر شيء تحب نشوفه في FROST MC؟",
      question_en: "What would you like to see most on FROST MC?",
      options: [
        { ar: "فعاليات ومسابقات", en: "Events & contests", votes: 0 },
        { ar: "اقتصاد قوي", en: "Strong economy", votes: 0 },
        { ar: "مود/ميزات جديدة", en: "New features", votes: 0 },
        { ar: "جوايز للاعبين", en: "Player rewards", votes: 0 }
      ]
    }
  ],

  /* القوانين (قوانين عامة — عدّلها زي ما تحب) */
  rules: [
    { id: "r1", text_ar: "احترم كل اللاعبين والإدارة، ممنوع السب والإهانة والتنمر.", text_en: "Respect every player and staff member. No insults or bullying." },
    { id: "r2", text_ar: "ممنوع الغش واستخدام أي هاكات أو مودات تعطي أفضلية غير عادلة.", text_en: "No cheating, hacks or unfair-advantage mods." },
    { id: "r3", text_ar: "ممنوع الإعلان عن سيرفرات أو روابط أخرى بدون إذن الإدارة.", text_en: "No advertising other servers or links without staff approval." },
    { id: "r4", text_ar: "ممنوع التخريب (Grief) أو سرقة بيلدات اللاعبين.", text_en: "No griefing or stealing other players' builds." },
    { id: "r5", text_ar: "قرارات الإدارة نهائية، ولو عندك اعتراض كلّم الإدارة على Discord.", text_en: "Staff decisions are final. Appeal through Discord if needed." }
  ],

  /* إعدادات يتم تعديلها من لوحة الإدارة وتغطي config.js */
  settings: {}
};
