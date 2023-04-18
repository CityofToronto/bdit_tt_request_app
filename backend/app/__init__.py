from flask import Flask
from flask_cors import CORS

from config import Config
from os import environ
from datetime import datetime
from pytz import timezone

app = Flask(__name__)
CORS(app=app, supports_credentials=True)
app.config.from_object(Config)

TIMEZONE = timezone('US/Eastern')
FULL_DATE_TIME_FORMAT = "%Y-%m-%d %H:%M"
DATE_FORMAT = "%Y-%m-%d"
TIME_FORMAT = "%H:%M"
POSTGIS_GEOM_SRID = int(environ["POSTGIS_GEOM_SRID"])
ALLOWED_FILE_TYPES = ['csv', 'xlsx']

from app import routes
