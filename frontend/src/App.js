import React from 'react';
import MapBox from './components/Map/Mapbox'
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }
  render(){
    return (
          <MapBox/>
      );
  }
}

export default App;
