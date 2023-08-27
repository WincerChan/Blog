import path from "path";
import { Plugin } from "vite";
import PostLoader from "./PostLoader";
import BaseLoader from "./base/loader";


const TaxoLoader = (content, type) => {
    const transformedCode = `
                import { lazy } from "solid-js";
                const TaxoLayout = lazy(() => import("~/components/layouts/TaxoLayout"))
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
    if (id.includes('/posts/')) {
        return 'post';
    } else if (id.includes('/tags/')) {
        return 'tags'
    } else if (id.includes('/category/')) {
        return 'category'
    } else {
        return 'base'
    }
}

export default function () {
    const plugin: Plugin = {
        name: 'jsonx-plugin',
        enforce: "pre",
        async transform(content: string, id: string) {
            if (path.extname(id) !== '.jsonx') {
                return null;
            }
            const parsedContent = JSON.parse(content);
            const _type = checkType(id)
            if (_type === 'base') {
                return BaseLoader(parsedContent)
            } else if (_type === 'post') {
                return PostLoader(parsedContent)
            } else if (_type === 'tags') {
                return TaxoLoader(content, '标签')
            } else if (_type === 'category') {
                return TaxoLoader(content, '分类')
            }
            return '<></>'
        },
        generateBundle(options, bundle) {
            for (const fileName in bundle) {
                if (fileName.endsWith('.jsonx')) {
                    const file = bundle[fileName];
                    console.log(fileName)
                    delete bundle[fileName]; // Remove the original file from the bundle
                }
            }
        },
    };
    return plugin
}
