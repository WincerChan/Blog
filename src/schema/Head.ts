import { z } from "zod";

export const HeadParamsSchema = z.object({
    title: z.string().default(""),
    date: z.date().default(new Date()),
    description: z.string().default(__SITE_CONF.description),
    keywords: z.array(z.string()).default(__SITE_CONF.keywords.split(", ")),
    pageURL: z.string().default(__SITE_CONF.baseURL),
    updated: z.date().default(new Date()),
    cover: z.string().default(""),
    words: z.number().default(0),
    subtitle: z.string().default(""),
    genre: z.string().default("Technology"),
    mathrender: z.boolean().optional(),
    lang: z.string().optional(),
    isTranslation: z.boolean().optional(),
    toc: z.string().optional()
})

export type HeadParamsTyoe = z.infer<typeof HeadParamsSchema>;
