import "highlight.js/styles/magula.css"
import { decode } from "js-base64"

const Pre = ({ children, lang }) => {
    const code = decode(children)
    return (
        <pre class=" relative ">
            <code class="hljs rounded" data-lang={lang} innerHTML={code} />
        </pre>
    )
}

export default Pre