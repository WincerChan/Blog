import friendPage from '@/_output/base/friends/index.json';
import friendLinks from "@/hugo/content/friends.json";
import { For } from 'solid-js';
import FriendLink from '~/components/core/section/FriendLink';
import PageLayout from '~/components/layouts/PageLayout';


const Friend = () => {
    const page = friendPage;
    return (
        <PageLayout page={page} showComment={true}>
            <section innerHTML={friendPage.content} />
            <div class=':: grid grid-cols-1 gap-6 mt-6 sm:grid-cols-2 '>
                <For each={friendLinks}>
                    {
                        link => <FriendLink {...link} />
                    }
                </For>
            </div>
        </PageLayout>
    )
}


export default Friend;

