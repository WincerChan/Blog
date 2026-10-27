import { defineConfig } from 'astro/config';
import solid from '@astrojs/solid-js';
import UnoCSS from 'unocss/vite';
import Icons from 'unplugin-icons/vite';
import { cp, mkdir, rm, copyFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { build } from 'vite';
import { fileURLToPath } from 'node:url';
import computeSwHash from './tools/build/swHash.ts';
import { ogTemplate } from './tools/astro/ogTemplate.ts';
import { blogSitemap } from './tools/astro/sitemap.ts';
import { markdownOptions } from './tools/content/markdown.ts';
import { existsSync } from 'node:fs';
import site from './site.config.json' with { type: 'json' };

if (existsSync('.env')) process.loadEnvFile('.env');
const syncAssets = async () => {
  await mkdir('.astro-public', { recursive: true });
  await cp('public', '.astro-public', { recursive: true,
    filter: source => !['_data', 'sw.js', 'og', 'category', 'posts', 'pages', 'sass',
      'search-index.json', 'atom.xml', 'sitemap.xml', 'manifest.webmanifest', 'valid_paths.txt']
      .includes(source.split('/')[1]),
  });
};

export default defineConfig({
  site: site.baseURL,
  srcDir: './src/astro',
  outDir: './dist/astro',
  publicDir: './.astro-public',
  trailingSlash: 'always',
  markdown: markdownOptions,
  integrations: [solid({ exclude: ["tools/content/og/**"] }), {
    name: 'blog-static-assets',
    hooks: { 'astro:config:setup': async () => {
      await rm('.astro-public', { recursive: true, force: true });
      await syncAssets();
    }, 'astro:build:done': async ({ dir }) => {
      const outDir = fileURLToPath(dir);
      await build({ configFile: false, publicDir: false, build: { outDir, emptyOutDir: false,
        rolldownOptions: { input: resolve('src/site/service-worker.ts'), output: { entryFileNames: 'sw.js' } },
      } });
      await mkdir(resolve(outDir, '404'), { recursive: true });
      await copyFile(resolve(outDir, '404.html'), resolve(outDir, '404/index.html'));
    } },
  }, blogSitemap()],
  vite: {
    plugins: [ogTemplate(), UnoCSS(), Icons({ compiler: 'solid' })],
    resolve: { alias: { '~': resolve('src'), '@': resolve('.') } },
    envPrefix: ['PUBLIC_', 'INKSTONE_API_'],
    define: { __SITE_CONF: JSON.stringify(site), __SW_HASH: JSON.stringify(computeSwHash()) },
  },
});
