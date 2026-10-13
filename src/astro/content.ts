// Build-only. The Content Layer exposes only sanitized/encrypted article data.
import { getCollection, getEntry } from 'astro:content';
const entries = await getCollection('blog');
export const posts = entries.flatMap(entry => entry.data.kind === 'post' ? [entry.data.value] : []);
export const pages = entries.flatMap(entry => entry.data.kind === 'page' ? [entry.data.value] : []);
const site = await getEntry('blog', 'site');
if (!site || site.data.kind !== 'site') throw new Error('Missing blog site metadata');
export const { latest, categories, categoryData, friends } = site.data.value;
