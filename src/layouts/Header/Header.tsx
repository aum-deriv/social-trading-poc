import { Link } from "react-router-dom";
import "./Header.css";

const Header = () => {

    return (
        <header className="header">
            <div className="header__content">
                    <Link to="/" className="header__logo">
                        <img
                            src="/champion_logo-white.svg"
                            alt="Champion Logo"
                            className="header__logo-image"
                        />
                        <span className="header__logo-text">Social Trader</span>
                    </Link>
            </div>
    </header>
  );
};

export default Header;
