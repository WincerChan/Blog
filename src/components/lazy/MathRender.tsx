import katex from "katex";
import { base64ToUtf8 } from "~/utils/base64";

const MathRender = ({ content }: { content: string }) => {
    const rawCode = base64ToUtf8(content);

    const code = katex.renderToString(rawCode, {
        output: "mathml",
        displayMode: true,
    });
    return <span innerHTML={code} />;
};

export default MathRender;
