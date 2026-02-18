SEED = 42

REGIONS = ["NA", "LATAM", "EMEA", "APAC", "MEA", "OCEANIA"]

HUBS: dict[str, list[str]] = {
    "NA": ["New York", "Chicago", "Los Angeles", "Dallas", "Toronto"],
    "LATAM": ["São Paulo", "Mexico City", "Buenos Aires", "Bogotá"],
    "EMEA": ["London", "Frankfurt", "Madrid", "Dubai", "Istanbul"],
    "APAC": ["Shanghai", "Tokyo", "Singapore", "Mumbai", "Sydney"],
    "MEA": ["Nairobi", "Cairo", "Lagos"],
    "OCEANIA": ["Auckland", "Melbourne"],
}

TRANSPORT_TYPES = ["truck", "airplane", "ship"]

HOURS_24 = 24
DAYS_30 = 30
