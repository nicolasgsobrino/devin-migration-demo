import random
from datetime import datetime, timedelta, timezone

from app.config import DAYS_30, HOURS_24


def generate_hourly_series(
    rng: random.Random,
    base: float,
    volatility: float = 0.1,
    hours: int = HOURS_24,
    spike_hour: int | None = None,
    spike_magnitude: float = 1.5,
) -> list[dict[str, float | str]]:
    now = datetime.now(tz=timezone.utc).replace(minute=0, second=0, microsecond=0)
    series = []
    for i in range(hours):
        ts = now - timedelta(hours=hours - 1 - i)
        value = base * (1 + rng.uniform(-volatility, volatility))
        if spike_hour is not None and i == spike_hour:
            value *= spike_magnitude
        series.append({
            "timestamp": ts.isoformat(),
            "value": round(value, 2),
        })
    return series


def generate_daily_series(
    rng: random.Random,
    base: float,
    volatility: float = 0.08,
    days: int = DAYS_30,
    trend: float = 0.0,
) -> list[dict[str, float | str]]:
    today = datetime.now(tz=timezone.utc).replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    series = []
    for i in range(days):
        ts = today - timedelta(days=days - 1 - i)
        drift = 1 + trend * (i / days)
        value = base * drift * (1 + rng.uniform(-volatility, volatility))
        series.append({
            "timestamp": ts.isoformat(),
            "value": round(value, 2),
        })
    return series
