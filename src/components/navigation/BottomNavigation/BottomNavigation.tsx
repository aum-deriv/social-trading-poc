import { Link, useLocation } from "react-router-dom";
import "./BottomNavigation.css";

interface BottomNavigationProps {
    onCreatePost?: () => void;
}

const BottomNavigation = ({ onCreatePost }: BottomNavigationProps) => {
    const location = useLocation();
    const currentPath = location.pathname;

    const isActive = (path: string) => currentPath === path;

    return (
        <nav className="bottom-navigation">
            <Link
                to="/feed"
                className={`nav-item ${isActive("/feed") ? "active" : ""}`}
            >
                <span>Feed</span>
            </Link>

            <Link
                to="/discover"
                className={`nav-item ${isActive("/discover") ? "active" : ""}`}
            >
                <span>Discover</span>
            </Link>
            <div className="fab-placeholder">
                <button className="fab" onClick={onCreatePost}>
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                </button>
            </div>
            <Link
                to="/report"
                className={`nav-item ${isActive("/report") ? "active" : ""}`}
            >
                <span>Report</span>
            </Link>

            <Link
                to="/profile"
                className={`nav-item ${isActive("/profile") ? "active" : ""}`}
            >
                <span>Profile</span>
            </Link>
        </nav>
    );
};

export default BottomNavigation;
