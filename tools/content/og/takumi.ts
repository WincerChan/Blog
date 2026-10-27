import { Renderer } from '@takumi-rs/core';
import { fromJsx } from '@takumi-rs/helpers/jsx';
import type { OgFont } from './fonts';
import { buildOgTree, OG_WIDTH, OG_HEIGHT } from './template';
import { OG_PNG_SCALE, type OgRenderInput } from './targets';

export async function createOgPngRenderer(fonts: OgFont[]) {
  const renderer = new Renderer();
  for (const font of fonts) await renderer.registerFont(font);
  const fontFamilies = [...new Set(fonts.map(font => font.name))];

  return async (input: OgRenderInput): Promise<Buffer> => {
    const { node, css } = await fromJsx(buildOgTree(input));
    // Takumi's explicit dimensions are output pixels; DPR scales the logical
    // 1200 x 630 template without enlarging its layout or upscaling a bitmap.
    return renderer.render(node, {
      width: Math.round(OG_WIDTH * OG_PNG_SCALE),
      height: Math.round(OG_HEIGHT * OG_PNG_SCALE),
      devicePixelRatio: OG_PNG_SCALE,
      format: 'png',
      fontFamilies,
      css,
    });
  };
}
