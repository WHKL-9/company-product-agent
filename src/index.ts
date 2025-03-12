import * as cheerio from "cheerio";
import cliProgress from "cli-progress";
import fs from "fs/promises";
import pLimit from "p-limit";
import { ContentAnalyzer } from "./analysis/contentAnalyzer";
import { Config, getConfig } from "./config/config";
import { CompanyName } from "./config/productPaths";
import { ContentFetcher } from "./fetchers/contentFetcher";
import { SitemapParser } from "./parsers/sitemapParser";
import { SitemapURL, StructuredSummary, WebpageContent } from "./types";

export class EnergyWebsiteAnalyzer {
  private readonly sitemapParser: SitemapParser;
  private readonly contentAnalyzer: ContentAnalyzer;
  private readonly config: Config;
  private readonly limit: ReturnType<typeof pLimit>;

  constructor(config?: Partial<Config>) {
    this.config = { ...getConfig(), ...config };
    this.sitemapParser = new SitemapParser();
    this.contentAnalyzer = new ContentAnalyzer(this.config.openAIApiKey);
    this.limit = pLimit(5);
  }

  private createContentFetcher(company: CompanyName): ContentFetcher {
    return new ContentFetcher(company, this.config);
  }

  private determinePageType(
    url: string,
    contentFetcher: ContentFetcher
  ): WebpageContent["pageType"] {
    const $ = cheerio.load("<html></html>");
    return contentFetcher.determinePageType(url, $);
  }

  /**
   * Analyzes the content of a website and saves the results to a file.
   * @param sitemapXml - The sitemap of the website to analyze.
   * @param outputPath - The path to save the results to.
   * @param urlLimit - The number of URLs to analyze.
   * @returns The summaries of the analyzed content.
   */
  async analyze(
    sitemapXml: string,
    outputPath?: string,
    urlLimit: number = 200
  ): Promise<StructuredSummary[]> {
    const progressBar = new cliProgress.SingleBar(
      { format: " {bar} {percentage}% | ETA: {eta}s | {value}/{total} URLs" },
      cliProgress.Presets.shades_classic
    );

    try {
      // Extract company name from sitemap and initialize contentFetcher
      const company = this.extractCompanyName(sitemapXml);
      const contentFetcher = this.createContentFetcher(company);

      const urls = (await this.sitemapParser.parse(sitemapXml)).slice(
        0,
        urlLimit
      );
      progressBar.start(urls.length, 0);

      // Group URLs by page type for optimized processing
      const productUrls: SitemapURL[] = [];
      const otherUrls: SitemapURL[] = [];

      urls.forEach((url) => {
        const pageType = this.determinePageType(url.loc, contentFetcher);
        if (pageType === "product") {
          productUrls.push(url);
        } else {
          otherUrls.push(url);
        }
      });

      // Process URLs and update progress
      const results = await Promise.all([
        ...productUrls.map(async (url) => {
          const result = await this.limit(() =>
            this.processUrl(url, contentFetcher)
          );
          progressBar.increment();
          return result;
        }),
        ...otherUrls.map(async (url) => {
          const result = await this.limit(() =>
            this.processUrl(url, contentFetcher)
          );
          progressBar.increment();
          return result;
        }),
      ]);

      progressBar.stop();

      // Save results to file if outputPath is provided
      if (outputPath) {
        const jsonOutput = JSON.stringify(results, null, 2);
        await fs.writeFile(outputPath, jsonOutput);
        console.log(`\n✓ Results saved to ${outputPath}`);
        console.log(`Successfully analyzed ${results.length} URLs`);
      }

      return results.filter(
        (result): result is StructuredSummary => result !== null
      );
    } catch (error) {
      progressBar.stop();
      throw error;
    }
  }

  private async processUrl(url: SitemapURL, contentFetcher: ContentFetcher) {
    try {
      const content = await contentFetcher.fetch(url);
      return await this.contentAnalyzer.analyze(content);
    } catch (error) {
      console.error(`Error processing ${url.loc}:`, error);
      return null;
    }
  }

  private extractCompanyName(sitemap: string): CompanyName {
    if (sitemap.includes("1komma5")) return "1komma5";
    if (sitemap.includes("ostrom")) return "ostrom";
    if (sitemap.includes("spotmyenergy")) return "spotmyenergy";
    throw new Error("Unknown company");
  }
}
