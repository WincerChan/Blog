import { A } from "solid-start";


const Logo = () => {
    return (
        <A href="/" activeClass="" class=":: flex items-center justify-center bg-menuHover trans-linear cursor-pointer space-x-3 h-menu <sm:h-14 " >
            <img src={__SITE_CONF.avatar} alt="avatar" id="avatar" width={32} height={32} class=":: rounded-36 sm:w-9 sm:h-9 shadow-round " />
            <h1 class=":: text-[22px] subpixel-antialiased font-medium font-headline ">
                Wincer's Blog
            </h1>
        </A>
    )
}
export default Logo;