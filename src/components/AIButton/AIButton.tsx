import { ReactNode, useRef, useEffect, useState } from "react";
import "./AIButton.css";

interface AIButtonProps {
    onClick: () => void;
    isLoading?: boolean;
    disabled?: boolean;
    loadingText?: string;
    children: ReactNode;
}

const AIButton = ({
    onClick,
    isLoading,
    disabled,
    loadingText = "Analyzing...",
    children,
}: AIButtonProps) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => setIsVisible(entry.isIntersecting),
            { threshold: 0.5 }
        );

        if (buttonRef.current) {
            observer.observe(buttonRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <button
            ref={buttonRef}
            className={`ai-button ${isVisible ? "ai-button--visible" : ""} ${
                isLoading ? "ai-button--loading" : ""
            }`}
            onClick={onClick}
            disabled={disabled || isLoading}
        >
            {/* Background sparkles */}
            <div className="ai-button__background">
                <span className="sparkle sparkle-1">✦</span>
                <span className="sparkle sparkle-2">✧</span>
                <span className="sparkle sparkle-3">✦</span>
                <span className="sparkle sparkle-4">✧</span>
                <span className="sparkle sparkle-5">✦</span>
            </div>
            <span className="ai-button__content">
                <span className="ai-button__icon">✦</span>
                <span className="ai-button__text">
                    {isLoading ? loadingText : children}
                </span>
            </span>
        </button>
    );
};

export default AIButton;
