import fs from "fs/promises";
import path from "path";

export class AnalysisCache {
  private cacheDir: string;

  constructor(cacheDir: string = ".cache") {
    this.cacheDir = cacheDir;
  }

  async get(url: string) {
    try {
      const cachePath = this.getCachePath(url);
      const data = await fs.readFile(cachePath, "utf-8");
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  async set(url: string, data: any) {
    try {
      const cachePath = this.getCachePath(url);
      await fs.mkdir(path.dirname(cachePath), { recursive: true });
      await fs.writeFile(cachePath, JSON.stringify(data));
    } catch (error) {
      console.error(`Cache write error for ${url}:`, error);
    }
  }

  private getCachePath(url: string) {
    const urlHash = Buffer.from(url).toString("base64");
    return path.join(this.cacheDir, `${urlHash}.json`);
  }
}
