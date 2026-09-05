export interface PresentationTopic {
  title: string;
  videos: string;
}

export interface PresentationFaq {
  question: string;
  questionAr: string;
  answer: string;
  answerAr: string;
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
}
