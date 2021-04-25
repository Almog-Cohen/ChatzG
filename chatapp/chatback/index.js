const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const {
  addUserToRoom,
  removeUserFromRoom,
  getUsersInRoom,
  addNewChatMessage,
  getRoomsList,
} = require("./users");

let client;

const PORT = process.env.PORT || 3001;

const router = require("./router");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const CONNECTION_URL =
  "mongodb+srv://mogz:CqHeDgPInnRDzcjA@cluster0.wh701.mongodb.net/realtimechat?retryWrites=true&w=majority";

MongoClient.connect(
  CONNECTION_URL,
  { useUnifiedTopology: true },
  function (err, db) {
    app.locals.db = db;
    client = db;
  }
);

// Connecting the client with the server
io.on("connection", (socket) => {
  console.log("We have new connection!!!   ", socket.id);

  // Add new user to DB (array) and connecting him to the room
  socket.on("join", async ({ name, room }, callback) => {
    const user = await addUserToRoom(client, name, room);
    // Sending message to the user
    socket.emit("message", {
      _id: "a",
      message: `${user.name}, Welcome to the room ${user.room}`,
      name: "Chat system",
      timestamp: new Date().getTime(),
    });

    const users = await getUsersInRoom(client, room);
    // Sending message to everyone in the room besides the admin/use
    socket.broadcast.to(user.room).emit("message", {
      _id: "a",
      message: `${user.name}, has joined`,
      name: "Chat system",
      timestamp: new Date().getTime(),
    });
    socket.join(user.room);
    io.to(user.room).emit("roomData", {
      users,
    });

    callback();
  });

  socket.on("rooms", () => {
    setTimeout(async () => {
      const roomsList = await getRoomsList(client);
      // Sending message to the user
      io.emit("rooms", roomsList);
    }, 500);
  });

  //   Getting the message from the frontend
  socket.on("sendMessage", ({ name, room, message, timestamp }, callback) => {
    // the socketid changes everytime the user switch between the rooms
    // const user = getUser(user, room);
    addNewChatMessage(name, room, message, timestamp, client);
    // name, room, message, timestamp, client;
    // io.to(user.room).emit("message", { user: user.name, text: message });
    io.to(room).emit("message", { message, name, timestamp });

    // io.to(user.room).emit("roomData", {
    //   room: user.room,
    //   users: getUsersInRoom(user.room),
    // });

    callback();
  });

  // Disconecting and removing the user from the connection
  socket.on("disconnected", async ({ name, room }) => {
    const user = await removeUserFromRoom(client, name, room);
    const users = await getUsersInRoom(client, room);

    if (user && users) {
      io.to(room).emit("message", {
        name: "Chat system",
        message: `${name} has left the channel !`,
        timestamp: new Date().getTime(),
      });
      io.to(room).emit("roomData", {
        users,
      });
    }
  });
});
app.use(express.json());
app.use(cors());
app.use(router);

server.listen(PORT, () => console.log(`SERVER IS RUNNING ON ${PORT}`));
