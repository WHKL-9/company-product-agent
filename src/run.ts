import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";
import { EnergyWebsiteAnalyzer } from "./index";

// Load environment variables
dotenv.config();

async function main() {
  try {
    const analyzer = new EnergyWebsiteAnalyzer();
    const companyName = "ostrom"; // Extract from sitemap path or pass as parameter
    const sitemap = await fs.readFile(
      path.join(__dirname, "parsers/ostrom/ostrom_sitemap.xml"),
      "utf-8"
    );

    // Create output directory if it doesn't exist
    await fs.mkdir(path.join(__dirname, "../output"), { recursive: true });

    await analyzer.analyze(
      sitemap,
      path.join(__dirname, `../output/${companyName}_analysis.json`),
      400
    );
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
