import React from 'react';
import Layout from './components/Layout/Layout.jsx';
import Mapbox from "./components/Map/Mapbox";
import './App.css';
import {getEndDate} from "./actions/actions";

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            maxDate: null
        };
    }

    componentDidMount() {
        getEndDate(this);
    }

    render() {
        return (
            <div>
                <Mapbox/>
                <Layout
                    state={this.state}
                />
            </div>

        );
    }
}

export default App;
