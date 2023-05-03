import Header from "../core/header";
import { BlogSideBar, SideBar } from "../core/sidebar";

const ContentLayout = ({ children, blog }) => {
    return (
        <>
            <Header />
            <main class="w-view md:grid grid-cols-50 md:mx-4 lg:mx-auto">
                <article class="mb-4 2xl:col-span-37 leading-7 col-span-36 md:mr-4 lg:mr-8 text-justify">
                    {children}
                </article>
                {blog ? <BlogSideBar blog={blog} /> : <SideBar />}
            </main>
        </>
    );
};

export default ContentLayout;