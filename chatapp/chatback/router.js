const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

const rooms = require("./controllers/rooms");
const valiadte = require("./controllers/validation");
const auth = require("./controllers/auth");
const token = require("./controllers/token");

require("dotenv").config();

router.get("/", (req, res) => {
  res.send("server is up and runing");
});

router.delete("/logout", (req, res) => {
  token.handleDeleteToken(req, res);
});

router.post("/auth/refresh", (req, res) => {
  token.handleGenerateNewTokens(req, res);
});

router.post("/signin", valiadte.validateUserSignIn, (req, res) => {
  auth.handleSignin(req, res, bcrypt);
});

router.post("/googlelogin", (req, res) => auth.handleGoogleSignIn(req, res));

// register path + token
router.post("/register", valiadte.validateUserRegister, (req, res) => {
  auth.handleRegister(req, res, bcrypt);
});
//get rooms path
router.get("/chat/:room", token.tokenValidation, (req, res) => {
  rooms.handleGetRoomMessages(req, res);
});

router.get("/isroomexist/:room", token.tokenValidation, (req, res) => {
  rooms.handleIsRoomExist(req, res);
});

module.exports = router;
