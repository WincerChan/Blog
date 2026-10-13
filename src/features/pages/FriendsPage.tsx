import { For } from "solid-js";
import FriendLink from "~/features/friends/FriendLink";
import type { FriendLink as FriendLinkType } from "~/content/types";

const Friend = ({ children, links = [] }: { page?: unknown; children?: import("solid-js").JSX.Element; links?: FriendLinkType[] }) => {
    const sortedLinks = () => {
        const activeLinks = links.filter((link) => !link.inactive);
        const inactiveLinks = links.filter((link) => link.inactive === true);
        return activeLinks.concat(inactiveLinks) as FriendLinkType[];
    };
    return (
        <>
            {children}
            <div class="mt-6 grid gap-6 md:grid-cols-2">
                <For each={sortedLinks()}>
                    {(link) => <FriendLink {...link} avatar={link.avatar ?? ""} inactive={!!link.inactive} />}
                </For>
            </div>
        </>
    );
};

export default Friend;
