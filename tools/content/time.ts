const pad2 = (n: number) => String(n).padStart(2, "0");

export const formatUtc = (date: Date) => {
  const yyyy = date.getUTCFullYear();
  const mm = pad2(date.getUTCMonth() + 1);
  const dd = pad2(date.getUTCDate());
  const hh = pad2(date.getUTCHours());
  const mi = pad2(date.getUTCMinutes());
  const ss = pad2(date.getUTCSeconds());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}Z`;
};

export const parseDateLikeHugo = (input: string | undefined) => {
  if (!input) return new Date(0);
  const v = input.trim();
  let normalized = v.replace(/\s+([+-]\d{2}:?\d{2}|[zZ])$/, "$1");
  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) normalized = `${normalized}T00:00:00`;
  if (normalized.includes(" ") && !normalized.includes("T")) normalized = normalized.replace(" ", "T");
  normalized = normalized.replace(/T(\d):/, "T0$1:");
  normalized = normalized.replace(/([+-]\d{2})(\d{2})$/, "$1:$2");
  if (!/[zZ]$|[+-]\d{2}:\d{2}$/.test(normalized)) normalized = `${normalized}+08:00`;
  return new Date(normalized);
};

