import { createAsync } from "@solidjs/router";
import { For, createMemo } from "solid-js";
import FriendLink from "~/features/friends/FriendLink";
import ArticlePage from "~/layouts/ArticlePage";
import { getFriendLinks } from "~/content/velite";

const Friend = ({ page, children }) => {
    const links = createAsync(() => getFriendLinks());
    const sortedLinks = createMemo(() => {
        const friendLinks = links() ?? [];
        const activeLinks = friendLinks.filter((link) => !link.inactive);
        const inactiveLinks = friendLinks.filter((link) => link.inactive === true);
        return activeLinks.concat(inactiveLinks);
    });
    return (
        <ArticlePage rawBlog={page} relates={[]}>
            {children}
            <div class=":: grid grid-cols-1 gap-6 my-6 sm:grid-cols-2 ">
                <For each={sortedLinks()}>{(link) => <FriendLink {...link} />}</For>
            </div>
        </ArticlePage>
    );
};

export default Friend;
