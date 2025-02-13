import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/input/Button";
import "./Header.css";
import { LegacyProfileXsIcon } from "@deriv/quill-icons";

const Header = () => {
  const { isAuthenticated } = useAuth();

  return (
    <header className="header">
      <div className="header__content">
        <div className="header__left">
          <Link to="/" className="header__logo">
            <img
              src="/champion_logo-white.svg"
              alt="Champion Logo"
              className="header__logo-image"
            />
            <span className="header__logo-text">Social Trader</span>
          </Link>
        </div>
        <div className="header__right">
          {isAuthenticated && (
            <div className="header__actions">
              <Button variant="text" className="header__action-btn">
                <LegacyProfileXsIcon fill="#ffffff" iconSize="sm" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
