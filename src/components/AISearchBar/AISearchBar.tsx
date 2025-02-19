import { FC, FormEvent, useState } from 'react';
import DiscoverIcon from '@/assets/icons/DiscoverIcon';
import './AISearchBar.css';

interface AISearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

const AISearchBar: FC<AISearchBarProps> = ({ onSearch, placeholder = 'Ask Champion' }) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form
      className={`ai-search-bar ${isFocused ? 'ai-search-bar--focused' : ''}`}
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
      />
      <button type="submit" className="ai-search-bar__button">
        <DiscoverIcon />
      </button>
    </form>
  );
};

export default AISearchBar;
