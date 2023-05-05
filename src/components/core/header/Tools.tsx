import { A } from "solid-start"
import ToggleButton from "./ThemeSwitch/Switcher"

const Tools = () => {
    return (
        <ul class="flex">
            <li class=":: bg-menuHover trans-linear text-menuHover text-menu ">
                <A href="/search/" title="Search" class=":: h-full h-menu flex items-center ">
                    <div class=":: i-carbon-search-advanced inline-block w-6 h-6 "></div>
                </A>
            </li>
            <li class=":: bg-menuHover trans-linear text-menuHover text-menu ">
                <a href="/atom.xml" target="_blank" title="RSS" class=":: h-full h-menu flex items-center ">
                    <div class=":: i-carbon-rss inline-block w-6 h-6 "></div>
                </a>
            </li>
            <ToggleButton />
        </ul>
    )
}
export default Tools