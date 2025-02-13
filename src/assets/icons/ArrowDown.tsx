import { FC } from "react";

const ArrowDown: FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8 12L13 7L12.3 6.3L8.5 10.1V4H7.5V10.1L3.7 6.3L3 7L8 12Z"
      fill="currentColor"
    />
  </svg>
);

export default ArrowDown;
