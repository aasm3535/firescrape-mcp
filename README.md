# 🔥 FireScrape MCP Server

An **MCP (Model Context Protocol)** server that empowers AI models (like Claude, Cursor, etc.) to browse the web, search for information, and read local files.

## 🚀 Features (v1.0.3)

*   **`scrape_webpage`**: Smart AI-ready scraping.
    *   **Markdown**: Converts HTML to clean Markdown (easier for LLMs to read).
    *   **Noise Filtering**: Removes ads, popups, navbars, and scripts automatically.
    *   **Metadata**: Returns publication date, description, and keywords.
    *   **Table of Contents**: Extracts H1-H3 headers for navigation.
*   **`search_web`**: Search the internet using DuckDuckGo (No API key required).
*   **`search_in_page`**: Find specific information inside massive webpages (saves context window).
*   **`list_files` / `read_file`**: Local filesystem access.

## 📦 Installation & Usage

### Method 1: NPM / Bun (Recommended)

You can run the server directly without cloning the repo:

```bash
# Using Bun (Recommended)
bunx @yutugyutugyutug/firescrape-mcp

# Using Node.js
npx @yutugyutugyutug/firescrape-mcp
```

### Method 2: Single Binary (Windows)

1.  Download `firescrape-mcp.exe` from Releases.
2.  Use the path to the executable in your config.

---

## 🔌 Connection Guides

### Claude Desktop App

1.  Open config: `Win + R` -> `%APPDATA%\Claude\claude_desktop_config.json`
2.  Add this configuration:

```json
{
  "mcpServers": {
    "firescrape": {
      "command": "bunx",
      "args": ["@yutugyutugyutug/firescrape-mcp"]
    }
  }
}
```

### Cursor (AI Code Editor)

1.  **Settings** -> **Features** -> **MCP**.
2.  **Add New MCP Server**.
3.  **Name:** `FireScrape`
4.  **Type:** `stdio`
5.  **Command:** `bunx` (or `npx`)
6.  **Args:** `@yutugyutugyutug/firescrape-mcp`

---

## 🛠️ Tools Reference

| Tool Name | Description | Parameters |
| :--- | :--- | :--- |
| `scrape_webpage` | Reads a specific URL and returns structured Markdown. | `url` (string) |
| `search_web` | Finds current info on the web. | `query` (string) |
| `search_in_page` | Searches text inside a specific page URL. | `url` (string), `query` (string) |
| `list_files` | Lists files in a folder. | `path` (string, optional) |
| `read_file` | Reads a file's content. | `path` (string) |

---
Built with ❤️ by [FireScrape](https://github.com/aasm3535/firescrape).
