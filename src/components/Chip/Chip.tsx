import { FC, ButtonHTMLAttributes } from 'react';
import './Chip.css';

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  children: React.ReactNode;
}

const Chip: FC<ChipProps> = ({ active, children, className, ...props }) => {
  return (
    <button
      className={`chip ${active ? 'chip--active' : ''} ${className || ''}`}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
};

export default Chip;
