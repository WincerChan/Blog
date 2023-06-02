import { load } from "cheerio"

const escapeBracket = (content: string) => {
    const bracketPattern = /[\{\}]/g
    const $ = load(content.replaceAll("<hr>", "<hr/>"), { xmlMode: true, decodeEntities: false })
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