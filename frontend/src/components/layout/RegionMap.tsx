interface RegionStatus {
  region: string;
  latency: number;
  errorRate: number;
  uptime: number;
}

interface RegionMapProps {
  regions: RegionStatus[];
}

function getStatus(r: RegionStatus): 'healthy' | 'warning' | 'critical' {
  if (r.errorRate > 3 || r.uptime < 97) return 'critical';
  if (r.latency > 200 || r.errorRate > 1.5) return 'warning';
  return 'healthy';
}

export function RegionMap({ regions }: RegionMapProps) {
  return (
    <div className="region-map">
      {regions.map((r) => {
        const status = getStatus(r);
        return (
          <div key={r.region} className={`region-tile ${status}`}>
            <div className="name">{r.region}</div>
            <div className="metric">Latency: {r.latency.toFixed(0)}ms</div>
            <div className="metric">Errors: {r.errorRate.toFixed(2)}%</div>
            <div className="metric">Uptime: {r.uptime.toFixed(2)}%</div>
          </div>
        );
      })}
    </div>
  );
}
