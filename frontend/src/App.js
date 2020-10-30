import React from 'react';
import Layout from './components/Layout/Layout.jsx'
import MapBox from './components/Map/Mapbox'
import './App.css'
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }
  render(){
    return (
      <div>
        <MapBox/>
        <Layout/>
      </div>
          
      );
  }
}

export default App;
