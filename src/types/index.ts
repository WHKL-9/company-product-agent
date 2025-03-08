export type SitemapURL = {
  loc: string;
  lastmod?: string;
  priority?: number;
};

export type WebpageContent = {
  url: string;
  htmlContent: string;
  extractedText: string;
  title: string;
  pageType:
    | "homepage"
    | "product"
    | "blog"
    | "news"
    | "about"
    | "legal"
    | "service"
    | "business"
    | "other";
  lastModified?: string;
};

export type ProductAnalysis = {
  name: string;
  description: string;
  primaryPurpose: string;
  strategicImportance: string;
  integrationInEcosystem: string;
  marketPotentialAssessment: {
    trend: "rapid growth" | "moderate growth" | "stable" | "declining";
    reasoning: string;
    scalingChallenges: Array<{
      challenge: string;
      explanation: string;
      examples: string;
      sources: string;
      competitiveContext: string;
      futurePerspective: string;
    }>;
  };
};

export type GeneralAnalysis = {
  summary: string;
  keyPoints: string[];
  relevantInsights: string;
};

export type StructuredSummary = {
  url: string;
  pageType: string;
  title: string;
  lastModified?: string;
  analysis: ProductAnalysis | GeneralAnalysis;
  metadata: {
    analyzedAt: string;
    responseId: string;
    model: string;
    analysisType: "detailed" | "general";
  };
};
