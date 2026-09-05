export interface FloatingCard {
  label: string;
  labelAr: string;
  sublabel: string;
  sublabelAr: string;
}

export interface StatItem {
  value: string;
  title: string;
  titleAr: string;
  subtitle: string;
  subtitleAr: string;
}

export interface HomepageContent {
  id: string;
  // Hero
  heroEyebrow: string;
  heroEyebrowAr: string;
  heroTitle: string;
  heroTitleAr: string;
  heroSubtitle: string;
  heroSubtitleAr: string;
  heroSearchPlaceholder: string;
  heroSearchPlaceholderAr: string;
  heroSearchButton: string;
  heroSearchButtonAr: string;
  heroPrimaryCtaLabel: string;
  heroPrimaryCtaLabelAr: string;
  heroPrimaryCtaLink: string;
  heroSecondaryCtaLabel: string;
  heroSecondaryCtaLabelAr: string;
  heroSecondaryCtaLink: string;
  heroImage: string;
  heroImageAlt: string;
  heroFloatingCards: FloatingCard[];
  // Stats
  stats: StatItem[];
  // Shorts
  shortsTitle: string;
  shortsTitleAr: string;
  shortsSubtitle: string;
  shortsSubtitleAr: string;
  shortsCtaLabel: string;
  shortsCtaLabelAr: string;
  shortsEmptyText: string;
  shortsEmptyTextAr: string;
  // News
  newsTitle: string;
  newsTitleAr: string;
  newsSubtitle: string;
  newsSubtitleAr: string;
  newsCtaLabel: string;
  newsCtaLabelAr: string;
  // Initiatives
  initiativesTitle: string;
  initiativesTitleAr: string;
  initiativesSubtitle: string;
  initiativesSubtitleAr: string;
  initiativesCtaLabel: string;
  initiativesCtaLabelAr: string;
  // Consultations
  consultationsTitle: string;
  consultationsTitleAr: string;
  consultationsSubtitle: string;
  consultationsSubtitleAr: string;
  consultationsCtaLabel: string;
  consultationsCtaLabelAr: string;
  consultationsFreeTab: string;
  consultationsFreeTabAr: string;
  consultationsPaidTab: string;
  consultationsPaidTabAr: string;
  // Emirates
  emiratesTitle: string;
  emiratesTitleAr: string;
  emiratesSubtitle: string;
  emiratesSubtitleAr: string;
  emiratesCapitalLabel: string;
  emiratesCapitalLabelAr: string;
  emiratesHeadquartersLabel: string;
  emiratesHeadquartersLabelAr: string;
  emiratesCtaLabel: string;
  emiratesCtaLabelAr: string;
  // CTA
  ctaTitle: string;
  ctaTitleAr: string;
  ctaSubtitle: string;
  ctaSubtitleAr: string;
  ctaPrimaryLabel: string;
  ctaPrimaryLabelAr: string;
  ctaPrimaryLink: string;
  ctaSecondaryLabel: string;
  ctaSecondaryLabelAr: string;
  ctaSecondaryLink: string;
  // Visibility
  published: boolean;
  sectionVisibility: SectionVisibility;
}

export interface SectionVisibility {
  hero: boolean;
  stats: boolean;
  shorts: boolean;
  news: boolean;
  initiatives: boolean;
  consultations: boolean;
  emirates: boolean;
  cta: boolean;
}

export const DEFAULT_SECTION_VISIBILITY: SectionVisibility = {
  hero: true,
  stats: true,
  shorts: true,
  news: true,
  initiatives: true,
  consultations: true,
  emirates: true,
  cta: true,
};

export const SECTION_VISIBILITY_LABELS: Record<keyof SectionVisibility, string> = {
  hero: 'Show Hero Section',
  stats: 'Show Stats Section',
  shorts: 'Show Shorts Section',
  news: 'Show Latest News Section',
  initiatives: 'Show Initiatives Section',
  consultations: 'Show Consultations Section',
  emirates: 'Show Emirates Section',
  cta: 'Show Call-To-Action Section',
};
