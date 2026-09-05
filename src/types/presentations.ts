export interface PresentationTopic {
  title: string;
  titleAr?: string;
  videos: string;
}

export interface PresentationFaq {
  question: string;
  questionAr: string;
  answer: string;
  answerAr: string;
}

export interface ShortsSectionVisibility {
  hero: boolean;
  topics: boolean;
  contributors: boolean;
  faqs: boolean;
  cta: boolean;
  categories: boolean;
  orgs: boolean;
}

export interface NewsSectionVisibility {
  hero: boolean;
  topics: boolean;
  contributors: boolean;
  faqs: boolean;
  cta: boolean;
  categories: boolean;
  orgs: boolean;
}

export interface InitiativesSectionVisibility {
  hero: boolean;
  topics: boolean;
  contributors: boolean;
  faqs: boolean;
  cta: boolean;
}

export interface ConsultationSectionVisibility {
  hero: boolean;
  topics: boolean;
  contributors: boolean;
  faqs: boolean;
  cta: boolean;
}

export interface EmiratesSectionVisibility {
  hero: boolean;
  topics: boolean;
  contributors: boolean;
  faqs: boolean;
  cta: boolean;
}

export interface Presentation {
  id: string;
  key: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  badge: string;
  heroImage: string;
  published: boolean;
  topics: PresentationTopic[];
  contributors: string[];
  faqs: PresentationFaq[];
  sectionVisibility: ShortsSectionVisibility;
  initiativesTopics: PresentationTopic[];
  initiativesContributors: string[];
  initiativesFaqs: PresentationFaq[];
  initiativesSectionVisibility: InitiativesSectionVisibility;
  consultationTopics: PresentationTopic[];
  consultationContributors: string[];
  consultationFaqs: PresentationFaq[];
  consultationSectionVisibility: ConsultationSectionVisibility;
  emiratesTopics: PresentationTopic[];
  emiratesContributors: string[];
  emiratesFaqs: PresentationFaq[];
  emiratesSectionVisibility: EmiratesSectionVisibility;
  newsTopics: PresentationTopic[];
  newsContributors: string[];
  newsFaqs: PresentationFaq[];
  newsSectionVisibility: NewsSectionVisibility;
}
