const {
  addUserToRoom,
  removeUserFromRoom,
  getUsersInRoom,
  addNewChatMessage,
  getRoomsList,
} = require("./users");

module.exports = socketPath = (io, socket, client) => {
  // Add new user to db and connecting him to the room.
  socket.on("join", async ({ name, room, imageUrl = null }, callback) => {
    try {
      const user = await addUserToRoom(client, name, room, imageUrl);
      // Sending message to the user that has just joined.
      // Add image url
      if (typeof user.imageUrl != "undefined")
        socket.emit("join", user.imageUrl);

      socket.emit("message", {
        _id: "a",
        message: `${user.name}, Welcome to the room ${user.room}`,
        name: "Chat system",
        timestamp: new Date().getTime(),
      });

      const users = await getUsersInRoom(client, room);
      // Sending message to everyone in the room besides the user that is just join.
      socket.broadcast.to(user.room).emit("message", {
        _id: "a",
        message: `${user.name}, has joined`,
        name: "Chat system",
        timestamp: new Date().getTime(),
      });
      // Add the the user socket to the room sockets.
      socket.join(user.room);
      io.to(user.room).emit("roomData", {
        users,
      });
      callback();
    } catch (error) {
      console.log(error);
    }
  });

  // Sending the list of avilable rooms to the user.
  socket.on("rooms", () => {
    try {
      setTimeout(async () => {
        const roomsList = await getRoomsList(client);
        io.emit("rooms", roomsList);
      }, 1500);
    } catch (error) {
      console.log(error);
    }
  });

  // Getting the message from the client add it to db and send it to the room
  socket.on("sendMessage", ({ name, room, message, timestamp }, callback) => {
    try {
      addNewChatMessage(name, room, message, timestamp, client);
      io.to(room).emit("message", { message, name, timestamp });
      callback();
    } catch (error) {
      console.log(error);
    }
  });

  // Disconecting and removing the user from the db
  socket.on("disconnected", async ({ name, room }) => {
    try {
      const user = await removeUserFromRoom(client, name, room);
      const users = await getUsersInRoom(client, room);
      // Send the room a message about which user left the room.
      if (user && users) {
        io.to(room).emit("message", {
          name: "Chat system",
          message: `${name} has left the channel !`,
          timestamp: new Date().getTime(),
        });
        // Send the new users list of the room
        io.to(room).emit("roomData", {
          users,
        });
      }
    } catch (error) {
      console.log(error);
    }
  });
};
