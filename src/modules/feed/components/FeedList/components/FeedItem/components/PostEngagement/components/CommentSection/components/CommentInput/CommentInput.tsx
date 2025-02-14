import { useState, FormEvent } from "react";
import Avatar from "@/components/user/Avatar";
import useCurrentUser from "@/modules/feed/hooks/useCurrentUser";
import "./CommentInput.css";

interface CommentInputProps {
    onSubmit: (content: string) => void;
    placeholder?: string;
    currentUserId: string;
}

const CommentInput = ({
    onSubmit,
    placeholder = "Write a comment...",
    currentUserId,
}: CommentInputProps) => {
    const [content, setContent] = useState("");
    const { user } = useCurrentUser(currentUserId);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (content.trim()) {
            onSubmit(content.trim());
            setContent("");
        }
    };

    return (
        <form className="comment-input" onSubmit={handleSubmit}>
            <div className="comment-input__avatar">
                <Avatar 
                    size="small" 
                    username={user?.displayName?.split('|')[0].trim() || currentUserId}
                    src={user?.profilePicture}
                />
            </div>
            <div className="comment-input__container">
                <input
                    type="text"
                    className="comment-input__field"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={placeholder}
                />
                <button
                    type="submit"
                    className="comment-input__submit"
                    disabled={!content.trim()}
                >
                    Post
                </button>
            </div>
        </form>
    );
};

export default CommentInput;
