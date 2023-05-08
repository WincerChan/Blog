import { decode } from "js-base64";
import "katex/dist/katex.min.css";

const MathDecode = ({ children }) => {
    const code = decode(children)
    return (
        <div class="<md:px-8 <md:max-w-screen" innerHTML={code} />
    )
}

export default MathDecode