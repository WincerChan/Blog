import { For } from "solid-js";
import FriendLink from "~/features/friends/FriendLink";
import ArticlePage from "~/layouts/ArticlePage";
import type { FriendLink as FriendLinkType } from "~/content/types";

const Friend = ({ page, children }) => {
    const links = Array.isArray(__CONTENT_FRIENDS) ? __CONTENT_FRIENDS : [];
    const sortedLinks = () => {
        const activeLinks = links.filter((link) => !link.inactive);
        const inactiveLinks = links.filter((link) => link.inactive === true);
        return activeLinks.concat(inactiveLinks) as FriendLinkType[];
    };
    return (
        <ArticlePage rawBlog={page} relates={[]}>
            {children}
            <div class="mt-6 grid gap-6 md:grid-cols-2">
                <For each={sortedLinks()}>
                    {(link) => <FriendLink {...link} />}
                </For>
            </div>
        </ArticlePage>
    );
};

export default Friend;
