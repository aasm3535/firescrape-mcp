#!/usr/bin/env bun
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import fs from "fs/promises";

// Engines
import { unifiedSearch } from "./src/engines/search";
import { scrapeUrl, searchInPage } from "./src/engines/scraper";

// Tools Logic
import { discoverMcpTools } from "./src/tools/discover";
import { runDeepResearch } from "./src/tools/deep_research";

const SERVER_NAME = "@yutugyutugyutug/firescrape-mcp";
const SERVER_VERSION = "1.1.2"; // Major version bump for modular refactor

const server = new Server(
  { name: SERVER_NAME, version: SERVER_VERSION },
  { capabilities: { tools: {} } }
);

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
        name: "deep_research",
        description: "Deep multi-step research on a topic. Searches, scrapes, and recurses to find insights.",
        inputSchema: {
          type: "object",
          properties: {
            topic: { type: "string", description: "The main research topic" },
            depth: { type: "number", description: "Recursion depth (default: 2)", default: 2 }
          },
          required: ["topic"]
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
      },
      {
        name: "get_agent_rules",
        description: "Returns the official strict guidelines and protocols for AI agents using FireScrape.",
        inputSchema: {
          type: "object",
          properties: {},
          required: []
        }
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "get_agent_rules") {
      const path = require('path');
      const rulesPath = path.join(process.cwd(), "rules", "AI_USAGE_RULES.md");
      try {
        const content = await fs.readFile(rulesPath, 'utf-8');
        return { content: [{ type: "text", text: content }] };
      } catch (e) {
         return { content: [{ type: "text", text: "Error: Could not locate 'rules/AI_USAGE_RULES.md'. Ensure the 'rules' folder is in the project root." }], isError: true };
      }
    }

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
    if (name === "deep_research") {
      const { topic, depth = 2 } = args as { topic: string, depth?: number };
      const report = await runDeepResearch(topic, depth);
      return { content: [{ type: "text", text: report }] };
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

const transport = new StdioServerTransport();
await server.connect(transport);