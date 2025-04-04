from app.db import getConnection

def currentDateBounds():
    connection = getConnection()
    with connection:
        with connection.cursor() as cursor:
            cursor.execute('SELECT MIN(dt)::text, MAX(dt)::text FROM here.ta;')
            ( min_date, max_date ) = cursor.fetchone()
    connection.close()
    return {
        "minDate": min_date,
        "maxDate": max_date
    }