const handleGetRoomMessages = async (req, res) => {
  const db = req.app.locals.db;

  const { room } = req.params;

  const database = db.db("chats");
  const chats = await database.collection(room).find({}).toArray();
  return res.json(chats);
}; 

const handleIsRoomExist = async (req, res) => {
  const db = req.app.locals.db;
  const { room } = req.params;

  const database = db.db("rooms");
  const rooms = await database.listCollections({ name: room }).toArray();
  return res.json(rooms.length > 0);
};

module.exports = {
  handleGetRoomMessages: handleGetRoomMessages,
  handleIsRoomExist: handleIsRoomExist,
};
