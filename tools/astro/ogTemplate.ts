import { transformWithOxc, type Plugin } from 'vite';

// Satori's JSX creates plain element objects, not Solid components.
export function ogTemplate(): Plugin {
  return {
    name: 'blog-og-template',
    enforce: 'pre',
    transform(code, id) {
      if (!id.endsWith('/tools/content/og/template.tsx')) return;
      return transformWithOxc(code, id, {
        jsx: { runtime: 'classic', pragma: 'h', pragmaFrag: 'Fragment' },
      });
    },
  };
}
