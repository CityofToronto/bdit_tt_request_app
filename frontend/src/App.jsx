import Layout from './components/Layout/Layout.jsx';
import Mapbox from "./components/Map/Mapbox";
import './App.css';

export default function App(){
    return (
        <div>
            <Mapbox/>
            <Layout/>
        </div>
    )
}