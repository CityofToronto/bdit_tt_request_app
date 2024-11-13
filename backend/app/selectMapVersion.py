from app.db import getConnection

def selectMapVersion(start_date, end_date):
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