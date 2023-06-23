import { Component } from 'react'
import SidebarContent from "./Sidebar"
import Map from "./Map"

import { SpatialData } from '../spatialData.js'

import RangeFactory from "./Datetime/Range"
import { getLinksBetweenNodes, getDateBoundaries } from "../actions.js"
import FileSettingsFactory from "./Settings/FileSettings"
import { NotificationContainer, NotificationManager } from 'react-notifications'
import './layout.css'

export default class Layout extends Component {
    constructor(props) {
        super(props);
        this.state = {
            spatialData: new SpatialData(),
            popupOpen: false,
            nodesList: [],
            linksList: [],
            activeRange: 0,
            ranges: [],
            fileSettings: FileSettingsFactory.newFileSettings({}),
            disableGetButton: false
        };
        this.handleClose = this.handleClose.bind(this)
        this.openPopup = this.openPopup.bind(this)
        this.replaceSettings = this.replaceSettings.bind(this)
        this.addRange = this.addRange.bind(this)
        this.replicateRange = this.replicateRange.bind(this)
        this.deleteCurrRange = this.deleteCurrRange.bind(this)
        this.changeDateTimeRange = this.changeDateTimeRange.bind(this)
        this.renameRange = this.renameRange.bind(this)
        this.replaceActiveRange = this.replaceActiveRange.bind(this)
        this.replaceSettings = this.replaceSettings.bind(this)
    }

    componentDidMount(){
        getDateBoundaries().then( ({startDate,endDate}) => {
            let range = RangeFactory.newRange({
                startTime: startDate,
                endTime: endDate
            } )
            this.setState({ranges:[range]})
        } )
    }

    updateNodes = (newNodes) => {
        this.setState({nodesList: newNodes});
    }

    updateLinks = (newLinks) => {
        this.setState({linksList: [ ...newLinks, ...this.state.linksList ]});
    }

    getLinks = (doc, enableInteractions) => {
        getLinksBetweenNodes(doc, this.state.nodesList, enableInteractions);
    }

    resetMapVars = () => {
        this.setState({linksList: [], nodesList: []});
    }

    changeDateTimeRange(event) {
        let rangeChoice = event.value;
        let choice = parseInt(rangeChoice.split(" ")[0]);
        this.setState({activeRange: choice - 1});
    }

    removeAllLinks = () => {
        this.setState({linksList: []});
    }

    addRange() {
        let ranges = [...this.state.ranges];
        const name = prompt("Name the new range")
        if (!name || name === "") {
            if (name === "") {
                NotificationManager.error('You must enter a name');
            }
        } else {
            ranges.push(RangeFactory.newRange({
                name: name,
                startTime: null,
                endTime: null
            }));
            this.setState({
                activeRange: this.state.ranges.length,
                ranges: ranges
            });
        }
    }

    replicateRange() {
        let ranges = [...this.state.ranges];
        let activeRange = ranges[this.state.activeRange];
        let params = activeRange.getParams();

        const name = prompt("Name the new Range");

        if (!name || name === "") {
            if (name === "") {
                NotificationManager.error('You must enter a name');
            }
        } else {
            params.name = name;
            ranges.push(RangeFactory.newRange(params));
            this.setState({
                activeRange: this.state.ranges.length,
                ranges: ranges
            });
        }
    }

    renameRange() {
        const name = prompt("Enter the new Name");
        if (!name || name === "") {
            if (name === "") {
                NotificationManager.error('You must enter a name');
            }
        } else {
            let params = this.state.ranges[this.state.activeRange].getParams();
            params.name = name;
            this.replaceActiveRange(params);
        }
    }

    deleteCurrRange() {
        if (this.state.ranges.length <= 1) {
            NotificationManager.error('Must have at least one range!');
            return;
        }
        let new_ranges = [...this.state.ranges];
        new_ranges.splice(this.state.activeRange, 1);

        let newActiveRange = this.state.activeRange;

        if (newActiveRange > 0) {
            newActiveRange--;
        }

        this.setState({
            activeRange: newActiveRange,
            ranges: new_ranges
        });
    }

    downloadGeoJSON() {
        let filename = "geometry_data.json";
        let contentType = "application/json;charset=utf-8;";

        let geoJSON = {
            "type": "FeatureCollection",
            "features": this.state.linksList.flat().map( (segment,i) => {
                return {
                    "type": "Feature",
                    "properties": {
                        "segment_number": i,
                        "link_dirs": segment.link_dirs,
                        "link_name": segment.path_name,
                        "source_node_id": segment.source,
                        "target_node_id": segment.target
                    },
                    "geometry": segment.geometry
                }
            } )
        };

        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            let blob = new Blob([decodeURIComponent(encodeURI(JSON.stringify(geoJSON, null, "\t")))], {type: contentType});
            navigator.msSaveOrOpenBlob(blob, filename);
        } else {
            let a = document.createElement('a');
            a.download = filename;
            a.href = 'data:' + contentType + ',' + encodeURIComponent(JSON.stringify(geoJSON, null, "\t"));
            a.target = '_blank';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    }

    openPopup() { this.setState({popupOpen: true}) }
    handleClose() { this.setState({popupOpen: false}) }

    replaceActiveRange = (params) => {
        let ranges = [...this.state.ranges];
        ranges[this.state.activeRange] = RangeFactory.newRange(params);
        this.setState({ranges: ranges});
    }

    replaceSettings = (params) => {
        this.setState(
            { fileSettings: FileSettingsFactory.newFileSettings(params) }
        )
    }

    render() {
        if(this.state.ranges.length === 0) return null;
        const activeRange = this.state.ranges[this.state.activeRange];
        let rangeNames = this.state.ranges.map( r => r.getName() );
        return (
            <div className='layoutContainer'>
                <div className='layoutSidebar'>
                    <SidebarContent
                        disableGetButton={this.state.disableGetButton}
                        openPopup={this.openPopup}
                        range={this.state.activeRange}
                        fileSettings={this.state.fileSettings}
                        replaceSettings={this.replaceSettings}
                        dateTimeRanges={this.state.ranges.length}
                        addNewRange={this.addRange}
                        replicateCurrRange={this.replicateRange}
                        deleteCurrRange={this.deleteCurrRange}
                        changeDateTimeRange={this.changeDateTimeRange}
                        renameRange={this.renameRange}
                        activeRange={activeRange}
                        replaceActiveRange={this.replaceActiveRange}
                        rangeNames={rangeNames}
                        state={this.props.state}
                    />
                </div>

                <div className='layoutMap'>
                    <Map
                        onLinkUpdate={this.updateLinks}
                        onNodeUpdate={this.updateNodes}
                        getLinks={this.getLinks}
                        resetMapVars={this.resetMapVars}
                        removeAllLinks={this.removeAllLinks}
                        spatialData={this.state.spatialData}
                    />
                </div>

                {false && <div className='layoutMapControls'>
                    {/*will hold this component eventually*/}
                </div>}
                <NotificationContainer/>
            </div>
        );

    }
}
