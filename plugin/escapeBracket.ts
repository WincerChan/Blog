import { CheerioAPI, load } from "cheerio";

const wrapTable = ($: CheerioAPI) => {
    $('table').wrap('<div class="table-wrapper"></div>');
    return $
}

const escapeBracket = (content: string) => {
    const bracketPattern = /[\{\}]/g
    let $ = load(content.replaceAll("<hr>", "<hr/>"), { xmlMode: true, decodeEntities: false })
    $ = wrapTable($);
    $('p').each((index, element) => {
        const text = $(element).html() || ""
        const escapedText = text.replace(bracketPattern, (match) => {
            try {
                const escapeResult = `{'${match}'}`
                return escapeResult
            } catch (err) {
                return match
            }
        })
        $(element).html(escapedText)
    })
    return $.html()
}

export default escapeBracket