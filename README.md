# Energy Website Analyzer

Analyzes energy company websites using AI to extract product and market insights.

## Features

- Sitemap-based crawling
- AI-powered content analysis
- Product vs general page differentiation
- Concurrent processing with rate limiting
- Cost-efficient AI processing
- Full analysis traceability (ChatGPT response IDs and sources)

The analyzer processes:

- Product pages with 4-pass detailed analysis with GPT-3.5 (50-55% cheaper than GPT-4)
  1. General market analysis
  2. Regional/EU-specific insights
  3. Competitive intelligence
  4. Strategic synthesis
- Other pages with single-pass general analysis with GPT-3.5
- Results saved to `output/{company}_analysis.json` with:
  - Analysis metadata (timestamps, model used)
  - ChatGPT response IDs for each analysis pass
  - Source URLs and references
  - Full analysis context

## Page Types

- Homepage
- Products (solar, batteries, heat pumps, etc.)
- Blog/News
- About/Company
- Legal
- Service
- Business/B2B
- Other

## Project Structure

```
src/
├── analysis/        # AI analysis logic
├── fetchers/        # Web crawling
├── parsers/         # XML parsing
├── types/          # TypeScript types
├── config/         # Configuration
└── cache/          # Caching logic
```

## Dependencies

- OpenAI API (GPT-3.5)
- Cheerio (HTML parsing)
- Axios (HTTP requests)
- CLI Progress
- Fast XML Parser
