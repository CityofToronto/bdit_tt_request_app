from app.db import getConnection

# Selects Here map version to use based on dates in the provided query.
# however the query also has nodes which may or may not be version-specific

rangeQuery = """
WITH coverage AS (
    SELECT
        street_version,
        valid_range * daterange(%(start_date)s, %(end_date)s,'[)') AS overlap
    FROM here.street_valid_range
)

SELECT street_version
FROM coverage
WHERE UPPER(overlap) - LOWER(overlap) IS NOT NULL
ORDER BY UPPER(overlap) - LOWER(overlap) DESC NULLS LAST;
"""

nowQuery = """
SELECT street_version
FROM here.street_valid_range
WHERE valid_range @> NOW()::date;
"""

def selectMapVersion(start_date=None, end_date=None):
    connection = getConnection()
    with connection:
        with connection.cursor() as cursor:
            # a daterange has been provided
            cursor.execute(
                rangeQuery if start_date and end_date else nowQuery,
                {'start_date':start_date,'end_date':end_date}
            )
            (map_version) = cursor.fetchone()
    connection.close()
    return map_version
