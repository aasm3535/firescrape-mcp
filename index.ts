#!/usr/bin/env bun
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs/promises";
import TurndownService from "turndown";

// --- Config ---
const SERVER_NAME = "@yutugyutugyutug/firescrape-mcp";
const SERVER_VERSION = "1.0.3";

const turndownService = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-"
});

// --- Helpers ---
const getHeaders = () => ({
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5'
});

async function googleSearch(query: string) {
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const { data } = await axios.get(url, { headers: getHeaders() });
    const $ = cheerio.load(data);

    const results: any[] = [];
    $('.result').each((i, el) => {
      if (i > 8) return;
      const title = $(el).find('.result__a').text().trim();
      const link = $(el).find('.result__a').attr('href');
      const snippet = $(el).find('.result__snippet').text().trim();
      if (title && link) results.push({ title, link, snippet });
    });
    return results;
  } catch (error: any) {
    throw new Error(`Search failed: ${error.message}`);
  }
}

async function scrapeUrl(url: string) {
  try {
    const { data } = await axios.get(url, {
      headers: getHeaders(),
      timeout: 15000
    });
    const $ = cheerio.load(data);

    // 1. Metadata Extraction
    const metadata = {
      title: $('title').text().trim() || '',
      description: $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || '',
      published_time: $('meta[property="article:published_time"]').attr('content') || $('meta[name="date"]').attr('content') || 'unknown',
      type: $('meta[property="og:type"]').attr('content') || 'website',
      keywords: $('meta[name="keywords"]').attr('content') || ''
    };

    // 2. Table of Contents (ToC)
    const toc = [];
    $('h1, h2, h3').each((_, el) => {
      toc.push({
        level: el.tagName.toLowerCase(),
        text: $(el).text().trim()
      });
    });

    // 3. Noise Filtering (Noise Removal)
    const selectorsToRemove = [
      'script', 'style', 'noscript', 'iframe', 'svg',
      'nav', 'footer', 'header', 'aside',
      '.ad', '.ads', '.advertisement', '.social-share',
      '.cookie-consent', '.popup', '#sidebar'
    ];
    $(selectorsToRemove.join(',')).remove();

    // 4. Content Focus (Try to find main content)
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
    
    // Fallback to body if no main container found
    if (!foundMain) {
      contentHtml = $('body').html() || '';
    }

    // 5. Convert to Markdown
    const markdown = turndownService.turndown(contentHtml);

    return { 
      url, 
      metadata, 
      toc: toc.slice(0, 20), // Limit ToC size
      markdown: markdown.substring(0, 15000) // Safety limit
    };

  } catch (error: any) {
    throw new Error(`Scrape failed: ${error.message}`);
  }
}

async function searchInPage(url: string, query: string) {
  try {
    const { data } = await axios.get(url, { headers: getHeaders() });
    const $ = cheerio.load(data);
    
    // Clean minimal noise
    $('script, style, nav, footer, svg').remove();
    
    const bodyText = $('body').text();
    // Split by double newlines or periods to simulate paragraphs
    const paragraphs = bodyText.split(/\n\s*\n|\.\s+/).map(p => p.trim()).filter(p => p.length > 20);
    
    const matches = [];
    const lowerQuery = query.toLowerCase();

    for (let i = 0; i < paragraphs.length; i++) {
      if (paragraphs[i].toLowerCase().includes(lowerQuery)) {
        // Add context (previous + current + next paragraph)
        const context = [
          paragraphs[i - 1] || '',
          `**${paragraphs[i]}**`, // Highlight match
          paragraphs[i + 1] || ''
        ].join('\n\n').trim();
        
        matches.push(context);
        if (matches.length >= 5) break; // Limit to 5 matches
      }
    }

    return {
      query,
      found_count: matches.length,
      results: matches
    };

  } catch (error: any) {
    throw new Error(`In-page search failed: ${error.message}`);
  }
}

// --- Server Setup ---
const server = new Server(
  { name: SERVER_NAME, version: SERVER_VERSION },
  { capabilities: { tools: {} } }
);

// --- Tool Definitions ---
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "search_web",
        description: "Search the web (DuckDuckGo). Returns fresh links and snippets.",
        inputSchema: {
          type: "object",
          properties: { query: { type: "string" } },
          required: ["query"]
        }
      },
      {
        name: "scrape_webpage",
        description: "Smartly scrape a webpage. Returns Markdown, Metadata, and Table of Contents. Filters out ads and navigation.",
        inputSchema: {
          type: "object",
          properties: { url: { type: "string" } },
          required: ["url"]
        }
      },
      {
        name: "search_in_page",
        description: "Search for a specific keyword or phrase inside a large webpage. Useful when you don't need the whole page.",
        inputSchema: {
          type: "object",
          properties: { 
            url: { type: "string" },
            query: { type: "string" }
          },
          required: ["url", "query"]
        }
      },
      {
        name: "read_file",
        description: "Read the contents of a local file.",
        inputSchema: {
          type: "object",
          properties: { path: { type: "string", description: "Absolute path to file" } },
          required: ["path"]
        }
      }
    ]
  };
});

// --- Tool Execution ---
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "search_web") {
      const { query } = args as { query: string };
      return { content: [{ type: "text", text: JSON.stringify(await googleSearch(query), null, 2) }] };
    }

    if (name === "scrape_webpage") {
      const { url } = args as { url: string };
      return { content: [{ type: "text", text: JSON.stringify(await scrapeUrl(url), null, 2) }] };
    }

    if (name === "search_in_page") {
      const { url, query } = args as { url: string, query: string };
      return { content: [{ type: "text", text: JSON.stringify(await searchInPage(url, query), null, 2) }] };
    }

    if (name === "read_file") {
      const filePath = (args as { path: string }).path;
      const content = await fs.readFile(filePath, 'utf-8');
      return { content: [{ type: "text", text: content }] };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (error: any) {
    return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
  }
});

// --- Start ---
const transport = new StdioServerTransport();
await server.connect(transport);
