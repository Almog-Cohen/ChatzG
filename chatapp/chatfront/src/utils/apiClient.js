import axios from "axios";
import LocalStorageService from "./LocalStorageService";

// LocalstorageService
const localStorageService = LocalStorageService.getService();

const LOG_OUT_URL = "http://localhost:3001/logout";
// Add a request interceptor
// Block the request for register and login
axios.interceptors.request.use(
  (config) => {
    if (config.url === LOG_OUT_URL) {
      const token = localStorageService.getAccessToken();

      if (token) {
        config.headers["Authorization"] = "Bearer " + token;
      }
    }
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
    if (
      error.response.status === 401 &&
      originalRequest.url === "http://localhost:3001/auth/refresh"
    ) {
      localStorageService.clearToken();
      window.location = "/login";
      return Promise.reject(error);
    }

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorageService.getRefreshToken();
      return axios
        .post("http://localhost:3001/auth/refresh", {
          refreshToken: refreshToken,
        })
        .then((res) => {
          if (res.status === 201) {
            localStorageService.setToken(res.data);
            const accessToken = localStorageService.getAccessToken();
            axios.defaults.headers.common["Authorization"] =
              "Bearer " + accessToken;
            originalRequest.headers.Authorization = "Bearer " + accessToken;
            return axios(originalRequest);
          }
        });
    }
    return Promise.reject(error);
  }
);

// Login with email and password
export async function authenticate({ email, password }) {
  const response = await axios.post("http://localhost:3001/signin", {
    email: email,
    password: password,
  });
  return response.data;
}

// Send client data to the server
export async function register({ username, email, password }) {
  const response = await axios.post("http://localhost:3001/register", {
    username: username,
    email: email,
    password: password,
  });
  return response.data;
}

// Check if the room is alredy exist
export async function isRoomExists(roomName) {
  const response = await axios.get(
    `http://localhost:3001/isroomexist/${roomName}`
  );
  return response.data;
}

// Get messages of the specific room
export async function getRoomMessages(roomName) {
  const response = await axios.get(` http://localhost:3001/chat/${roomName}`);
  return response.data;
}

// Login with google account
export async function authenticateGoogle(response) {
  const googleData = await axios.post("http://localhost:3001/googlelogin", {
    tokenId: response.tokenId,
  });

  return googleData.data;
}

// Upload image to the server
export async function uploadImages(base64EncodedImage) {
  const response = await axios.post("http://localhost:3001/api/upload", {
    base64EncodedImage: base64EncodedImage,
  });
  return response.data;
}
// Get username from the database
export async function getUserName() {
  const response = await axios.post("http://localhost:3001/getuser/name");
  return response;
}

export async function deleteRefreshToken(refreshToken) {
  console.log(refreshToken);
  const response = await axios.delete("http://localhost:3001/logout", {
    data: { refreshToken: refreshToken },
  });

  return response.data;
}
