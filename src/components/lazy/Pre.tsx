import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
import 'highlight.js/styles/dark.css';
import { decode } from "js-base64";
import { JSX } from "solid-js";
hljs.registerLanguage('bash', bash);
type Props = {
    lang: string,
    content: string,
    children: JSX.Element
}


const CodeHightlight = ({ lang, content }: Props) => {
    const rawCode = decode(content);
    const result = hljs.highlightAuto(rawCode).value
    return (
        <pre class="relative" data-lang={lang}>
            <code class={`language-${lang} hljs rounded`} innerHTML={result} />
        </pre>
    )
}
export default CodeHightlight;