# 🔥 FireScrape MCP Server

An **MCP (Model Context Protocol)** server that empowers AI models (like Claude, Cursor, etc.) to browse the web, search for information, and read local files.

## 🚀 Features

*   **`search_web`**: Search the internet using DuckDuckGo (No API key required).
*   **`scrape_webpage`**: Extract clean, markdown-friendly text from any URL (bypasses basic bot protections).
*   **`list_files`**: Explore your local project structure.
*   **`read_file`**: Read file contents for code analysis or debugging.

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
| `search_web` | Finds current info on the web. | `query` (string) |
| `scrape_webpage` | Reads a specific URL. | `url` (string) |
| `list_files` | Lists files in a folder. | `path` (string, optional) |
| `read_file` | Reads a file's content. | `path` (string) |

---
Built with ❤️ by [FireScrape](https://github.com/aasm3535/firescrape).
