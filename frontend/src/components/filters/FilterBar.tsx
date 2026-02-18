interface FilterBarProps {
  region: string;
  setRegion: (r: string) => void;
  timeRange: string;
  setTimeRange: (t: string) => void;
  transportType: string;
  setTransportType: (t: string) => void;
}

const REGIONS = ['', 'NA', 'LATAM', 'EMEA', 'APAC', 'MEA', 'OCEANIA'];
const TIME_RANGES = ['24h', '30d'];
const TRANSPORT_TYPES = ['', 'truck', 'airplane', 'ship'];

export function FilterBar({ region, setRegion, timeRange, setTimeRange, transportType, setTransportType }: FilterBarProps) {
  return (
    <div className="filters-bar">
      <select className="filter-select" value={region} onChange={(e) => setRegion(e.target.value)}>
        <option value="">All Regions</option>
        {REGIONS.filter(Boolean).map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>
      <select className="filter-select" value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
        {TIME_RANGES.map((t) => (
          <option key={t} value={t}>{t === '24h' ? 'Last 24 Hours' : 'Last 30 Days'}</option>
        ))}
      </select>
      <select className="filter-select" value={transportType} onChange={(e) => setTransportType(e.target.value)}>
        <option value="">All Transport</option>
        {TRANSPORT_TYPES.filter(Boolean).map((t) => (
          <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
        ))}
      </select>
    </div>
  );
}
