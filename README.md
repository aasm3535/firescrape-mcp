# 🔥 FireScrape MCP Server

<div align="center">

![npm version](https://img.shields.io/npm/v/@yutugyutugyutug/firescrape-mcp?color=orange&label=FireScrape)
![license](https://img.shields.io/npm/l/@yutugyutugyutug/firescrape-mcp)
![downloads](https://img.shields.io/npm/dm/@yutugyutugyutug/firescrape-mcp)

**The Ultimate Gateway for AI Agents.**
*Empower your LLMs to Browse, Search, Research, and Scrape with precision.*

[Installation](#-installation--usage) • [Connection Guides](#-connection-guides) • [AI Rules](#-ai-agent-rules) • [Tools](#%EF%B8%8F-tools-reference)

</div>

---

## 🚀 Overview

**FireScrape MCP** is a Model Context Protocol server designed to bridge the gap between AI models (Claude, Cursor, etc.) and the real world. It provides robust tools for:
*   **Deep Research:** Multi-step autonomous investigation and synthesis.
*   **Web Access:** Anti-blocking search and intelligent markdown scraping.
*   **Local Context:** File system access for project-aware coding.

## 📦 Installation & Usage

Run instantly without global installation using `npx`:

```bash
npx -y @yutugyutugyutug/firescrape-mcp
```

### ✨ Key Features (v1.1.0)

*   🧠 **`deep_research`**: Conducts autonomous, multi-step research on complex topics, filtering noise and synthesizing reports.
*   🌐 **`search_web`**: High-availability web search with fallback providers (DuckDuckGo + Brave) to ensure you always get results.
*   📄 **`scrape_webpage`**: Converts messy HTML into clean, token-efficient Markdown, stripping ads and irrelevant boilerplate.
*   🔍 **`discover_tools`**: a "Meta-Tool" to find and install other MCP servers from GitHub and Smithery.
*   📂 **Local Integration**: Seamlessly `list_files` and `read_file` to give your AI context about your local project.

---

## 🤖 AI Agent Rules

**Want your AI to be smarter?**
We have created a standardized rule set to teach your AI agents (Cursor, Windsurf, Cline) how to effectively use these tools to verify facts and avoid hallucinations.

👉 **[Read the AI Usage Guidelines](./rules/AI_USAGE_RULES.md)**

*Copy the content of the file above into your `.cursorrules` or System Prompt to supercharge your agent.*

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
| `get_agent_rules` | Returns the strict operational protocol for AI agents. | `(none)` |

---
<div align="center">
Built with ❤️ by <a href="https://github.com/aasm3535/firescrape">FireScrape</a>
</div>