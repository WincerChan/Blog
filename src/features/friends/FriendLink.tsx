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
            class=""
            title="此网站已无法访问，链接已被禁用"
        >
            <LazyImg class="" src={avatar} />
            <div class="">
                <span class="">
                    {name}
                </span>
                <span class="">已失联</span>
            </div>
        </div>
    ) : (
        <a
            class=""
            href={url}
            target="_blank"
            title={name}
        >
            <LazyImg class="" src={avatar} />
            <span class="">
                {name}
            </span>
        </a>
    );
};

export default FriendLink;
