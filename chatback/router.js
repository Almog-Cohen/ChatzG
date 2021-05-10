const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const uploadImage = require("./controllers/uploadImage");
const rooms = require("./controllers/rooms");
const valiadte = require("./controllers/validation");
const auth = require("./controllers/auth");
const token = require("./controllers/token");

require("dotenv").config();

router.get("/", (req, res) => {
  res.send("server is up and runing");
});
// Delete the refresh token from redis
router.delete("/logout", (req, res) => {
  token.handleDeleteToken(req, res);
});
// Silent auth, generate refresh and access JWT
router.post("/auth/refresh", (req, res) => {
  token.handleGenerateNewTokens(req, res);
});
// Login with email and password
router.post("/signin", valiadte.validateUserSignIn, (req, res) => {
  auth.handleSignin(req, res, bcrypt);
});
// Login with google account
router.post("/googlelogin", (req, res) => auth.handleGoogleSignIn(req, res));
// Get username
router.post("/getuser/name", token.tokenValidation, (req, res) => {
  auth.handleGetUserName(req, res);
});
// register path + token
router.post("/register", valiadte.validateUserRegister, (req, res) => {
  auth.handleRegister(req, res, bcrypt);
});
//get rooms list data
router.get("/chat/:room", token.tokenValidation, (req, res) => {
  rooms.handleGetRoomMessages(req, res);
});
// Check if the room exists alredy
router.get("/isroomexist/:room", token.tokenValidation, (req, res) => {
  rooms.handleIsRoomExist(req, res);
});
// Upload the image to cloudinary
router.post("/api/upload", token.tokenValidation, (req, res) => {
  uploadImage.handleUploadImage(req, res);
});

module.exports = router;
