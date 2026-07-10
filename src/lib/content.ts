import fs from "fs";
import path from "path";

const contentPath = path.join(process.cwd(), "data", "content.json");

export type EventItem = {
  id: string;
  day: string;
  month: string;
  time: string;
  title_en: string;
  place_en: string;
  title_hk: string;
  place_hk: string;
};

export type SermonItem = {
  id: string;
  title_en: string;
  title_hk: string;
  speaker: string;
  scripture: string;
  date: string;
};

export type ContentBlock =
  | { type: "text"; en: string; hk: string }
  | { type: "image"; src: string; caption_en: string; caption_hk: string; size: "small" | "medium" | "full"; align: "left" | "center" | "right" };

export type MissionItem = {
  id: string;
  title_en: string;
  title_hk: string;
  description_en: string;
  description_hk: string;
  image: string;
  blocks: ContentBlock[];
};

export type GalleryItem = {
  id: string;
  image: string;
  images: string[];
  caption_en: string;
  caption_hk: string;
};

export type LeaderItem = {
  id: string;
  image: string;
  name: string;
  position_en: string;
  position_hk: string;
  term: string;
  status: "current" | "former";
};

export type BulletinItem = {
  id: string;
  title: string;
  date: string;
  files: string[];
};

export type BuildingItem = {
  id: string;
  image: string;
  name_en: string;
  name_hk: string;
  caption_en: string;
  caption_hk: string;
  history_en: string;
  history_hk: string;
};

export type LangContent = {
  nav: { home: string; about: string; events: string; gallery: string; contact: string };
  hero: { eyebrow: string; title: string[]; sub: string; cta1: string; cta2: string };
  infoBar: Array<{ title: string; value: string }>;
  about: { eyebrow: string; heading: string; p1: string; p2: string; cta: string };
  leaders: { eyebrow: string; heading: string; current: string; former: string };
  buildings: { eyebrow: string; heading: string };
  features: { eyebrow: string; heading: string; items: Array<{ label: string; body: string; link: string }> };
  mission: { eyebrow: string; heading: string; sub: string };
  events: { eyebrow: string; heading: string; viewAll: string; register: string };
  verse: { text: string; ref: string };
  gallery: { eyebrow: string; heading: string; viewAll: string };
  cta: { heading: string; sub: string; button: string; placeholder: string; successMsg: string; errorMsg: string };
  footer: {
    tagline: string; quickLinks: string; services: string; contact: string;
    nav: string[];
    times: Array<{ day: string; time: string; label: string }>;
    address: string; phone: string; email: string; copy: string;
  };
};

export type SeasonTheme = "default" | "christmas" | "good-friday" | "easter";

export type BrandingConfig = {
  churchName_en: string;
  churchName_hk: string;
  subtitle_en: string;
  subtitle_hk: string;
  logoUrl: string;
  heroImageUrl: string;
  aboutImageUrl: string;
  facebookUrl: string;
  youtubeUrl: string;
  instagramUrl: string;
};

export type SiteContent = {
  en: LangContent;
  hk: LangContent;
  events_items: EventItem[];
  leaders_items: LeaderItem[];
  buildings_items: BuildingItem[];
  gallery_items: GalleryItem[];
  bulletin_items: BulletinItem[];
  mission_items: MissionItem[];
  activeTheme: SeasonTheme;
  branding: BrandingConfig;
};

export function readContent(): SiteContent {
  const raw = fs.readFileSync(contentPath, "utf-8");
  return JSON.parse(raw) as SiteContent;
}

export function writeContent(data: SiteContent): void {
  fs.writeFileSync(contentPath, JSON.stringify(data, null, 2), "utf-8");
}
