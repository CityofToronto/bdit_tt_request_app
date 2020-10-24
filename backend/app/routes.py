from app import app


@app.route('/')
def index():
    return "Data Filter Web Application"


@app.route('/closest-node/<latitude>/<longitude>')
def get_closest_node(latitude, longitude):
    raise NotImplementedError


@app.route('/find-link/<from_node_id>/<to_node_id>')
def get_link_between_nodes(from_node_id, to_node_id):
    raise NotImplementedError

