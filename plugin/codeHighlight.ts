import { load } from "cheerio";
import hljs from "highlight.js";
import { utf8ToBase64, base64ToUtf8 } from "../src/utils/base64";

const renderHighlight = (content: string) => {
    const $ = load(content, { xmlMode: true, decodeEntities: false });
    $("Pre").each((index, element) => {
        const lang = $(element).attr("lang");
        if (!lang) return;
        if (lang.includes("$lang")) return;
        const code = base64ToUtf8($(element).find("code").html() || "");
        const normalized = lang.trim().toLowerCase();
        const highlightedCode = hljs.getLanguage(normalized)
            ? hljs.highlight(code, { language: normalized, ignoreIllegals: true }).value
            : hljs.highlightAuto(code).value;
        $(element).html(utf8ToBase64(highlightedCode));
    });
    return $.html();
};

export default renderHighlight;
