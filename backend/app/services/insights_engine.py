from app.data.generator import (
    generate_cost,
    generate_deliveries,
    generate_incidents,
    generate_infrastructure,
    generate_overview,
)


def generate_insights() -> list[dict[str, str]]:
    overview = generate_overview()
    deliveries = generate_deliveries()
    incidents = generate_incidents()
    infra = generate_infrastructure()
    cost = generate_cost()

    insights: list[dict[str, str]] = []

    if overview["sla_compliance"] < 95:
        insights.append({
            "type": "warning",
            "category": "SLA",
            "message": (
                f"Global SLA compliance is at {overview['sla_compliance']}%, "
                "below the 95% target. Review regional performance for bottlenecks."
            ),
        })
    else:
        insights.append({
            "type": "ok",
            "category": "SLA",
            "message": (
                f"Global SLA compliance is healthy at {overview['sla_compliance']}%. "
                "All regions within acceptable thresholds."
            ),
        })

    worst_region = max(deliveries["by_region"], key=lambda r: r["delayed"])
    if worst_region["sla_pct"] < 90:
        insights.append({
            "type": "critical",
            "category": "deliveries",
            "message": (
                f"Region {worst_region['region']} has a delivery SLA of only "
                f"{worst_region['sla_pct']}% with {worst_region['delayed']} delayed "
                f"shipments. Immediate action recommended."
            ),
        })
    elif worst_region["delayed"] > 200:
        insights.append({
            "type": "warning",
            "category": "deliveries",
            "message": (
                f"Region {worst_region['region']} shows {worst_region['delayed']} "
                f"delayed deliveries (SLA: {worst_region['sla_pct']}%). "
                "Consider redistributing load to adjacent hubs."
            ),
        })

    if deliveries["total_backlog"] > 500:
        insights.append({
            "type": "warning",
            "category": "backlog",
            "message": (
                f"Total delivery backlog is {deliveries['total_backlog']} items. "
                "This exceeds the recommended threshold of 500. "
                "Scale up processing capacity in affected regions."
            ),
        })

    high_incident_regions = [
        (r, count) for r, count in incidents["by_region"].items() if count > 30
    ]
    for r, count in high_incident_regions:
        insights.append({
            "type": "warning",
            "category": "incidents",
            "message": (
                f"Region {r} has {count} active incidents, significantly above average. "
                "Correlate with infrastructure metrics for root cause analysis."
            ),
        })

    critical_count = incidents["by_severity"].get("critical", 0)
    if critical_count > 10:
        insights.append({
            "type": "critical",
            "category": "incidents",
            "message": (
                f"There are {critical_count} critical incidents across the platform. "
                "Activate incident response protocol and prioritize resolution."
            ),
        })

    for region_data in infra["by_region"]:
        r = region_data["region"]
        if region_data["avg_latency_ms"] > 200:
            incident_count = incidents["by_region"].get(r, 0)
            insights.append({
                "type": "warning",
                "category": "infrastructure",
                "message": (
                    f"High latency detected in {r} ({region_data['avg_latency_ms']}ms). "
                    f"This region also has {incident_count} incidents. "
                    "Latency spike may be contributing to operational delays."
                ),
            })
        if region_data["saturation_pct"] > 85:
            insights.append({
                "type": "warning",
                "category": "infrastructure",
                "message": (
                    f"Infrastructure saturation in {r} is at "
                    f"{region_data['saturation_pct']}%. "
                    "Consider scaling resources before reaching critical capacity."
                ),
            })

    for hub_region in infra["by_region"]:
        for hub_data in hub_region["hubs"]:
            if hub_data["error_rate_pct"] > 4.0:
                insights.append({
                    "type": "critical",
                    "category": "infrastructure",
                    "message": (
                        f"Hub {hub_data['hub']} ({hub_region['region']}) has an error "
                        f"rate of {hub_data['error_rate_pct']}%, well above the 2% "
                        "threshold. Investigate service health immediately."
                    ),
                })

    highest_cost_region = max(cost["by_region"], key=lambda r: r["cost_per_delivery"])
    lowest_cost_region = min(cost["by_region"], key=lambda r: r["cost_per_delivery"])
    if highest_cost_region["cost_per_delivery"] > lowest_cost_region["cost_per_delivery"] * 2:
        insights.append({
            "type": "info",
            "category": "cost",
            "message": (
                f"Cost disparity detected: {highest_cost_region['region']} has a "
                f"cost-per-delivery of ${highest_cost_region['cost_per_delivery']:.2f} "
                f"vs ${lowest_cost_region['cost_per_delivery']:.2f} in "
                f"{lowest_cost_region['region']}. Review operational efficiency."
            ),
        })

    increasing_services = [
        s["service"] for s in cost["by_service"] if s["cost_trend"] == "increasing"
    ]
    if increasing_services:
        insights.append({
            "type": "info",
            "category": "cost",
            "message": (
                f"Cost trend increasing for services: {', '.join(increasing_services)}. "
                "Monitor for budget overrun and optimize resource allocation."
            ),
        })

    if overview["on_time_delivery_pct"] > 95:
        insights.append({
            "type": "ok",
            "category": "performance",
            "message": (
                f"On-time delivery rate is excellent at "
                f"{overview['on_time_delivery_pct']}%. "
                "Fleet utilization and routing algorithms performing optimally."
            ),
        })

    if not insights:
        insights.append({
            "type": "ok",
            "category": "general",
            "message": "All systems operating within normal parameters. No anomalies detected.",
        })

    return insights
