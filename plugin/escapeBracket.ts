import { CheerioAPI, load } from "cheerio";

const wrapTable = ($: CheerioAPI) => {
    $("table").wrap('<div class="table-wrapper"></div>');
    return $;
};

const escapeBracket = (content: string) => {
    const bracketPattern = /[\{\}]/g;
    let $ = load(content.replaceAll("<hr>", "<hr/>"), {
        xmlMode: true,
        decodeEntities: false,
    });
    $ = wrapTable($);
    $("code").each((index, element) => {
        const text = $(element).html() || "";
        const escapedText = text.replace(bracketPattern, (match) => {
            return `{'${match}'}`;
        });
        $(element).html(escapedText);
    });

    // 如果代码片段在 <pre> 标签内，可以类似处理
    $("pre").each((index, element) => {
        const text = $(element).html() || "";
        const escapedText = text.replace(bracketPattern, (match) => {
            return `{'${match}'}`;
        });
        $(element).html(escapedText);
    });

    return $.html();
};

export default escapeBracket;
