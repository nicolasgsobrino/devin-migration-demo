interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  color: 'blue' | 'purple' | 'green' | 'yellow' | 'red' | 'cyan';
}

export function KpiCard({ label, value, sub, color }: KpiCardProps) {
  return (
    <div className={`kpi-card ${color}`}>
      <div className="kpi-label">{label}</div>
      <div className={`kpi-value ${color}`}>{value}</div>
      {sub && <div className="kpi-sub">{sub}</div>}
    </div>
  );
}
