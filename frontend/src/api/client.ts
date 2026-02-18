const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function fetchJson<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(path, API_BASE);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v) url.searchParams.set(k, v);
    });
  }
  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export function fetchOverview() {
  return fetchJson<import('../types/api').OverviewData>('/overview');
}

export function fetchFleet(region?: string, transportType?: string) {
  const params: Record<string, string> = {};
  if (region) params.region = region;
  if (transportType) params.transport_type = transportType;
  return fetchJson<import('../types/api').FleetData>('/fleet', params);
}

export function fetchDeliveries(region?: string, transportType?: string) {
  const params: Record<string, string> = {};
  if (region) params.region = region;
  if (transportType) params.transport_type = transportType;
  return fetchJson<import('../types/api').DeliveriesData>('/deliveries', params);
}

export function fetchIncidents(region?: string) {
  const params: Record<string, string> = {};
  if (region) params.region = region;
  return fetchJson<import('../types/api').IncidentsData>('/incidents', params);
}

export function fetchInfrastructure(region?: string) {
  const params: Record<string, string> = {};
  if (region) params.region = region;
  return fetchJson<import('../types/api').InfrastructureData>('/infrastructure', params);
}

export function fetchCost(region?: string) {
  const params: Record<string, string> = {};
  if (region) params.region = region;
  return fetchJson<import('../types/api').CostData>('/cost', params);
}

export function fetchInsights() {
  return fetchJson<import('../types/api').InsightsData>('/insights');
}
