import { promises } from "fs";
import path from "path";

const loader = async (code: string, id: string) => {

}

export default function () {
    return {
        name: 'jsonx-plugin',
        async transform(code: string, id: string) {
            if (path.extname(id) !== '.jsonx') {
                return null;
            }

            const content = await promises.readFile(id, 'utf-8');
            const parsedContent = JSON.parse(content);

            const transformedCode = `
                import PostLayout from "~/components/layouts/PostLayout"
                import Img from "~/components/lazy/Img"
                import Pre from "~/components/lazy/Pre"
                import { A } from "solid-start"
                const Post = () => {
                    return (
                        <PostLayout rawBlog={${content}}>
                            ${parsedContent.content}
                        </PostLayout>
                    )
                }
                export default Post;
            `;
            return {
                code: transformedCode,
                map: null
            };
        }
    };
}
