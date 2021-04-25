import axios from "axios";

import LocalStorageService from "./LocalStorageService";

// LocalstorageService
const localStorageService = LocalStorageService.getService();

// window.location='/login'

// Add a request interceptor
// Block the request for register and login
axios.interceptors.request.use(
  (config) => {
    const token = localStorageService.getAccessToken();
    if (token) {
      config.headers["Authorization"] = "Bearer " + token;
      console.log("ALMOG REQUEST", token);
    }

    // config.headers['Content-Type'] = 'application/json';
    return config;
  },
  (error) => {
    Promise.reject(error);
  }
);

//Add a response interceptor

axios.interceptors.response.use(
  (response) => {
    return response;
  },
  function (error) {
    const originalRequest = error.config;
    console.log("CHECK SWITCH ROOMS", originalRequest);
    if (
      error.response.status === 403 &&
      originalRequest.url === "http://localhost:3001/auth/refresh"
    ) {
      // router.push("/login");
      window.location = "/login";
      console.log("RESPONSE FOR LOGIN");
      return Promise.reject(error);
    }

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorageService.getRefreshToken();
      console.log("REFRESH TOKEN TEST", refreshToken);
      return axios
        .post("http://localhost:3001/auth/refresh", {
          refreshToken: refreshToken,
        })
        .then((res) => {
          console.log("RESPONSE TO OUR REFRESH TOKEN", res);
          if (res.status === 201) {
            console.log("RESPONSE 201", res.data);
            localStorageService.setToken(res.data);
            axios.defaults.headers.common["Authorization"] =
              "Bearer " + localStorageService.getAccessToken();
            return axios(originalRequest);
          }
        });
    }
    return Promise.reject(error);
  }
);

export async function authenticate({ email, password }) {
  const response = await axios.post("http://localhost:3001/signin", {
    email: email,
    password: password,
  });
  return response.data;
}

export async function register({ username, email, password }) {
  const response = await axios.post("http://localhost:3001/register", {
    username: username,
    email: email,
    password: password,
  });
  return response.data;
}
export async function isRoomExists(roomName) {
  const response = await axios.get(
    `http://localhost:3001/isroomexist/${roomName}`
  );
  return response.data;
}

export async function authenticateGoogle(response) {
  const googleData = await axios.post("http://localhost:3001/googlelogin", {
    tokenId: response.tokenId,
  });

  return googleData.data;
}
