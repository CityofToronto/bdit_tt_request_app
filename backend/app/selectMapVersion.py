from app.db import getConnection
from datetime import date, timedelta

# Selects Here map version to use based on a date range for the travel time
# query, or today's date if those are not provided

def selectMapVersion(
    start_date = date.today().isoformat(),
    end_date = (date.today() + timedelta(days=1)).isoformat()
):
    query = """
    WITH coverage AS (
        SELECT
            street_version,
            valid_range * daterange(%(start_date)s, %(end_date)s,'[)') AS overlap
        FROM here.street_valid_range
    )

    SELECT
        street_version,
        UPPER(overlap) - LOWER(overlap) AS days_covered
    FROM coverage
    WHERE UPPER(overlap) - LOWER(overlap) IS NOT NULL
    ORDER BY days_covered DESC NULLS LAST
    """
    connection = getConnection()
    with connection:
        with connection.cursor() as cursor:
            cursor.execute(query,{'start_date':start_date,'end_date':end_date})
            (map_version, coverage) = cursor.fetchone()
    connection.close()
    return map_version