const handleGetRoomMessages = async (req, res) => {
  const db = req.app.locals.db;
  const { room } = req.params;
  try {
    const database = db.db("chats");
    const chats = await database.collection(room).find({}).toArray();
    return res.json(chats);
  } catch (error) {
    console.log(error);
    res.status(500);
  }
};

const handleIsRoomExist = async (req, res) => {
  const db = req.app.locals.db;
  const { room } = req.params;
  try {
    const database = db.db("rooms");
    const rooms = await database.listCollections({ name: room }).toArray();
    return res.json(rooms.length > 0);
  } catch (error) {
    console.log(error);
    res.status(500);
  }
};

module.exports = {
  handleGetRoomMessages: handleGetRoomMessages,
  handleIsRoomExist: handleIsRoomExist,
};
