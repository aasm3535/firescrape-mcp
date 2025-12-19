export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
}

export interface ScrapeResult {
  url: string;
  metadata: {
    title: string;
    description: string;
    published_time: string;
    type: string;
    keywords: string;
    images: { alt: string; src: string }[];
  };
  toc: { level: string; text: string }[];
  markdown: string;
}

export interface McpTool {
  name: string;
  url: string;
  description: string;
  source: string;
  install_hint: string;
}
