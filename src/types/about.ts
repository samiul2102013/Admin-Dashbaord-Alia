export interface AboutContent {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  browseSession: string;
  browseSessionAr: string;
  contactSupport: string;
  contactSupportAr: string;
  heroImage: string;
  heroImageAlt: string;
  // Our Story
  ourStory: string;
  ourStoryAr: string;
  ourStoryText: string;
  ourStoryTextAr: string;
  // Our Mission
  ourMission: string;
  ourMissionAr: string;
  ourMissionText: string;
  ourMissionTextAr: string;
  // Our Vision
  ourVision: string;
  ourVisionAr: string;
  ourVisionText: string;
  ourVisionTextAr: string;
  // Our Objective
  ourObjective: string;
  ourObjectiveAr: string;
  ourObjectiveText: string;
  ourObjectiveTextAr: string;
  objectives: string[];
  // What We Offer
  whatWeOffer: string;
  whatWeOfferAr: string;
  whatWeOfferText: string;
  whatWeOfferTextAr: string;
  offerings: { title: string; titleAr: string; desc: string; descAr: string }[];
  // Our Impact
  ourImpact: string;
  ourImpactAr: string;
  ourImpactText: string;
  ourImpactTextAr: string;
  impact: { label: string; labelAr: string; value: string; valueAr: string }[];
  // Why Choose
  whyChoose: string;
  whyChooseAr: string;
  whyChooseText: string;
  whyChooseTextAr: string;
  whyValues: string[];
  // Core Values
  coreValues: string;
  coreValuesAr: string;
  coreValuesText: string;
  coreValuesTextAr: string;
  coreValueList: string[];
  // Visibility
  published: boolean;
}
