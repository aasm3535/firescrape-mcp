import axios from "axios";
import * as cheerio from "cheerio";
import TurndownService from "turndown";
import { ScrapeResult } from "../types";
import { getHeaders } from "../utils";

const turndownService = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-"
});

export async function scrapeUrl(url: string): Promise<ScrapeResult> {
  try {
    const { data } = await axios.get(url, {
      headers: getHeaders(new URL(url).origin),
      timeout: 15000
    });
    const $ = cheerio.load(data);

    const metadata = {
      title: $('title').text().trim() || '',
      description: $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || '',
      published_time: $('meta[property="article:published_time"]').attr('content') || $('meta[name="date"]').attr('content') || 'unknown',
      type: $('meta[property="og:type"]').attr('content') || 'website',
      keywords: $('meta[name="keywords"]').attr('content') || '',
      images: [] as { alt: string; src: string }[]
    };

    $("img").each((_, el) => {
      const src = $(el).attr('src');
      const alt = $(el).attr('alt');
      if (src && alt && alt.trim().length > 2) {
        metadata.images.push({
          alt: alt.trim(),
          src: src.startsWith('http') ? src : new URL(src, url).toString()
        });
      }
    });
    metadata.images = metadata.images.slice(0, 10);

    const toc: { level: string; text: string }[] = [];
    $('h1, h2, h3').each((_, el) => {
      toc.push({ level: el.tagName.toLowerCase(), text: $(el).text().trim() });
    });

    const selectorsToRemove = [
      'script', 'style', 'noscript', 'iframe', 'svg',
      'nav', 'footer', 'header', 'aside',
      '.ad', '.ads', '.advertisement', '.social-share',
      '.cookie-consent', '.popup', '#sidebar'
    ];
    $(selectorsToRemove.join(',')).remove();

    let contentHtml = '';
    const mainSelectors = ['main', 'article', '#content', '.content', '#main'];
    let foundMain = false;
    for (const selector of mainSelectors) {
      if ($(selector).length > 0) {
        contentHtml = $(selector).html() || '';
        foundMain = true;
        break;
      }
    }
    if (!foundMain) contentHtml = $('body').html() || '';

    // Text density filtering
    const markdown = turndownService.turndown(contentHtml);
    const cleanedMarkdown = markdown
      .split('\n')
      .filter(line => {
        const trimmed = line.trim();
        if (trimmed.length === 0) return true;
        if (trimmed.length < 20 && !trimmed.startsWith('#')) return false; 
        return true;
      })
      .join('\n');

    return { url, metadata, toc: toc.slice(0, 20), markdown: cleanedMarkdown.substring(0, 20000) };
  } catch (error: any) {
    throw new Error(`Scrape failed: ${error.message}`);
  }
}

export async function searchInPage(url: string, query: string) {
  try {
    const { data } = await axios.get(url, { headers: getHeaders(new URL(url).origin) });
    const $ = cheerio.load(data);
    $('script, style, nav, footer, svg').remove();
    const bodyText = $('body').text();
    const paragraphs = bodyText.split(/\n\s*\n|\.\s+/).map(p => p.trim()).filter(p => p.length > 20);
    const matches: string[] = [];
    const lowerQuery = query.toLowerCase();
    for (let i = 0; i < paragraphs.length; i++) {
      if (paragraphs[i].toLowerCase().includes(lowerQuery)) {
        const context = [paragraphs[i - 1] || '', `**${paragraphs[i]}**`, paragraphs[i + 1] || ''].join('\n\n').trim();
        matches.push(context);
        if (matches.length >= 5) break;
      }
    }
    return { query, found_count: matches.length, results: matches };
  } catch (error: any) {
    throw new Error(`In-page search failed: ${error.message}`);
  }
}