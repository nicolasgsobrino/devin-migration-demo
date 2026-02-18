import type { Vehicle } from '../../types/api';

interface FleetTableProps {
  vehicles: Vehicle[];
}

export function FleetTable({ vehicles }: FleetTableProps) {
  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>Region</th>
            <th>Hub</th>
            <th>Status</th>
            <th>Fuel</th>
            <th>Last Maint.</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.slice(0, 30).map((v) => (
            <tr key={v.id}>
              <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{v.id}</td>
              <td>{v.type}</td>
              <td>{v.region}</td>
              <td>{v.hub}</td>
              <td><span className={`status-dot ${v.status}`} />{v.status}</td>
              <td>{v.fuel_pct.toFixed(0)}%</td>
              <td>{v.last_maintenance_days_ago}d ago</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
