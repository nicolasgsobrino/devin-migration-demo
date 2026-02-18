from fastapi import APIRouter, Query

from app.data.generator import generate_fleet

router = APIRouter()


@router.get("/fleet")
def get_fleet(
    region: str | None = Query(None, description="Filter by region"),
    transport_type: str | None = Query(None, description="Filter by transport type"),
) -> dict:
    return generate_fleet(region=region, transport_type=transport_type)
