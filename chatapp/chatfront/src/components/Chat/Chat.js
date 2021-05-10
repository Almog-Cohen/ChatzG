import React, { useEffect, useState } from "react";
import InsertEmoticon from "@material-ui/icons/InsertEmoticon";
import MicIcon from "@material-ui/icons/Mic";
import "./Chat.css";
import io from "socket.io-client";
import IconButton from "@material-ui/core/IconButton";
import SendIcon from "@material-ui/icons/Send";
import { Image } from "cloudinary-react";
import { useStateValue } from "../../StateProvider";
import { getRoomMessages } from "../../utils/apiClient";

const END_POINT = "localhost:3001";
let socket;
const connectionOptions = {
  "force new connection": true,
  reconnectionAttempts: "Infinity",
  timeout: 10000,
  transports: ["websocket"],
};

const Chat = ({ roomName, userName }) => {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [roomImage, setRoomImage] = useState("");

  const [{ messages, previewSource }, dispatch] = useStateValue();

  // Clear the image url

  const clearPreviewSource = () => {
    dispatch({
      type: "CLEAR_PREVIEW_SOURCE",
      previewSource: "",
    });
  };

  // Add message to the colletction of the messages.
  const addToMessages = (message) => {
    dispatch({
      type: "ADD_TO_MESSAGES",
      message: message,
    });
  };

  // Clear all chat messages.
  const clearMessages = () => {
    dispatch({
      type: "CLEAR_MESSAGES",
      message: [],
    });
  };
  // Fetch all messages from db.
  const addFetchMessages = (message) => {
    dispatch({
      type: "ADD_FETCH_MESSAGES",
      message: message,
    });
  };

  // Load all messages and connect the sockets.
  useEffect(() => {
    const setRoomMessages = async () => {
      try {
        const roomMessages = await getRoomMessages(roomName);
        roomMessages.length > 0 && addFetchMessages(roomMessages);
        socket = io(END_POINT, connectionOptions);
        socket.emit(
          "join",
          { name: userName, room: roomName, imageUrl: previewSource },
          (error) => {
            if (error) {
              alert(error);
            }
          }
        );
        // socket to get room image from the server.
        socket.on("join", (imageUrl) => {
          setRoomImage(imageUrl);
        });
        // socket to get messages from the server.
        socket.on("message", (message) => {
          addToMessages(message);
        });
        // socket to get users data for the specific room
        socket.on("roomData", ({ users }) => {
          setUsers(users);
        });
      } catch (error) {
        console.log(error);
      }
    };

    setRoomMessages();

    return () => {
      socket.emit("disconnected", { name: userName, room: roomName });
      socket.disconnect();

      if (previewSource) {
        clearPreviewSource();
      }
      clearMessages();
    };
  }, [roomName]);

  useEffect(() => {
    // If user refresh the page, close browser remove him from the room and close his socket to the room
    window.onbeforeunload = (e) => {
      socket.emit("disconnected", { name: userName, room: roomName });
      socket.disconnect();
    };
  }, []);

  // Send message with socket over the backend.
  const sendMessage = (event) => {
    event.preventDefault();
    if (message) {
      socket.emit(
        "sendMessage",
        {
          name: userName,
          room: roomName,
          message,
          timestamp: new Date().getTime(),
        },
        () => setMessage("")
      );
    }
  };

  // Print users names
  const printUsersNamesArray = (users) => {
    return users.map((user, i) =>
      i !== users.length - 1 ? ` ${user.name},` : ` ${user.name}`
    );
  };

  // Formating the messages date and time
  const dateFormatter = (timeStamp) => {
    let date = new Date(timeStamp);
    let dateString =
      date.getDate() +
      "/" +
      (date.getMonth() + 1) +
      "/" +
      date.getFullYear() +
      " " +
      date.getHours() +
      ":" +
      date.getMinutes() +
      ":" +
      date.getSeconds();
    return dateString;
  };

  // Set the layout to the current user by name
  const checkUserLayout = (userName, messageName) => {
    return userName === messageName;
  };

  const submitHandler = (e) => {
    e.preventDefault();
  };

  return (
    <div className="chat">
      <div className="chat-header">
        {roomImage && (
          <Image
            cloudName="dndmacjgo"
            publicId={roomImage}
            width="50"
            height="50"
            crop="scale"
          />
        )}

        <div className="chat-header-info">
          <h3>{roomName}</h3>
          {users && printUsersNamesArray(users)}
        </div>
      </div>

      <div className="chat-body">
        {messages &&
          messages.map((message, i) => (
            <p
              key={i}
              className={`chat-message ${
                checkUserLayout(userName, message.name) && "chat-receiver"
              }`}
            >
              <span className="chat-name">{message.name}</span>
              {message.message}
              <span className="chat-timeStamp">
                {dateFormatter(message.timestamp)}
              </span>
            </p>
          ))}
      </div>

      <div className="chat-footer">
        <InsertEmoticon />
        <form onSubmit={submitHandler}>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message"
            type="text"
          />
        </form>
        {message && (
          <IconButton onClick={sendMessage}>
            <SendIcon color="primary" fontSize="small" />
          </IconButton>
        )}
        <MicIcon />
      </div>
    </div>
  );
};

export default Chat;
