from fastapi import APIRouter, Query

from app.data.generator import generate_deliveries

router = APIRouter()


@router.get("/deliveries")
def get_deliveries(
    region: str | None = Query(None, description="Filter by region"),
    transport_type: str | None = Query(None, description="Filter by transport type"),
) -> dict:
    return generate_deliveries(region=region, transport_type=transport_type)
