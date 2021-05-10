const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const cors = require("cors");
const { MongoClient } = require("mongodb");

let client;
const PORT = process.env.PORT || 3001;
const router = require("./router");
const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ limit: "2mb", extended: true }));
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
  console.log("WE HAVE CONNECTION");
  require("./sockets/chats")(io, socket, client);
});

app.use(express.json());
app.use(cors());
app.use(router);

server.listen(PORT, () => console.log(`SERVER IS RUNNING ON ${PORT}`));
