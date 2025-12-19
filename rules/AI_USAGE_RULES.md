# 🤖 FireScrape MCP: AI Agent Protocol

This document defines the **STRICT** operational protocol for AI agents (Cursor, Claude, Windsurf, etc.) using the FireScrape MCP server.

## 🎯 Core Objective
You are equipped with **FireScrape**, a toolset for real-time web access and deep research. **Your goal is to be accurate, not fast.** Verification is mandatory.

---

## 🛠️ Tool Usage Guidelines

### 1. `search_web` (Web Search)
**WHEN TO USE:**
*   ✅ User asks for **current events** (news, sports, stocks).
*   ✅ User asks for **specific facts** (latest version of a library, release dates).
*   ✅ User asks for a **quick summary** of a topic.

**WHEN NOT TO USE:**
*   ❌ User asks for **comprehensive tutorials** or "how-to" guides (Use `deep_research`).
*   ❌ User asks for **deep analysis** of a broad topic (Use `deep_research`).
*   ❌ User provides a specific **URL** (Use `scrape_webpage`).

**PROTOCOL:**
1.  Perform search.
2.  If the snippet is sufficient, answer.
3.  If details are missing, **IMMEDIATELY** use `scrape_webpage` on the best result.

---

### 2. `scrape_webpage` (Read URL)
**WHEN TO USE:**
*   ✅ User provides a **specific URL**.
*   ✅ You need to read **official documentation** (e.g., React docs, Python API).
*   ✅ You need to verify a specific claim found in search results.

**WHEN NOT TO USE:**
*   ❌ You are just guessing a URL (Search first!).
*   ❌ The page is a generic landing page with no content (Search for "docs" or "blog" instead).

**PROTOCOL:**
1.  Scrape the URL.
2.  Read the Markdown content.
3.  **Quote** relevant sections when answering the user to prove source validity.

---

### 3. `deep_research` (Autonomous Research)
**WHEN TO USE:**
*   ✅ User asks a **complex question** ("Best practices for...", "Compare X vs Y vs Z").
*   ✅ User asks for a **tutorial** or **implementation guide** involving multiple technologies.
*   ✅ User asks for **market analysis** or **aggregated opinions**.

**WHEN NOT TO USE:**
*   ❌ User asks a simple fact question ("What is the capital of France?").
*   ❌ User asks about a local file.

**PROTOCOL:**
1.  Pass the user's FULL query as the `topic`.
2.  Wait for the tool to perform multiple steps.
3.  Synthesize the returned report into your final answer.

---

### 4. `discover_tools` (MCP Discovery)
**WHEN TO USE:**
*   ✅ User asks for "tools for X" (e.g., "tools for Postgres", "MCP for GitHub").
*   ✅ User wants to install a new capability.

**WHEN NOT TO USE:**
*   ❌ User is asking about general web topics.

---

## 🚫 Critical Anti-Patterns (DO NOT DO)

1.  **HALLUCINATING APIS:** Never invent function names or library methods. If you don't know, **Search -> Scrape Docs -> Answer**.
2.  **LAZY SEARCHING:** Do not stop after one search if the answer isn't clear. Refine your query and search again.
3.  **IGNORING CONTEXT:** If the user is in a specific tech stack (seen via `list_files`), tailor your search queries to that stack (e.g., "auth **for Next.js**").

---
*End of Protocol. Adhere to these rules strictly.*