// Adding user to the room if the room is not exists create new room with image
const addUserToRoom = async (client, name, room, imageUrl = null) => {
  name = name.trim().toLowerCase();

  const database = client.db("rooms");
  try {
    if (imageUrl) {
      const chats = await database.collection(room).insertOne({
        names: [{ name: name }],
        room_name: room,
        image_url: imageUrl,
      });
    } else {
      const query = { room_name: room };
      const updateDocument = {
        $push: { names: { name: name } },
      };
      const result = await database
        .collection(room)
        .updateOne(query, updateDocument);
    }

    const roomImage = await database.collection(room).distinct("image_url");
    const user = { name, room, imageUrl: roomImage[0] };
    return user;
  } catch (error) {
    console.log(error);
  }
};

// Add new message to db ofchat messages
const addNewChatMessage = (name, room, message, timestamp, client) => {
  doc = { message, name, timestamp };

  const database = client.db("chats");
  const chats = database.collection(room);
  const result = chats.insertOne(doc);
};

// Check if user exists in the server
const isUserExsists = async (db, email) => {
  const database = db.db("users");

  const user = await database.collection("users").findOne({ email, email });
  return user;
};

// Remove user from the room
const removeUserFromRoom = async (client, name, room) => {
  try {
    name = name.trim().toLowerCase();
    const database = client.db("rooms");
    const chats = await database
      .collection(room)
      .updateOne({}, { $pull: { names: { name: name } } }, { multi: true });

    return chats.result.ok;
  } catch (error) {
    console.log(error);
  }
};

// Function for socket when some one join the  display the new data by database.
const getUsersInRoom = async (client, room) => {
  const database = client.db("rooms");
  const users = await database.collection(room).distinct("names");
  return users;
};

// Get list of rooms from db.
const getRoomsList = async (client) => {
  const database = client.db("rooms");

  const rooms = await database.listCollections().toArray();
  const roomNames = rooms.map((room) => room.name);
  let roomsDetails = [];

  for (let room of roomNames) {
    let roomDetail = await database.collection(room).findOne({});
    roomsDetails.push({
      activeUsers: roomDetail.names,
      roomName: roomDetail.room_name,
      imageUrl: roomDetail.image_url,
    });
  }
  return roomsDetails;
};

module.exports = {
  addUserToRoom,
  removeUserFromRoom,
  getUsersInRoom,
  addNewChatMessage,
  getRoomsList,
  isUserExsists,
};
