import React from "react";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-datepicker/dist/react-datepicker.css";
import "./App.css";
import Scheduler from "./Components/Scheduler";


function App() {
    return (
        <div className="App">
            <Scheduler />
        </div>
    );
}

export default App;