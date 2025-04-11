from time import time
from app.db import pool

# This is a very efficient query of a large table (indexes only, really),
# but because it takes some time, including just connecting, and because it
# 1. only changes once a day and
# 2. is necessary for many other things
# I want to cache the results for speed

cache = {
    'time': 0, # 1970-01-01 00:00:00 ie. will update when first called
    'results': None
}

def currentDateBounds():
    if time() - cache['time'] < 600: # 600 seconds = 10 minutes
        return cache['results']
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute('SELECT MIN(dt)::text, MAX(dt)::text FROM here.ta;')
            ( min_date, max_date ) = cursor.fetchone()
    results = {
        "minDate": min_date,
        "maxDate": max_date
    }
    cache['time'] = time() # seconds since epoch
    cache['results'] = results
    return results

def maxDate():
    return currentDateBounds()['maxDate']
