import Chip from '@/components/Chip';
import './Suggestions.css';

interface SuggestionsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
}

const Suggestions = ({ suggestions, onSelect }: SuggestionsProps) => (
  <div className="suggestions">
    {suggestions.map(suggestion => (
      <Chip key={suggestion} onClick={() => onSelect(suggestion)} className="suggestions__chip">
        {suggestion}
      </Chip>
    ))}
  </div>
);

export default Suggestions;
