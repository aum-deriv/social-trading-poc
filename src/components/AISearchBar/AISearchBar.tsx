import { FC, FormEvent, useState } from 'react';
import MessageIcon from '@/assets/icons/MessageIcon';
import './AISearchBar.css';

interface AISearchBarProps {
  isLoading?: boolean;
  onSearch: (query: string) => void;
  placeholder?: string;
}

const AISearchBar: FC<AISearchBarProps> = ({ isLoading, onSearch, placeholder }) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setQuery('');
    }
  };

  return (
    <form
      className={`ai-search-bar ${isFocused || isLoading ? 'ai-search-bar--focused' : ''}`}
      onSubmit={handleSubmit}
    >
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className="ai-search-bar__input"
        disabled={isLoading}
      />
      <button type="submit" className="ai-search-bar__button">
        <MessageIcon />
      </button>
    </form>
  );
};

export default AISearchBar;
