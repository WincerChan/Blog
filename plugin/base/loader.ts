const AboutLoader = (parsedContent) => {
    const { content, ...rest } = parsedContent
    const transformedCode = `
                import PostLayout from "~/components/layouts/PostLayout"
                
                const About = () => {
                    return (
                        <PostLayout rawBlog={${JSON.stringify(rest)}}>
                                ${content}
                        </PostLayout>
                    )
                }
                
                export default About;
    `
    return transformedCode
}

const OtherPageLoader = (parsedContent, name) => {
    const { content, ...rest } = parsedContent
    const transformCode = `
        import ${name} from "~/components/page/${name}"

        const OtherPage = () => {
            return (
                <${name} page={${JSON.stringify(rest)}}>
                    ${content}
                </${name}>
            )
        }
        export default OtherPage;
    `
    return transformCode
}

const ArchLoader = (parsedContent) => {
    const { _, ...rest } = parsedContent
    const transformCode = `
        import Arch from "~/components/page/Archives"
        const ArchPage = () => {
            return (
                <Arch page={${JSON.stringify(rest)}} />
            )
        }
        export default ArchPage;
    `
    return transformCode
}

const BaseLoader = (parsedContent) => {
    if (parsedContent.slug.startsWith('/about')) {
        return AboutLoader(parsedContent)
    } else if (parsedContent.slug.startsWith('/life')) {
        return OtherPageLoader(parsedContent, "Life")
    } else if (parsedContent.slug.startsWith('/search')) {
        return OtherPageLoader(parsedContent, "Search")
    } else if (parsedContent.slug.startsWith('/friends')) {
        return OtherPageLoader(parsedContent, "Friends")
    } else if (parsedContent.slug.startsWith('/archives')) {
        return ArchLoader(parsedContent)
    }
    return AboutLoader(parsedContent)
}
export default BaseLoader;