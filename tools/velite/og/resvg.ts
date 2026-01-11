import { renderAsync } from "@resvg/resvg-js";
import type { ResvgRenderOptions } from "@resvg/resvg-js";

type RenderPngOptions = {
  width?: number; // base width, default 1200
  scale?: number; // default 1
  resvgOptions?: ResvgRenderOptions;
};

export const renderPng = async (svg: string, opts: RenderPngOptions = {}) => {
  const baseWidth = opts.width ?? 1200;
  const scale = opts.scale ?? 1;
  const targetWidth = Math.round(baseWidth * scale);
  const resvgOptions = opts.resvgOptions;
  const svgHasText = /<text[\s>]/i.test(svg);
  const font = resvgOptions?.font ?? { loadSystemFonts: svgHasText };
  const rendered = await renderAsync(svg, {
    ...resvgOptions,
    fitTo: resvgOptions?.fitTo ?? { mode: "width", value: targetWidth },
    font,
  });

  return rendered.asPng();
};
