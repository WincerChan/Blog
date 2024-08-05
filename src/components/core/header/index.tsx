import Logo from "./Logo";
import Pages from "./Pages";
import Tools from "./Tools";


const Nav = ({ children }) => {
    return (
        <header class=':: shadow-round bg-ers md:mb-14 mb-8 '>
            <nav class=':: flex flex-col sm:flex-row xl:w-292 lg:w-228 mx-auto '>
                {children}
            </nav>
        </header>
    )
}

const Header = () => {
    return (
        <Nav>
            <Logo />
            <div class="justify-center sm:justify-between flex flex-grow-1 ">
                <Pages />
                <Tools />
            </div>
        </Nav>
    )
}

export default Header