import { FC } from "react";

const ArrowUp: FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8 4L3 9L3.7 9.7L7.5 5.9V12H8.5V5.9L12.3 9.7L13 9L8 4Z"
      fill="currentColor"
    />
  </svg>
);

export default ArrowUp;
