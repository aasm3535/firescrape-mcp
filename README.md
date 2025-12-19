# FireScrape MCP Server

This is a Model Context Protocol (MCP) server that provides web search and scraping capabilities to LLMs.

## Features
- **Web Search:** Privacy-friendly search via DuckDuckGo.
- **Scraping:** Extract clean text content from websites using FireScrape logic.
- **Local Tools:** Basic file system operations for local development.

## Installation

```bash
git clone https://github.com/aasm3535/firescrape-mcp.git
cd firescrape-mcp
bun install
```

## Usage

Run the server via stdio:

```bash
bun start
```

## Tools

### `search_web`
Searches the internet for a given query.
- `query`: The search string.

### `scrape_webpage`
Reads the content of a URL.
- `url`: The link to scrape.

### `list_local_files`
Lists files in a directory.
- `path`: (Optional) Path to list.
