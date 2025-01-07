from app.nodes.nearby.here import get_here_nodes_within
from app.nodes.byID.px import get_px_node
from app.nodes.nearby.centreline import get_nearest_centreline_node

def add_conflated_nodes(node):
    """adds "conflated" field to node objects"""

    node['conflated'] = {}

    if node['network'] == 'centreline':
        # adds px and here nodes
        # px search is based on the centreline_id
        node['conflated']['px'] = get_px_node(node['node_id'])
        try:
            # here search is based on distance
            lon = node['geometry']['coordinates'][0]
            lat = node['geometry']['coordinates'][1]
            node['conflated']['here'] = get_here_nodes_within(50, lon, lat, 1)[0]
        except:
            pass
    elif node['network'] == 'here':
        # adds centreline and px nodes
        # get centreline by nearest
        lon = node['geometry']['coordinates'][0]
        lat = node['geometry']['coordinates'][1]
        node['conflated']['centreline'] = get_nearest_centreline_node(lon, lat)
        # get px from Id of nearest centreline
        node['conflated']['px'] = get_px_node(node['conflated']['centreline']['node_id'])

    return node