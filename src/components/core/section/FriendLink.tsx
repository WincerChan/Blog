import LazyImg from "~/components/lazy/Img"

type LinkProps = {
    name: string,
    url: string,
    avatar: string
}

const FriendLink = ({ name, url, avatar }: LinkProps) => {
    return (
        <a class=":: inline-flex my-3 rounded outline-card w-full " href={url} target="_blank" title={name} >
            <LazyImg class=":: h-20 w-20 rounded mx-0 " src={avatar} />
            <span class=":: text-center px-4 font-headline py-2 text-2xl truncate mr-auto ">{name}</span>
        </a>
    )
}

export default FriendLink