from app import app


@app.route('/')
def index():
    return "Data Filter Web Application"
