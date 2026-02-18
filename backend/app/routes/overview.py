from fastapi import APIRouter

from app.data.generator import generate_overview

router = APIRouter()


@router.get("/overview")
def get_overview() -> dict:
    return generate_overview()
