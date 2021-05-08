import React, { useEffect, useState } from "react";
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
import LocalStorageService from "./utils/LocalStorageService";
import { getUserName } from "./utils/apiClient";

const localStorageService = LocalStorageService.getService();

function App() {
  const [roomName, setRoomName] = useState("");
  const [userName, setUserName] = useState("");

  // Check if the user has valid token to skip the login page
  // If user don't have valid token he need to login
  useEffect(() => {
    const accessToken = localStorageService.getAccessToken();
    if (accessToken) {
      getUserName()
        .then((response) => {
          if (response.status === 200) {
            setUserName(response.data);
          }
        })
        .catch((error) => console.log(error));
    }
  }, []);

  return (
    <div className="App">
      <Router>
        <Switch>
          <Route path="/login">
            {userName ? (
              <Redirect to="/chat" />
            ) : (
              <SignIn setUserName={setUserName} />
            )}
          </Route>
          <Route path="/register">
            <Register setUserName={setUserName} />
          </Route>
          <Route path="/chat">
            {userName ? (
              <div className="app-body">
                <Sidebar setRoomName={setRoomName} userName={userName} />
                {roomName && <Chat roomName={roomName} userName={userName} />}
              </div>
            ) : (
              <Redirect to="/login" />
            )}
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
