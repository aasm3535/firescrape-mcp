# 🔥 FireScrape MCP Server

An **MCP (Model Context Protocol)** server that empowers AI models (like Claude, Cursor, etc.) to browse the web, search for information, and read local files.

## 🚀 Features

*   **`search_web`**: Search the internet using DuckDuckGo (No API key required).
*   **`scrape_webpage`**: Extract clean, markdown-friendly text from any URL (bypasses basic bot protections).
*   **`list_files`**: Explore your local project structure.
*   **`read_file`**: Read file contents for code analysis or debugging.

## 📦 Installation & Setup

### Method 1: Single Binary (Recommended for Windows)

No Node.js or Bun required.

1.  Download `firescrape-mcp.exe` from the Releases page (or build it yourself with `bun run build`).
2.  **Claude Desktop Config:**
    ```json
    {
      "mcpServers": {
        "firescrape": {
          "command": "C:/Path/To/firescrape-mcp.exe",
          "args": []
        }
      }
    }
    ```

### Method 2: Automatic (Smithery)

Compatible with tools that support the Smithery registry.

```yaml
# smithery.yaml is included in the repo
```

### Method 3: From Source (Developers)

1.  **Prerequisites:** Install [Bun](https://bun.sh/).
2.  **Clone & Install:**
    ```powershell
    git clone https://github.com/aasm3535/firescrape-mcp.git
    cd firescrape-mcp
    bun install
    ```
3.  **Build Binary (Optional):**
    ```bash
    bun run build
    ```

## 🔌 Connection Guides

### Claude Desktop App

1.  Open config: `Win + R` -> `%APPDATA%\Claude\claude_desktop_config.json`
2.  Add config (see Method 1 or Method 3).
3.  Restart Claude.

### Cursor (AI Code Editor)

1.  **Settings** -> **Features** -> **MCP**.
2.  **Add New MCP Server**.
3.  **Name:** `FireScrape`
4.  **Type:** `stdio`
5.  **Command:** `C:/Path/To/firescrape-mcp.exe` (or `bun run .../index.ts`)

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
