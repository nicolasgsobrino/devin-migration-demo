import random
from datetime import datetime, timezone

from app.config import HUBS, REGIONS, SEED, TRANSPORT_TYPES
from app.data.timeseries import generate_daily_series, generate_hourly_series


def _rng(extra_seed: int = 0) -> random.Random:
    return random.Random(SEED + extra_seed)


def generate_overview() -> dict:
    rng = _rng(1)
    return {
        "sla_compliance": round(rng.uniform(92, 99), 2),
        "on_time_delivery_pct": round(rng.uniform(85, 97), 2),
        "backlog": rng.randint(120, 450),
        "incident_rate": round(rng.uniform(0.5, 4.0), 2),
        "infra_health_pct": round(rng.uniform(94, 99.9), 2),
        "cost_index": round(rng.uniform(0.8, 1.3), 3),
        "total_deliveries_today": rng.randint(8000, 25000),
        "active_vehicles": rng.randint(1200, 3500),
        "regions_monitored": len(REGIONS),
        "hubs_active": sum(len(v) for v in HUBS.values()),
        "sla_trend_30d": generate_daily_series(rng, base=95.0, volatility=0.03),
        "deliveries_trend_24h": generate_hourly_series(rng, base=600, volatility=0.15),
    }


def generate_fleet(region: str | None = None, transport_type: str | None = None) -> dict:
    rng = _rng(2)
    vehicles = []
    statuses = ["active", "in_transit", "maintenance", "idle"]
    regions_to_use = [region] if region and region in REGIONS else REGIONS

    for r in regions_to_use:
        for hub in HUBS[r]:
            for t in TRANSPORT_TYPES:
                if transport_type and t != transport_type:
                    continue
                count = rng.randint(5, 40)
                for i in range(count):
                    vehicles.append({
                        "id": f"{t[:2].upper()}-{hub[:3].upper()}-{rng.randint(1000, 9999)}",
                        "type": t,
                        "region": r,
                        "hub": hub,
                        "status": rng.choice(statuses),
                        "fuel_pct": round(rng.uniform(10, 100), 1),
                        "last_maintenance_days_ago": rng.randint(1, 90),
                    })

    summary_by_type: dict[str, dict[str, int]] = {}
    for t in TRANSPORT_TYPES:
        t_vehicles = [v for v in vehicles if v["type"] == t]
        summary_by_type[t] = {
            "total": len(t_vehicles),
            "active": sum(1 for v in t_vehicles if v["status"] == "active"),
            "in_transit": sum(1 for v in t_vehicles if v["status"] == "in_transit"),
            "maintenance": sum(1 for v in t_vehicles if v["status"] == "maintenance"),
            "idle": sum(1 for v in t_vehicles if v["status"] == "idle"),
        }

    summary_by_region: dict[str, int] = {}
    for r in regions_to_use:
        summary_by_region[r] = sum(1 for v in vehicles if v["region"] == r)

    return {
        "total_vehicles": len(vehicles),
        "summary_by_type": summary_by_type,
        "summary_by_region": summary_by_region,
        "vehicles": vehicles[:200],
    }


def generate_deliveries(region: str | None = None, transport_type: str | None = None) -> dict:
    rng = _rng(3)
    regions_to_use = [region] if region and region in REGIONS else REGIONS
    by_region = []

    for r in regions_to_use:
        total = rng.randint(800, 5000)
        on_time = int(total * rng.uniform(0.82, 0.97))
        delayed = total - on_time
        sla = round(on_time / total * 100, 2)
        backlog = rng.randint(10, 200)
        by_region.append({
            "region": r,
            "total": total,
            "on_time": on_time,
            "delayed": delayed,
            "sla_pct": sla,
            "backlog": backlog,
            "avg_delay_hours": round(rng.uniform(0.5, 8.0), 2),
        })

    total_all = sum(r["total"] for r in by_region)
    on_time_all = sum(r["on_time"] for r in by_region)
    global_sla = round(on_time_all / total_all * 100, 2) if total_all else 0

    return {
        "global_sla_pct": global_sla,
        "total_deliveries": total_all,
        "total_on_time": on_time_all,
        "total_delayed": total_all - on_time_all,
        "total_backlog": sum(r["backlog"] for r in by_region),
        "by_region": by_region,
        "volume_trend_24h": generate_hourly_series(rng, base=500, volatility=0.2),
        "sla_trend_30d": generate_daily_series(rng, base=global_sla, volatility=0.02),
        "by_transport_type": _deliveries_by_transport(rng, transport_type),
    }


def _deliveries_by_transport(rng: random.Random, transport_type: str | None = None) -> list[dict]:
    types = [transport_type] if transport_type and transport_type in TRANSPORT_TYPES else TRANSPORT_TYPES
    result = []
    for t in types:
        total = rng.randint(500, 3000)
        on_time = int(total * rng.uniform(0.80, 0.96))
        result.append({
            "type": t,
            "total": total,
            "on_time": on_time,
            "delayed": total - on_time,
            "sla_pct": round(on_time / total * 100, 2),
        })
    return result


def generate_incidents(region: str | None = None) -> dict:
    rng = _rng(4)
    regions_to_use = [region] if region and region in REGIONS else REGIONS
    categories = ["IT", "operational", "security", "weather"]
    severities = ["critical", "high", "medium", "low"]
    incidents = []

    for r in regions_to_use:
        for hub in HUBS[r]:
            count = rng.randint(0, 12)
            for _ in range(count):
                incidents.append({
                    "id": f"INC-{rng.randint(10000, 99999)}",
                    "region": r,
                    "hub": hub,
                    "category": rng.choice(categories),
                    "severity": rng.choice(severities),
                    "status": rng.choice(["open", "investigating", "resolved"]),
                    "description": _incident_description(rng),
                    "created_hours_ago": round(rng.uniform(0.1, 72), 1),
                })

    by_severity: dict[str, int] = {}
    for s in severities:
        by_severity[s] = sum(1 for inc in incidents if inc["severity"] == s)

    by_category: dict[str, int] = {}
    for c in categories:
        by_category[c] = sum(1 for inc in incidents if inc["category"] == c)

    by_region: dict[str, int] = {}
    for r in regions_to_use:
        by_region[r] = sum(1 for inc in incidents if inc["region"] == r)

    return {
        "total_incidents": len(incidents),
        "open_incidents": sum(1 for inc in incidents if inc["status"] == "open"),
        "by_severity": by_severity,
        "by_category": by_category,
        "by_region": by_region,
        "incidents": sorted(incidents, key=lambda x: x["created_hours_ago"]),
        "trend_24h": generate_hourly_series(rng, base=3, volatility=0.4, spike_hour=14, spike_magnitude=2.5),
        "trend_30d": generate_daily_series(rng, base=15, volatility=0.2),
    }


def _incident_description(rng: random.Random) -> str:
    templates = [
        "Network latency spike detected in load balancer",
        "Container restart loop in delivery tracking service",
        "GPS tracking module offline for fleet segment",
        "Database connection pool exhaustion on primary node",
        "Weather delay impacting scheduled departures",
        "Cargo scanner malfunction at sorting facility",
        "API gateway timeout affecting customer portal",
        "Power supply interruption at hub facility",
        "Route optimization service degraded performance",
        "TLS certificate expiry warning for tracking endpoint",
        "Fuel sensor reporting inconsistent readings",
        "Warehouse automation system partial outage",
    ]
    return rng.choice(templates)


def generate_infrastructure(region: str | None = None) -> dict:
    rng = _rng(5)
    regions_to_use = [region] if region and region in REGIONS else REGIONS
    by_region = []

    for r in regions_to_use:
        latency = round(rng.uniform(20, 300), 1)
        error_rate = round(rng.uniform(0.01, 5.0), 3)
        saturation = round(rng.uniform(30, 95), 1)
        uptime = round(rng.uniform(97, 99.99), 3)

        hubs_data = []
        for hub in HUBS[r]:
            hubs_data.append({
                "hub": hub,
                "latency_ms": round(rng.uniform(15, 350), 1),
                "error_rate_pct": round(rng.uniform(0.01, 6.0), 3),
                "cpu_saturation_pct": round(rng.uniform(25, 98), 1),
                "memory_saturation_pct": round(rng.uniform(30, 92), 1),
                "uptime_pct": round(rng.uniform(96, 99.99), 3),
            })

        by_region.append({
            "region": r,
            "avg_latency_ms": latency,
            "error_rate_pct": error_rate,
            "saturation_pct": saturation,
            "uptime_pct": uptime,
            "hubs": hubs_data,
        })

    return {
        "by_region": by_region,
        "latency_trend_24h": generate_hourly_series(rng, base=80, volatility=0.3, spike_hour=18, spike_magnitude=2.0),
        "latency_trend_30d": generate_daily_series(rng, base=75, volatility=0.15),
        "error_trend_24h": generate_hourly_series(rng, base=1.5, volatility=0.4),
        "error_trend_30d": generate_daily_series(rng, base=1.2, volatility=0.2, trend=0.05),
    }


def generate_cost(region: str | None = None) -> dict:
    rng = _rng(6)
    regions_to_use = [region] if region and region in REGIONS else REGIONS
    by_region = []

    for r in regions_to_use:
        infra = round(rng.uniform(50000, 300000), 2)
        fuel = round(rng.uniform(100000, 800000), 2)
        labor = round(rng.uniform(200000, 600000), 2)
        maintenance = round(rng.uniform(30000, 150000), 2)
        total = round(infra + fuel + labor + maintenance, 2)
        by_region.append({
            "region": r,
            "total": total,
            "infrastructure": infra,
            "fuel": fuel,
            "labor": labor,
            "maintenance": maintenance,
            "cost_per_delivery": round(total / rng.randint(2000, 8000), 2),
        })

    by_service = []
    services = ["last_mile", "long_haul", "air_freight", "sea_freight", "warehousing"]
    for svc in services:
        by_service.append({
            "service": svc,
            "monthly_cost": round(rng.uniform(80000, 500000), 2),
            "cost_trend": "increasing" if rng.random() > 0.5 else "stable",
        })

    return {
        "total_monthly_cost": round(sum(r["total"] for r in by_region), 2),
        "by_region": by_region,
        "by_service": by_service,
        "cost_trend_30d": generate_daily_series(rng, base=sum(r["total"] for r in by_region) / 30, volatility=0.1),
    }
