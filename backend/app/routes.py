from app import app


@app.route('/closest-node/<latitude>/<longitude>', methods=['GET'])
def get_closest_node(latitude, longitude):
    raise NotImplementedError


@app.route('/link-nodes/<from_node_id>/<to_node_id>', methods=['GET'])
def get_links_between_nodes(from_node_id, to_node_id):
    raise NotImplementedError


@app.route('/travel-data', methods=['POST'])
def get_links_travel_data():
    raise NotImplementedError


@app.route('/date-bounds', methods=['GET'])
def get_date_bounds():
    raise NotImplementedError
