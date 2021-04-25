import React from "react";
import { authenticateGoogle } from "../../utils/apiClient";
import GoogleLogin from "react-google-login";
import GoogleButton from "react-google-button";
import { useHistory } from "react-router-dom";
import LocalStorageService from "../../utils/LocalStorageService";
import "./SignIn.css";

const localStorageService = LocalStorageService.getService();

const GoogleSignIn = ({ setError, setUserName }) => {
  const history = useHistory();

  const responseGoogle = async (response) => {
    const googleResponse = await authenticateGoogle(response);
    console.log(googleResponse);
    if (typeof googleResponse.username != "undefined")
      setError("Error to signin with google");
    // add token
    localStorageService.setToken(googleResponse);
    setUserName(googleResponse.username);
    // get name or token
    history.push("/chat");
  };

  return (
    <div className="card-input">
      <GoogleLogin
        clientId="861782992167-16tj8a8hr1388c9qf7cp6vmupo6hh8e4.apps.googleusercontent.com"
        render={(renderProps) => (
          <GoogleButton
            style={{
              width: "100%",
            }}
            onClick={renderProps.onClick}
            disabled={renderProps.disabled}
          >
            Sign in with Google
          </GoogleButton>
        )}
        buttonText="Login"
        onSuccess={responseGoogle}
        onFailure={responseGoogle}
        cookiePolicy={"single_host_origin"}
      />
    </div>
  );
};

export default GoogleSignIn;
