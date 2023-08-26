import friendLinks from "@/hugo/content/friends.json";
import { For } from 'solid-js';
import FriendLink from '~/components/core/section/FriendLink';
import PostLayout from '../layouts/PostLayout';


const Friend = ({ page, children }) => {
    return (
        <PostLayout rawBlog={page}>
            {children}
            <div class=':: grid grid-cols-1 gap-6 my-6 sm:grid-cols-2 '>
                <For each={friendLinks}>
                    {
                        link => <FriendLink {...link} />
                    }
                </For>
            </div>
        </PostLayout>
    )
}


export default Friend;

