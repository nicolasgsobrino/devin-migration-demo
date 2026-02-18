import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"


def test_overview():
    response = client.get("/overview")
    assert response.status_code == 200
    data = response.json()
    assert "sla_compliance" in data
    assert "on_time_delivery_pct" in data
    assert "backlog" in data
    assert "incident_rate" in data
    assert "infra_health_pct" in data
    assert "cost_index" in data
    assert "sla_trend_30d" in data
    assert "deliveries_trend_24h" in data
    assert isinstance(data["sla_trend_30d"], list)
    assert len(data["sla_trend_30d"]) == 30
    assert len(data["deliveries_trend_24h"]) == 24


def test_fleet():
    response = client.get("/fleet")
    assert response.status_code == 200
    data = response.json()
    assert "total_vehicles" in data
    assert "summary_by_type" in data
    assert "summary_by_region" in data
    assert "vehicles" in data
    assert data["total_vehicles"] > 0


def test_fleet_filter_region():
    response = client.get("/fleet?region=EMEA")
    assert response.status_code == 200
    data = response.json()
    for vehicle in data["vehicles"]:
        assert vehicle["region"] == "EMEA"


def test_fleet_filter_transport_type():
    response = client.get("/fleet?transport_type=truck")
    assert response.status_code == 200
    data = response.json()
    for vehicle in data["vehicles"]:
        assert vehicle["type"] == "truck"


def test_deliveries():
    response = client.get("/deliveries")
    assert response.status_code == 200
    data = response.json()
    assert "global_sla_pct" in data
    assert "total_deliveries" in data
    assert "by_region" in data
    assert "volume_trend_24h" in data
    assert "sla_trend_30d" in data
    assert "by_transport_type" in data
    assert len(data["by_region"]) == 6


def test_deliveries_filter_region():
    response = client.get("/deliveries?region=NA")
    assert response.status_code == 200
    data = response.json()
    assert len(data["by_region"]) == 1
    assert data["by_region"][0]["region"] == "NA"


def test_incidents():
    response = client.get("/incidents")
    assert response.status_code == 200
    data = response.json()
    assert "total_incidents" in data
    assert "open_incidents" in data
    assert "by_severity" in data
    assert "by_category" in data
    assert "by_region" in data
    assert "incidents" in data
    assert "trend_24h" in data
    assert "trend_30d" in data


def test_incidents_filter_region():
    response = client.get("/incidents?region=APAC")
    assert response.status_code == 200
    data = response.json()
    for inc in data["incidents"]:
        assert inc["region"] == "APAC"


def test_infrastructure():
    response = client.get("/infrastructure")
    assert response.status_code == 200
    data = response.json()
    assert "by_region" in data
    assert "latency_trend_24h" in data
    assert "latency_trend_30d" in data
    assert "error_trend_24h" in data
    assert "error_trend_30d" in data
    assert len(data["by_region"]) == 6
    for region in data["by_region"]:
        assert "hubs" in region
        assert len(region["hubs"]) > 0


def test_infrastructure_filter_region():
    response = client.get("/infrastructure?region=LATAM")
    assert response.status_code == 200
    data = response.json()
    assert len(data["by_region"]) == 1
    assert data["by_region"][0]["region"] == "LATAM"


def test_cost():
    response = client.get("/cost")
    assert response.status_code == 200
    data = response.json()
    assert "total_monthly_cost" in data
    assert "by_region" in data
    assert "by_service" in data
    assert "cost_trend_30d" in data
    assert len(data["by_region"]) == 6
    for region in data["by_region"]:
        assert "cost_per_delivery" in region


def test_cost_filter_region():
    response = client.get("/cost?region=MEA")
    assert response.status_code == 200
    data = response.json()
    assert len(data["by_region"]) == 1
    assert data["by_region"][0]["region"] == "MEA"


def test_insights():
    response = client.get("/insights")
    assert response.status_code == 200
    data = response.json()
    assert "insights" in data
    assert isinstance(data["insights"], list)
    assert len(data["insights"]) > 0
    for insight in data["insights"]:
        assert "type" in insight
        assert "category" in insight
        assert "message" in insight
        assert insight["type"] in ["ok", "info", "warning", "critical"]


def test_overview_reproducible():
    r1 = client.get("/overview").json()
    r2 = client.get("/overview").json()
    assert r1["sla_compliance"] == r2["sla_compliance"]
    assert r1["backlog"] == r2["backlog"]
    assert r1["incident_rate"] == r2["incident_rate"]
