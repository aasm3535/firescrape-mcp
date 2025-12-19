# 🔥 FireScrape MCP Server

An **MCP (Model Context Protocol)** server that empowers AI models (like Claude, Cursor, etc.) to browse the web, search for information, and read local files.

## 📦 Installation & Usage

You can run FireScrape directly without installation using `npx`:

```bash
npx -y @yutugyutugyutug/firescrape-mcp
```

### Features (v1.1.0)
*   **`deep_research`**: Multi-step automated research with text-density filtering and synthesis.
*   **`search_web`**: Robust search with anti-blocking and fallback providers (DDG + Brave).
*   **`scrape_webpage`**: Smart scraping that removes noise and converts to clean Markdown.
*   **`discover_tools`**: Find other MCP servers on GitHub and Smithery with accurate install hints.
*   **Local Files**: `list_files` and `read_file` tools for context.


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
| `discover_tools` | Finds other MCP servers on GitHub. | `query` (string) |
| `search_in_page` | Searches text inside a specific page URL. | `url` (string), `query` (string) |
| `list_files` | Lists files in a folder. | `path` (string, optional) |
| `read_file` | Reads a file's content. | `path` (string) |

---
Built with ❤️ by [FireScrape](https://github.com/aasm3535/firescrape).
