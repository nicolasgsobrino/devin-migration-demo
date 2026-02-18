import type { Incident } from '../../types/api';

interface IncidentsTableProps {
  incidents: Incident[];
}

export function IncidentsTable({ incidents }: IncidentsTableProps) {
  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Region</th>
            <th>Hub</th>
            <th>Category</th>
            <th>Severity</th>
            <th>Status</th>
            <th>Description</th>
            <th>Age</th>
          </tr>
        </thead>
        <tbody>
          {incidents.slice(0, 30).map((inc) => (
            <tr key={inc.id}>
              <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{inc.id}</td>
              <td>{inc.region}</td>
              <td>{inc.hub}</td>
              <td>{inc.category}</td>
              <td><span className={`severity-badge ${inc.severity}`}>{inc.severity}</span></td>
              <td><span className={`status-dot ${inc.status}`} />{inc.status}</td>
              <td style={{ maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inc.description}</td>
              <td>{inc.created_hours_ago < 1 ? `${Math.round(inc.created_hours_ago * 60)}m` : `${inc.created_hours_ago.toFixed(1)}h`}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
