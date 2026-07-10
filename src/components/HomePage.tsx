"use client";

import { useState, useEffect } from "react";
import type { SiteContent, BuildingItem, BulletinItem, GalleryItem, LeaderItem, MissionItem, SeasonTheme, BrandingConfig } from "@/lib/content";

// ─── THEME CONFIG ──────────────────────────────────────────────────────────────
type ThemeColors = {
  primary: string;   // main dark color (navbar, footer, buttons)
  primaryHover: string;
  accent: string;    // highlight / gold equivalent
  accentHover: string;
  footerBg: string;
  heroBg: string;    // hero gradient start
  heroVia: string;
};

const THEME_COLORS: Record<SeasonTheme, ThemeColors> = {
  default: {
    primary:      "#1A2E4A",
    primaryHover: "#243D5C",
    accent:       "#C9A454",
    accentHover:  "#b8933f",
    footerBg:     "#0F1D30",
    heroBg:       "#0A1628",
    heroVia:      "#1A2E4A",
  },
  christmas: {
    primary:      "#8B0000",
    primaryHover: "#A50000",
    accent:       "#2D6A2D",
    accentHover:  "#1F4F1F",
    footerBg:     "#0D2E0D",
    heroBg:       "#4A0000",
    heroVia:      "#8B0000",
  },
  "good-friday": {
    primary:      "#2D1B4E",
    primaryHover: "#3D2860",
    accent:       "#6B4C8A",
    accentHover:  "#5A3D77",
    footerBg:     "#1A0D2E",
    heroBg:       "#1A0D2E",
    heroVia:      "#2D1B4E",
  },
  easter: {
    primary:      "#7B5EA7",
    primaryHover: "#8A6DB5",
    accent:       "#F4A340",
    accentHover:  "#E09230",
    footerBg:     "#3D2F60",
    heroBg:       "#4A3570",
    heroVia:      "#7B5EA7",
  },
};

// ─── SNOWFALL (Christmas only) ─────────────────────────────────────────────────
function Snowfall() {
  const flakes = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    left: `${(i * 5.5 + 2) % 100}%`,
    delay: `${(i * 0.7) % 6}s`,
    duration: `${8 + (i % 5) * 2}s`,
    size: i % 3 === 0 ? 32 : i % 3 === 1 ? 22 : 16,
    opacity: 0.55 + (i % 3) * 0.15,
  }));

  return (
    <>
      <style>{`
        @keyframes snowfall {
          0%   { transform: translateY(-20px) rotate(0deg);   opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 0.6; }
          100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
      `}</style>
      <div className="fixed inset-0 pointer-events-none z-[5] overflow-hidden">
        {flakes.map((f) => (
          <div
            key={f.id}
            style={{
              position: "absolute",
              left: f.left,
              top: "-20px",
              fontSize: f.size,
              opacity: f.opacity,
              animation: `snowfall ${f.duration} ${f.delay} linear infinite`,
            }}
          >
            ❄
          </div>
        ))}
      </div>
    </>
  );
}

// ─── GIFT BOW (Christmas button decoration) ────────────────────────────────────
function GiftBow() {
  return (
    <span className="absolute -top-3 left-1/2 -translate-x-1/2 pointer-events-none select-none" aria-hidden>
      <svg width="36" height="20" viewBox="0 0 36 20" fill="none">
        {/* Left loop */}
        <path d="M18 10 C12 4 4 2 5 8 C6 13 13 12 18 10Z" fill="#CC2020" opacity="0.9"/>
        <path d="M18 10 C12 16 4 18 5 12 C6 7 13 8 18 10Z" fill="#A50000" opacity="0.9"/>
        {/* Right loop */}
        <path d="M18 10 C24 4 32 2 31 8 C30 13 23 12 18 10Z" fill="#CC2020" opacity="0.9"/>
        <path d="M18 10 C24 16 32 18 31 12 C30 7 23 8 18 10Z" fill="#A50000" opacity="0.9"/>
        {/* Knot */}
        <ellipse cx="18" cy="10" rx="3.5" ry="3" fill="#E53030"/>
        {/* Ribbon vertical */}
        <rect x="16.5" y="9" width="3" height="11" fill="#CC2020" rx="1" opacity="0.8"/>
      </svg>
    </span>
  );
}

type Lang = "en" | "hk";

// ─── FALLBACK (used only if content prop missing) ─────────────────────────────
const T = {
  en: {
    nav: {
      home: "Home",
      about: "About",
      events: "Events",
      gallery: "Gallery",
      contact: "Contact",
    },
    hero: {
      eyebrow: "Welcome to PBC Hakha",
      title: ["Be Still Before the Lord,", "and Wait Patiently", "for Him."],
      sub: "Join us as we grow together in the love and grace of Jesus Christ. All are welcome.",
      cta1: "Let's Connect",
      cta2: "Up Coming Events",
    },
    infoBar: [
      { title: "Sunday Service", value: "10:00 AM – 12:00 PM" },
      { title: "Prayer Meeting", value: "Wednesday, 7:00 PM" },
      { title: "Location", value: "Hakha, Chin State, Myanmar" },
    ],
    about: {
      eyebrow: "About Our Church",
      heading: "A Place Where Every\nHeart Finds Home",
      p1: "PBC Hakha is a vibrant, Bible-centred congregation in the heart of Hakha, Chin State. We are a community of believers passionate about worshipping God, building meaningful relationships, and reaching our community with the love of Christ.",
      p2: "Whether you are exploring faith for the first time, returning after a long absence, or looking for a place to belong — you are welcome here.",
      cta: "Download",
    },
    leaders: {
      eyebrow: "Our Leadership",
      heading: "Meet Our Leaders",
      current: "Current Leaders",
      former: "Former Leaders",
    },
    buildings: {
      eyebrow: "Memorial Buildings",
      heading: "Buildings Built in Loving Memory",
    },
    features: {
      eyebrow: "What We Stand For",
      heading: "Our Three Pillars",
      items: [
        {
          label: "Our Community",
          body: "We are a family — united by faith, strengthened by love, and called to serve one another and the world around us.",
          link: "Meet the Family →",
        },
        {
          label: "Our Mission",
          body: "To proclaim the Gospel, make disciples of all nations, and demonstrate the Kingdom of God in practical, tangible ways.",
          link: "Our Vision →",
        },
        {
          label: "Get Involved",
          body: "From small groups to youth ministry, women's fellowship to worship teams — there is a place for everyone to serve and grow.",
          link: "Find Your Place →",
        },
      ],
    },
    events: {
      eyebrow: "Upcoming Events",
      heading: "Join Us for What's Coming",
      viewAll: "View All Events",
      register: "Register",
      items: [
        { day: "15", month: "Jun", title: "Youth Sunday Gathering", time: "10:00 AM", place: "PBC Main Hall" },
        { day: "22", month: "Jun", title: "Prayer & Fasting Week", time: "6:00 PM", place: "PBC Chapel" },
        { day: "29", month: "Jun", title: "Community Outreach Day", time: "8:00 AM", place: "Hakha Town Centre" },
      ],
    },
    mission: {
      eyebrow: "Our Mission",
      heading: "Serving with Purpose",
      sub: "We are called to proclaim the Gospel, make disciples, and demonstrate the Kingdom of God in practical ways across Hakha and beyond.",
    },
    verse: {
      text: "For God so loved the world that He gave His one and only Son, that whoever believes in Him shall not perish but have eternal life.",
      ref: "John 3:16",
    },
    gallery: {
      eyebrow: "Photo Gallery",
      heading: "Life at PBC Hakha",
      viewAll: "View Full Gallery",
    },
    cta: {
      heading: "New to PBC Hakha?",
      sub: "We'd love to meet you. Come join us this Sunday and experience the warmth of our church family.",
      button: "Let's Connect",
    },
    footer: {
      tagline: "Growing together in faith, love, and community.",
      quickLinks: "Quick Links",
      services: "Service Times",
      contact: "Contact",
      nav: ["Home", "About Us", "Our Mission", "Our Leaders", "Events", "Gallery", "Contact"],
      times: [
        { day: "Sunday", time: "10:00 AM – 12:00 PM", label: "Morning Worship" },
        { day: "Wednesday", time: "7:00 PM – 8:30 PM", label: "Prayer Meeting" },
        { day: "Friday", time: "6:30 PM – 8:00 PM", label: "Youth Service" },
      ],
      address: "Hakha, Chin State, Myanmar",
      phone: "+95 XXX XXX XXXX",
      email: "info@pbchakha.org",
      copy: "© 2025 PBC Hakha Church. All rights reserved.",
    },
  },

  hk: {
    nav: {
      home: "Inn",
      about: "Konglam",
      events: "Cawlcanghnak/Puai",
      gallery: "Zuk Bawm",
      contact: "Pehtlaihnak",
    },
    hero: {
      eyebrow: "PBC Hakha In Kan In Don",
      title: ["Bawipa kha dai te", "le lungsau tein", "hngak ko."],
      sub: "Jesuh Khrih a dawtnak le a vel ngaihnak tang ah a thang mi kan sinah rak ra ve. Ahopaoh kan in don hna.",
      cta1: "Pehtlaihnak",
      cta2: "Ara Lai Mi Cawlcanghnak",
    },
    infoBar: [
      { title: "Zarhpi Ni Pumh Caan", value: "10:00 AM – 12:00 PM" },
      { title: "Thlacam Caan", value: "Nithum Ni, 7:00 PM" },
      { title: "A Hmun", value: "Haka, Chin Ram, Myanmar" },
    ],
    about: {
      eyebrow: "Kan Pawlpi Cungvan",
      heading: "Mi Zawng Lunglengnak\nThleng Inn",
      p1: "PBC Haka Pawlpi hi Chin Ram, Haka khuannak tuanin Bible thuthlennak pawlpi ni. Kan si Pathian biaknak, ruamhnak zawrh le Krist hmunhmam-in khawthlang kami duh sianginn ningcang.",
      p2: "Nang lungngaknak thar duh, nidang in loh le hmun duh nang si — nang nung lam tlai thei.",
      cta: "Download",
    },
    leaders: {
      eyebrow: "Kan Sianginn Hna",
      heading: "Kan Sianginn Hmuh",
      current: "Tulio Sianginn Hna",
      former: "Nidang Sianginn Hna",
    },
    buildings: {
      eyebrow: "Theihnak Inn Hna",
      heading: "Theihnak-in Sa Mi Inn Hna",
    },
    features: {
      eyebrow: "Kan Dingah",
      heading: "Kawng Thum Fiangtling",
      items: [
        {
          label: "Kan Zumhnak",
          body: "Kan si ruamhnak — lungngaknak-in ruam, hmunhmam-in zuam, le mino le khawthlang tangko ding.",
          link: "Ruamhnak Hmuh →",
        },
        {
          label: "Kan Tuanbia",
          body: "Thuzang gen, thiamnak tein, le Pathian cozah khawthlang-ah hmanfang tein thleng.",
          link: "Kan Hin Hmuh →",
        },
        {
          label: "Rian Ruam",
          body: "Hna zumhnak, sungbawi sianginn, mipu pawlpi le biaknak hna — mi zawng zawng-ah hmun an um.",
          link: "Hmun Hmuh →",
        },
      ],
    },
    events: {
      eyebrow: "Puai/Cawlcanghnak Tuah Ding Mi Pawl",
      heading: "Kan Kai Uh Hmannak",
      viewAll: "Puai/Cawlcanghnak Dihlak",
      register: "Ming Zet",
      items: [
        { day: "15", month: "Jun", title: "Sungbawi Thausing Zumhnak", time: "10:00 AM", place: "PBC Inn Lian" },
        { day: "22", month: "Jun", title: "Thleihnak & Zuksaknak Hun", time: "6:00 PM", place: "PBC Chapel" },
        { day: "29", month: "Jun", title: "Khawthlang Tangkonak Ni", time: "8:00 AM", place: "Haka Khua" },
      ],
    },
    mission: {
      eyebrow: "Kan Rianttuannak",
      heading: "Tinhmi Ngei Bu Tein Rianttuannak",
      sub: "Hakha khuachung le Hmun Zakip Ah Thawngtha phuan ding, zultu siter ding le Pathian Pennak Akarh khawhnak ding caah lamhmuhsak khawhnak ding rianttuantu kan si.",
    },
    verse: {
      text: "Pathian in kha thlalang hmunhmam a si caan, a nupa Pa mi tangko in a pekmi, a man fiang ding, mi zeihmanh sih lo ding, tutan nupi nei ding a si.",
      ref: "John 3:16",
    },
    gallery: {
      eyebrow: "Zuk Bawm",
      heading: "PBC Haka-ah Nunnak",
      viewAll: "Hmanthlak Dihlak In Zohnak",
    },
    cta: {
      heading: "PBC Haka-ah Thar Bia?",
      sub: "Kan hmuah duh. Thausing kan kan tlang ko le kan sianginn sungbawi hmunhmam hmuh.",
      button: "Pehtlaihnak",
    },
    footer: {
      tagline: "Lungngaknak, hmunhmam le zumhnak-in zuam nung.",
      quickLinks: "Khulrang in Zohnak",
      services: "Caanhmannak Caan",
      contact: "Pehtlaihnak",
      nav: ["Inn", "Kan Konglam", "Kan Riantuannak", "Kan Hruaitu Hna", "Cawlcanghnak/Puai", "Zuk Bawm", "Pehtlaihnak"],
      times: [
        { day: "Zarhpi Ni", time: "10:00 AM – 12:00 PM", label: "Zarhpi Ni Zing Pumhnak" },
        { day: "Nithum Ni", time: "7:00 PM – 8:30 PM", label: "Thlacamnak" },
        { day: "Ninga Ni", time: "6:30 PM – 8:00 PM", label: "Mino Caanhmannak" },
      ],
      address: "Haka, Chin Ram, Myanmar",
      phone: "+95 XXX XXX XXXX",
      email: "info@pbchakha.org",
      copy: "© 2025 PBC Haka Pawlpi. Hna thawng kan zet.",
    },
  },
} as const;

// ─── ICONS ────────────────────────────────────────────────────────────────────
function SectionLabel({ text, color = "#C9A454" }: { text: string; color?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 mb-4">
      <span className="h-px w-10" style={{ backgroundColor: color }} />
      <span className="text-[11px] font-bold tracking-[0.28em] uppercase" style={{ color }}>{text}</span>
      <span className="h-px w-10" style={{ backgroundColor: color }} />
    </div>
  );
}

// ─── BUBBLES ──────────────────────────────────────────────────────────────────
const BUBBLES = [
  { size: 16, left: 3,  delay: 0,   duration: 9,  ring: true  },
  { size: 10, left: 8,  delay: 2.8, duration: 11, ring: false },
  { size: 24, left: 14, delay: 1.2, duration: 8,  ring: true  },
  { size: 8,  left: 21, delay: 4.5, duration: 13, ring: false },
  { size: 18, left: 27, delay: 0.6, duration: 10, ring: true  },
  { size: 12, left: 33, delay: 3.2, duration: 8,  ring: false },
  { size: 28, left: 39, delay: 1.8, duration: 12, ring: true  },
  { size: 8,  left: 45, delay: 5.1, duration: 9,  ring: false },
  { size: 20, left: 51, delay: 0.3, duration: 11, ring: true  },
  { size: 14, left: 57, delay: 2.5, duration: 7,  ring: false },
  { size: 10, left: 62, delay: 6.0, duration: 10, ring: true  },
  { size: 26, left: 68, delay: 1.0, duration: 9,  ring: false },
  { size: 12, left: 73, delay: 3.8, duration: 12, ring: true  },
  { size: 18, left: 79, delay: 0.9, duration: 8,  ring: false },
  { size: 8,  left: 85, delay: 4.2, duration: 10, ring: true  },
  { size: 22, left: 90, delay: 2.1, duration: 13, ring: false },
  { size: 14, left: 95, delay: 5.6, duration: 9,  ring: true  },
  { size: 10, left: 17, delay: 6.8, duration: 11, ring: false },
  { size: 16, left: 48, delay: 7.2, duration: 8,  ring: true  },
  { size: 8,  left: 76, delay: 1.5, duration: 10, ring: false },
];

function Bubbles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {BUBBLES.map((b, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: b.size,
            height: b.size,
            left: `${b.left}%`,
            bottom: "-40px",
            background: b.ring ? "transparent" : "rgba(255,255,255,0.06)",
            border: b.ring ? "1.5px solid rgba(201,164,84,0.35)" : "none",
            animation: `bubble-rise ${b.duration}s ease-in ${b.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

// ─── FOOTER QUICK LINK HREFS (matches footer nav order in both languages) ──────
const FOOTER_NAV_HREFS = ["#home", "#about", "#mission", "#leadership", "#events", "#gallery", "#contact"];

// ─── SUBMENU DATA ─────────────────────────────────────────────────────────────
const NAV_SUBS: Record<string, { en: string; hk: string; href: string }[]> = {
  about: [
    { en: "About Us",          hk: "Kan Konglam",        href: "#about" },
    { en: "Our Mission",       hk: "Kan Riantuannak",    href: "#mission" },
    { en: "Our Leaders",       hk: "Kan Hruaitu Hna",    href: "#leadership" },
    { en: "Memorial Building", hk: "Philhlonak Inn Pawl", href: "#buildings" },
  ],
  events: [
    { en: "Upcoming Events", hk: "Puai/Cawlcanghnak Tuah Ding Mi Pawl", href: "#events" },
    { en: "All Events",      hk: "Puai/Cawlcanghnak Dihlak",            href: "#events" },
  ],
  gallery: [
    { en: "Photos",  hk: "Hmanthlak", href: "#gallery" },
  ],
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function HomePage({ content }: { content: SiteContent }) {
  const [lang, setLang] = useState<Lang>("en");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileSub, setMobileSub] = useState<string | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingItem | null>(null);
  const [selectedGallery, setSelectedGallery] = useState<GalleryItem | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [showAllGallery, setShowAllGallery] = useState(false);
  const [selectedBulletin, setSelectedBulletin] = useState<BulletinItem | null>(null);
  const [bulletinPage, setBulletinPage] = useState(0);
  const [selectedMission, setSelectedMission] = useState<MissionItem | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const tc = THEME_COLORS[content.activeTheme ?? "default"];
  const isChristmas = content.activeTheme === "christmas";
  const b: BrandingConfig = content.branding ?? {
    churchName_en: "PBC Hakha", churchName_hk: "PBC Hakha",
    subtitle_en: "Church", subtitle_hk: "Pawlpi",
    logoUrl: "/images/church_logo.png",
    heroImageUrl: "/images/church_outside.png",
    aboutImageUrl: "/images/church_outside.png",
    facebookUrl: "https://www.facebook.com/profile.php?id=61585721172230",
    youtubeUrl: "", instagramUrl: "",
  };

  function showBuilding(offset: number) {
    const buildings = content.buildings_items;
    if (!selectedBuilding || buildings.length === 0) return;
    const idx = buildings.findIndex((b) => b.id === selectedBuilding.id);
    const nextIdx = (idx + offset + buildings.length) % buildings.length;
    setSelectedBuilding(buildings[nextIdx]);
  }

  function showGalleryImage(offset: number) {
    if (!selectedGallery || selectedGallery.images.length === 0) return;
    const len = selectedGallery.images.length;
    setGalleryIndex((idx) => (idx + offset + len) % len);
  }

  function handleTouchStart(e: React.TouchEvent) {
    setTouchStartX(e.touches[0].clientX);
  }

  function handleTouchEnd(e: React.TouchEvent, onNext: () => void, onPrev: () => void) {
    if (touchStartX === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    const threshold = 50;
    if (deltaX < -threshold) onNext();
    else if (deltaX > threshold) onPrev();
    setTouchStartX(null);
  }

  const l = (content ?? T)[lang];
  const navEntries = Object.entries(l.nav) as [string, string][];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 70);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="bg-white">
      {isChristmas && <Snowfall />}
      {isChristmas && (
        <div className="relative z-[60] text-white text-center text-xs py-1.5 font-medium tracking-wide" style={{ backgroundColor: "#8B0000" }}>
          🎄 Wishing You A Blessed Christmas Season 🎄
        </div>
      )}

      {/* ── NAVBAR ─────────────────────────────────────────────────── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white shadow-md py-3"
            : "bg-white shadow-sm py-3 lg:bg-transparent lg:shadow-none lg:py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a href="#home" className="flex items-center gap-3">
              <img
                src={b.logoUrl}
                alt={`${lang === "en" ? b.churchName_en : b.churchName_hk} Logo`}
                className="h-14 w-auto object-contain shrink-0"
              />
              <div>
                <p
                  className={`font-bold text-sm leading-none ${scrolled ? "text-[#1A2E4A]" : "text-[#1A2E4A] lg:text-[#C9A454]"}`}
                >
                  {lang === "en" ? b.churchName_en : b.churchName_hk}
                </p>
                <p
                  className={`text-xs mt-0.5 ${scrolled ? "text-gray-400" : "text-gray-400 lg:text-white/75"}`}
                >
                  {lang === "en" ? b.subtitle_en : b.subtitle_hk}
                </p>
              </div>
            </a>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-7">
              {navEntries.map(([key, label]) => {
                const subs = NAV_SUBS[key] ?? [];
                const isOpen = openMenu === key;
                const linkColor = isOpen ? "#C9A454" : scrolled ? "#1A2E4A" : "#ffffff";
                return (
                  <div
                    key={key}
                    className="relative"
                    onMouseEnter={() => setOpenMenu(key)}
                    onMouseLeave={() => setOpenMenu(null)}
                  >
                    <a
                      href={`#${key}`}
                      className="flex items-center gap-1 text-sm font-bold tracking-wide"
                      style={{
                        color: linkColor,
                        textShadow: !scrolled ? "0 1px 6px rgba(0,0,0,0.7)" : "none",
                        transition: "color 0.2s",
                      }}
                    >
                      {label}
                      {subs.length > 0 && (
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor" style={{ opacity: 0.7, marginTop: 1 }}>
                          <path d="M0 0l5 6 5-6H0z" />
                        </svg>
                      )}
                    </a>

                    {/* Dropdown */}
                    {subs.length > 0 && isOpen && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 z-50">
                        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 min-w-[200px]">
                          {subs.map((sub, i) => (
                            <a
                              key={i}
                              href={sub.href}
                              className="block px-5 py-2.5 text-sm font-medium text-[#1A2E4A] hover:bg-[#F5EDD8] hover:text-[#C9A454] transition-colors"
                            >
                              {lang === "en" ? sub.en : sub.hk}
                            </a>
                          ))}
                        </div>
                        {/* Arrow */}
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 border-l border-t border-gray-100" />
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Language toggle + mobile hamburger */}
            <div className="flex items-center gap-3">
              <div
                className={`flex rounded-full overflow-hidden text-xs font-bold border ${
                  scrolled ? "border-gray-200" : "border-gray-200 lg:border-white/40"
                }`}
              >
                {(["en", "hk"] as Lang[]).map((code) => (
                  <button
                    key={code}
                    onClick={() => setLang(code)}
                    className={`px-3 py-1.5 transition-colors ${
                      lang === code
                        ? "bg-[#C9A454] text-white"
                        : scrolled
                        ? "text-[#1A2E4A] hover:bg-gray-50"
                        : "text-[#1A2E4A] hover:bg-gray-50 lg:text-white lg:hover:bg-white/10"
                    }`}
                  >
                    {code === "en" ? "EN" : "CNH"}
                  </button>
                ))}
              </div>

              <button
                className="lg:hidden p-1"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
              >
                <div className="space-y-1.5">
                  <span className={`block w-6 h-0.5 ${scrolled ? "bg-[#1A2E4A]" : "bg-[#1A2E4A] lg:bg-white"}`} />
                  <span className={`block w-6 h-0.5 ${scrolled ? "bg-[#1A2E4A]" : "bg-[#1A2E4A] lg:bg-white"}`} />
                  <span className={`block w-6 h-0.5 ${scrolled ? "bg-[#1A2E4A]" : "bg-[#1A2E4A] lg:bg-white"}`} />
                </div>
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {menuOpen && (
            <div className="lg:hidden mt-4 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              {navEntries.map(([key, label]) => {
                const subs = NAV_SUBS[key] ?? [];
                const isExpanded = mobileSub === key;
                return (
                  <div key={key} className="border-b border-gray-100 last:border-0">
                    {subs.length > 0 ? (
                      <>
                        {/* Parent row — toggles submenu */}
                        <button
                          onClick={() => setMobileSub(isExpanded ? null : key)}
                          className="w-full flex items-center justify-between px-5 py-3 text-[#1A2E4A] font-medium hover:text-[#C9A454] hover:bg-gray-50 transition-colors text-left"
                        >
                          {label}
                          <svg
                            width="12" height="12" viewBox="0 0 10 6" fill="currentColor"
                            style={{ transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
                          >
                            <path d="M0 0l5 6 5-6H0z" />
                          </svg>
                        </button>
                        {/* Submenu items */}
                        {isExpanded && (
                          <div className="bg-gray-50 border-t border-gray-100">
                            {subs.map((sub, i) => (
                              <a
                                key={i}
                                href={sub.href}
                                onClick={() => { setMenuOpen(false); setMobileSub(null); }}
                                className="block pl-8 pr-5 py-2.5 text-sm text-[#1A2E4A] hover:text-[#C9A454] hover:bg-gray-100 transition-colors"
                              >
                                {lang === "en" ? sub.en : sub.hk}
                              </a>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      /* No submenu — direct link */
                      <a
                        href={`#${key}`}
                        onClick={() => setMenuOpen(false)}
                        className="block px-5 py-3 text-[#1A2E4A] font-medium hover:text-[#C9A454] hover:bg-gray-50 transition-colors"
                      >
                        {label}
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────────────── */}
      <section id="home" className="relative min-h-screen flex flex-col">
        {/* Background gradient */}
        <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom right, ${tc.heroBg}, ${tc.heroVia}, #1E3A52)` }} />
        {/* Church background photo */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: isChristmas ? "url('/images/Christmas.png')" : `url('${b.heroImageUrl}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            opacity: isChristmas ? 0.45 : 0.3,
          }}
        />
        {/* Radial glow */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(201,164,84,0.4), transparent 60%), radial-gradient(ellipse 50% 40% at 85% 80%, rgba(255,255,255,0.06), transparent 50%)",
          }}
        />
        {/* Floating bubbles */}
        <Bubbles />

        {/* Cross watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none">
          <svg width="520" height="520" viewBox="0 0 100 100">
            <rect x="44" y="5" width="12" height="90" fill="white" />
            <rect x="5" y="30" width="90" height="12" fill="white" />
          </svg>
        </div>

        {/* Hero content */}
        <div className="relative flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 pt-28 pb-32">
          <p className="text-[11px] font-bold tracking-[0.35em] uppercase mb-6" style={{ color: tc.accent }}>
            {l.hero.eyebrow}
          </p>
          <h1 className="text-white leading-snug mb-4">
            {l.hero.title.map((word, i) => (
              <span key={i} className="block text-4xl sm:text-5xl lg:text-6xl xl:text-7xl">
                {word}
              </span>
            ))}
          </h1>
          <p className="text-sm font-semibold tracking-[0.2em] mb-8" style={{ color: tc.accent }}>
            — {lang === "en" ? "Psalm 37:7" : "Salm 37:7"}
          </p>
          <p className="text-white/60 text-lg max-w-md mx-auto leading-relaxed mb-12">
            {l.hero.sub}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="#about"
              className="relative hover:brightness-90 text-white px-8 py-3.5 rounded-full font-semibold text-sm tracking-wide transition-all hover:-translate-y-0.5 shadow-lg"
              style={{ backgroundColor: tc.accent }}
            >
              {isChristmas && <GiftBow />}
              {l.hero.cta1}
            </a>
            <a
              href="#events"
              className="border border-white/35 hover:border-white px-8 py-3.5 rounded-full font-semibold text-sm tracking-wide transition-all hover:bg-white/10"
              style={{ color: "white" }}
            >
              {l.hero.cta2}
            </a>
          </div>
        </div>

        {/* Info strip at bottom of hero */}
        <div className="relative border-t border-white/10 bg-black/25 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="grid sm:grid-cols-3 gap-4 text-center text-white">
              {l.infoBar.map((item, i) => (
                <div
                  key={i}
                  className={`px-4 ${i < l.infoBar.length - 1 ? "sm:border-r border-white/10" : ""}`}
                >
                  <p className="text-[10px] font-bold tracking-[0.25em] uppercase mb-1" style={{ color: tc.accent }}>
                    {item.title}
                  </p>
                  <p className="text-sm font-semibold">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── ABOUT ──────────────────────────────────────────────────── */}
      <section id="about" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Image */}
            <div className="relative">
              <div className="rounded-3xl overflow-hidden aspect-[4/5] flex items-end relative">
                <img src={b.aboutImageUrl} alt={lang === "en" ? b.churchName_en : b.churchName_hk} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="relative p-8 text-white">
                  <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: tc.accent }}>
                    {lang === "en" ? "Hakha, Chin State" : "Hakha, Chin Ramkulh"}
                  </p>
                  <p className="text-xl font-semibold">
                    {lang === "en" ? "Peniel Baptist Church" : "Peniel Tipil Khrihfabu"}
                  </p>
                </div>
              </div>
              <div className="absolute -bottom-5 -right-5 w-32 h-32 bg-[#C9A454]/12 rounded-3xl -z-10" />
              <div className="absolute -top-5 -left-5 w-24 h-24 bg-[#1A2E4A]/08 rounded-3xl -z-10" />
            </div>

            {/* Text */}
            <div>
              <SectionLabel text={l.about.eyebrow} color={tc.accent} />
              <h2 className="text-4xl lg:text-5xl text-[#1A2E4A] leading-tight mb-8">
                {l.about.heading.split("\n").map((line, i, arr) => (
                  <span key={i}>
                    {line}
                    {i < arr.length - 1 && <br />}
                  </span>
                ))}
              </h2>
              <p className="text-gray-500 leading-relaxed mb-5">{l.about.p1}</p>
              <p className="text-gray-500 leading-relaxed mb-10">{l.about.p2}</p>
              <a
                href="/docs/Peniel_Baptist_Church_Tuan_Bia_Tawi.pdf"
                download
                style={{ color: "#ffffff", backgroundColor: tc.accent }}
                className="inline-flex items-center gap-2 hover:brightness-90 px-7 py-3.5 rounded-full font-semibold text-sm tracking-wide transition-all hover:-translate-y-0.5"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                {l.about.cta}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── LEADERSHIP ─────────────────────────────────────────────── */}
      <section id="leadership" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <SectionLabel text={l.leaders.eyebrow} color={tc.accent} />
            <h2 className="text-4xl lg:text-5xl text-[#1A2E4A]">{l.leaders.heading}</h2>
          </div>

          {/* Current Leaders */}
          {content.leaders_items.filter((p: LeaderItem) => p.status === "current").length > 0 && (
            <div className="mb-20">
              <div className="flex items-center gap-4 mb-10">
                <span className="h-px flex-1 bg-gray-200" />
                <span className="text-xs font-bold tracking-[0.2em] uppercase" style={{ color: tc.accent }}>{l.leaders.current}</span>
                <span className="h-px flex-1 bg-gray-200" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8">
                {content.leaders_items.filter((p: LeaderItem) => p.status === "current").map((p: LeaderItem) => (
                  <div key={p.id} className="group flex flex-col items-center">
                    <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-br from-[#1A2E4A] to-[#243D5C] shadow-md mb-4">
                      {p.image
                        ? <img src={p.image} alt={p.name} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" />
                        : <div className="w-full h-full flex items-center justify-center">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                          </div>
                      }
                      <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: tc.accent }} />
                    </div>
                    <p className="font-semibold text-[#1A2E4A] text-sm text-center leading-snug">{p.name}</p>
                    <p className="text-xs mt-1 text-center leading-snug" style={{ color: tc.accent }}>{lang === "en" ? p.position_en : p.position_hk}</p>
                    {p.term && <p className="text-gray-400 text-[11px] mt-1 text-center">{p.term}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Former Leaders */}
          {content.leaders_items.filter((p: LeaderItem) => p.status === "former").length > 0 && (
            <div>
              <div className="flex items-center gap-4 mb-10">
                <span className="h-px flex-1 bg-gray-200" />
                <span className="text-xs font-bold tracking-[0.2em] uppercase text-gray-400">{l.leaders.former}</span>
                <span className="h-px flex-1 bg-gray-200" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8">
                {content.leaders_items.filter((p: LeaderItem) => p.status === "former").map((p: LeaderItem) => (
                  <div key={p.id} className="group flex flex-col items-center">
                    <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-br from-gray-300 to-gray-400 shadow-sm mb-4">
                      {p.image
                        ? <img src={p.image} alt={p.name} className="w-full h-full object-cover object-top grayscale group-hover:grayscale-0 transition-all duration-500" />
                        : <div className="w-full h-full flex items-center justify-center">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                          </div>
                      }
                    </div>
                    <p className="font-semibold text-gray-600 text-sm text-center leading-snug">{p.name}</p>
                    <p className="text-gray-400 text-xs mt-1 text-center leading-snug">{lang === "en" ? p.position_en : p.position_hk}</p>
                    {p.term && <p className="text-gray-400 text-[11px] mt-1 text-center">{p.term}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {content.leaders_items.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-12">Leaders will appear here once added from the admin dashboard.</p>
          )}
        </div>
      </section>

      {/* ── MEMORIAL BUILDINGS ─────────────────────────────────────── */}
      <section id="buildings" className="py-24 bg-[#F8F7F4]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <SectionLabel text={l.buildings.eyebrow} color={tc.accent} />
            <h2 className="text-4xl lg:text-5xl text-[#1A2E4A]">{l.buildings.heading}</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {content.buildings_items.map((b) => (
              <div
                key={b.id}
                onClick={() => setSelectedBuilding(b)}
                className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={b.image} alt={lang === "en" ? b.name_en : b.name_hk} className="w-full h-full object-cover" />
                </div>
                <div className="p-7">
                  <h3 className="text-xl text-[#1A2E4A] font-semibold mb-2">
                    {lang === "en" ? b.name_en : b.name_hk}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {lang === "en" ? b.caption_en : b.caption_hk}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MEMORIAL BUILDING MODAL ────────────────────────────────── */}
      {selectedBuilding && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
          onClick={() => setSelectedBuilding(null)}
        >
          {/* Prev arrow */}
          {content.buildings_items.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); showBuilding(-1); }}
              aria-label="Previous building"
              className="fixed left-2 sm:left-6 top-1/2 -translate-y-1/2 z-[110] w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 hover:bg-white text-[#1A2E4A] flex items-center justify-center shadow-md text-2xl transition-colors"
            >
              ‹
            </button>
          )}

          <div
            className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchEnd={(e) => handleTouchEnd(e, () => showBuilding(1), () => showBuilding(-1))}
          >
            <button
              onClick={() => setSelectedBuilding(null)}
              aria-label="Close"
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-[#1A2E4A] flex items-center justify-center shadow-md text-xl transition-colors"
            >
              ×
            </button>
            <div className="aspect-[16/9]">
              <img
                src={selectedBuilding.image}
                alt={lang === "en" ? selectedBuilding.name_en : selectedBuilding.name_hk}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-8">
              <h3 className="text-2xl text-[#1A2E4A] font-semibold mb-4">
                {lang === "en" ? selectedBuilding.name_en : selectedBuilding.name_hk}
              </h3>
              <p className="text-gray-500 leading-relaxed whitespace-pre-line">
                {lang === "en" ? selectedBuilding.history_en : selectedBuilding.history_hk}
              </p>
            </div>
          </div>

          {/* Next arrow */}
          {content.buildings_items.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); showBuilding(1); }}
              aria-label="Next building"
              className="fixed right-2 sm:right-6 top-1/2 -translate-y-1/2 z-[110] w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 hover:bg-white text-[#1A2E4A] flex items-center justify-center shadow-md text-2xl transition-colors"
            >
              ›
            </button>
          )}
        </div>
      )}

      {/* ── THREE PILLARS ──────────────────────────────────────────── */}
      {/* ── EVENTS ─────────────────────────────────────────────────── */}
      <section id="events" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-14 gap-4">
            <div>
              <SectionLabel text={l.events.eyebrow} color={tc.accent} />
              <h2 className="text-4xl lg:text-5xl text-[#1A2E4A]">{l.events.heading}</h2>
            </div>
            <a href="#" className="text-sm font-semibold hover:underline shrink-0" style={{ color: tc.accent }}>
              {l.events.viewAll} →
            </a>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {content.events_items.map((ev) => (
              <div key={ev.id} className="border border-gray-100 rounded-3xl overflow-hidden hover:shadow-lg transition-shadow">
                {/* Date header */}
                <div className="px-6 py-5 flex items-center gap-5" style={{ backgroundColor: tc.primary }}>
                  <div className="text-center shrink-0">
                    <p className="text-3xl font-bold leading-none" style={{ color: tc.accent }}>{ev.day}</p>
                    <p className="text-white/60 text-[10px] font-bold tracking-widest uppercase mt-1">{ev.month}</p>
                  </div>
                  <div className="w-px h-10 bg-white/15 shrink-0" />
                  <h3 className="text-white font-semibold leading-snug text-sm">
                    {lang === "en" ? ev.title_en : ev.title_hk}
                  </h3>
                </div>
                {/* Details */}
                <div className="px-6 py-5">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                    </svg>
                    {ev.time}
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-6">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                    </svg>
                    {lang === "en" ? ev.place_en : ev.place_hk}
                  </div>
                  <a
                    href="#"
                    className="inline-block hover:brightness-90 text-white text-xs font-bold tracking-widest uppercase px-5 py-2.5 rounded-full transition-all"
                    style={{ backgroundColor: tc.accent }}
                  >
                    {l.events.register}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OUR MISSION ────────────────────────────────────────────── */}
      <section id="mission" className="py-24 bg-[#F8F7F4]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <SectionLabel text={l.mission.eyebrow} color={tc.accent} />
            <h2 className="text-4xl lg:text-5xl text-[#1A2E4A] mb-4">{l.mission.heading}</h2>
            {l.mission.sub && (
              <p className="text-gray-500 text-base max-w-2xl mx-auto leading-relaxed">{l.mission.sub}</p>
            )}
          </div>

          {content.mission_items.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {content.mission_items.map((item: MissionItem) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedMission(item)}
                  className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group text-left w-full"
                >
                  {item.image ? (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={item.image}
                        alt={lang === "en" ? item.title_en : item.title_hk}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-[#1A2E4A] to-[#243D5C] flex items-center justify-center">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(201,164,84,0.6)" strokeWidth="1.5">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                      </svg>
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-[#1A2E4A] font-bold text-lg leading-snug mb-2">
                      {lang === "en" ? item.title_en : item.title_hk}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">
                      {lang === "en" ? item.description_en : item.description_hk}
                    </p>
                    <p className="text-xs font-bold mt-4 group-hover:underline" style={{ color: tc.accent }}>
                      {lang === "en" ? "Read more →" : "Thazang zoh →"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400 text-sm">
              Mission activities will appear here once added by the admin.
            </div>
          )}
        </div>
      </section>

      {/* ── SCRIPTURE QUOTE ────────────────────────────────────────── */}
      <section className="relative py-24 overflow-hidden" style={{ backgroundColor: tc.primary }}>
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none">
          <svg width="640" height="640" viewBox="0 0 100 100">
            <rect x="44" y="5" width="12" height="90" fill="white" />
            <rect x="5" y="30" width="90" height="12" fill="white" />
          </svg>
        </div>
        <div className="relative max-w-3xl mx-auto text-center px-4 sm:px-6">
          <svg
            className="mx-auto mb-8"
            style={{ color: tc.accent + "80" }}
            width="44"
            height="44"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
          <blockquote className="text-white text-xl sm:text-2xl leading-relaxed italic mb-8">
            {l.verse.text}
          </blockquote>
          <cite className="font-bold tracking-[0.2em] text-sm not-italic uppercase" style={{ color: tc.accent }}>
            — {l.verse.ref}
          </cite>
        </div>
      </section>

      {/* ── GALLERY ────────────────────────────────────────────────── */}
      <section id="gallery" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <SectionLabel text={l.gallery.eyebrow} color={tc.accent} />
            <h2 className="text-4xl lg:text-5xl text-[#1A2E4A]">{l.gallery.heading}</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {(showAllGallery ? content.gallery_items : content.gallery_items.slice(0, 6)).map((item, i) => {
              const gradients = [
                "from-[#1A2E4A] to-[#243D5C]",
                "from-[#2D4A3E] to-[#3D6050]",
                "from-[#4A3820] to-[#6A5030]",
                "from-[#2A1A3E] to-[#3E2A58]",
                "from-[#1A3A3A] to-[#2A5050]",
                "from-[#3A2A1A] to-[#5A4028]",
              ];
              const caption = lang === "en" ? item.caption_en : item.caption_hk;
              const hasPhotos = item.images.length > 0;
              return (
                <div
                  key={item.id}
                  onClick={() => { if (hasPhotos) { setSelectedGallery(item); setGalleryIndex(0); } }}
                  className={`relative aspect-square rounded-2xl overflow-hidden group ${hasPhotos ? "cursor-pointer" : ""} ${!item.image ? `bg-gradient-to-br ${gradients[i % gradients.length]}` : ""}`}
                >
                  {item.image && (
                    <img src={item.image} alt={caption} className="absolute inset-0 w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                    <p className="text-white font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity text-center px-4">
                      {caption}
                    </p>
                  </div>
                  <div className="absolute bottom-3 left-3 opacity-60 group-hover:opacity-0 transition-opacity">
                    <p className="text-white text-xs">{caption}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {(showAllGallery || content.gallery_items.length > 6) && (
            <div className="text-center mt-10">
              <button
                onClick={() => setShowAllGallery((v) => !v)}
                className="inline-block hover:brightness-90 text-white px-8 py-3 rounded-full text-sm font-semibold transition-all"
                style={{ backgroundColor: tc.primary }}
              >
                {showAllGallery ? (lang === "en" ? "Show Less" : "Tlawmdeuh Lawng Zohnak") : l.gallery.viewAll}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── GALLERY LIGHTBOX ───────────────────────────────────────── */}
      {selectedGallery && selectedGallery.images.length > 0 && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
          onClick={() => setSelectedGallery(null)}
        >
          {/* Prev arrow */}
          {selectedGallery.images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); showGalleryImage(-1); }}
              aria-label="Previous photo"
              className="fixed left-2 sm:left-6 top-1/2 -translate-y-1/2 z-[110] w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 hover:bg-white text-[#1A2E4A] flex items-center justify-center shadow-md text-2xl transition-colors"
            >
              ‹
            </button>
          )}

          <div
            className="relative max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchEnd={(e) => handleTouchEnd(e, () => showGalleryImage(1), () => showGalleryImage(-1))}
          >
            <button
              onClick={() => setSelectedGallery(null)}
              aria-label="Close"
              className="absolute -top-12 right-0 sm:top-4 sm:right-4 z-10 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-[#1A2E4A] flex items-center justify-center shadow-md text-xl transition-colors"
            >
              ×
            </button>
            <img
              src={selectedGallery.images[galleryIndex]}
              alt={lang === "en" ? selectedGallery.caption_en : selectedGallery.caption_hk}
              className="w-full max-h-[80vh] object-contain rounded-2xl bg-black"
            />
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full whitespace-nowrap">
              {lang === "en" ? selectedGallery.caption_en : selectedGallery.caption_hk} · {galleryIndex + 1} / {selectedGallery.images.length}
            </div>
          </div>

          {/* Next arrow */}
          {selectedGallery.images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); showGalleryImage(1); }}
              aria-label="Next photo"
              className="fixed right-2 sm:right-6 top-1/2 -translate-y-1/2 z-[110] w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 hover:bg-white text-[#1A2E4A] flex items-center justify-center shadow-md text-2xl transition-colors"
            >
              ›
            </button>
          )}
        </div>
      )}

      {/* ── SUNDAY BULLETIN ───────────────────────────────────────── */}
      {content.bulletin_items && content.bulletin_items.length > 0 && (
        <section className="py-16 bg-[#F8F7F4]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10">
              <SectionLabel text="ZINGPUMH CAAN HMANNAK" color={tc.accent} />
              <h2 className="text-3xl lg:text-4xl text-[#1A2E4A]">Sunday Bulletin</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {content.bulletin_items.map((b: BulletinItem) => {
                const cover = (b.files ?? [])[0];
                const pageCount = (b.files ?? []).length;
                return (
                  <button
                    key={b.id}
                    onClick={() => { setSelectedBulletin(b); setBulletinPage(0); }}
                    className="group text-left bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                      {cover
                        ? <img src={cover} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        : <div className="w-full h-full flex items-center justify-center">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.2">
                              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                              <path d="m21 15-5-5L5 21"/>
                            </svg>
                          </div>
                      }
                      {pageCount > 1 && (
                        <span className="absolute top-2 right-2 bg-black/50 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {pageCount}p
                        </span>
                      )}
                      <div className="absolute inset-0 bg-[#1A2E4A]/0 group-hover:bg-[#1A2E4A]/30 transition-all duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full p-2.5" style={{ backgroundColor: tc.accent }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-[#1A2E4A] text-xs font-semibold leading-snug line-clamp-2">{b.title}</p>
                      <p className="text-gray-400 text-[11px] mt-1">{b.date}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── BULLETIN MODAL ────────────────────────────────────────── */}
      {selectedBulletin && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedBulletin(null)}
          onTouchStart={handleTouchStart}
          onTouchEnd={(e) => handleTouchEnd(e,
            () => setBulletinPage((p) => (p + 1) % (selectedBulletin.files ?? []).length),
            () => setBulletinPage((p) => (p - 1 + (selectedBulletin.files ?? []).length) % (selectedBulletin.files ?? []).length)
          )}
        >
          <div className="relative max-w-lg w-full flex flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedBulletin(null)}
              className="absolute -top-10 right-0 text-white/70 hover:text-white text-3xl leading-none">×</button>
            <img
              src={(selectedBulletin.files ?? [])[bulletinPage]}
              alt={`${selectedBulletin.title} p.${bulletinPage + 1}`}
              className="w-full max-h-[75vh] object-contain rounded-xl shadow-2xl"
            />
            <div className="flex items-center gap-4 w-full justify-between">
              <button
                onClick={() => setBulletinPage((p) => (p - 1 + (selectedBulletin.files ?? []).length) % (selectedBulletin.files ?? []).length)}
                className="bg-white/15 hover:bg-white/30 text-white rounded-full w-10 h-10 flex items-center justify-center text-lg transition-colors"
              >‹</button>
              <div className="flex flex-col items-center gap-1.5">
                <span className="text-white/70 text-xs">{bulletinPage + 1} / {(selectedBulletin.files ?? []).length}</span>
                {/* Single download — ZIP when multiple pages, direct when one */}
                {(selectedBulletin.files ?? []).length > 1 ? (
                  <a
                    href={`/api/bulletin-zip?title=${encodeURIComponent(selectedBulletin.title)}&${(selectedBulletin.files ?? []).map(f => `file=${encodeURIComponent(f)}`).join("&")}`}
                    download
                    onClick={(e) => e.stopPropagation()}
                    style={{ color: "#ffffff", backgroundColor: tc.accent }}
                    className="inline-flex items-center gap-1.5 hover:brightness-90 text-xs font-semibold px-4 py-1.5 rounded-full transition-all"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Download All ({(selectedBulletin.files ?? []).length} pages)
                  </a>
                ) : (
                  <a
                    href={(selectedBulletin.files ?? [])[0]}
                    download
                    onClick={(e) => e.stopPropagation()}
                    style={{ color: "#ffffff", backgroundColor: tc.accent }}
                    className="inline-flex items-center gap-1.5 hover:brightness-90 text-xs font-semibold px-4 py-1.5 rounded-full transition-all"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Download
                  </a>
                )}
              </div>
              <button
                onClick={() => setBulletinPage((p) => (p + 1) % (selectedBulletin.files ?? []).length)}
                className="bg-white/15 hover:bg-white/30 text-white rounded-full w-10 h-10 flex items-center justify-center text-lg transition-colors"
              >›</button>
            </div>
            <p className="text-white/60 text-xs text-center">{selectedBulletin.title} · {selectedBulletin.date}</p>
          </div>
        </div>
      )}

      {/* ── MISSION FULL-SCREEN VIEW ───────────────────────────────── */}
      {selectedMission && (
        <div
          className="mission-page-enter fixed inset-0 z-50 bg-white overflow-y-auto"
          onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchStartX === null) return;
            if (e.changedTouches[0].clientX - touchStartX > 80) setSelectedMission(null);
            setTouchStartX(null);
          }}
        >
          {/* Sticky top bar */}
          <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100">
            <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
              <button
                onClick={() => setSelectedMission(null)}
                className="flex items-center gap-2 text-[#1A2E4A] font-semibold text-sm hover:text-[#C9A454] transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                {lang === "en" ? "Back" : "Hlan Lut"}
              </button>
              <span className="text-gray-300">|</span>
              <span className="text-gray-500 text-sm truncate">
                {lang === "en" ? selectedMission.title_en : selectedMission.title_hk}
              </span>
            </div>
          </div>

          {/* Hero image — full width */}
          {selectedMission.image && (
            <div className="w-full aspect-video sm:aspect-[21/9] overflow-hidden bg-[#1A2E4A]">
              <img
                src={selectedMission.image}
                alt={lang === "en" ? selectedMission.title_en : selectedMission.title_hk}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Article body */}
          <div className="max-w-3xl mx-auto px-4 sm:px-8 py-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#1A2E4A] leading-tight mb-6">
              {lang === "en" ? selectedMission.title_en : selectedMission.title_hk}
            </h1>

            {/* Excerpt */}
            {(lang === "en" ? selectedMission.description_en : selectedMission.description_hk) && (
              <p className="text-lg font-semibold leading-relaxed mb-8 border-l-4 pl-5" style={{ color: tc.accent, borderColor: tc.accent }}>
                {lang === "en" ? selectedMission.description_en : selectedMission.description_hk}
              </p>
            )}

            {/* Full content — blocks */}
            <div className="space-y-6">
              {selectedMission.blocks && selectedMission.blocks.length > 0 ? (
                selectedMission.blocks.map((block, i) => {
                  if (block.type === "text") {
                    return (
                      <div key={i} className="space-y-4">
                        {(lang === "en" ? block.en : block.hk).split("\n").filter(Boolean).map((para, j) => (
                          <p key={j} className="text-base sm:text-lg text-gray-700 leading-relaxed">{para}</p>
                        ))}
                      </div>
                    );
                  }
                  if (block.type === "image") {
                    const sizeClass = block.size === "small" ? "max-w-xs" : block.size === "medium" ? "max-w-md" : "w-full";
                    const alignClass = block.align === "left" ? "mr-auto" : block.align === "right" ? "ml-auto" : "mx-auto";
                    return (
                      <figure key={i} className={`${sizeClass} ${alignClass}`}>
                        <img src={block.src} alt={lang === "en" ? block.caption_en : block.caption_hk} className="w-full rounded-xl object-cover" />
                        {(lang === "en" ? block.caption_en : block.caption_hk) && (
                          <figcaption className="text-sm text-gray-400 italic text-center mt-2">
                            {lang === "en" ? block.caption_en : block.caption_hk}
                          </figcaption>
                        )}
                      </figure>
                    );
                  }
                  return null;
                })
              ) : (
                <p className="text-gray-400 italic">No full content added yet.</p>
              )}
            </div>

            {/* Back button at bottom */}
            <div className="mt-14 pt-8 border-t border-gray-100">
              <button
                onClick={() => setSelectedMission(null)}
                className="inline-flex items-center gap-2 bg-[#1A2E4A] hover:bg-[#243D5C] text-white font-semibold px-6 py-3 rounded-full text-sm transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                {lang === "en" ? "Back to Mission" : "Kan Tuanbia Hlan Lut"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── FOOTER ─────────────────────────────────────────────────── */}
      <footer id="contact" className="text-white pt-16 pb-8" style={{ backgroundColor: tc.footerBg }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">

            {/* About */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={b.logoUrl}
                  alt={`${lang === "en" ? b.churchName_en : b.churchName_hk} Logo`}
                  className="h-14 w-auto object-contain shrink-0"
                />
                <div>
                  <p className="font-bold text-sm">{lang === "en" ? b.churchName_en : b.churchName_hk}</p>
                  <p className="text-white/40 text-xs">{lang === "en" ? b.subtitle_en : b.subtitle_hk}</p>
                </div>
              </div>
              <p className="text-white/45 text-sm leading-relaxed mb-6">{l.footer.tagline}</p>
              {/* Social */}
              <div className="flex gap-3">
                {(["facebook", "youtube", "instagram"] as const).map((s) => {
                  const hrefs = {
                    facebook: b.facebookUrl || "#",
                    youtube:  b.youtubeUrl  || "#",
                    instagram:b.instagramUrl|| "#",
                  };
                  return (
                  <a
                    key={s}
                    href={hrefs[s]}
                    target={hrefs[s] !== "#" ? "_blank" : undefined}
                    rel={hrefs[s] !== "#" ? "noopener noreferrer" : undefined}
                    className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-white/40 hover:border-[#C9A454] hover:text-[#C9A454] transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      {s === "facebook" && (
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                      )}
                      {s === "youtube" && (
                        <>
                          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.41 19.1C5.12 19.56 12 19.56 12 19.56s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.48z" />
                          <polygon fill={tc.footerBg} points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
                        </>
                      )}
                      {s === "instagram" && (
                        <>
                          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                          <circle cx="12" cy="12" r="4" fill={tc.footerBg} />
                          <circle cx="17.5" cy="6.5" r="1.5" fill={tc.footerBg} />
                        </>
                      )}
                    </svg>
                  </a>
                  );
                })}
              </div>
            </div>

            {/* Quick links */}
            <div>
              <p className="font-bold text-xs tracking-[0.25em] uppercase mb-5" style={{ color: tc.accent }}>
                {l.footer.quickLinks}
              </p>
              <ul className="space-y-3">
                {l.footer.nav.map((item, i) => (
                  <li key={i}>
                    <a href={FOOTER_NAV_HREFS[i]} className="text-white/45 text-sm hover:text-[#C9A454] transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Service times */}
            <div>
              <p className="font-bold text-xs tracking-[0.25em] uppercase mb-5" style={{ color: tc.accent }}>
                {l.footer.services}
              </p>
              <ul className="space-y-4">
                {l.footer.times.map((t, i) => (
                  <li key={i}>
                    <p className="text-white text-sm font-semibold">{t.day}</p>
                    <p className="text-white/45 text-xs mt-0.5">{t.time}</p>
                    <p className="text-white/30 text-xs">{t.label}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <p className="font-bold text-xs tracking-[0.25em] uppercase mb-5" style={{ color: tc.accent }}>
                {l.footer.contact}
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-white/45 text-sm">
                  <svg className="shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {l.footer.address}
                </li>
                <li className="flex items-center gap-3 text-white/45 text-sm">
                  <svg className="shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.1a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.48l3.27-.23a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.07 6.07l1.06-1.06a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <a href={`tel:${l.footer.phone}`} className="text-white/45 hover:text-white/70">{l.footer.phone}</a>
                </li>
                <li className="flex items-center gap-3 text-white/45 text-sm">
                  <svg className="shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <a href={`mailto:${l.footer.email}`} className="text-white/45 hover:text-white/70">{l.footer.email}</a>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="pt-8 text-center text-white/25 text-xs">
            {l.footer.copy}
          </div>
        </div>
      </footer>
    </div>
  );
}
