import { load } from "cheerio";
import hljs from "highlight.js";
import { utf8ToBase64, base64ToUtf8 } from "../src/utils/base64";

const renderHighlight = (content: string) => {
    const $ = load(content, { xmlMode: true });
    $("Pre").each((index, element) => {
        const lang = $(element).attr("lang");
        if (!lang) throw new Error("lang is not defined");
        if (lang.includes("$lang")) return;
        const code = base64ToUtf8($(element).find("code").html() || "");
        const highlightedCode = hljs.highlight(code, { language: lang }).value;
        $(element).html(utf8ToBase64(highlightedCode));
    });
    return $.html();
};

export default renderHighlight;
