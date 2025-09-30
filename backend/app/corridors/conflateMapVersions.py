from app.links.here import get_here_links
from app.nodes.byID.here import get_here_node
from app.nodes.conflation import metersBetweenNodes
from functools import reduce

def corridorLength(links):
    return reduce(lambda a,b:a+b,[l['length_m'] for l in links])

def corridorsAreTheSame(startNode,endNode,mapVersions):
    """determine whether a corridor is effectively the same between map versions"""

    # compare all map versions to the first one
    thisMap = mapVersions[0]
    links, corridorURI = get_here_links(startNode, endNode, thisMap['version'])

    for altMap in mapVersions[1:]:
        # check that routing is basically the same on the other maps
        # first, check that start, end nodes exist and are in the same spot
        for nodeId in [startNode, endNode]:
            nodeA = get_here_node(nodeId, hereMapVersion=thisMap['version'])
            nodeB = get_here_node(nodeId, hereMapVersion=altMap['version'])
            nodeDrift = metersBetweenNodes(nodeA, nodeB)
            if nodeDrift >= 10:
                return False
        altLinks, altURI = get_here_links(startNode, endNode, altMap['version'])

        # length must be < +/- 2% between map versions
        lengthRatio = corridorLength(links) / corridorLength(altLinks)
        if not (lengthRatio > 0.98 and lengthRatio < 1.02):
            return False

        # check street names for equality; assures no rerouting
        namesA = set([link['name'] for link in links])
        namesB = set([link['name'] for link in altLinks])
        if namesA != namesB:
            return False
    return True
