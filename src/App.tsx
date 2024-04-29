import React from "react";
import './App.css';

import HeaderComponent from "./components/HeaderComponent";
import BodyComponent from "./components/BodyComponent";

class App extends React.Component {
   constructor(props:any) {
     super(props);
     this.state={}
   }

   state = {}

   componentDidMount() {

       if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i
           .test(navigator.userAgent)) {


       } else {
       }

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
