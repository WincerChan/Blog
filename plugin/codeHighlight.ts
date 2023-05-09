import { load } from "cheerio";
import hljs from "highlight.js";
import { encode } from "js-base64";



const renderHighlight = (content: string) => {
    const $ = load(content, { xmlMode: true, decodeEntities: false })
    $('Pre').each((index, element) => {
        const lang = $(element).attr('lang')
        if (!lang) throw new Error("lang is not defined")
        if (lang.includes("$lang")) return
        const code = $(element).find("code").html() || ""
        const highlightedCode = hljs.highlight(code, { language: lang }).value
        $(element).html(encode(highlightedCode))
    })
    return $.html()
}

export default renderHighlight;