import { load } from "cheerio"

const escapeBracket = (content: string) => {
    const bracketPattern = /[\{\}]/g
    const $ = load(content, { xmlMode: true, decodeEntities: false })
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
    return $
}

export default escapeBracket