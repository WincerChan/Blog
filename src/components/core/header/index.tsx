import Logo from "./Logo";
import Pages from "./Pages";
import Tools from "./Tools";

import siteConf from "@/siteConf";

const Nav = ({ children }) => {
    return (
        <header class=':: shadow-round bg-ers mb-14 <md:mb-8 '>
            <nav class=':: flex w-viewl <sm:flex-col '>
                {children}
            </nav>
        </header>
    )
}

const Header = () => {
    return (
        <Nav>
            <Logo siteConf={siteConf} />
            <div class="header-justify <sm:w-100vw">
                <Pages />
                <Tools />
            </div>
        </Nav>
    )
}

export default Header