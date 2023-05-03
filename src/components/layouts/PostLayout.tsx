import { BlogDetailed, BlogDetailedSchema } from "~/schema/Post";
import { formatDate } from "~/utils";
import TagCollection from "../core/section/Tag";
import ArticleTitle from "../core/section/Title";
import LazyBg from "../lazy/BG";
import LazyImg from "../lazy/Img";
import ContentLayout from "./ContentLayout";

const PostMeta = ({ blog }: { blog: BlogDetailed }) => {
    return (
        <LazyBg dataSrc={blog.cover} class="bg-center bg-cover bg-clip-text backdrop-filter backdrop-blur-lg text-opacity-60 text-[var(--meta-bg)]" >
            <div class="flex items-center overflow-x-scroll <md:mx-4 hyphens-auto whitespace-nowrap space-x-4 scrollbar-none leading-loose">
                <span>{formatDate(blog.date)}</span>
                <div class="h-0.5 w-0.5 mx-4 rounded-full bg-[var(--subtitle)]"></div>
                <TagCollection tags={blog.tags} />
            </div>
            <ArticleTitle title={blog.title} words={blog.words} />
            {blog.subtitle && <h2 class="text-2xl <md:mx-4 font-headline leading-relaxed <md:leading-relaxed <md:text-[1.4rem]">{blog.subtitle}</h2>}
        </LazyBg>
    )
}


const PostLayout = ({ children, rawBlog }) => {
    const blog = BlogDetailedSchema.parse(rawBlog)
    return (
        <ContentLayout blog={blog} >
            <LazyImg class="w-full blog-cover rounded object-cover mb-6" src={blog.cover} alt={blog.cover} />
            <PostMeta blog={blog} />
            <section innerHTML={children} />
        </ContentLayout>
    )
}

export default PostLayout