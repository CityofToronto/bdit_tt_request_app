from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

from config import Config

app = Flask(__name__)
CORS(app=app, supports_credentials=True)
app.config.from_object(Config)

db = SQLAlchemy(app)
db.create_all()

METER_UNIT_SRID = 2952
FULL_DATE_TIME_FORMAT = "%Y-%m-%d %H:%M"
DATE_FORMAT = "%Y-%m-%d"
TIME_FORMAT = "%H:%M"
ALLOWED_FILE_TYPES = ['csv', 'xlsx']
DB_TRAVEL_DATA_QUERY_RESULT_FORMAT = {
    'id': (int, 0),
    'period': (str, 1),
    'street': (str, -1),
    'from_street': (str, -1),
    'to_street': (str, -1),
    'mean_tt': (float, 2),
    'min_tt': (float, 3),
    'max_tt': (float, 4),
    'pct_5_tt': (float, 5),
    'pct_10_tt': (float, 6),
    'pct_15_tt': (float, 7),
    'pct_20_tt': (float, 8),
    'pct_25_tt': (float, 9),
    'pct_30_tt': (float, 10),
    'pct_35_tt': (float, 11),
    'pct_40_tt': (float, 12),
    'pct_45_tt': (float, 13),
    'pct_50_tt': (float, 14),
    'pct_55_tt': (float, 15),
    'pct_60_tt': (float, 16),
    'pct_65_tt': (float, 17),
    'pct_70_tt': (float, 18),
    'pct_75_tt': (float, 19),
    'pct_80_tt': (float, 20),
    'pct_85_tt': (float, 21),
    'pct_90_tt': (float, 22),
    'pct_95_tt': (float, 23),
    'std_dev': (float, 24),
    'min_spd': (float, 25),
    'mean_spd': (float, 26),
    'max_spd': (float, 27),
    'total_length': (float, 28),
    'days_of_data': (int, 29),
    'requested_days': (int, 30),
    'prop_5min': (float, 31)
}

from app import routes
