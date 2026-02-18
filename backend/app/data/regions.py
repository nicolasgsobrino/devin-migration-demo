from app.config import HUBS, REGIONS


def get_all_hubs() -> list[dict[str, str]]:
    result = []
    for region in REGIONS:
        for hub in HUBS[region]:
            result.append({"region": region, "hub": hub})
    return result


def get_hubs_by_region(region: str) -> list[str]:
    return HUBS.get(region, [])
