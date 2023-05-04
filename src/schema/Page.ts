import { z } from "zod";

export const PageSchema = z.object({
    title: z.string(),
    date: z.string().transform((v) => new Date(v)),
    cover: z.string().optional(),
    content: z.string(),
    slug: z.string(),
    summary: z.string()
})

export type BasePage = z.infer<typeof PageSchema>;