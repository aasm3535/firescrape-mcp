import axios from "axios";

export const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
];

export const getRandomAgent = () => USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

export const getHeaders = (referer = "https://www.google.com/") => ({
  'User-Agent': getRandomAgent(),
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
  'Accept-Encoding': 'gzip, deflate, br',
  'Referer': referer,
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'cross-site',
  'Sec-Fetch-User': '?1',
  'Pragma': 'no-cache',
  'Cache-Control': 'no-cache'
});

export const cleanDdgUrl = (rawUrl: string | undefined) => {
  if (!rawUrl) return "";
  try {
    if (rawUrl.includes("duckduckgo.com/l/") || rawUrl.includes("uddg=")) {
      const match = rawUrl.match(/uddg=([^&]+)/);
      if (match && match[1]) {
        return decodeURIComponent(match[1]);
      }
    }
    return rawUrl.split('?')[0]; // Enhanced cleaning: strip queries by default for cleaner hints
  } catch {
    return rawUrl || "";
  }
};

export async function searchNpm(query: string): Promise<string | null> {
  try {
    const cleanQuery = query.split('/').pop() || query;
    const url = `https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(cleanQuery)}&size=3`;
    const { data } = await axios.get(url, { timeout: 2000 });
    
    if (data.objects && data.objects.length > 0) {
      for (const obj of data.objects) {
        const pkg = obj.package;
        const name = pkg.name.toLowerCase();
        const desc = (pkg.description || "").toLowerCase();
        if (name.includes("mcp") || desc.includes("mcp") || name.includes(cleanQuery.toLowerCase())) {
          return pkg.name;
        }
      }
      return data.objects[0].package.name;
    }
  } catch (e) {}
  return null;
}
