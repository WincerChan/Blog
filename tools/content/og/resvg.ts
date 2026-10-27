import { renderAsync } from "@resvg/resvg-js";
import type { ResvgRenderOptions } from "@resvg/resvg-js";
import sharp from "sharp";

type RenderPngOptions = {
  width?: number; // base width, default 1200
  scale?: number; // default 1
  resvgOptions?: ResvgRenderOptions;
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
  // resvg's asPng() encodes synchronously on the JS thread. Keep its exact
  // rasterized pixels, but encode assets asynchronously off the JS thread.
  return sharp(rendered.pixels, {
    raw: { width: rendered.width, height: rendered.height, channels: 4 },
  }).png({ compressionLevel: 6 }).toBuffer();
};

// Standalone SVG assets such as favicons. OG cards use Takumi directly.
export const renderPng = async (svg: string, opts: RenderPngOptions = {}) => {
  const baseWidth = opts.width ?? 1200;
  const scale = opts.scale ?? 1;
  const targetWidth = Math.round(baseWidth * scale);
  return renderSvgPng(svg, targetWidth, opts.resvgOptions);
};
