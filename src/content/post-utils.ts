import pkg from "crypto-js";
import { BlogScore } from "~/schema/Post";
import { padTo32 } from "~/utils";
import { postUrl, publishedPosts } from "./velite";

const { enc, AES } = pkg as any;

type VelitePost = {
    slug: string;
    title: string;
    date: string;
    category?: string;
    tags?: string[];
    encrypt_pwd?: string;
};

const encryptHtml = (pwd: string, html: string) => {
    const key = enc.Hex.parse(padTo32(pwd ? pwd : ""));
    return AES.encrypt(html, key, { iv: key }).toString();
};

const maybeEncryptHtml = (post: VelitePost, html: string) => {
    if (!post.encrypt_pwd) return html;
    return encryptHtml(post.encrypt_pwd, html);
};

const findRelatedPosts = (post: VelitePost): BlogScore[] => {
    const sameCate = String(post.category ?? "");
    const tags = new Set((post.tags ?? []).map(String));
    const scores = new Map<string, { score: number; p: any }>();

    for (const p of publishedPosts()) {
        if (p.slug === post.slug) continue;
        let score = 0;
        if (sameCate && String(p.category ?? "") === sameCate) score += 0.5;
        for (const t of p.tags ?? []) {
            if (tags.has(String(t))) score += 1;
        }
        if (score <= 0) continue;
        scores.set(p.slug, { score, p });
    }

    return Array.from(scores.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, 6)
        .map(({ score, p }) => ({
            title: p.title,
            slug: postUrl(p.slug),
            date: p.date,
            score,
        }));
};

export { findRelatedPosts, maybeEncryptHtml };

