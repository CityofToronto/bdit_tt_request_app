from app.db import getConnection
from app.dates import maxDate

# Selects Here map version to use based on a date range for the travel time
# query, or latest available date if those are not provided

query_if_dates_provided = """
WITH coverage AS (
    SELECT
        street_version,
        valid_range * daterange(%(start_date)s, %(end_date)s,'[)') AS overlap
    FROM here.street_valid_range
)

SELECT street_version
FROM coverage
WHERE UPPER(overlap) - LOWER(overlap) IS NOT NULL
ORDER BY UPPER(overlap) - LOWER(overlap) DESC;
"""

query_for_latest_date = """
SELECT street_version
FROM here.street_valid_range
WHERE valid_range @> %(maxDate)s::date;
"""

def selectMapVersion(start_date='????-??-??', end_date='????-??-??'):
    connection = getConnection()
    with connection:
        with connection.cursor() as cursor:
            if start_date == '????-??-??':
                cursor.execute(query_for_latest_date, {'maxDate': maxDate()})
            else:
                cursor.execute(
                    query_if_dates_provided,
                    {'start_date':start_date,'end_date':end_date}
                )
            (map_version,) = cursor.fetchone()
    print(map_version)
    connection.close()
    return map_version