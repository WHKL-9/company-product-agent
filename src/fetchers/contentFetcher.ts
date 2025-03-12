import retry from "async-retry";
import axios from "axios";
import * as cheerio from "cheerio";
import { Config } from "../config/config";
import { COMPANY_PRODUCT_PATHS, CompanyName } from "../config/productPaths";
import { SitemapURL, WebpageContent } from "../types";

const BLOG_PATHS = [
  "/magazin",
  "/blog",
  "/news",
  "/pressemitteilungen",
  "/post",
  "/press",
] as const;

const ABOUT_PATHS = [
  "/ueber-uns",
  "/about-us",
  "/team",
  "/careers",
  "/jobs",
  "/kontakt",
  "/contact",
] as const;

const LEGAL_PATHS = [
  "/legal",
  "/privacy",
  "/terms",
  "/imprint",
  "/compliance",
] as const;

const SERVICE_PATHS = ["/service/", "/support/", "/faq", "/help"] as const;

const BUSINESS_PATHS = ["/b2b/", "/gewerbe", "/business"] as const;

const HOME_PATHS = ["/de/", "/en/", "/"] as const;

export class ContentFetcher {
  private config: Config;
  private company: CompanyName;

  constructor(company: CompanyName, config?: Config) {
    this.company = company;
    this.config = config || {
      openAIApiKey: "",
      maxConcurrentRequests: 5,
      requestTimeoutMs: 30000,
    };
  }

  isProductPath(path: string): boolean {
    return COMPANY_PRODUCT_PATHS[this.company].some((productPath) =>
      path.toLowerCase().includes(productPath.toLowerCase())
    );
  }

  /**
   * Determines the type of a webpage based on its URL and content.
   * @param url - The URL of the webpage.
   * @param $ - The Cheerio API instance for the webpage.
   * @returns The type of the webpage ("product", "blog", "about", "legal", "service", "business", or "other").
   */
  determinePageType(
    url: string,
    $: cheerio.CheerioAPI
  ): WebpageContent["pageType"] {
    const path = new URL(url).pathname.toLowerCase();

    // Early return for homepage (exact match)
    if (HOME_PATHS.some((p) => path === p)) return "homepage";

    // Check path patterns
    const matchedPattern = (() => {
      if (this.isProductPath(path)) {
        return "product";
      } else if (BLOG_PATHS.some((p) => path.includes(p))) {
        return "blog";
      } else if (ABOUT_PATHS.some((p) => path.includes(p))) {
        return "about";
      } else if (LEGAL_PATHS.some((p) => path.includes(p))) {
        return "legal";
      } else if (SERVICE_PATHS.some((p) => path.includes(p))) {
        return "service";
      } else if (BUSINESS_PATHS.some((p) => path.includes(p))) {
        return "business";
      } else {
        return "other";
      }
    })();

    return matchedPattern;
  }

  /**
   * Fetches the content of a webpage and returns a WebpageContent object.
   * @param url - The URL of the webpage to fetch.
   * @returns A WebpageContent object containing the webpage's content, type, and metadata.
   */
  async fetch(url: SitemapURL): Promise<WebpageContent> {
    const result = await retry(
      async (bail) => {
        try {
          const response = await axios.get(url.loc, {
            timeout: this.config.requestTimeoutMs,
          });
          const $ = cheerio.load(response.data);

          // Extract meaningful content
          const title = $("title").text();
          const headings = $("h1, h2, h3")
            .map((_, el) => $(el).text())
            .get();
          const paragraphs = $("p")
            .map((_, el) => $(el).text())
            .get();

          const extractedText = [...headings, ...paragraphs].join("\n");

          return {
            url: url.loc,
            htmlContent: response.data,
            extractedText,
            title,
            pageType: this.determinePageType(url.loc, $),
            lastModified: url.lastmod,
          } as WebpageContent;
        } catch (error: any) {
          if (error.response?.status === 404) {
            bail(new Error(`404 for ${url.loc}`));
          }
          throw error;
        }
      },
      {
        retries: 3,
        factor: 2,
        minTimeout: 2000,
      }
    );

    if (!result) {
      throw new Error(`Failed to fetch ${url.loc}`);
    }

    return result;
  }
}
