from fastapi import APIRouter, Query

from app.data.generator import generate_infrastructure

router = APIRouter()


@router.get("/infrastructure")
def get_infrastructure(
    region: str | None = Query(None, description="Filter by region"),
) -> dict:
    return generate_infrastructure(region=region)
