import logging
from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import cost, deliveries, fleet, incidents, infrastructure, insights, overview

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("observability-api")


@asynccontextmanager
async def lifespan(application: FastAPI) -> AsyncIterator[None]:
    logger.info("Transport Observability API started")
    yield
    logger.info("Transport Observability API shutting down")


app = FastAPI(
    title="Transport Observability API",
    description="Simulated observability data for a global transport company",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(overview.router, tags=["Overview"])
app.include_router(fleet.router, tags=["Fleet"])
app.include_router(deliveries.router, tags=["Deliveries"])
app.include_router(incidents.router, tags=["Incidents"])
app.include_router(infrastructure.router, tags=["Infrastructure"])
app.include_router(cost.router, tags=["Cost"])
app.include_router(insights.router, tags=["Insights"])


@app.get("/health", tags=["Health"])
def health() -> dict[str, str]:
    return {"status": "ok"}
