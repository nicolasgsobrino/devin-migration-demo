from fastapi import APIRouter

from app.services.insights_engine import generate_insights

router = APIRouter()


@router.get("/insights")
def get_insights() -> dict:
    return {"insights": generate_insights()}
