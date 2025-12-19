# 🔥 FireScrape MCP Server

An **MCP (Model Context Protocol)** server that empowers AI models (like Claude, Cursor, etc.) to browse the web, search for information, and read local files.

## 🚀 Features

*   **`search_web`**: Search the internet using DuckDuckGo (No API key required).
*   **`scrape_webpage`**: Extract clean, markdown-friendly text from any URL (bypasses basic bot protections).
*   **`list_files`**: Explore your local project structure.
*   **`read_file`**: Read file contents for code analysis or debugging.

## 📦 Installation

1.  **Prerequisites:** Ensure you have [Bun](https://bun.sh/) installed.
2.  **Clone & Install:**
    ```powershell
    git clone https://github.com/aasm3535/firescrape-mcp.git
    cd firescrape-mcp
    bun install
    ```

## 🔌 How to Connect (Guides)

### Option 1: Claude Desktop App

This allows Claude to use your internet connection and local files.

1.  Open your Claude Desktop config file:
    *   **Windows:** `Win + R` -> `%APPDATA%\Claude\claude_desktop_config.json`
    *   **Mac:** `~/Library/Application Support/Claude/claude_desktop_config.json`

2.  Add the following configuration (replace `C:/Users/destr/firescrape-mcp` with your actual path):

    ```json
    {
      "mcpServers": {
        "firescrape": {
          "command": "bun",
          "args": ["run", "C:/Users/destr/firescrape-mcp/index.ts"]
        }
      }
    }
    ```

3.  Restart Claude Desktop. You should see a plug icon 🔌 indicating the server is connected.

### Option 2: Cursor (AI Code Editor)

1.  Go to **Settings** -> **Features** -> **MCP**.
2.  Click **"Add New MCP Server"**.
3.  **Name:** `FireScrape`
4.  **Type:** `stdio`
5.  **Command:** `bun run C:/Users/destr/firescrape-mcp/index.ts`

## 🛠️ Tools Reference

| Tool Name | Description | Parameters |
| :--- | :--- | :--- |
| `search_web` | Finds current info on the web. | `query` (string) |
| `scrape_webpage` | Reads a specific URL. | `url` (string) |
| `list_files` | Lists files in a folder. | `path` (string, optional) |
| `read_file` | Reads a file's content. | `path` (string) |

## 👨‍💻 Development

To run the server in debug mode:

```bash
bun dev
```

---
Built with ❤️ by [FireScrape](https://github.com/aasm3535/firescrape).
