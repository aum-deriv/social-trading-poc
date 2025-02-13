import { useState, useEffect } from "react";
import type Post from "@/types/post.types";
import "./PostContent.css";

const ImageFallback = () => (
    <div className="post-content__image-fallback">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
        </svg>
        <span>Image failed to load</span>
    </div>
);

interface PostContentProps {
    content: Post["content"];
}

const PostContent = ({ content }: PostContentProps) => {
    const { text, images = [] } = content;
    const hasImages = images.length > 0;
    const isSingleImage = images.length === 1;

    const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});
    const [errorStates, setErrorStates] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        // Initialize loading states for all images
        const initialLoadingStates = images.reduce((acc, image) => {
            acc[image] = true;
            return acc;
        }, {} as { [key: string]: boolean });
        setLoadingStates(initialLoadingStates);
    }, [images]);

    const handleImageLoad = (imageUrl: string) => {
        setLoadingStates((prev) => ({
            ...prev,
            [imageUrl]: false,
        }));
    };

    const handleImageError = (imageUrl: string) => {
        setLoadingStates((prev) => ({
            ...prev,
            [imageUrl]: false,
        }));
        setErrorStates((prev) => ({
            ...prev,
            [imageUrl]: true,
        }));
    };

    return (
        <div className="post-content">
            {text && <p className="post-content__text">{text}</p>}

            {hasImages && (
                <div
                    className={`post-content__images ${
                        isSingleImage
                            ? "post-content__images--single"
                            : "post-content__images--multiple"
                    }`}
                >
                    {images.map((image, index) => (
                        <div key={index} className="post-content__image-container">
                            <img
                                src={image}
                                alt={`Post image ${index + 1}`}
                                className={`post-content__image ${
                                    isSingleImage ? "post-content__image--single" : ""
                                } ${loadingStates[image] ? "loading" : ""}`}
                                onLoad={() => handleImageLoad(image)}
                                onError={() => handleImageError(image)}
                                style={{ display: errorStates[image] ? 'none' : 'block' }}
                            />
                            {errorStates[image] && <ImageFallback />}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PostContent;
