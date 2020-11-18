import React from 'react';
import Layout from './components/Layout/Layout.jsx'
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
        <Layout/>
      </div>
          
      );
  }
}

export default App;
