import { useNavigate, useRouteError } from "react-router-dom";
import "./NotFound.css";

const NotFound = () => {
    const navigate = useNavigate();
    const error = useRouteError() as { statusText?: string; message?: string };

    return (
        <div className="not-found">
            <h1>Oops!</h1>
            <h2>{error?.statusText || "Something went wrong"}</h2>
            <p>{error?.message || "An unexpected error has occurred."}</p>
            <button 
                className="not-found__button"
                onClick={() => navigate("/feed")}
            >
                Go to Feed
            </button>
        </div>
    );
};

export default NotFound;
