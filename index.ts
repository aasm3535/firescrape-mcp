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
const SERVER_VERSION = "1.0.11";

const turndownService = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-"
});

// --- User-Agent Rotation & Headers ---
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
];

const getRandomAgent = () => USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

const getHeaders = (referer = "https://www.google.com/") => ({
  'User-Agent': getRandomAgent(),
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
  'Accept-Encoding': 'gzip, deflate, br',
  'Referer': referer,
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'cross-site',
  'Sec-Fetch-User': '?1',
  'Pragma': 'no-cache',
  'Cache-Control': 'no-cache'
});

// --- Helpers ---
const cleanDdgUrl = (rawUrl: string | undefined) => {
  if (!rawUrl) return "";
  try {
    if (rawUrl.includes("duckduckgo.com/l/") || rawUrl.includes("uddg=")) {
      const match = rawUrl.match(/uddg=([^&]+)/);
      if (match && match[1]) {
        return decodeURIComponent(match[1]);
      }
    }
    return rawUrl;
  } catch {
    return rawUrl;
  }
};

// --- Search Providers ---

// 1. DuckDuckGo (Primary)
async function searchDDG(query: string) {
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const { data } = await axios.get(url, { headers: getHeaders("https://html.duckduckgo.com/") });
    const $ = cheerio.load(data);

    const results: any[] = [];
    $('.result').each((i, el) => {
      if (i > 8) return;
      const title = $(el).find('.result__a').text().trim();
      let link = $(el).find('.result__a').attr('href');
      const snippet = $(el).find('.result__snippet').text().trim();
      
      link = cleanDdgUrl(link); 

      if (title && link) results.push({ title, link, snippet });
    });
    return results;
  } catch (error) {
    console.error(`[DDG Error] ${error.message}`);
    return [];
  }
}

// 2. Brave Search (Fallback)
async function searchBrave(query: string) {
  try {
    const url = `https://search.brave.com/search?q=${encodeURIComponent(query)}`;
    const { data } = await axios.get(url, { headers: getHeaders("https://search.brave.com/") });
    const $ = cheerio.load(data);

    const results: any[] = [];
    $('#results > .snippet, .snippet').each((i, el) => {
        if (i > 8) return;
        const title = $(el).find('.title, h3').text().trim();
        let link = $(el).find('a').attr('href');
        const snippet = $(el).find('.snippet-content, .snippet-description').text().trim();
        if (title && link) results.push({ title, link, snippet });
    });

    if (results.length === 0) {
        $('div.fdb').each((i, el) => {
             const title = $(el).find('a div').first().text().trim();
             const link = $(el).find('a').attr('href');
             if(title && link) results.push({ title, link, snippet: "..." });
        });
    }

    return results;
  } catch (error) {
    console.error(`[Brave Error] ${error.message}`);
    return [];
  }
}

async function unifiedSearch(query: string) {
  let results = await searchDDG(query);
  if (results.length === 0) results = await searchBrave(query);
  if (results.length === 0) throw new Error("Search blocked. Please try again later.");
  return results;
}

async function scrapeUrl(url: string) {
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
      images: [] as { alt: string, src: string }[]
    };

    $('img').each((_, el) => {
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

    const toc: { level: string, text: string }[] = [];
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

    const markdown = turndownService.turndown(contentHtml);

    return { url, metadata, toc: toc.slice(0, 20), markdown: markdown.substring(0, 15000) };

  } catch (error: any) {
    throw new Error(`Scrape failed: ${error.message}`);
  }
}

async function searchInPage(url: string, query: string) {
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

async function searchNpm(query: string): Promise<string | null> {
  try {
    const cleanQuery = query.split('/').pop() || query;
    const url = `https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(cleanQuery)}&size=3`;
    const { data } = await axios.get(url, { timeout: 2000 });
    
    if (data.objects && data.objects.length > 0) {
      // Look for a close match or the first result if it seems related to MCP
      for (const obj of data.objects) {
        const pkg = obj.package;
        const name = pkg.name.toLowerCase();
        const desc = (pkg.description || "").toLowerCase();
        if (name.includes("mcp") || desc.includes("mcp") || name.includes(cleanQuery.toLowerCase())) {
          return pkg.name;
        }
      }
      return data.objects[0].package.name;
    }
  } catch (e) {}
  return null;
}

async function getGitHubInstallHint(repoPath: string, snippet: string): Promise<string> {
  const snippetLower = (snippet || "").toLowerCase();
  const repoName = repoPath.split('/').pop() || "";
  
  if (snippetLower.includes("docker pull") || snippetLower.includes("docker run")) {
    return `docker run -i --rm ${repoPath.toLowerCase()}`;
  }

  const branches = ['main', 'master'];
  
  // 1. Try package.json in the repo
  for (const branch of branches) {
    try {
      const pkgUrl = `https://raw.githubusercontent.com/${repoPath}/${branch}/package.json`;
      const { data } = await axios.get(pkgUrl, { timeout: 2000 });
      const pkg = typeof data === 'string' ? JSON.parse(data) : data;
      if (pkg.name) return `npx -y ${pkg.name}`;
    } catch (e) {}
  }

  // 2. Try to find the package on NPM by repo name
  const npmName = await searchNpm(repoName);
  if (npmName) return `npx -y ${npmName}`;

  // 3. Try README for instructions
  for (const branch of branches) {
    try {
      const readmeUrl = `https://raw.githubusercontent.com/${repoPath}/${branch}/README.md`;
      const { data: readme } = await axios.get(readmeUrl, { timeout: 2000 });
      if (typeof readme === 'string') {
        const npxMatch = readme.match(/npx -y (@?[\w\-/]+)/);
        if (npxMatch) return npxMatch[0];
        
        const pipMatch = readme.match(/pip install ([\w\-/]+)/);
        if (pipMatch) return pipMatch[0];

        const dockerMatch = readme.match(/docker run [^`\n]+/);
        if (dockerMatch) return dockerMatch[0];
      }
    } catch (e) {}
  }

  if (snippetLower.includes("pip install") || snippetLower.includes("python")) {
    return `pip install git+https://github.com/${repoPath}.git`;
  }
  
  if (snippetLower.includes("go install")) {
    return `go install github.com/${repoPath}@latest`;
  }

  return `npx -y ${repoPath}`;
}

async function discoverMcpTools(query: string) {
  try {
    const searchQ = `${query} (site:github.com topic:mcp-server) OR (site:smithery.ai/server)`;
    const rawResults = await unifiedSearch(searchQ);

    const tools = await Promise.all(rawResults.map(async (res: any) => {
      const { title, snippet } = res;
      let { link } = res; 
      
      link = cleanDdgUrl(link); 
      if (!link) return null;

      let installCommand = "See repository for instructions";
      let source = "Web";

      if (link.includes('github.com')) {
        source = "GitHub";
        const cleanLink = link.split('?')[0]; 
        const parts = cleanLink.split('github.com/');
        if (parts[1]) {
            const repoPath = parts[1].split('/').slice(0, 2).join('/').replace(/\/$/, ""); 
            if (repoPath && repoPath.includes('/')) {
                installCommand = await getGitHubInstallHint(repoPath, snippet);
            }
        }
      }
      
      if (link.includes('smithery.ai')) {
        source = "Smithery";
        const parts = link.split('smithery.ai/server/');
        if (parts[1]) {
             const slug = parts[1].split('/')[0].split('?')[0];
             // Verify if slug is a valid NPM package or try to find it
             const npmName = await searchNpm(slug);
             installCommand = `npx -y ${npmName || slug}`;
        }
      }

      return {
        name: title,
        url: link,
        description: snippet,
        source: source,
        install_hint: installCommand
      };
    }));

    const filteredTools = tools.filter(t => t !== null);

    return { query, found: filteredTools.length, tools: filteredTools };
  } catch (error: any) {
    throw new Error(`Tool discovery failed: ${error.message}`);
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
        description: "Search the web (DuckDuckGo/Brave). Returns fresh links and snippets.",
        inputSchema: {
          type: "object",
          properties: { query: { type: "string" } },
          required: ["query"]
        }
      },
      {
        name: "scrape_webpage",
        description: "Smartly scrape a webpage. Returns Markdown, Metadata, and ToC.",
        inputSchema: {
          type: "object",
          properties: { url: { type: "string" } },
          required: ["url"]
        }
      },
      {
        name: "search_in_page",
        description: "Search for text inside a webpage (Case-insensitive).",
        inputSchema: {
          type: "object",
          properties: { url: { type: "string" }, query: { type: "string" } },
          required: ["url", "query"]
        }
      },
      {
        name: "discover_tools",
        description: "Find OTHER MCP servers for specific tasks on GitHub/Smithery.",
        inputSchema: {
            type: "object",
            properties: { 
                query: { type: "string", description: "Topic to search for" } 
            },
            required: ["query"]
        }
      },
      {
        name: "read_file",
        description: "Read local file content.",
        inputSchema: {
          type: "object",
          properties: { path: { type: "string" } },
          required: ["path"]
        }
      },
       {
        name: "list_files",
        description: "List local files.",
        inputSchema: {
          type: "object",
          properties: { path: { type: "string" } },
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
      return { content: [{ type: "text", text: JSON.stringify(await unifiedSearch(query), null, 2) }] };
    }
    if (name === "scrape_webpage") {
      const { url } = args as { url: string };
      return { content: [{ type: "text", text: JSON.stringify(await scrapeUrl(url), null, 2) }] };
    }
    if (name === "search_in_page") {
      const { url, query } = args as { url: string, query: string };
      return { content: [{ type: "text", text: JSON.stringify(await searchInPage(url, query), null, 2) }] };
    }
    if (name === "discover_tools") {
      const { query } = args as { query: string };
      return { content: [{ type: "text", text: JSON.stringify(await discoverMcpTools(query), null, 2) }] };
    }
    if (name === "read_file") {
      const filePath = (args as { path: string }).path;
      const content = await fs.readFile(filePath, 'utf-8');
      return { content: [{ type: "text", text: content }] };
    }
     if (name === "list_files") {
      const dirPath = (args as { path?: string })?.path || process.cwd();
      const files = await fs.readdir(dirPath);
      return { content: [{ type: "text", text: files.join("\n") }] };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (error: any) {
    return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
  }
});

// --- Start ---
const transport = new StdioServerTransport();
await server.connect(transport);
