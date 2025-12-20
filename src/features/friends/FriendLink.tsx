import LazyImg from "~/ui/media/Img";

type LinkProps = {
    name: string;
    url: string;
    inactive: boolean;
    avatar: string;
};

const FriendLink = ({ name, url, avatar, inactive }: LinkProps) => {
    return inactive ? (
        <div
            class=":: inline-flex my-3 rounded outline-card cursor-not-allowed w-full opacity-60 grayscale "
            title="此网站已无法访问，链接已被禁用"
        >
            <LazyImg class=":: h-20 w-20 rounded mx-0 loading" src={avatar} />
            <div class="flex flex-col justify-center px-4 mr-auto">
                <span class="font-headline text-2xl truncate line-through text-gray-500">
                    {name}
                </span>
                <span class="text-sm text-gray-400 mt-1">已失联</span>
            </div>
        </div>
    ) : (
        <a
            class=":: inline-flex my-3 rounded outline-card w-full "
            href={url}
            target="_blank"
            title={name}
        >
            <LazyImg class=":: h-20 w-20 rounded mx-0 loading" src={avatar} />
            <span class=":: text-center px-4 font-headline py-2 text-2xl truncate mr-auto ">
                {name}
            </span>
        </a>
    );
};

export default FriendLink;
