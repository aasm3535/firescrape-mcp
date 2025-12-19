import axios from "axios";
import { McpTool } from "../types";
import { unifiedSearch } from "../engines/search";
import { cleanDdgUrl, searchNpm } from "../utils";

async function getGitHubInstallHint(repoPath: string, snippet: string): Promise<string> {
  const snippetLower = (snippet || "").toLowerCase();
  const repoName = repoPath.split('/').pop() || "";
  
  if (snippetLower.includes("docker pull") || snippetLower.includes("docker run")) {
    return `docker run -i --rm ${repoPath.toLowerCase()}`;
  }

  const branches = ['main', 'master'];
  
  for (const branch of branches) {
    try {
      const pkgUrl = `https://raw.githubusercontent.com/${repoPath}/${branch}/package.json`;
      const { data } = await axios.get(pkgUrl, { timeout: 2000 });
      const pkg = typeof data === 'string' ? JSON.parse(data) : data;
      if (pkg.name) return `npx -y ${pkg.name}`;
    } catch (e) {}
  }

  const npmName = await searchNpm(repoName);
  if (npmName) return `npx -y ${npmName}`;

  for (const branch of branches) {
    try {
      const readmeUrl = `https://raw.githubusercontent.com/${repoPath}/${branch}/README.md`;
      const { data: readme } = await axios.get(readmeUrl, { timeout: 2000 });
      if (typeof readme === 'string') {
        const npxMatch = readme.match(/npx -y (@?[\w\-/]+)/);
        if (npxMatch) return npxMatch[0];
        
        const pipMatch = readme.match(/pip install ([\w\-/]+)/);
        if (pipMatch) return pipMatch[0];

        const dockerMatch = readme.match(/docker run [^`\n]+/);
        if (dockerMatch) return dockerMatch[0];
      }
    } catch (e) {}
  }

  return `npx -y ${repoPath}`;
}

export async function discoverMcpTools(query: string) {
  const searchQ = `${query} (site:github.com topic:mcp-server) OR (site:smithery.ai/server)`;
  const rawResults = await unifiedSearch(searchQ);

  const tools = await Promise.all(rawResults.map(async (res: any) => {
    const { title, snippet } = res;
    let link = cleanDdgUrl(res.link); 
    if (!link) return null;

    let installCommand = "See repository for instructions";
    let source = "Web";

    if (link.includes('github.com')) {
      source = "GitHub";
      const parts = link.split('github.com/');
      if (parts[1]) {
        const repoPath = parts[1].split('/').slice(0, 2).join('/').replace(/\/$/, ""); 
        if (repoPath && repoPath.includes('/')) {
          installCommand = await getGitHubInstallHint(repoPath, snippet);
        }
      }
    }
    
    if (link.includes('smithery.ai')) {
      source = "Smithery";
      const parts = link.split('smithery.ai/server/');
      if (parts[1]) {
        const slug = parts[1].split('/')[0].split('?')[0];
        const npmName = await searchNpm(slug);
        installCommand = `npx -y ${npmName || slug}`;
      }
    }

    return {
      name: title,
      url: link,
      description: snippet,
      source: source,
      install_hint: installCommand
    };
  }));

  const filteredTools = tools.filter(t => t !== null);
  return { query, found: filteredTools.length, tools: filteredTools };
}
