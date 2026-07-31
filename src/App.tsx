import React from "react";
import './App.css';

import HeaderComponent from "./components/HeaderComponent";
import BodyComponent from "./components/BodyComponent";
import { initLocaleFromDevice } from "./i18n";

class App extends React.Component {
   constructor(props:any) {
     super(props);
     initLocaleFromDevice()
     this.state={}
   }

   state = {}

   componentDidMount() {
       initLocaleFromDevice()
   }


  render() {
       const {} = this.state
      return (
        <div className="App background">
            <HeaderComponent/>
            <BodyComponent />
        </div>
        );
  }
}

export default App;
