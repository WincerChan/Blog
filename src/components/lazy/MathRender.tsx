import { decode } from 'js-base64';
import katex from "katex";

const MathRender = ({ content }: { content: string }) => {
    const rawCode = decode(content)

    const code = katex.renderToString(rawCode, { output: 'mathml' })
    return (
        <span innerHTML={code} />
    )
}

export default MathRender;