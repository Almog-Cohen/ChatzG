require("dotenv").config();
const jwt = require("jsonwebtoken");
const redis = require("redis");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.O_AUTH_CLIET);

const redisClient = redis.createClient();

redisClient.on("error", function (error) {
  console.error(error);
});

redisClient.on("connect", function (error) {
  console.log("REDIS IS CONNECTED");
});
// Function for email && password signin
// If user not exists return that the user isn't exists.
// If password matches generate refresh and access JWT  and return it to the user if not return incorrect password
const handleSignin = async (req, res, bcrypt) => {
  const { email, password } = req.body;
  const db = req.app.locals.db;
  const userExist = await checkIsUserExsists(db, email);

  if (!userExist) return res.json("User not exists");
  // Check if the user registered with google account
  if (typeof userExist.password == "undefined")
    return res.json("Please signin with your google account");

  const match = await bcrypt.compare(password, userExist.password);
  if (!match) return res.json("Incorrect password");
  const accessToken = generateAccessToken(email);
  const refreshToken = generateRefreshToken(email);
  setToken(refreshToken, email);

  return res.json({
    username: userExist.username,
    accessToken: accessToken,
    refreshToken: refreshToken,
  });
};

// Fuction that register a user to our db
// If user email alredy exists its return that the user exists alredy
// If user isnt exists its hashing the user password and restore his data in db
const handleRegister = async (req, res, bcrypt) => {
  const db = req.app.locals.db;
  let user = req.body;
  console.log("THIS IS MYT USER REGISTER", user);

  const userExist = await checkIsUserExsists(db, user.email);
  if (userExist) return res.json("User exists");

  const saltRounds = 10;
  // Hashing user password and updating
  user.password = bcrypt.hashSync(user.password, saltRounds);
  const accessToken = generateAccessToken(user.email);
  const refreshToken = generateRefreshToken(user.email);
  const userCreated = await createNewUser(db, user);
  if (!userCreated.result.ok) return res.json(500);
  setToken(refreshToken, user.email);
  return res.status(201).json({
    username: user.username,
    accessToken: accessToken,
    refreshToken: refreshToken,
  });
};
// Login with google account.
// The function check if the google account is valid and return user data(nes tokens).
// The function creates new user if his not registered to the db.
const handleGoogleSignIn = async (req, res) => {
  const { tokenId } = req.body;
  const db = req.app.locals.db;

  try {
    const response = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.O_AUTH_CLIET,
    });
    const { email_verified, name, email } = response.payload;
    if (!email_verified) res.status(403);
    // Check if the user alredy exists in the db
    const isUserExists = await checkIsUserExsists(db, email);
    const accessToken = generateAccessToken(email);
    const refreshToken = generateRefreshToken(email);

    setToken(refreshToken, email);
    // If user exists return user data
    if (isUserExists)
      return res.status(201).json({
        username: isUserExists.username,
        accessToken: accessToken,
        refreshToken: refreshToken,
      });

    // If user isnt exists create new one and return user data
    const user = { username: name, email };
    console.log("NEW USER BABY", user);
    const userCreated = await createNewUser(db, user);
    if (userCreated.result.ok)
      return res.status(201).json({
        username: user.username,
        accessToken: accessToken,
        refreshToken: refreshToken,
      });
  } catch (error) {
    console.log(error);
    res.status(500);
  }
};

// Check if the user exists in mongodb
// If yes return the email of the user if not return null
const checkIsUserExsists = async (db, email) => {
  const database = db.db("users");
  const user = await database.collection("users").findOne({ email, email });
  if (user) return user;
};

// Generate jwt refresh token
const generateRefreshToken = (email) => {
  const jwtPayload = { email };
  return jwt.sign(jwtPayload, process.env.ACCESS_TOKEN_SECRET);
};

// Generate jwt access token
const generateAccessToken = (email) => {
  const jwtPayload = { email };
  return jwt.sign(jwtPayload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "10s",
  });
};

//Create new user in the database
const createNewUser = (db, user) => {
  const database = db.db("users");
  return database.collection("users").insertOne(user);
};

// Set refresh token into redis db
const setToken = (key, value) => redisClient.set(key, value);

module.exports = {
  handleSignin: handleSignin,
  redisClient: redisClient,
  handleRegister: handleRegister,
  handleGoogleSignIn: handleGoogleSignIn,
  setToken: setToken,
  generateRefreshToken,
  generateAccessToken,
  checkIsUserExsists,
};
