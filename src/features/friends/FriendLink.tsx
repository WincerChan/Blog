import IconArrowUpRight from "~icons/ph/arrow-up-right";
import LazyImg from "~/ui/media/Img";

type LinkProps = {
    name: string;
    url: string;
    inactive: boolean;
    avatar: string;
};

const FriendLink = ({ name, url, avatar, inactive }: LinkProps) => {
    const getDomain = (value: string) => {
        if (!value) return "";
        try {
            return new URL(value).hostname.replace(/^www\./, "");
        } catch {
            return value;
        }
    };
    const domain = getDomain(url);
    return inactive ? (
        <div
            class="flex items-center cursor-not-allowed justify-between gap-4 rounded px-3 py-2 text-[var(--c-text-subtle)] opacity-60"
            title="此网站已无法访问，链接已被禁用"
            aria-disabled="true"
        >
            <div class="flex items-center gap-3">
                <LazyImg class="h-16 w-16 rounded-full object-cover m-0!" src={avatar} />
                <div class="flex flex-col gap-1">
                    <span class="text-base font-medium">{name}</span>
                    <span class="text-sm text-[var(--c-text-subtle)]">已失联</span>
                </div>
            </div>
            <IconArrowUpRight class="h-4 w-4" />
        </div>
    ) : (
        <a
            class="group flex no-underline! items-center justify-between gap-4 rounded px-3 py-2 text-[var(--c-text)] transition-colors hover:text-[var(--c-text)]"
            href={url}
            target="_blank"
            title={name}
            rel="noreferrer"
        >
            <div class="flex items-center gap-3">
                <span class="rounded-full ring-2 ring-transparent transition-colors group-hover:ring-[var(--c-link)]">
                    <LazyImg class="h-16 w-16 rounded-full object-cover m-0!" src={avatar} />
                </span>
                <div class="flex flex-col gap-1">
                    <span class="text-base font-medium">{name}</span>
                    <span class="text-sm text-[var(--c-text-subtle)]">{domain}</span>
                </div>
            </div>
            <IconArrowUpRight class="h-4 w-4 text-[var(--c-link)] opacity-0 transition-opacity transition-transform group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1" />
        </a>
    );
};

export default FriendLink;
