import { XMLParser } from "fast-xml-parser";
import { SitemapURL } from "../types";

export class SitemapParser {
  private parser: XMLParser;

  constructor() {
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
    });
  }

  async parse(xmlContent: string): Promise<SitemapURL[]> {
    try {
      const parsed = this.parser.parse(xmlContent);
      const urls = parsed.urlset?.url || [];

      return urls.map((url: any) => ({
        loc: url.loc,
        lastmod: url.lastmod,
        priority: parseFloat(url.priority),
      }));
    } catch (error) {
      console.error("Error parsing sitemap:", error);
      throw error;
    }
  }
}
