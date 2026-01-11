/** @jsxRuntime classic */
/** @jsx h */
/** @jsxFrag Fragment */

import satori from "satori";

type OgFont = {
  name: string;
  data: Buffer;
  weight: number;
  style: "normal";
};

type OgTemplateInput = {
  title: string;
  subtitle?: string;
  date?: string;
  siteName: string;
  siteHost: string;
  showDate?: boolean;
  titleFontFamily?: string;
  subtitleFontFamily?: string;
  fonts: OgFont[];
};

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const ACCENT = "#1f6f6a";
const BG_BASE = "#FDFBF9";
const TEXT_DARK = "#374151";
const TEXT_MUTED = "#6b7280";
const DOT_CELL = 120;
const DOT_PATTERN = [
  { x: 24, y: 28, size: 5, opacity: 0.8 },
  { x: 92, y: 18, size: 3.5, opacity: 0.5 },
  { x: 35, y: 85, size: 4, opacity: 0.6 },
  { x: 82, y: 95, size: 6.5, opacity: 0.9 },
  { x: 62, y: 58, size: 3, opacity: 0.4 },
];

const clampText = (value: string, max: number) => {
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

const Fragment = (props: { children?: any }) => props.children;

const flattenChildren = (items: any[]): any[] =>
  items.flatMap((item) => (Array.isArray(item) ? flattenChildren(item) : [item]));

const sanitizeChildren = (items: any[]) =>
  items.filter((child) => {
    if (child === null || child === undefined || child === false) return false;
    if (typeof child === "string" && child.trim() === "") return false;
    return true;
  });

const h = (type: any, props: Record<string, unknown> | null, ...children: any[]) => {
  const baseProps = props ?? {};
  const style = { ...(baseProps.style as Record<string, unknown> | undefined) };
  const resolvedChildren = sanitizeChildren(flattenChildren(children));

  if (type === "div" && style.display == null) {
    style.display = "flex";
    if (style.flexDirection == null) style.flexDirection = "column";
  }

  return {
    type,
    props: {
      ...baseProps,
      style,
      children: resolvedChildren.length === 1 ? resolvedChildren[0] : resolvedChildren,
    },
  };
};

export const renderOgSvg = async ({
  title,
  subtitle,
  date,
  siteName,
  siteHost,
  showDate = true,
  titleFontFamily,
  subtitleFontFamily,
  fonts,
}: OgTemplateInput) => {
  const safeTitle = clampText(title, 90);
  const safeSubtitle = subtitle ? clampByUnits(subtitle, 40) : "";
  const safeDate = String(date ?? "").trim();
  const resolvedTitleFont = titleFontFamily ?? "Fraunces, LXGW WenKai, serif";
  const resolvedSubtitleFont = subtitleFontFamily ?? "LXGW WenKai, serif";
  const dotIndex = siteName.lastIndexOf(".");
  const siteNamePrefix = dotIndex > 0 ? siteName.slice(0, dotIndex) : siteName;
  const siteNameSuffix = dotIndex > 0 ? siteName.slice(dotIndex) : "";
  const dotRects = [];
  const dotRows = Math.ceil(OG_HEIGHT / DOT_CELL);
  const dotCols = Math.ceil(OG_WIDTH / DOT_CELL);

  for (let row = 0; row < dotRows; row += 1) {
    for (let col = 0; col < dotCols; col += 1) {
      const offsetX = col * DOT_CELL;
      const offsetY = row * DOT_CELL;
      DOT_PATTERN.forEach((dot, idx) => {
        const x = offsetX + dot.x;
        const y = offsetY + dot.y;
        const size = dot.size;
        dotRects.push(
          <rect
            key={`dot-${row}-${col}-${idx}`}
            x={x}
            y={y}
            width={size}
            height={size}
            fill={ACCENT}
            opacity={dot.opacity}
            transform={`rotate(45 ${x + size / 2} ${y + size / 2})`}
          />
        );
      });
    }
  }

  const headerDate =
    showDate && safeDate ? (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          paddingTop: 8,
        }}
      >
        <div
          style={{
            position: "relative",
            width: 14,
            height: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 14,
              height: 14,
              borderRadius: 9999,
              backgroundColor: ACCENT,
              opacity: 0.4,
            }}
          />
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: 9999,
              backgroundColor: ACCENT,
            }}
          />
        </div>
        <span
          style={{
            fontSize: 18,
            fontWeight: 500,
            fontFamily: "IBM Plex Sans, LXGW WenKai, sans-serif",
            letterSpacing: 0.45,
            color: TEXT_DARK,
            opacity: 0.9,
          }}
        >
          {safeDate}
        </span>
      </div>
    ) : null;

  const subtitleNode = safeSubtitle ? (
    <div
      style={{
        fontSize: 36,
        fontWeight: 500,
        fontFamily: resolvedSubtitleFont,
        lineHeight: 1.625,
        maxWidth: 768,
        opacity: 0.75,
        color: TEXT_DARK,
      }}
    >
      {safeSubtitle}
    </div>
  ) : null;

  const root = (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 84,
        position: "relative",
        backgroundColor: BG_BASE,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          right: 0,
          bottom: 0,
          opacity: 0.08,
        }}
      >
        <svg width="100%" height="100%">
          {dotRects}
        </svg>
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          right: 0,
          bottom: 0,
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 1200 630">
          <g transform="translate(1000 500)" opacity={0.15}>
            <circle r={300} fill="none" stroke={ACCENT} strokeWidth={2.5} />
            <circle
              r={240}
              fill="none"
              stroke={ACCENT}
              strokeWidth={1.5}
              strokeDasharray="10 10"
            />
            <circle r={180} fill="none" stroke={ACCENT} strokeWidth={1.5} />
          </g>
          <line x1={84} y1={0} x2={84} y2={630} stroke={ACCENT} strokeWidth={2} opacity={0.25} />
          <line
            x1={0}
            y1={156}
            x2={1200}
            y2={156}
            stroke={ACCENT}
            strokeWidth={1.5}
            opacity={0.2}
          />
          <g opacity={0.6} stroke={ACCENT} strokeWidth={3}>
            <path d="M79 156 h10 M84 151 v10" />
            <path d="M1111 156 h10 M1116 151 v10" />
            <path d="M1111 540 h10 M1116 535 v10" />
          </g>
          <rect x={1116} y={0} width={84} height={20} fill={ACCENT} opacity={0.15} />
          <rect x={1116} y={25} width={20} height={5} fill={ACCENT} opacity={0.3} />
        </svg>
      </div>
      <div
        style={{
          position: "relative",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <svg
              width={36}
              height={36}
              viewBox="0 0 512 512"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              style={{ filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.05))" }}
            >
              <rect x={88} y={64} width={80} height={240} rx={40} fill={TEXT_DARK} />
              <rect x={208} y={152} width={80} height={240} rx={40} fill={TEXT_DARK} />
              <rect x={328} y={64} width={80} height={240} rx={40} fill={TEXT_DARK} />
              <circle cx={368} cy={392} r={56} fill={ACCENT} />
            </svg>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  fontFamily: "IBM Plex Sans, LXGW WenKai, sans-serif",
                  letterSpacing: -0.6,
                  color: TEXT_DARK,
                  transform: "translateY(-2px)",
                }}
              >
                {siteNamePrefix}
                {siteNameSuffix ? (
                  <span style={{ color: ACCENT }}>{siteNameSuffix}</span>
                ) : null}
              </span>
            </div>
          </div>
          {headerDate}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flexGrow: 1,
            maxWidth: 896,
            marginTop: 16,
          }}
        >
          <div
            style={{
              fontSize: 70,
              fontWeight: 600,
              fontFamily: resolvedTitleFont,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              color: TEXT_DARK,
              marginBottom: subtitleNode ? 24 : 0,
            }}
          >
            {safeTitle}
          </div>
          {subtitleNode}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            paddingTop: 32,
            borderTop: "1px solid rgba(229,231,235,0.5)",
            color: TEXT_MUTED,
            opacity: 0.6,
          }}
        >
          <span
            style={{
              fontSize: 20,
              fontWeight: 500,
              fontFamily: "IBM Plex Sans, LXGW WenKai, sans-serif",
            }}
          >
            {`Read more at ${siteHost}`}
          </span>
          <div style={{ display: "flex", gap: 16, marginRight: 24, transform: "translateY(-2px)" }}>
            <div style={{ width: 8, height: 8, borderRadius: 9999, backgroundColor: ACCENT }} />
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 9999,
                backgroundColor: ACCENT,
                opacity: 0.5,
              }}
            />
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 9999,
                backgroundColor: ACCENT,
                opacity: 0.25,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  return await satori(root as any, {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    fonts,
  });
};
