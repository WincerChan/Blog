import "highlight.js/styles/magula.css";
import { base64ToUtf8 } from "~/utils/base64";

const Pre = ({ children, lang }) => {
    const code = base64ToUtf8(children);
    return (
        <pre class=" relative ">
            <code class="hljs rounded" data-lang={lang} innerHTML={code} />
        </pre>
    );
};

export default Pre;
