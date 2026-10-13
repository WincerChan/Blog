import site from '../../../site.config.json';
import { resolveOgImagePath } from './og';
export function structuredData(params: { path: string; title: string; description: string; date?: string; updated?: string; lang?: string; words?: number; subtitle?: string; keywords?: string[] }) {
    if (params.path === '/') return { '@context': 'https://schema.org', '@type': 'Blog' as const, name: site.title, url: site.baseURL };
    return {
        '@context': 'https://schema.org', '@type': 'BlogPosting' as const, name: params.title,
        editor: site.author.name, author: { '@type': 'Person', name: site.author.name, url: site.author.url },
        datePublished: params.date, dateModified: params.updated ?? params.date,
        image: new URL(resolveOgImagePath(params.path), site.baseURL).href,
        publisher: { '@type': 'Organization', name: site.title, logo: { '@type': 'ImageObject', url: new URL('/favicon/generated/logo-512.png', site.baseURL).href } },
        headline: params.title, inLanguage: params.lang ?? 'zh-CN',
        mainEntityOfPage: { '@type': 'WebPage', '@id': new URL(params.path, site.baseURL).href },
        keywords: params.keywords?.join(', '), description: params.description.slice(0, 200), genre: 'Technology',
        ...(params.words ? { wordCount: params.words } : {}), ...(params.subtitle ? { alternativeHeadline: params.subtitle } : {}),
    };
}
