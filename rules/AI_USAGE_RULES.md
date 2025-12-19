# 🤖 AI Agent Guidelines: Using FireScrape MCP

These rules are designed to ensure AI agents (Cursor, Claude, Windsurf, Cline, etc.) utilize the **FireScrape MCP** server effectively to retrieve accurate, real-time information and perform deep research.

## 📌 Core Directives

1.  **Prioritize Real-Time Data:** Do not rely solely on your training data for events, documentation, or libraries that may have changed post-training.
2.  **Verify via Search:** When asked about technical documentation, news, or specific facts, ALWAYS verify using `search_web` or `scrape_webpage`.
3.  **Deep Research:** For complex queries, "how-to" guides, or market analysis, use the `deep_research` tool instead of multiple simple searches.

## 🛠️ Tool Usage Protocols

### 🔍 When to use `search_web`
*   **Trigger:** User asks for specific, simple facts (e.g., "latest version of React", "who won the game", "current stock price").
*   **Action:** Perform a query and summarize the snippet. If details are missing, scrape the top result.

### 📚 When to use `scrape_webpage`
*   **Trigger:** User provides a URL or asks about a specific documentation page.
*   **Action:** Scrape the URL to get the full markdown content.
*   **Constraint:** Always look for "Context7" or official documentation links if the user asks for coding help.

### 🧠 When to use `deep_research`
*   **Trigger:** User asks a broad question (e.g., "Compare top 5 vector databases", "How to implement auth with Supabase and Next.js 14").
*   **Action:** Initiate `deep_research` with a specific `topic`.
*   **Process:**
    1.  Analyze the user's objective.
    2.  Run the deep research tool (this handles multiple search-scrape loops).
    3.  Synthesize the final markdown report provided by the tool.

### 📂 When to use `list_files` & `read_file`
*   **Trigger:** User asks about the current project structure or specific code context.
*   **Action:** List files to understand the directory tree, then read specific files to gain context before suggesting code changes.

## 📝 Example System Prompt Injection

If you are configuring a custom agent (e.g., in Cursor's `.cursorrules` or a System Prompt), add this block:

```text
YOU HAVE ACCESS TO THE FIRESCRAPE MCP SERVER.

1. USE `search_web` to find current information.
2. USE `scrape_webpage` to read documentation URLs found in search.
3. USE `deep_research` for complex topics requiring synthesis of multiple sources.
4. NEVER hallucinate API methods. Verify them by scraping the library's docs.
```
