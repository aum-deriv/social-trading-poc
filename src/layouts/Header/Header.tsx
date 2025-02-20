import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import BackIcon from '@/assets/icons/BackIcon';
import LogoutIcon from '@/assets/icons/LogoutIcon';
import ThemeToggle from '@/components/ThemeToggle';
import './Header.css';

const Header = () => {
  const { username } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const showBackButton = username && user?.username !== username;

  return (
    <header className="header">
      <div className="header__content">
        {showBackButton ? (
          <button className="header__back-button" onClick={() => navigate(-1)}>
            <BackIcon />
          </button>
        ) : (
          <Link to="/" className="header__logo">
            <img
              src={`/champion_logo-white.svg`}
              alt="Champion Logo"
              className="header__logo-image"
            />
            <span className="header__logo-text">Social Trader</span>
          </Link>
        )}
        <div className="header__actions">
          <ThemeToggle />
          {user && (
            <button className="header__logout-button" onClick={handleLogout} aria-label="Logout">
              <LogoutIcon />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
