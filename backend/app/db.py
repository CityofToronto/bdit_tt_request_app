"""Handle connection to database"""

import os
from dotenv import load_dotenv
from psycopg_pool import ConnectionPool

load_dotenv()

pool = ConnectionPool(
    kwargs={
        'host': os.environ['DB_HOST'],
        'dbname': os.environ['DB_NAME'],
        'user': os.environ['DB_USER'],
        'password': os.environ['DB_USER_PASSWORD']
    },
    min_size=1,
    max_size=5,
    open=True
)
pool.wait()
