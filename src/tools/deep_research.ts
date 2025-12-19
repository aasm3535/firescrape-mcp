import { unifiedSearch } from "../engines/search";
import { scrapeUrl } from "../engines/scraper";
import { cleanDdgUrl } from "../utils";

async function deepResearchInternal(topic: string, depth: number, visited: Set<string> = new Set()): Promise<{ content: string, links: string[] }> {
  if (depth <= 0) return { content: "", links: [] };

  const results = await unifiedSearch(topic);
  const topLinks = results
    .map(r => cleanDdgUrl(r.link))
    .filter(link => link && !visited.has(link))
    .slice(0, 3);

  topLinks.forEach(link => visited.add(link));

  const scrapes = await Promise.allSettled(topLinks.map(link => scrapeUrl(link)));
  
  let knowledgeBuffer = "";
  let extractedLinks: string[] = [];

  for (const res of scrapes) {
    if (res.status === 'fulfilled') {
      const { url, metadata, markdown } = res.value;
      
      // The text density filtering is already applied in scrapeUrl
      knowledgeBuffer += `
### ANALYSIS: ${metadata.title || 'In-depth Knowledge'}\n${markdown.substring(0, 3000)}\n`;
      
      const linkMatches = markdown.match(/\`.*?\`\((https?:\/\/.*?)\)/g);
      if (linkMatches) {
        const pageLinks = linkMatches
          .map(m => m.match(/\((https?:\/\/.*?)\)/)?.[1])
          .filter(l => l && !visited.has(l) && !l.includes('twitter.com') && !l.includes('facebook.com'))
          .slice(0, 2) as string[];
        extractedLinks.push(...pageLinks);
      }
    }
  }

  // Support for synthesized recursion based on extracted links
  if (depth > 1 && extractedLinks.length > 0) {
    const nextLinks = extractedLinks.slice(0, 2);
    for (const nextLink of nextLinks) {
        try {
            if (!visited.has(nextLink)) {
                visited.add(nextLink);
                const subRes = await scrapeUrl(nextLink);
                knowledgeBuffer += `
### DEEP DIVE: ${subRes.metadata.title}\n${subRes.markdown.substring(0, 2000)}\n`;
            }
        } catch (e) {}
    }
  }

  return { content: knowledgeBuffer, links: Array.from(visited) };
}

export async function runDeepResearch(topic: string, depth: number = 2) {
  const visited = new Set<string>();
  const { content, links } = await deepResearchInternal(topic, depth, visited);
  
  const report = `# Deep Research Synthesis: ${topic}\n\n` +
    `## Executive Summary\n` +
    `Automated research synthesis for "${topic}" across multiple layers of web resources.\n\n` +
    `## Comprehensive Findings\n` +
    content + 
    `\n\n## Data Sources & References\n` + 
    links.map(l => `- ${l}`).join('\n');

  return report;
}
