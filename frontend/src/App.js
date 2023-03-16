import React from 'react';
import Layout from './components/Layout/Layout.jsx';
import Mapbox from "./components/Map/Mapbox";
import './App.css';
import {getDateBoundaries} from "./actions/actions";

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            maxDate: null,
            startDate: null
        };
    }

    componentDidMount() {
        getDateBoundaries(this);
    }

    render() {
        if (this.state.maxDate == null) {
            return (<div/>);
        } else {
            return (<div>
                <Mapbox/>
                <Layout
                    state={this.state}
                />
            </div>);
        }
    }
}

export default App;
