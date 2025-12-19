type WithUpdatedObj = { updatedObj?: { getTime?: () => number } };

export const escapeXmlText = (value: string) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

export const latestUpdated = (items: WithUpdatedObj[]) =>
  items.reduce((acc, x) => Math.max(acc, x.updatedObj?.getTime?.() ?? 0), 0);
