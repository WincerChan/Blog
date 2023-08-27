import { A } from "solid-start";


const Logo = () => {
    return (
        <A href="/" activeClass="" class=":: flex items-center justify-center bg-menuHover trans-linear cursor-pointer space-x-3 h-menu <sm:h-14 " >
            <img src="https://ae01.alicdn.com/kf/HTB1DdGHXizxK1RjSspj763S.pXax.png" alt="avatar" id="avatar" class=":: rounded-36 w-8 h-8 sm:w-9 sm:h-9 shadow-round " />
            <h1 class=":: text-[22px] subpixel-antialiased font-medium font-headline ">
                Wincer's Blog
            </h1>
        </A>
    )
}
export default Logo;