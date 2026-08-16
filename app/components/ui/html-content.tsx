export function stripScripts(html: string): string {
  return html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");
}

export function htmlToPlain(html: string): string {
  if (!html) return "";
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, " ")
    .trim();
}

export function isEmptyHtml(html: string | undefined | null): boolean {
  return !htmlToPlain(html ?? "");
}

function looksLikeHtml(s: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(s);
}

export function HtmlContent({
  html,
  className = "",
  compact,
}: {
  html?: string | null;
  className?: string;
  compact?: boolean;
}) {
  if (!html) return null;
  const cleaned = stripScripts(html);
  if (!looksLikeHtml(cleaned)) {
    return (
      <p className={`${compact ? "text-sm text-gray-600" : ""} ${className}`.trim()}>
        {cleaned}
      </p>
    );
  }
  return (
    <div
      className={`html-content ${compact ? "html-content-compact" : ""} ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: cleaned }}
    />
  );
}
