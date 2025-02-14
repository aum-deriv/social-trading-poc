import { useState, useRef, useEffect } from "react";
import "./ImageCarousel.css";

interface ImageCarouselProps {
    images: string[];
    onImageLoad: (imageUrl: string) => void;
    onImageError: (imageUrl: string) => void;
    loadingStates: { [key: string]: boolean };
    errorStates: { [key: string]: boolean };
}

const ImageFallback = () => (
    <div className="image-carousel__fallback">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
        </svg>
        <span>Image failed to load</span>
    </div>
);

const ImageCarousel = ({
    images,
    onImageLoad,
    onImageError,
    loadingStates,
    errorStates,
}: ImageCarouselProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const index = Number(entry.target.getAttribute('data-index'));
                        setCurrentIndex(index);
                    }
                });
            },
            {
                root: container,
                threshold: 0.5,
            }
        );

        const slides = container.querySelectorAll('.image-carousel__slide');
        slides.forEach((slide) => observer.observe(slide));

        return () => {
            slides.forEach((slide) => observer.unobserve(slide));
        };
    }, [images]);

    return (
        <div className="image-carousel">
            <div className="image-carousel__container" ref={containerRef}>
                {images.map((image, index) => (
                    <div
                        key={index}
                        className="image-carousel__slide"
                        data-index={index}
                    >
                        <img
                            src={image}
                            alt={`Slide ${index + 1}`}
                            className={`image-carousel__image ${
                                loadingStates[image] ? "loading" : ""
                            }`}
                            onLoad={() => onImageLoad(image)}
                            onError={() => onImageError(image)}
                            style={{ display: errorStates[image] ? 'none' : 'block' }}
                        />
                        {errorStates[image] && <ImageFallback />}
                    </div>
                ))}
            </div>
            {images.length > 1 && (
                <div className="image-carousel__dots">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            className={`image-carousel__dot ${
                                index === currentIndex ? "active" : ""
                            }`}
                            onClick={() => {
                                const container = containerRef.current;
                                if (container) {
                                    container.scrollTo({
                                        left: container.offsetWidth * index,
                                        behavior: 'smooth'
                                    });
                                }
                            }}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ImageCarousel;
