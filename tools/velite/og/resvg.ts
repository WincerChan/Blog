import { renderAsync } from "@resvg/resvg-js";
import type { ResvgRenderOptions } from "@resvg/resvg-js";

type RenderPngOptions = {
  width?: number; // base width, default 1200
  scale?: number; // default 1
  resvgOptions?: ResvgRenderOptions;
};

type OgSvgLayers = {
  backgroundSvg: string;
  foregroundContents: string;
  sourceWidth: number;
  sourceHeight: number;
};

const SVG_ROOT_RE = /<svg\b([^>]*)>/i;
const SVG_IMAGE_RE = /<image\b([^>]*)\/?>/gi;
const SVG_BACKGROUND_RE =
  /<rect x="0" y="0" width="[^"]+" height="[^"]+" fill="#fdfbf9"\s*\/?>/i;
const OG_FOREGROUND_IMAGE_INDEX = 2;

const parsePositiveNumber = (value: string | undefined) => {
  const parsed = Number.parseFloat(value ?? "");
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};

const resolveSvgSize = (svg: string) => {
  const root = svg.match(SVG_ROOT_RE)?.[1] ?? "";
  const attrs = Object.fromEntries(
    [...root.matchAll(/([\w:-]+)\s*=\s*["']([^"']*)["']/g)].map((match) => [
      match[1],
      match[2],
    ]),
  );
  const viewBox = root.match(
    /viewBox\s*=\s*["']\s*([\d.+-]+)[\s,]+([\d.+-]+)[\s,]+([\d.+-]+)[\s,]+([\d.+-]+)\s*["']/i,
  );
  const viewBoxWidth = parsePositiveNumber(viewBox?.[3]);
  const viewBoxHeight = parsePositiveNumber(viewBox?.[4]);
  const width = parsePositiveNumber(attrs.width) ?? viewBoxWidth ?? 1200;
  const height = parsePositiveNumber(attrs.height) ?? viewBoxHeight ?? 630;
  return { width, height };
};

const renderSvgPng = async (
  svg: string,
  targetWidth: number,
  resvgOptions?: ResvgRenderOptions,
) => {
  const svgHasText = /<text[\s>]/i.test(svg);
  const font = resvgOptions?.font ?? { loadSystemFonts: svgHasText };
  const rendered = await renderAsync(svg, {
    ...resvgOptions,
    fitTo: resvgOptions?.fitTo ?? { mode: "width", value: targetWidth },
    font,
  });
  return rendered.asPng();
};

// Satori serializes the two decorative SVG layers as data-image resources.
// They are identical for every OG card, so rasterize them once and reuse them.
const splitOgSvg = (svg: string): OgSvgLayers | undefined => {
  const matches = [...svg.matchAll(SVG_IMAGE_RE)];
  if (matches.length <= OG_FOREGROUND_IMAGE_INDEX) return undefined;

  const sourceSize = resolveSvgSize(svg);
  const root = svg.match(SVG_ROOT_RE)?.[0];
  if (!root) return undefined;

  const staticEnd = matches[OG_FOREGROUND_IMAGE_INDEX].index;
  if (staticEnd == null) return undefined;
  const backgroundSvg = svg.slice(0, staticEnd) + "</svg>";
  const foregroundSvg = svg
    .replace(matches[0][0], "")
    .replace(matches[1][0], "")
    .replace(SVG_BACKGROUND_RE, "");
  const foregroundContents = foregroundSvg
    .replace(root, "")
    .replace(/<\/svg>\s*$/i, "");

  return {
    backgroundSvg,
    foregroundContents,
    sourceWidth: sourceSize.width,
    sourceHeight: sourceSize.height,
  };
};

export const renderPng = async (svg: string, opts: RenderPngOptions = {}) => {
  const baseWidth = opts.width ?? 1200;
  const scale = opts.scale ?? 1;
  const targetWidth = Math.round(baseWidth * scale);
  return renderSvgPng(svg, targetWidth, opts.resvgOptions);
};

export const createOgPngRenderer = async (
  templateSvg: string,
  opts: RenderPngOptions = {},
) => {
  const baseWidth = opts.width ?? 1200;
  const scale = opts.scale ?? 1;
  const targetWidth = Math.round(baseWidth * scale);
  const layers = splitOgSvg(templateSvg);

  if (!layers) {
    return async (svg: string) => renderPng(svg, opts);
  }

  const targetHeight = Math.max(
    1,
    Math.round((layers.sourceHeight / layers.sourceWidth) * targetWidth),
  );
  const backgroundPng = await renderSvgPng(
    layers.backgroundSvg,
    targetWidth,
    opts.resvgOptions,
  );
  const backgroundDataUrl = "data:image/png;base64," + backgroundPng.toString("base64");
  const foregroundScale = targetWidth / layers.sourceWidth;

  return async (svg: string) => {
    const currentLayers = splitOgSvg(svg);
    if (!currentLayers || currentLayers.backgroundSvg !== layers.backgroundSvg) {
      return renderPng(svg, opts);
    }

    const compositeSvg = [
      '<svg width="' +
        targetWidth +
        '" height="' +
        targetHeight +
        '" viewBox="0 0 ' +
        targetWidth +
        " " +
        targetHeight +
        '" xmlns="http://www.w3.org/2000/svg">',
      '<image x="0" y="0" width="' +
        targetWidth +
        '" height="' +
        targetHeight +
        '" href="' +
        backgroundDataUrl +
        '"/>',
      '<g transform="scale(' + foregroundScale + ')">' + currentLayers.foregroundContents + "</g>",
      "</svg>",
    ].join("");
    return renderSvgPng(compositeSvg, targetWidth, opts.resvgOptions);
  };
};
