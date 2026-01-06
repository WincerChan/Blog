const escapeToken = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const countToken = (value: string, token: string) => {
  if (!token) return 0;
  const pattern = new RegExp(`(?:^|\\s)${escapeToken(token)}[^\\s]*`, "g");
  return value.match(pattern)?.length ?? 0;
};

export const findToken = (value: string, token: string) => {
  if (!value || !token) return null;
  const pattern = new RegExp(`(?:^|\\s)${escapeToken(token)}([^\\s]*)`, "i");
  const match = pattern.exec(value);
  if (!match) return null;
  const tokenIndex = match.index + match[0].indexOf(token);
  const valueStart = tokenIndex + token.length;
  const valueEnd = valueStart + (match[1]?.length ?? 0);
  return { valueStart, valueEnd };
};

export const canAppendToken = (value: string, token: string, maxTags = 3) => {
  const limits: Record<string, number> = {
    "category:": 1,
    "tag:": maxTags,
  };
  const limit = limits[token];
  if (!limit) return true;
  if (token === "tag:") {
    const total = countToken(value, "tag:") + countToken(value, "tags:");
    return total < limit;
  }
  return countToken(value, token) < limit;
};

export const normalizeQuery = (raw: string, maxTags = 3) => {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const tags: string[] = [];
  const seen = new Set<string>();
  const tagPattern = /(?:^|\s)(tag|tags):([^\s]+)/gi;
  const stripped = trimmed
    .replace(tagPattern, (_match, _token, value) => {
      const parts = String(value ?? "").split(",");
      parts.forEach((part) => {
        const cleaned = part.trim();
        if (!cleaned || seen.has(cleaned)) return;
        seen.add(cleaned);
        tags.push(cleaned);
      });
      return "";
    })
    .replace(/\s+/g, " ")
    .trim();
  if (!tags.length) return stripped;
  const limited = tags.slice(0, maxTags);
  const tagToken = `tags:${limited.join(",")}`;
  return stripped ? `${stripped} ${tagToken}` : tagToken;
};
