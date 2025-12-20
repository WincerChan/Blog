

const Logo = () => {
    return (
        <a href="/" class=":: flex items-center justify-center px-[12px] hover:bg-menu transition-linear cursor-pointer space-x-3 sm:h-16 h-12 px[120x] sm:px[140x] lg:px-6 " >
            <img src={__SITE_CONF.avatar} referrerpolicy="no-referrer" alt="avatar" id="avatar" width={32} height={32} class=":: rounded-36 sm:w-9 sm:h-9 shadow-card " />
            <h1 class=":: text-[22px] subpixel-antialiased font-medium ">
                Wincer's Blog
            </h1>
        </a>
    )
}
export default Logo;
