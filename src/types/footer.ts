export interface FooterLink {
  label: string;
  labelAr?: string;
  href: string;
}

export interface FooterContent {
  id: string;
  logoUrl: string;
  brandText: string;
  brandTextAr: string;
  governmentLabel: string;
  governmentLabelAr: string;
  quickLinksHeading: string;
  quickLinksHeadingAr: string;
  resourceLinksHeading: string;
  resourceLinksHeadingAr: string;
  contactsHeading: string;
  contactsHeadingAr: string;
  quickLinks: FooterLink[];
  resourceLinks: FooterLink[];
  phone: string;
  email: string;
  address: string;
  addressAr: string;
  copyrightText: string;
  copyrightTextAr: string;
  builtForText: string;
  builtForTextAr: string;
  // Visibility
  published: boolean;
  sectionVisibility?: Record<string, boolean>;
}
