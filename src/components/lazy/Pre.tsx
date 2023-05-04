import hljs from "highlight.js/lib/core";
import 'highlight.js/styles/magula.css';
import { decode } from "js-base64";
import { JSX } from "solid-js";
type Props = {
    lang: string,
    content: string,
    children: JSX.Element
}

const CodeHightlight = ({ lang, content }: Props) => {
    // registerLanguages(lang);
    const rawCode = decode(content);
    const result = hljs.highlightAuto(rawCode).value
    return (
        <pre class="relative" data-lang={lang}>
            <code class={`language-${lang} hljs rounded`} innerHTML={result} />
        </pre>
    )
}
export default CodeHightlight;