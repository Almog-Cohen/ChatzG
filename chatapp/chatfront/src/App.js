import React, { useState } from "react";
import Chat from "./components/Chat/Chat";
import "./App.css";
import Sidebar from "./components/Sidebar/Sidebar";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import SignIn from "./components/Signin/SignIn";
import Register from "./components/Register/Registrer";

function App() {
  const [roomName, setRoomName] = useState("");
  const [userName, setUserName] = useState("");

  return (
    <div className="App">
      <Router>
        <Switch>
          <Route path="/login">
            <SignIn setUserName={setUserName} />
          </Route>
          <Route path="/register">
            <Register setUserName={setUserName} />
          </Route>
          <Route path="/chat">
            <div className="app-body">
              <Sidebar setRoomName={setRoomName} userName={userName} />
              {roomName && <Chat roomName={roomName} userName={userName} />}
            </div>
          </Route>
          <Route path="/">
            <Redirect to="/login" />
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
