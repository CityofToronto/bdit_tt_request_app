from app.db import pool
from app.dates import maxDate

# Selects Here map version to use based on a date range for the travel time
# query, or latest available date if those are not provided

query_if_dates_provided = """
SELECT
    street_version,
    lower(valid_range)::text AS lower,
    upper(valid_range)::text AS upper
FROM here.street_valid_range
WHERE valid_range && daterange(%(start_date)s, %(end_date)s,'[)')
ORDER BY lower
"""

def selectMapVersions(start_date, end_date):
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                query_if_dates_provided,
                {'start_date':start_date,'end_date':end_date}
            )
            map_versions = [{
                'version': mv,
                'lowerDateInclusive': lower,
                'upperDateExclusive': upper
            } for (mv,lower,upper) in cursor.fetchall()]
    return map_versions

query_for_latest_date = """
SELECT street_version
FROM here.street_valid_range
WHERE valid_range @> %(maxDate)s::date;
"""

def latestMapVersion():
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(query_for_latest_date, {'maxDate': maxDate()})
            (map_version,) = cursor.fetchone()
        return map_version
