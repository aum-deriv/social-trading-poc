import { Link, useLocation } from 'react-router-dom';
import FeedIcon from '@/assets/icons/FeedIcon';
import DiscoverIcon from '@/assets/icons/DiscoverIcon';
import ReportIcon from '@/assets/icons/ReportIcon';
import ProfileIcon from '@/assets/icons/ProfileIcon';
import PlusIcon from '@/assets/icons/PlusIcon';
import { useAuth } from '@/context/AuthContext';
import './BottomNavigation.css';

interface BottomNavigationProps {
  onCreateContent: () => void;
}

const BottomNavigation = ({ onCreateContent }: BottomNavigationProps) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { user } = useAuth();

  const isActive = (path: string) => {
    if (path === '/profile') {
      return currentPath.startsWith('/profile');
    }
    return currentPath === path;
  };

  return (
    <nav className="bottom-navigation">
      <Link to="/feed" className={`nav-item ${isActive('/feed') ? 'active' : ''}`}>
        <FeedIcon />
      </Link>
      <Link to="/discover" className={`nav-item ${isActive('/discover') ? 'active' : ''}`}>
        <DiscoverIcon />
      </Link>
      <button
        className="nav-item nav-item--create"
        onClick={onCreateContent}
        aria-label="Create content"
      >
        <PlusIcon />
      </button>
      <Link to="/reports" className={`nav-item ${isActive('/reports') ? 'active' : ''}`}>
        <ReportIcon />
      </Link>
      {user ? (
        <Link
          to={`/profile/${user.username}`}
          className={`nav-item ${isActive('/profile') ? 'active' : ''}`}
        >
          <ProfileIcon />
        </Link>
      ) : (
        <div className="nav-item disabled">
          <ProfileIcon />
        </div>
      )}
    </nav>
  );
};

export default BottomNavigation;
