import path from "path";
import PostLoader from "./PostLoader";

const loader = async (code: string, id: string) => {

}

const PageLoader = (content, parsedContent) => {
    const transformedCode = `
                import PageLayout from "~/components/layouts/PageLayout";
                import { PageSchema } from "~/schema/Page";
                import Img from "~/components/lazy/Img"
                import { A } from "solid-start"
                
                const About = () => {
                    return (
                        <PageLayout page={${content}} showComment={true}>
                            <section>
                                ${parsedContent.content}
                            </section>
                        </PageLayout>
                    )
                }
                
                export default About;
    `
    return {
        code: transformedCode,
        map: null
    }
}

const TaxoLoader = (content, type) => {
    const transformedCode = `
                import TaxoLayout from "~/components/layouts/TaxoLayout";
                const Taxo = () => {
                    return (
                        <TaxoLayout rawTaxo={${content}} type="${type}" />
                    )
                }
                export default Taxo;
    `
    return {
        code: transformedCode,
        map: null
    }
}

const checkType = (id: string) => {
    if (id.includes('about')) {
        return 'base';
    } else if (id.includes('posts')) {
        return 'post';
    } else if (id.includes('tags')) {
        return 'tags'
    } else if (id.includes('category')) {
        return 'category'
    }
}

export default function () {
    return {
        name: 'jsonx-plugin',
        async transform(content: string, id: string) {
            if (path.extname(id) !== '.jsonx') {
                return null;
            }
            const parsedContent = JSON.parse(content);
            const _type = checkType(id)
            if (_type === 'base') {
                return PageLoader(content, parsedContent)
            } else if (_type === 'post') {
                return PostLoader(content, parsedContent)
            } else if (_type === 'tags') {
                return TaxoLoader(content, '标签')
            } else if (_type === 'category') {
                return TaxoLoader(content, '分类')
            }
            return {
                code: '<></>',
                map: null
            };
        }
    };
}
