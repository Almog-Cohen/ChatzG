require("dotenv").config();
const redisClient = require("./auth").redisClient;
const jwt = require("jsonwebtoken");

const {
  generateAccessToken,
  generateRefreshToken,
  setToken,
} = require("./auth");

// Delete the refresh token in redis when logout
const handleDeleteToken = (req, res) => {
  deleteRefreshToken(req.body.refreshToken);
  return res.json("logout");
};

// Check for valid refresh token
// If there is no token return 401
// If token not exists return 403
// Otherwise return new resfresh and access tokens
const handleGenerateNewTokens = async (req, res) => {
  const { refreshToken } = req.body;
  try {
    if (refreshToken == null) return res.sendStatus(401);

    const refreshTokenExists = await checkRefreshTokenExists(refreshToken);
    if (!refreshTokenExists) return res.sendStatus(403);
    deleteRefreshToken(refreshToken);
    const newAccessToken = generateAccessToken(refreshTokenExists);
    const newRefreshToken = generateRefreshToken(refreshTokenExists);
    setToken(newRefreshToken, refreshTokenExists);
    return res.status(201).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.log(error);
    res.status(500);
  }
};

// Cheking for token
const tokenValidation = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  // Get token or undfiend if its not exists
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, email) => {
    if (err) return res.sendStatus(401);
    req.email = email;
    next();
  });
};

// Check if the refresh token exists in redis db .
// If token exists return the email
// If not return null
const checkRefreshTokenExists = (refreshToken) => {
  return new Promise((resolve, reject) => {
    redisClient.get(refreshToken, (error, email) => {
      if (error) {
        reject(error);
      }

      resolve(email);
    });
  });
};
// Delete the refresh token from redis db
const deleteRefreshToken = (refreshToken) => {
  redisClient.del(refreshToken, (err, response) => {
    response
      ? console.log("Deleted Successfully!")
      : console.log("Cannot delete");
  });
};

module.exports = {
  handleDeleteToken: handleDeleteToken,
  handleGenerateNewTokens: handleGenerateNewTokens,
  tokenValidation: tokenValidation,
};
