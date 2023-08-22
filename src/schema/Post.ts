import { z } from 'zod'


export const BlogDetailedSchema = z.object({
    slug: z.string().default('404'),
    title: z.string(),
    date: z.string().transform((v) => new Date(v)),
    updated: z.string().transform((v) => new Date(v)),
    content: z.string().default(""),
    cover: z.string(),
    tags: z.array(z.coerce.string()),
    summary: z.string().optional(),
    category: z.string(),
    words: z.number(),
    toc: z.string(),
    mathrender: z.boolean().default(false),
    subtitle: z.string().optional(),
    password: z.string().optional(),
    secondaryLang: z.string().transform((v) => v === 'true'),
    lang: z.string().default('zh-CN'),
    neighbours: z.object({
        prev: z.object({
            title: z.string(),
            slug: z.string(),
        }).optional(),
        next: z.object({
            title: z.string(),
            slug: z.string(),
        }).optional(),
    })
})

export const DefaultBlogDetailed: BlogDetailed = {
    slug: '404',
    title: '404 Not Found',
    date: new Date(),
    updated: new Date(),
    content: '404 Not Found, please check the url',
    cover: '',
    tags: [],
    category: '',
    words: 0,
    subtitle: '',
    toc: '',
    neighbours: {}
}

export const BlogMinimalSchema = z.object({
    slug: z.string(),
    title: z.string(),
    date: z.string().transform((v) => new Date(v)),
    category: z.string(),
    cover: z.string(),
    words: z.number().default(0),
    subtitle: z.string().optional(),
    summary: z.string().optional(),
})

export const BlogScoreSchema = z.object({
    slug: z.string(),
    title: z.string(),
    date: z.string().transform((v) => new Date(v)),
    score: z.number(),
})


export type BlogDetailed = z.infer<typeof BlogDetailedSchema>
export type BlogMinimal = z.infer<typeof BlogMinimalSchema>
export type BlogScore = z.infer<typeof BlogScoreSchema>

