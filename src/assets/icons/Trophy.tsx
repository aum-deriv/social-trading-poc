import { FC } from "react";

const Trophy: FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6.5 3H17.5C18.33 3 19 3.67 19 4.5V6.39C19 8.83 17.33 11 15 11.82V15C15 15.55 14.55 16 14 16H10C9.45 16 9 15.55 9 15V11.82C6.67 11 5 8.83 5 6.39V4.5C5 3.67 5.67 3 6.5 3ZM17.5 1H6.5C4.57 1 3 2.57 3 4.5V6.39C3 9.68 5.28 12.49 8.5 13.32V15C8.5 16.38 9.62 17.5 11 17.5H13C14.38 17.5 15.5 16.38 15.5 15V13.32C18.72 12.49 21 9.68 21 6.39V4.5C21 2.57 19.43 1 17.5 1Z"
      fill="currentColor"
    />
    <path d="M12 20L8 21.5V23H16V21.5L12 20Z" fill="currentColor" />
  </svg>
);

export default Trophy;
