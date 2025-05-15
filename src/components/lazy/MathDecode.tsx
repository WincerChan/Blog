import "katex/dist/katex.min.css";
import { base64ToUtf8 } from "~/utils/base64";

const MathDecode = ({ children }) => {
    const code = base64ToUtf8(children);
    return <span class="<md:px-4 <md:max-w-screen" innerHTML={code} />;
};

export default MathDecode;
