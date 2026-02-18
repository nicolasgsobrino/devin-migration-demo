import { useState } from 'react';
import { fetchOverview, fetchDeliveries, fetchIncidents, fetchInfrastructure, fetchCost, fetchInsights, fetchFleet } from './api/client';
import { useApi } from './hooks/useApi';
import { KpiCard } from './components/cards/KpiCard';
import { InsightCard } from './components/cards/InsightCard';
import { TimeSeriesChart } from './components/charts/TimeSeriesChart';
import { RegionBarChart } from './components/charts/RegionBarChart';
import { FilterBar } from './components/filters/FilterBar';
import { IncidentsTable } from './components/tables/IncidentsTable';
import { FleetTable } from './components/tables/FleetTable';
import { RegionMap } from './components/layout/RegionMap';
import { Loading } from './components/layout/Loading';
import { ErrorBanner } from './components/layout/ErrorBanner';

function App() {
  const [region, setRegion] = useState('');
  const [timeRange, setTimeRange] = useState('24h');
  const [transportType, setTransportType] = useState('');

  const overview = useApi(() => fetchOverview(), []);
  const deliveries = useApi(() => fetchDeliveries(region || undefined, transportType || undefined), [region, transportType]);
  const incidents = useApi(() => fetchIncidents(region || undefined), [region]);
  const infra = useApi(() => fetchInfrastructure(region || undefined), [region]);
  const cost = useApi(() => fetchCost(region || undefined), [region]);
  const insights = useApi(() => fetchInsights(), []);
  const fleet = useApi(() => fetchFleet(region || undefined, transportType || undefined), [region, transportType]);

  const anyLoading = overview.loading || deliveries.loading || incidents.loading || infra.loading || cost.loading || insights.loading || fleet.loading;
  const errors = [overview.error, deliveries.error, incidents.error, infra.error, cost.error, insights.error, fleet.error].filter(Boolean);

  return (
    <>
      <div className="stars-bg" />
      <div className="nebula-glow" />
      <div className="nebula-glow-2" />
      <div className="app-container">
        <header className="header">
          <div className="header-left">
            <div className="logo-icon">&#9681;</div>
            <h1>
              STELLAR OPS
              <span>Transport Observability Platform</span>
            </h1>
          </div>
          <div className="header-status">
            <span className="live-dot" />
            <span>Live Data</span>
          </div>
        </header>

        <FilterBar
          region={region}
          setRegion={setRegion}
          timeRange={timeRange}
          setTimeRange={setTimeRange}
          transportType={transportType}
          setTransportType={setTransportType}
        />

        {errors.length > 0 && <ErrorBanner message={`Connection error: ${errors[0]}. Make sure the backend is running on port 8000.`} />}

        {anyLoading && !overview.data ? (
          <Loading />
        ) : (
          <>
            {overview.data && (
              <div className="kpi-grid">
                <KpiCard label="SLA Compliance" value={`${overview.data.sla_compliance}%`} sub="Global target: 95%" color="blue" />
                <KpiCard label="On-Time Delivery" value={`${overview.data.on_time_delivery_pct}%`} sub={`${overview.data.total_deliveries_today.toLocaleString()} today`} color="green" />
                <KpiCard label="Backlog" value={overview.data.backlog.toLocaleString()} sub="Pending shipments" color="yellow" />
                <KpiCard label="Incident Rate" value={`${overview.data.incident_rate}/h`} sub={`${incidents.data?.open_incidents ?? '...'} open`} color="red" />
                <KpiCard label="Infra Health" value={`${overview.data.infra_health_pct}%`} sub={`${overview.data.hubs_active} hubs active`} color="cyan" />
                <KpiCard label="Cost Index" value={overview.data.cost_index.toFixed(3)} sub={cost.data ? `$${(cost.data.total_monthly_cost / 1000000).toFixed(2)}M/mo` : '...'} color="purple" />
              </div>
            )}

            <div className="section-grid">
              <div className="panel">
                <div className="panel-title"><span className="icon">&#128200;</span> {timeRange === '24h' ? 'Delivery Volume (24h)' : 'SLA Trend (30d)'}</div>
                {deliveries.data && (
                  <TimeSeriesChart
                    data={timeRange === '24h' ? deliveries.data.volume_trend_24h : deliveries.data.sla_trend_30d}
                    color={timeRange === '24h' ? '#3b82f6' : '#10b981'}
                    label={timeRange === '24h' ? 'Deliveries' : 'SLA %'}
                    formatValue={(v) => timeRange === '24h' ? v.toFixed(0) : `${v.toFixed(1)}%`}
                  />
                )}
              </div>

              <div className="panel">
                <div className="panel-title"><span className="icon">&#9889;</span> {timeRange === '24h' ? 'Latency (24h)' : 'Latency Trend (30d)'}</div>
                {infra.data && (
                  <TimeSeriesChart
                    data={timeRange === '24h' ? infra.data.latency_trend_24h : infra.data.latency_trend_30d}
                    color="#f59e0b"
                    label="Latency (ms)"
                    formatValue={(v) => `${v.toFixed(0)}ms`}
                  />
                )}
              </div>
            </div>

            <div className="section-grid">
              <div className="panel">
                <div className="panel-title"><span className="icon">&#128666;</span> Deliveries by Region</div>
                {deliveries.data && (
                  <RegionBarChart
                    data={deliveries.data.by_region.map((r) => ({ name: r.region, value: r.total }))}
                    color="#06b6d4"
                    label="Total Deliveries"
                  />
                )}
              </div>

              <div className="panel">
                <div className="panel-title"><span className="icon">&#128176;</span> Cost by Region</div>
                {cost.data && (
                  <RegionBarChart
                    data={cost.data.by_region.map((r) => ({ name: r.region, value: r.total }))}
                    color="#8b5cf6"
                    label="Total Cost"
                    formatValue={(v) => `$${(v / 1000).toFixed(0)}K`}
                  />
                )}
              </div>
            </div>

            <div className="section-grid">
              <div className="panel">
                <div className="panel-title"><span className="icon">&#127760;</span> Region Health Map</div>
                {infra.data && (
                  <RegionMap
                    regions={infra.data.by_region.map((r) => ({
                      region: r.region,
                      latency: r.avg_latency_ms,
                      errorRate: r.error_rate_pct,
                      uptime: r.uptime_pct,
                    }))}
                  />
                )}
              </div>

              <div className="panel">
                <div className="panel-title"><span className="icon">&#128293;</span> Incidents (24h)</div>
                {incidents.data && (
                  <TimeSeriesChart
                    data={incidents.data.trend_24h}
                    color="#ef4444"
                    label="Incidents"
                    formatValue={(v) => v.toFixed(0)}
                  />
                )}
              </div>
            </div>

            <div className="section-grid">
              <div className="panel">
                <div className="panel-title"><span className="icon">&#128640;</span> Delivery by Transport Type</div>
                {deliveries.data && (
                  <RegionBarChart
                    data={deliveries.data.by_transport_type.map((t) => ({ name: t.type, value: t.sla_pct }))}
                    color="#10b981"
                    label="SLA %"
                    formatValue={(v) => `${v.toFixed(1)}%`}
                    height={200}
                  />
                )}
              </div>

              <div className="panel">
                <div className="panel-title"><span className="icon">&#128181;</span> Cost by Service</div>
                {cost.data && (
                  <RegionBarChart
                    data={cost.data.by_service.map((s) => ({ name: s.service.replace('_', ' '), value: s.monthly_cost }))}
                    color="#f97316"
                    label="Monthly Cost"
                    formatValue={(v) => `$${(v / 1000).toFixed(0)}K`}
                    height={200}
                  />
                )}
              </div>
            </div>

            {insights.data && insights.data.insights.length > 0 && (
              <div className="panel" style={{ marginBottom: 28 }}>
                <div className="panel-title"><span className="icon">&#128161;</span> AI Insights &amp; Recommendations</div>
                {insights.data.insights.map((insight, i) => (
                  <InsightCard key={i} insight={insight} />
                ))}
              </div>
            )}

            <div className="section-grid">
              <div className="panel">
                <div className="panel-title"><span className="icon">&#128678;</span> Recent Incidents</div>
                {incidents.data && <IncidentsTable incidents={incidents.data.incidents} />}
              </div>

              <div className="panel">
                <div className="panel-title"><span className="icon">&#128667;</span> Fleet Status</div>
                {fleet.data && <FleetTable vehicles={fleet.data.vehicles} />}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default App;
