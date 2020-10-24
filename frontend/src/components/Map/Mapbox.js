import React from 'react';
import ReactDOM from 'react-dom';
import mapboxgl from 'mapbox-gl';
mapboxgl.accessToken = 'pk.eyJ1Ijoia2Vuc2IiLCJhIjoiY2tnb2E5ODZvMDlwMjJzcWhyamt5dWYwbCJ9.2uVkSjgGczylf1cmXdY9xQ';

class Mapbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      lng: 5,
      lat: 34,
      zoom: 2
    };
  }
  componentDidMount() {
    const map = new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [this.state.lng, this.state.lat],
      zoom: this.state.zoom
    });
  }
  render() {
    return (
      <div>
        <div  ref={el => this.mapContainer = el} className="mapContainer"/>
      </div>
    );
  }
}
export default Mapbox;
