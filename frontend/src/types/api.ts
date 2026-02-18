export interface TimeSeriesPoint {
  timestamp: string;
  value: number;
}

export interface OverviewData {
  sla_compliance: number;
  on_time_delivery_pct: number;
  backlog: number;
  incident_rate: number;
  infra_health_pct: number;
  cost_index: number;
  total_deliveries_today: number;
  active_vehicles: number;
  regions_monitored: number;
  hubs_active: number;
  sla_trend_30d: TimeSeriesPoint[];
  deliveries_trend_24h: TimeSeriesPoint[];
}

export interface RegionDelivery {
  region: string;
  total: number;
  on_time: number;
  delayed: number;
  sla_pct: number;
  backlog: number;
  avg_delay_hours: number;
}

export interface TransportDelivery {
  type: string;
  total: number;
  on_time: number;
  delayed: number;
  sla_pct: number;
}

export interface DeliveriesData {
  global_sla_pct: number;
  total_deliveries: number;
  total_on_time: number;
  total_delayed: number;
  total_backlog: number;
  by_region: RegionDelivery[];
  volume_trend_24h: TimeSeriesPoint[];
  sla_trend_30d: TimeSeriesPoint[];
  by_transport_type: TransportDelivery[];
}

export interface Vehicle {
  id: string;
  type: string;
  region: string;
  hub: string;
  status: string;
  fuel_pct: number;
  last_maintenance_days_ago: number;
}

export interface FleetData {
  total_vehicles: number;
  summary_by_type: Record<string, Record<string, number>>;
  summary_by_region: Record<string, number>;
  vehicles: Vehicle[];
}

export interface Incident {
  id: string;
  region: string;
  hub: string;
  category: string;
  severity: string;
  status: string;
  description: string;
  created_hours_ago: number;
}

export interface IncidentsData {
  total_incidents: number;
  open_incidents: number;
  by_severity: Record<string, number>;
  by_category: Record<string, number>;
  by_region: Record<string, number>;
  incidents: Incident[];
  trend_24h: TimeSeriesPoint[];
  trend_30d: TimeSeriesPoint[];
}

export interface HubInfra {
  hub: string;
  latency_ms: number;
  error_rate_pct: number;
  cpu_saturation_pct: number;
  memory_saturation_pct: number;
  uptime_pct: number;
}

export interface RegionInfra {
  region: string;
  avg_latency_ms: number;
  error_rate_pct: number;
  saturation_pct: number;
  uptime_pct: number;
  hubs: HubInfra[];
}

export interface InfrastructureData {
  by_region: RegionInfra[];
  latency_trend_24h: TimeSeriesPoint[];
  latency_trend_30d: TimeSeriesPoint[];
  error_trend_24h: TimeSeriesPoint[];
  error_trend_30d: TimeSeriesPoint[];
}

export interface RegionCost {
  region: string;
  total: number;
  infrastructure: number;
  fuel: number;
  labor: number;
  maintenance: number;
  cost_per_delivery: number;
}

export interface ServiceCost {
  service: string;
  monthly_cost: number;
  cost_trend: string;
}

export interface CostData {
  total_monthly_cost: number;
  by_region: RegionCost[];
  by_service: ServiceCost[];
  cost_trend_30d: TimeSeriesPoint[];
}

export interface Insight {
  type: 'ok' | 'info' | 'warning' | 'critical';
  category: string;
  message: string;
}

export interface InsightsData {
  insights: Insight[];
}
