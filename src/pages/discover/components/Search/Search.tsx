import AiGif from '../../../../assets/icons/ai.gif';
import './Search.css';

export default function Search() {
  return (
    <div className="discover__search">
      <input type="search" className="discover__search-input" placeholder="AI powered search..." />
      <button className="discover__search-ai">
        <img src={AiGif} alt="AI Search" />
      </button>
    </div>
  );
}
