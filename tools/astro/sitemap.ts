import sitemap from '@astrojs/sitemap';
import type { AstroIntegration } from 'astro';
import { readFile, stat } from 'node:fs/promises';
import { SITEMAP_METADATA_FILE, type SitemapMetadata } from '../content/sitemap';

export function blogSitemap(): AstroIntegration {
  let metadataFile: URL;
  let metadata: SitemapMetadata = {};
  const integration = sitemap({
    xslURL: '/sitemap.xsl',
    namespaces: { image: true, xhtml: true, news: false, video: false },
    serialize: item => ({ ...item, ...metadata[item.url] }),
  });
  const hooks = integration.hooks;
  return {
    ...integration,
    hooks: {
      ...hooks,
      'astro:config:done': async options => {
        metadataFile = new URL(SITEMAP_METADATA_FILE, options.config.cacheDir);
        await hooks['astro:config:done']?.(options);
      },
      'astro:build:done': async options => {
        metadata = JSON.parse(await readFile(metadataFile, 'utf8'));
        await hooks['astro:build:done']?.(options);
        // The integration logs some generation errors instead of rejecting.
        // A successful blog build must still produce its advertised index.
        await stat(new URL('sitemap-index.xml', options.dir));
      },
    },
  };
}
