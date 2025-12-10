import axios from 'axios';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';

/**
 * Scrapes content from a URL using Cheerio (fast) or Puppeteer (for JS-heavy sites)
 */
export async function scrapeUrl(url, usePuppeteer = false) {
  try {
    if (usePuppeteer) {
      return await scrapeWithPuppeteer(url);
    } else {
      return await scrapeWithCheerio(url);
    }
  } catch (error) {
    console.error('Scraping error:', error);

    // Fallback to Puppeteer if Cheerio fails
    if (!usePuppeteer) {
      console.log('Falling back to Puppeteer...');
      return await scrapeWithPuppeteer(url);
    }

    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Fast scraping with Cheerio
 */
async function scrapeWithCheerio(url) {
  const response = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    },
    timeout: 10000,
    maxRedirects: 5
  });

  const $ = cheerio.load(response.data);

  // Remove script, style, and navigation elements
  $('script, style, nav, header, footer, aside, .ad, .advertisement').remove();

  // Extract main content
  const title = $('title').text().trim() ||
                $('h1').first().text().trim() ||
                $('meta[property="og:title"]').attr('content') ||
                '';

  // Try to find main content area
  const mainContent = $('article, main, .content, .post-content, .article-content, [role="main"]').first();

  let content = '';
  if (mainContent.length > 0) {
    content = mainContent.text();
  } else {
    content = $('body').text();
  }

  // Clean up content
  content = content
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, '\n')
    .trim();

  // Extract metadata
  const author = $('meta[name="author"]').attr('content') ||
                 $('.author').first().text().trim() ||
                 '';

  const publishDate = $('meta[property="article:published_time"]').attr('content') ||
                      $('time').attr('datetime') ||
                      $('.date').first().text().trim() ||
                      '';

  // Extract all links (potential sources)
  const links = [];
  $('a[href]').each((i, elem) => {
    const href = $(elem).attr('href');
    const text = $(elem).text().trim();
    if (href && text && href.startsWith('http')) {
      links.push({ href, text });
    }
  });

  return {
    success: true,
    content: {
      title,
      content: content.substring(0, 15000), // Limit to ~15k chars
      author,
      publishDate,
      links: links.slice(0, 50), // Limit links
      wordCount: content.split(/\s+/).length
    }
  };
}

/**
 * Scraping with Puppeteer for JavaScript-heavy sites
 */
async function scrapeWithPuppeteer(url) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Wait for content to load
    await page.waitForSelector('body', { timeout: 5000 }).catch(() => {});

    // Extract content
    const data = await page.evaluate(() => {
      // Remove unwanted elements
      document.querySelectorAll('script, style, nav, header, footer, aside, .ad, .advertisement').forEach(el => el.remove());

      const title = document.title || document.querySelector('h1')?.textContent || '';

      const mainContent = document.querySelector('article, main, .content, .post-content, .article-content, [role="main"]');
      const content = mainContent ? mainContent.textContent : document.body.textContent;

      const author = document.querySelector('meta[name="author"]')?.content ||
                    document.querySelector('.author')?.textContent || '';

      const publishDate = document.querySelector('meta[property="article:published_time"]')?.content ||
                         document.querySelector('time')?.getAttribute('datetime') ||
                         document.querySelector('.date')?.textContent || '';

      const links = Array.from(document.querySelectorAll('a[href]'))
        .map(a => ({
          href: a.href,
          text: a.textContent.trim()
        }))
        .filter(link => link.href.startsWith('http') && link.text)
        .slice(0, 50);

      return {
        title: title.trim(),
        content: content.replace(/\s+/g, ' ').trim(),
        author: author.trim(),
        publishDate: publishDate.trim(),
        links
      };
    });

    await browser.close();

    return {
      success: true,
      content: {
        ...data,
        content: data.content.substring(0, 15000),
        wordCount: data.content.split(/\s+/).length
      }
    };

  } catch (error) {
    if (browser) await browser.close();
    throw error;
  }
}
