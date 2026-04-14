export function htmlToText(html: string): string {
  // Remove scripts/styles entirely
  let out = html.replace(/<script[\s\S]*?<\/script>/gi, " ");
  out = out.replace(/<style[\s\S]*?<\/style>/gi, " ");
  out = out.replace(/<noscript[\s\S]*?<\/noscript>/gi, " ");
  // Convert common block tags to newlines
  out = out.replace(/<\/(p|div|li|h[1-6]|br|tr|section|article)>/gi, "\n");
  out = out.replace(/<br\s*\/?\s*>/gi, "\n");
  // Strip remaining tags
  out = out.replace(/<[^>]+>/g, " ");
  // Decode a few common entities
  out = out
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  // Collapse whitespace
  out = out.replace(/[ \t]+/g, " ");
  out = out.replace(/\n{3,}/g, "\n\n");
  out = out.trim();
  return out;
}

export async function fetchJdFromUrl(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    if (!res.ok) throw new Error(`Upstream returned ${res.status}`);
    const html = await res.text();
    const text = htmlToText(html);
    if (text.length < 100) throw new Error("Extracted text too short — try pasting the JD directly.");
    return text.slice(0, 12000);
  } finally {
    clearTimeout(timeout);
  }
}
