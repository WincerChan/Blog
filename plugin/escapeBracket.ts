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

    const escapeText = (text: string) =>
        text.replace(bracketPattern, (match) => `{'${match}'}`);

    const walkAndEscapeTextNodes = () => {
        const walk = (elem: any) => {
            elem.contents().each((_, child: any) => {
                if (child.type === "text") {
                    child.data = escapeText(child.data || "");
                    return;
                }
                if (child.type !== "tag") return;
                const tag = child.name?.toLowerCase();
                if (!tag) return;
                if (tag === "code" || tag === "pre" || tag === "script" || tag === "style")
                    return;
                walk($(child));
            });
        };
        walk($.root());
    };

    walkAndEscapeTextNodes();
    $("code").each((index, element) => {
        const text = $(element).html() || "";
        const escapedText = escapeText(text);
        $(element).html(escapedText);
    });

    // 如果代码片段在 <pre> 标签内，可以类似处理
    $("pre").each((index, element) => {
        const text = $(element).html() || "";
        const escapedText = escapeText(text);
        $(element).html(escapedText);
    });

    return $.html();
};

export default escapeBracket;
