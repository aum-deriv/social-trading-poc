import type User from "@/types/user.types";
import Avatar from "@/components/user/Avatar";
import AIButton from "@/components/AIButton";
import "./PostHeader.css";

interface PostHeaderProps {
    user: User;
    timestamp: string;
    onAnalyze: () => void;
    isAnalyzing?: boolean;
    showAnalyzeButton?: boolean;
}

const PostHeader = ({
    user,
    timestamp,
    onAnalyze,
    isAnalyzing,
    showAnalyzeButton = true,
}: PostHeaderProps) => {
    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
        });
    };

    return (
        <div className="post-header">
            <div className="post-header__user-info">
                <Avatar
                    size="medium"
                    username={user.displayName?.split('|')[0].trim() || user.username}
                    src={user.profilePicture}
                />
                <div className="post-header__text">
                    <span className="post-header__username">
                        {user.displayName?.split('|')[0].trim() || user.username}
                    </span>
                    <span className="post-header__timestamp">
                        {formatTimestamp(timestamp)}
                    </span>
                </div>
            </div>
            {showAnalyzeButton && (
                <AIButton
                    onClick={onAnalyze}
                    isLoading={isAnalyzing}
                    disabled={isAnalyzing}
                    loadingText="Analyzing..."
                >
                    Ask AI
                </AIButton>
            )}
        </div>
    );
};

export default PostHeader;
