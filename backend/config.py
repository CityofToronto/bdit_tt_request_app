import os

basedir = os.path.abspath(os.path.dirname(__file__))

REQUIRED_SYSTEM_ENVIRONMENT_VARIABLES = ['SECRET_KEY', 'DATABASE_URL', 'LINK_TABLE_NAME', 'NODE_TABLE_NAME',
                                         'TRAVEL_DATA_TABLE_NAME', 'POSTGIS_GEOM_SRID', 'TEMP_FILE_LOCATION',
                                         'KEEP_TEMP_FILE']

if False in [var in os.environ for var in REQUIRED_SYSTEM_ENVIRONMENT_VARIABLES]:
    raise EnvironmentError(
        "Missing system environment! All of the following environment variables must be present: %s" % str(
            REQUIRED_SYSTEM_ENVIRONMENT_VARIABLES))


class Config(object):
    CSRF_ENABLED = True
    SECRET_KEY = os.environ['SECRET_KEY']
    SQLALCHEMY_DATABASE_URI = os.environ['DATABASE_URL']
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = None
    SESSION_COOKIE_SECURE = False
