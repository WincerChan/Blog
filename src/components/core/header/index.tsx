import basePage from "@/_output/base/index.json";
import Logo from "./Logo";
import Pages from "./Pages";
import Tools from "./Tools";

import siteConfig from "@/hugo.json";

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
            <Logo siteConfig={siteConfig} />
            <div class="header-justify <sm:w-100vw">
                <Pages rawPages={basePage.pages} />
                <Tools />
            </div>
        </Nav>
    )
}

export default Header