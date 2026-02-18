from fastapi import APIRouter, Query

from app.data.generator import generate_incidents

router = APIRouter()


@router.get("/incidents")
def get_incidents(
    region: str | None = Query(None, description="Filter by region"),
) -> dict:
    return generate_incidents(region=region)
