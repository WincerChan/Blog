import path from "path";
import PostLoader from "./PostLoader";


const PageLoader = (parsedContent) => {
    const { content, ...rest } = parsedContent
    const transformedCode = `
                import { PageSchema } from "~/schema/Page";
                import Img from "~/components/lazy/Img"
                import { A } from "solid-start"
                import {Suspense, lazy} from "solid-js";
                import EmptyLayout from "~/components/layouts/EmptyLayout"
                
                const PageLayout = lazy(() => import("~/components/layouts/PageLayout"))
                const About = () => {
                    return (
                <Suspense>
                        <PageLayout page={${JSON.stringify(rest)}} showComment={true}>
                            <section>
                                ${content}
                            </section>
                        </PageLayout>
                </Suspense>
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
                import {Suspense} from "solid-js";
                import { lazy } from "solid-js";
                import EmptyLayout from "~/components/layouts/EmptyLayout"

                const TaxoLayout = lazy(() => import("~/components/layouts/TaxoLayout"))
                const Taxo = () => {
                    return (
                <Suspense>
                        <TaxoLayout rawTaxo={${content}} type="${type}" />
                </Suspense>
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
    const plugin = {
        name: 'jsonx-plugin',
        async transform(content: string, id: string) {
            if (path.extname(id) !== '.jsonx') {
                return null;
            }
            const parsedContent = JSON.parse(content);
            const _type = checkType(id)
            if (_type === 'base') {
                return PageLoader(parsedContent)
            } else if (_type === 'post') {
                return PostLoader(parsedContent)
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
    return plugin
}
