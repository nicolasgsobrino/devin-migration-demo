import type { Insight } from '../../types/api';

interface InsightCardProps {
  insight: Insight;
}

export function InsightCard({ insight }: InsightCardProps) {
  return (
    <div className={`insight-card ${insight.type}`}>
      <div>
        <span className={`insight-badge ${insight.type}`}>{insight.type}</span>
        <span className="insight-category">{insight.category}</span>
      </div>
      <div className="insight-message">{insight.message}</div>
    </div>
  );
}
