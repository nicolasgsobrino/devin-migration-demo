from fastapi import APIRouter, Query

from app.data.generator import generate_cost

router = APIRouter()


@router.get("/cost")
def get_cost(
    region: str | None = Query(None, description="Filter by region"),
) -> dict:
    return generate_cost(region=region)
