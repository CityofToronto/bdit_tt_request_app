"""Handle connection to database"""

import os
from dotenv import load_dotenv
from psycopg_pool import ConnectionPool

load_dotenv()

kwargs = {
    'host': os.environ['DB_HOST'],
    'dbname': os.environ['DB_NAME'],
    'user': os.environ['DB_USER'],
    'password': os.environ['DB_USER_PASSWORD']
}

pool = ConnectionPool(kwargs=kwargs,min_size=1,max_size=5,open=True)
pool.wait()

def getConnection():
    with pool.connection() as conn:
        #print(conn.execute('SELECT * FROM here.ta LIMIT 1'))
        yield conn
