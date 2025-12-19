import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs/promises";
import path from "path";

// --- Config ---
const SERVER_NAME = "firescrape-mcp";
const SERVER_VERSION = "1.0.0";

// --- Helpers ---
const getHeaders = () => ({
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
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
    
    $('script, style, nav, footer, iframe, noscript, svg, header').remove();
    const title = $('title').text().trim();
    const content = $('body').text().replace(/\s+/g, ' ').trim().substring(0, 8000);
    
    return { title, url, content };
  } catch (error: any) {
    throw new Error(`Scrape failed: ${error.message}`);
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
        description: "Search the web (DuckDuckGo) for current information.",
        inputSchema: {
          type: "object",
          properties: { query: { type: "string" } },
          required: ["query"]
        }
      },
      {
        name: "scrape_webpage",
        description: "Extract text content from a specific URL.",
        inputSchema: {
          type: "object",
          properties: { url: { type: "string" } },
          required: ["url"]
        }
      },
      {
        name: "list_files",
        description: "List files in a local directory.",
        inputSchema: {
          type: "object",
          properties: { path: { type: "string", description: "Absolute path" } }
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

    if (name === "list_files") {
      const dirPath = (args as { path?: string })?.path || process.cwd();
      const files = await fs.readdir(dirPath);
      return { content: [{ type: "text", text: files.join("\n") }] };
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
