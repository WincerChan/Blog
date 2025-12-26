import Logo from "./Logo";
import Pages from "./Pages";
import Tools from "./Tools";

const Header = () => {
    return (
        <header>
            <Logo />
            <nav>
                <Pages />
            </nav>
            <Tools />
        </header>
    );
};

export default Header;
