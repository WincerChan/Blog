import { defineCollection } from 'astro:content';
import { blogLoader } from '../../tools/content/loader';
import { blogSchema } from '../../tools/content/collections';

export const collections = {
  blog: defineCollection({ loader: blogLoader(), schema: blogSchema }),
};
