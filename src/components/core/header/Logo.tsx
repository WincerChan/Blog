import { A } from "solid-start"


type LogoProps = {
    siteConfig: {
        title: string,
        avatar: string
    }
}

const Logo = ({ siteConfig }: LogoProps) => {
    return (
        <A href="/" class="flex items-center justify-center bg-menuHover trans-linear cursor-pointer space-x-3 h-menu <sm:h-14" >
            <img src={siteConfig.avatar} alt="avatar" id="avatar" class="rounded-36 w-8 h-8 sm:w-9 sm:h-9 shadow-round" />
            <h1 class="text-[22px] subpixel-antialiased font-medium font-headline">
                {siteConfig.title}
            </h1>
        </A>
    )
}
export default Logo;