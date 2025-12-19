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

### 1. Claude Desktop App
1.  Open your configuration file:
    *   **Windows:** `Win + R` -> `%APPDATA%\Claude\claude_desktop_config.json`
    *   **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
2.  Add this configuration:
    ```json
    {
      "mcpServers": {
        "firescrape": {
          "command": "npx",
          "args": ["-y", "@yutugyutugyutug/firescrape-mcp"]
        }
      }
    }
    ```

### 2. Cursor (AI Code Editor)
1.  Navigate to **Settings** -> **Features** -> **MCP**.
2.  Click **+ Add New MCP Server**.
3.  Fill in the fields:
    *   **Name:** `FireScrape`
    *   **Type:** `stdio`
    *   **Command:** `npx`
    *   **Args:** `-y @yutugyutugyutug/firescrape-mcp`
4.  Click **Add** to save.

### 3. Gemini CLI
1.  Locate your config file:
    *   **Linux/Mac:** `~/.gemini/settings.json`
    *   **Windows:** `%USERPROFILE%\.gemini\settings.json`
2.  Insert the server configuration:
    ```json
    {
      "mcpServers": {
        "firescrape": {
          "command": "npx",
          "args": ["-y", "@yutugyutugyutug/firescrape-mcp"]
        }
      }
    }
    ```

### 4. Claude Code (CLI)
Run this command in your terminal to add FireScrape:
```bash
claude mcp add firescrape -- npx -y @yutugyutugyutug/firescrape-mcp
```

### 5. Google Antigravity
1.  Open the **Manage MCP Servers** panel.
2.  Select **"Edit Configuration"** or open `mcp_config.json`.
3.  Add the entry:
    ```json
    "firescrape": {
      "command": "npx",
      "args": ["-y", "@yutugyutugyutug/firescrape-mcp"]
    }
    ```

### 6. Cline (VS Code Extension)
1.  Open **Cline Settings** (in VS Code settings or via the extension menu).
2.  Locate the **MCP Servers** config file (usually via a button "Edit MCP Settings").
3.  Add the following:
    ```json
    {
      "mcpServers": {
        "firescrape": {
          "command": "npx",
          "args": ["-y", "@yutugyutugyutug/firescrape-mcp"]
        }
      }
    }
    ```

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
