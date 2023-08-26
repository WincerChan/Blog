import siteConf from "@/hugo.json";
import { z } from "zod";

export const HeadParamsSchema = z.object({
    title: z.string().default(""),
    date: z.date().default(new Date()),
    description: z.string().default(siteConf.description),
    keywords: z.array(z.string()).default(siteConf.keywords.split(", ")),
    pageURL: z.string().default(siteConf.baseURL),
    updated: z.date().default(new Date()),
    cover: z.string().default(""),
    words: z.number().default(0),
    subtitle: z.string().default(""),
    genre: z.string().default("Technology"),
    lang: z.string().optional(),
    isTranslation: z.boolean().optional(),
    toc: z.string().optional()
})

export type HeadParamsTyoe = z.infer<typeof HeadParamsSchema>;