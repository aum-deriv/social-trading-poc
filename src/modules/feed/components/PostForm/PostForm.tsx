import { useState, useRef, ChangeEvent, FormEvent } from "react";
import type User from "@/types/user.types";
import "./PostForm.css";

interface PostFormProps {
    currentUser: User;
    onSubmit: (content: { text: string; images: string[] }) => Promise<void>;
    onClose?: () => void;
}

const PostForm = ({ currentUser, onSubmit, onClose }: PostFormProps) => {
    const [text, setText] = useState("");
    const [images, setImages] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
    };

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        // Convert files to URLs for preview
        const newImages = Array.from(files).map((file) =>
            URL.createObjectURL(file)
        );
        setImages((prev) => [...prev, ...newImages]);

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleRemoveImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!text.trim() && images.length === 0) return;

        setIsSubmitting(true);
        try {
            await onSubmit({
                text: text.trim(),
                images,
            });
            setText("");
            setImages([]);
            onClose?.();
        } catch (error) {
            console.error("Failed to create post:", error);
            // TODO: Show error message to user
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        onClose?.();
    };

    return (
        <div className="post-form-overlay">
            <div className="post-form-modal">
                <div className="post-form-modal__header">
                    <h2>Create Post</h2>
                    <button
                        type="button"
                        className="post-form-modal__close"
                        onClick={handleClose}
                    >
                        ×
                    </button>
                </div>
                <form className="post-form" onSubmit={handleSubmit}>
                    <div className="post-form__header">
                        <img
                            src={currentUser.profilePicture}
                            alt={currentUser.username}
                            className="post-form__avatar"
                        />
                        <span className="post-form__user-name">
                            {currentUser.username}
                        </span>
                    </div>
                    <textarea
                        className="post-form__textarea"
                        placeholder="Share your trading insights..."
                        value={text}
                        onChange={handleTextChange}
                        disabled={isSubmitting}
                    />
                    {images.length > 0 && (
                        <div className="post-form__image-preview">
                            {images.map((image, index) => (
                                <div
                                    key={index}
                                    className="post-form__image-container"
                                >
                                    <img
                                        src={image}
                                        alt={`Preview ${index + 1}`}
                                        className="post-form__image"
                                    />
                                    <button
                                        type="button"
                                        className="post-form__remove-image"
                                        onClick={() => handleRemoveImage(index)}
                                        disabled={isSubmitting}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="post-form__actions">
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="post-form__file-input"
                            accept="image/*"
                            multiple
                            onChange={handleImageChange}
                            disabled={isSubmitting}
                        />
                        <button
                            type="button"
                            className="post-form__button post-form__button--image"
                            onClick={handleImageClick}
                            disabled={isSubmitting}
                        >
                            Add Image
                        </button>
                        <button
                            type="submit"
                            className="post-form__button post-form__button--submit"
                            disabled={
                                isSubmitting ||
                                (!text.trim() && images.length === 0)
                            }
                        >
                            {isSubmitting ? "Posting..." : "Post"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PostForm;
