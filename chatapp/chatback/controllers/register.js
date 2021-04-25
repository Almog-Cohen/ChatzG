const { isUserExsists } = require("./auth");

const handleRegister = async (req, res, bcrypt) => {
  const db = req.app.locals.db;
  const database = db.db("users");
  let user = req.body;
  const userExist = await isUserExsists(db, user.email);
  if (userExist) return res.json("User exists");

  const saltRounds = 10;
  user.password = bcrypt.hashSync(user.password, saltRounds);
  const chats = await database.collection("users").insertOne(user);
  if (chats.result.ok) return res.json("success");

  return res.json(500);
};

module.exports = {
  handleRegister: handleRegister,
};
