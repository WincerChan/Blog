import { load } from "cheerio";
import { encode } from "js-base64";
// import hljs from "highlight.js";
import he from "he";
import katex from "katex";



const renderMath = (content: string) => {
    const mathPattern = /\$\$([\s\S]+?)\$\$/g;
    let result = content.replace(mathPattern, (match, formula) => {
        try {
            const renderResult = katex.renderToString(he.decode(formula), { output: 'html', displayMode: true });
            let $ = load(renderResult)
            $('annotation').remove()
            return `<MathDecode>${encode($('body').html())}</MathDecode>`
        } catch (err) {
            console.error('Failed to render math formula:', err.message);
            return match; // If rendering fails, return the original content
        }
    });
    return result
};


export default renderMath