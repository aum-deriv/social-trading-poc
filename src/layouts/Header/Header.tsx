import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import BackIcon from "@/assets/icons/BackIcon";
import "./Header.css";

const Header = () => {
    const { username } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const showBackButton = username && user?.username !== username;

    return (
        <header className="header">
            <div className="header__content">
                {showBackButton ? (
                    <button 
                        className="header__back-button"
                        onClick={() => navigate(-1)}
                    >
                        <BackIcon />
                    </button>
                ) : (
                    <Link to="/" className="header__logo">
                        <img
                            src="/champion_logo-white.svg"
                            alt="Champion Logo"
                            className="header__logo-image"
                        />
                        <span className="header__logo-text">Social Trader</span>
                    </Link>
                )}
            </div>
        </header>
  );
};

export default Header;
