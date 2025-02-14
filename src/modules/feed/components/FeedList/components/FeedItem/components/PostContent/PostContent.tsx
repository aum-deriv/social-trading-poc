import { useState } from "react";
import type Post from "@/types/post.types";
import ImageCarousel from "@/components/layout/ImageCarousel";
import "./PostContent.css";

interface PostContentProps {
    content: Post["content"];
}

const PostContent = ({ content }: PostContentProps) => {
    const { text, images = [] } = content;
    const hasImages = images.length > 0;
    const isSingleImage = images.length === 1;

    const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});
    const [errorStates, setErrorStates] = useState<{ [key: string]: boolean }>({});

    const handleImageLoad = (imageUrl: string) => {
        setLoadingStates((prev) => ({
            ...prev,
            [imageUrl]: false,
        }));
    };

    const handleImageLoadStart = (imageUrl: string) => {
        if (!loadingStates[imageUrl]) {
            setLoadingStates((prev) => ({
                ...prev,
                [imageUrl]: true,
            }));
        }
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
                <div className="post-content__images">
                    {isSingleImage ? (
                        <div className="post-content__image-container">
                            <img
                                src={images[0]}
                                alt="Post image"
                                className={`post-content__image post-content__image--single ${
                                    loadingStates[images[0]] ? "loading" : ""
                                }`}
                                onLoadStart={() => handleImageLoadStart(images[0])}
                                onLoad={() => handleImageLoad(images[0])}
                                onError={() => handleImageError(images[0])}
                                style={{ display: errorStates[images[0]] ? 'none' : 'block' }}
                            />
                            {errorStates[images[0]] && (
                                <div className="post-content__image-fallback">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                        <circle cx="8.5" cy="8.5" r="1.5"/>
                                        <polyline points="21 15 16 10 5 21"/>
                                    </svg>
                                    <span>Image failed to load</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <ImageCarousel
                            images={images}
                            onImageLoad={handleImageLoad}
                            onImageError={handleImageError}
                            loadingStates={loadingStates}
                            errorStates={errorStates}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default PostContent;
