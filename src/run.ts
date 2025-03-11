import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";
import { EnergyWebsiteAnalyzer } from "./index";

// Load environment variables
dotenv.config();

async function main() {
  try {
    // Get company name from command line arguments
    const companyName = process.argv[2];

    if (!companyName) {
      console.error(
        "Error: Company name is required. Usage: npm run start -- companyName"
      );
      process.exit(1);
    }

    const analyzer = new EnergyWebsiteAnalyzer();

    // Construct sitemap path dynamically based on company name
    const sitemapPath = path.join(
      __dirname,
      `parsers/${companyName}/${companyName}_sitemap.xml`
    );

    // Check if sitemap file exists
    try {
      await fs.access(sitemapPath);
    } catch (error) {
      console.error(`Error: Sitemap file not found at ${sitemapPath}`);
      process.exit(1);
    }

    const sitemap = await fs.readFile(sitemapPath, "utf-8");

    // Create output directory if it doesn't exist
    await fs.mkdir(path.join(__dirname, "../output"), { recursive: true });

    await analyzer.analyze(
      sitemap,
      path.join(__dirname, `../output/${companyName}_analysis.json`),
      400
    );

    console.log(
      `Analysis complete for ${companyName}. Results saved to output/${companyName}_analysis.json`
    );
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
