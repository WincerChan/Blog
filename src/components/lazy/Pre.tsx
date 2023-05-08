import { decode } from "js-base64"

const Pre = ({ content }) => {
    const code = decode(content)
    return (
        <div innerHTML={code} />
    )
}

export default Pre