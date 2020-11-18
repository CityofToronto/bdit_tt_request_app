from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

from config import Config

app = Flask(__name__)
CORS(app=app, supports_credentials=True)
app.config.from_object(Config)

db = SQLAlchemy(app)
db.create_all()

METER_UNIT_SRID = 26986
DATE_TIME_FORMAT = "%Y-%m-%d %H:%M"
ALLOWED_FILE_TYPES = ['csv', 'xlsx']

from app import routes
