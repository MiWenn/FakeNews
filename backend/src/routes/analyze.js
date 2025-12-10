import express from 'express';
import { validateUrl } from '../utils/urlValidator.js';
import { scrapeUrl } from '../services/scraper.js';
import { analyzeContent } from '../services/claudeAnalyzer.js';

const router = express.Router();

router.post('/analyze', async (req, res) => {
  try {
    const { url } = req.body;

    // Validate URL
    const validation = validateUrl(url);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Invalid URL',
        message: validation.error
      });
    }

    // Scrape content from URL
    const scrapedData = await scrapeUrl(url);

    if (!scrapedData.success) {
      return res.status(400).json({
        error: 'Scraping failed',
        message: scrapedData.error
      });
    }

    // Analyze content with Claude AI
    const analysis = await analyzeContent(url, scrapedData.content);

    // Return complete analysis
    res.json({
      success: true,
      url,
      analysis
    });

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      error: 'Analysis failed',
      message: error.message
    });
  }
});

export default router;
