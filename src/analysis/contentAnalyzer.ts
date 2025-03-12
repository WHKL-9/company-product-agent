import OpenAI from "openai";
import { StructuredSummary, WebpageContent } from "../types";

export class ContentAnalyzer {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  async analyze(content: WebpageContent): Promise<StructuredSummary> {
    try {
      // Choose analysis strategy based on page type
      const analysis =
        content.pageType === "product"
          ? await this.analyzeProductPage(content)
          : await this.analyzeGeneralPage(content);

      return {
        url: content.url,
        pageType: content.pageType,
        title: content.title,
        lastModified: content.lastModified,
        analysis,
        metadata: {
          analyzedAt: new Date().toISOString(),
          responseId: analysis.responseId,
          model: analysis.model,
          analysisType: content.pageType === "product" ? "detailed" : "general",
        },
      };
    } catch (error) {
      console.error(`Error analyzing ${content.url}:`, error);
      throw error;
    }
  }

  /**
   * Analyzes a product page through a 4-pass AI analysis process:
   * 1. First pass: Identifies general market challenges
   * 2. Second pass: Analyzes German/EU-specific market context
   * 3. Third pass: Evaluates competitive landscape and market trends
   * 4. Final pass: Synthesizes insights into structured JSON format
   *
   * @param content - The webpage content to analyze, including URL, title, and extracted text
   * @returns A structured analysis with product details, market assessment, and scaling challenges
   * @throws Error if OpenAI API calls fail or response parsing errors occur
   */
  private async analyzeProductPage(content: WebpageContent) {
    // First pass: General market challenges
    const firstPassPrompt = `Analyze this webpage for general market challenges:
    URL: ${content.url}
    Title: ${content.title}
    Content: ${content.extractedText.substring(0, 2000)}`;

    const firstPass = await this.openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: firstPassPrompt }],
    });

    // Second pass: Regional specific challenges
    const secondPassPrompt = `Given this initial analysis: ${firstPass.choices[0].message.content}
    Now focus on specific challenges in the German and European market context, including:
    - Regional regulatory frameworks
    - Local market dynamics
    - Consumer behavior in German/EU markets`;

    const secondPass = await this.openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "user", content: firstPassPrompt },
        { role: "assistant", content: firstPass.choices[0].message.content },
        { role: "user", content: secondPassPrompt },
      ],
    });

    // Third pass: Competitive intelligence and market foresight
    const thirdPassPrompt = `Based on previous analyses, provide deep insights on:
    1. Competitive Landscape:
       - Key competitors (e.g., Enpal, Sonnen, Tesla Energy)
       - Market positioning
       - Unique selling propositions
    2. Future Market Evolution:
       - Regulatory trends
       - Technology adoption curves
       - Consumer behavior shifts
    3. Strategic Implications:
       - Growth bottlenecks
       - Market opportunities
       - Risk mitigation strategies`;

    const thirdPass = await this.openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "user", content: firstPassPrompt },
        { role: "assistant", content: firstPass.choices[0].message.content },
        { role: "user", content: secondPassPrompt },
        { role: "assistant", content: secondPass.choices[0].message.content },
        { role: "user", content: thirdPassPrompt },
      ],
    });

    // Final pass: Synthesize all insights into structured format
    const finalPassPrompt = `Synthesize all previous analyses into a comprehensive JSON format:
    General Analysis: ${firstPass.choices[0].message.content}
    Regional Analysis: ${secondPass.choices[0].message.content}
    Strategic Analysis: ${thirdPass.choices[0].message.content}

    Provide final structured analysis in this JSON format:
    {
      "productsOrServices": [{
        "name": "product name",
        "description": "detailed description",
        "primaryPurpose": "main benefit/purpose",
        "strategicImportance": "strategic value with competitive context",
        "integrationInEcosystem": "ecosystem fit and market positioning",
        "marketPotentialAssessment": {
          "trend": "rapid growth|moderate growth|stable|declining",
          "reasoning": "comprehensive market analysis synthesis",
          "scalingChallenges": [
            {
              "challenge": "specific challenge name",
              "explanation": "detailed explanation with competitive context",
              "examples": "concrete industry examples",
              "sources": "specific external URLs, research papers, or regulatory documents (provide full URLs when available)",
              "competitiveContext": "how competitors address this challenge",
              "futurePerspective": "how this challenge might evolve"
            }
          ]
        }
      }]
    }`;

    const finalPass = await this.openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "user", content: firstPassPrompt },
        { role: "assistant", content: firstPass.choices[0].message.content },
        { role: "user", content: secondPassPrompt },
        { role: "assistant", content: secondPass.choices[0].message.content },
        { role: "user", content: thirdPassPrompt },
        { role: "assistant", content: thirdPass.choices[0].message.content },
        { role: "user", content: finalPassPrompt },
      ],
      response_format: { type: "json_object" },
    });

    const aiResponse = JSON.parse(
      finalPass.choices[0]?.message?.content || "{}"
    );

    return {
      ...aiResponse,
      responseId: finalPass.id,
      model: finalPass.model,
    };
  }

  private async analyzeGeneralPage(content: WebpageContent) {
    const prompt = `Analyze this webpage and provide a general analysis:
    URL: ${content.url}
    Title: ${content.title}
    Content: ${content.extractedText.substring(0, 2000)}

    Provide analysis in this JSON format:
    {
      "summary": "brief overview",
      "keyPoints": ["key point 1", "key point 2", ...],
      "relevantInsights": "any strategic/market insights if applicable"
    }`;

    const response = await this.openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    return {
      ...JSON.parse(response.choices[0]?.message?.content || "{}"),
      responseId: response.id,
      model: response.model,
    };
  }
}
