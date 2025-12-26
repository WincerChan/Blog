import Logo from "./Logo";
import Pages from "./Pages";
import Tools from "./Tools";


const Nav = ({ children }) => {
    return (
        <header class="">
            <nav class="">
                {children}
            </nav>
        </header>
    )
}

const Header = () => {
    return (
        <Nav>
            <Logo />
            <div class="">
                <Pages />
                <Tools />
            </div>
        </Nav>
    )
}

export default Header
