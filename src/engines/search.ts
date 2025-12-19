import axios from "axios";
import * as cheerio from "cheerio";
import { SearchResult } from "../types";
import { getHeaders, cleanDdgUrl } from "../utils";

export async function searchDDG(query: string): Promise<SearchResult[]> {
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const { data } = await axios.get(url, { headers: getHeaders("https://html.duckduckgo.com/") });
    const $ = cheerio.load(data);

    const results: SearchResult[] = [];
    $('.result').each((i, el) => {
      if (i > 8) return;
      const title = $(el).find('.result__a').text().trim();
      let link = $(el).find('.result__a').attr('href');
      const snippet = $(el).find('.result__snippet').text().trim();
      link = cleanDdgUrl(link);
      if (title && link) results.push({ title, link, snippet });
    });
    return results;
  } catch (error: any) {
    console.error(`[DDG Error] ${error.message}`);
    return [];
  }
}

export async function searchBrave(query: string): Promise<SearchResult[]> {
  try {
    const url = `https://search.brave.com/search?q=${encodeURIComponent(query)}`;
    const { data } = await axios.get(url, { headers: getHeaders("https://search.brave.com/") });
    const $ = cheerio.load(data);

    const results: SearchResult[] = [];
    $('#results > .snippet, .snippet').each((i, el) => {
      if (i > 8) return;
      const title = $(el).find('.title, h3').text().trim();
      let link = $(el).find('a').attr('href');
      const snippet = $(el).find('.snippet-content, .snippet-description').text().trim();
      if (title && link) results.push({ title, link, snippet });
    });

    if (results.length === 0) {
      $('div.fdb').each((i, el) => {
        const title = $(el).find('a div').first().text().trim();
        const link = $(el).find('a').attr('href');
        if (title && link) results.push({ title, link, snippet: "..." });
      });
    }

    return results;
  } catch (error: any) {
    console.error(`[Brave Error] ${error.message}`);
    return [];
  }
}

export async function unifiedSearch(query: string): Promise<SearchResult[]> {
  let results = await searchDDG(query);
  if (results.length === 0) {
    console.log("[Search] Falling back to Brave Search...");
    results = await searchBrave(query);
  }
  
  if (results.length === 0) {
    throw new Error("Search blocked or no results found on all providers. Please try again later.");
  }
  return results;
}
