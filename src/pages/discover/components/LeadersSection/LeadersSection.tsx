import { TopLeadersSection } from '../TopLeadersSection';
import SuggestedLeadersSection from '../SuggestedLeadersSection';
import './LeadersSection.css';

export default function LeadersSection() {
  return (
    <div className="leaders-section">
      <TopLeadersSection />
      <SuggestedLeadersSection />
    </div>
  );
}
