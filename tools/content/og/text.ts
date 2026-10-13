export const clampText = (value: string, max: number) => {
  const trimmed = String(value ?? "").trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max)}…`;
};

const isWideChar = (char: string) =>
  /[\u1100-\u115F\u2E80-\u9FFF\uAC00-\uD7A3\uF900-\uFAFF\uFE10-\uFE6F\uFF01-\uFF60\uFFE0-\uFFE6]/.test(
    char
  );

export const clampByUnits = (value: string, maxUnits: number) => {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return "";
  let units = 0;
  let output = "";

  for (const char of trimmed) {
    const nextUnits = units + (isWideChar(char) ? 1 : 0.55);
    if (nextUnits > maxUnits) return `${output.trimEnd()}…`;
    units = nextUnits;
    output += char;
  }

  return output;
};
