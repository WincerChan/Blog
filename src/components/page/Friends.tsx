import { For } from "solid-js";
import FriendLink from "~/components/core/section/FriendLink";
import PostPageLayout from "~/components/layouts/pages/PostPageLayout";
import { getFriendLinks } from "~/content/velite";

const Friend = ({ page, children }) => {
    const friendLinks = getFriendLinks();
    const activeLinks = friendLinks.filter((link) => !link.inactive);
    const inactiveLinks = friendLinks.filter((link) => link.inactive === true);
    const sortedLinks = activeLinks.concat(inactiveLinks);
    return (
        <PostPageLayout rawBlog={page}>
            {children}
            <div class=":: grid grid-cols-1 gap-6 my-6 sm:grid-cols-2 ">
                <For each={sortedLinks}>
                    {(link) => <FriendLink {...link} />}
                </For>
            </div>
        </PostPageLayout>
    );
};

export default Friend;
