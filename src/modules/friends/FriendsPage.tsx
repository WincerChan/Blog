import { For } from "solid-js";
import FriendLink from "~/modules/friends/FriendLink";
import ArticlePageLayout from "~/modules/article/layout/ArticlePageLayout";
import { getFriendLinks } from "~/content/velite";

const Friend = ({ page, children }) => {
    const friendLinks = getFriendLinks();
    const activeLinks = friendLinks.filter((link) => !link.inactive);
    const inactiveLinks = friendLinks.filter((link) => link.inactive === true);
    const sortedLinks = activeLinks.concat(inactiveLinks);
    return (
        <ArticlePageLayout rawBlog={page} relates={[]}>
            {children}
            <div class=":: grid grid-cols-1 gap-6 my-6 sm:grid-cols-2 ">
                <For each={sortedLinks}>
                    {(link) => <FriendLink {...link} />}
                </For>
            </div>
        </ArticlePageLayout>
    );
};

export default Friend;
