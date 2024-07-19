import { extname } from "path";
import { Plugin } from "vite";
import PostLoader from "./PostLoader";
import BaseLoader from "./base/loader";


const getFileBaseName = (filepath: string): string => {
    const cleanFilePath = filepath.split('?')[0];
    const fileName = extname(cleanFilePath);
    return fileName
}
const isValidJsonXPath = (filepath: string): boolean => {
    if (getFileBaseName(filepath) == ".jsx" && filepath.includes("(hugo)"))
        return true
    return false
}

const TaxoLoader = (content: string, type: string) => {
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
    const processedFiles = new Set();

    const plugin: Plugin = {
        name: 'jsx-plugin',
        enforce: "pre",
        async transform(content: string, id: string) {
            if (!isValidJsonXPath(id)) return null;
            const filepath = id.split("?")[0]
            // const realPath = await fs.realpath(filepath);
            // if (processedFiles.has(realPath)) {
            //     return;
            // }
            // processedFiles.add(realPath);
            const parsedContent = JSON.parse(content.slice(15, -1));
            const _type = checkType(id)
            if (_type === 'base') {
                return BaseLoader(parsedContent)
            } else if (_type === 'post') {
                return PostLoader(parsedContent)
            } else if (_type === 'tags') {
                return TaxoLoader(content.slice(15, -1), '标签')
            } else if (_type === 'category') {
                return TaxoLoader(content.slice(15, -1), '分类')
            }
            return '<></>'
        }
    };
    return plugin
}












