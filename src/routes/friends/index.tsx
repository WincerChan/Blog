import { For } from 'solid-js';
import friendPage from '~/../_output/base/friends/index.json';
import friendLinks from "~/../hugo/content/friends.json";
import FriendLink from '~/components/core/section/FriendLink';
import PageLayout from '~/components/layouts/PageLayout';
import { PageSchema } from '~/schema/Page';


const Friend = () => {
    const page = PageSchema.parse(friendPage);
    return (
        <PageLayout page={page}>
            <section innerHTML={friendPage.content} />
            <div class='grid sm:grid-cols-2 grid-cols-1 gap-6 mt-6'>
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

