# Stellar Ops - Transport Observability Platform

A "Datadog-like" observability POC for a global transport company, with a galactic/space-themed dashboard.

![Architecture](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square) ![Frontend](https://img.shields.io/badge/Frontend-React%20+%20TypeScript-61DAFB?style=flat-square) ![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square)

## Quick Start (Docker)

```bash
docker-compose up --build
```

- **API**: http://localhost:8000
- **Dashboard**: http://localhost:5173
- **API Docs (Swagger)**: http://localhost:8000/docs

## Quick Start (Local Development)

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend connects to `http://localhost:8000` by default. Override with `VITE_API_URL` env var.

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/health` | GET | Health check → `{"status": "ok"}` |
| `/overview` | GET | Global KPIs (SLA, deliveries, backlog, etc.) |
| `/fleet` | GET | Fleet status by type/region. Params: `?region=`, `?transport_type=` |
| `/deliveries` | GET | Delivery volume, SLA, backlog. Params: `?region=`, `?transport_type=` |
| `/incidents` | GET | Operational & IT incidents. Params: `?region=` |
| `/infrastructure` | GET | Latency, errors, saturation by region/hub. Params: `?region=` |
| `/cost` | GET | Cost breakdown by region & service. Params: `?region=` |
| `/insights` | GET | AI-generated heuristic interpretations of current data |

## Simulated Data

- **Seed**: `42` (reproducible between runs)
- **Regions**: NA, LATAM, EMEA, APAC, MEA, OCEANIA
- **Hubs**: 24 hubs distributed across regions
- **Transport types**: truck, airplane, ship
- **Time series**: 24h (hourly) + 30d (daily)
- No external databases — all generated in-memory

## Dashboard Features

- **KPI cards**: SLA compliance, on-time delivery, backlog, incident rate, infra health, cost index
- **Time series charts**: Delivery volume (24h), SLA trend (30d), latency, incidents
- **Bar charts**: Deliveries by region, cost by region, SLA by transport type, cost by service
- **Region health map**: Color-coded tiles showing latency/errors/uptime per region
- **Insights panel**: Heuristic AI insights with severity badges (ok/info/warning/critical)
- **Filterable tables**: Recent incidents, fleet status
- **Filters**: Region, time range (24h/30d), transport type
- **Galactic UI**: Dark theme, star field background, nebula glows, Orbitron typography

## Running Tests

```bash
cd backend
pip install -r requirements.txt
python -m pytest tests/ -v
```

## Repository Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app, CORS, routes
│   │   ├── config.py            # Seed, regions, hubs, constants
│   │   ├── models.py            # Pydantic schemas
│   │   ├── data/
│   │   │   ├── generator.py     # Simulated data generator (seed-based)
│   │   │   ├── regions.py       # Region/hub helpers
│   │   │   └── timeseries.py    # Time series generator (24h, 30d)
│   │   ├── routes/
│   │   │   ├── overview.py      # /overview
│   │   │   ├── fleet.py         # /fleet
│   │   │   ├── deliveries.py    # /deliveries
│   │   │   ├── incidents.py     # /incidents
│   │   │   ├── infrastructure.py # /infrastructure
│   │   │   ├── cost.py          # /cost
│   │   │   └── insights.py      # /insights
│   │   └── services/
│   │       └── insights_engine.py # Heuristic insights (no external APIs)
│   ├── tests/
│   │   └── test_endpoints.py    # 15 pytest tests
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.tsx              # Main dashboard
│   │   ├── api/client.ts        # HTTP client
│   │   ├── hooks/useApi.ts      # Data fetching hook
│   │   ├── types/api.ts         # TypeScript types
│   │   ├── components/
│   │   │   ├── cards/           # KpiCard, InsightCard
│   │   │   ├── charts/          # TimeSeriesChart, RegionBarChart
│   │   │   ├── filters/         # FilterBar
│   │   │   ├── layout/          # Loading, ErrorBanner, RegionMap
│   │   │   └── tables/          # IncidentsTable, FleetTable
│   │   └── index.css            # Galactic theme CSS
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Screenshots

After running `docker-compose up`, open http://localhost:5173 to see the dashboard. Recommended screenshot areas:
1. **Full dashboard** — the main view with KPIs and charts
2. **Insights panel** — scroll down to see AI-generated insights
3. **Region health map** — color-coded region tiles
4. **Incidents table** — filterable incident list
