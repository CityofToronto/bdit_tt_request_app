from app.nodes.nearby.here import get_here_nodes_within
from app.nodes.byID.px import get_px_node
from app.nodes.nearby.centreline import get_nearest_centreline_node
from haversine import haversine, Unit

def add_conflated_nodes(node):
    """adds "conflated" field to node objects"""

    node['conflated'] = {}
    lon = node['geometry']['coordinates'][0]
    lat = node['geometry']['coordinates'][1]

    if node['network'] == 'centreline':
        # adds px and here nodes
        # px search is based on the centreline_id
        node['conflated']['px'] = get_px_node(node['node_id'])
        try:
            # here search is based on distance
            node['conflated']['here'] = get_here_nodes_within(50, lon, lat, 1)[0]
        except:
            pass
    elif node['network'] == 'here':
        # adds centreline and px nodes
        # get centreline by nearest
        node['conflated']['centreline'] = get_nearest_centreline_node(lon, lat)
        # get px from Id of nearest centreline
        node['conflated']['px'] = get_px_node(node['conflated']['centreline']['node_id'])

    # now get distances between selected and conflated points
    for network, conflatedNode in node['conflated'].items():
        try:
            conflatedNode['distance'] = metersBetweenNodes(node,conflatedNode)
        except:
            pass

    return node

def metersBetweenNodes(nodeA, nodeB):
    return haversine(
        # coordinate order must be reversed
        tuple(nodeA['geometry']['coordinates'][::-1]),
        tuple(nodeB['geometry']['coordinates'][::-1]),
        unit=Unit.METERS
    )
