import React, { useEffect, useState } from "react";
import InsertEmoticon from "@material-ui/icons/InsertEmoticon";
import MicIcon from "@material-ui/icons/Mic";
import "./Chat.css";
import io from "socket.io-client";
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

  const clearPreviewSource = (previewSource) => {
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

  const [userExsits, setUserExists] = useState(true);

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
        clearPreviewSource(previewSource);
      }
      clearMessages();
    };
  }, [roomName]);

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
          <h3>Room {roomName}</h3>
          {users && users.map((user) => ` ,${user.name}`)}
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
        {!userExsits && (
          <p>
            Welcome {userName} to room {roomName}
          </p>
        )}
      </div>

      <div className="chat-footer">
        <InsertEmoticon />
        <form>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message"
            type="text"
          />
          <button onClick={sendMessage} type="submit">
            Send message
          </button>
        </form>
        <MicIcon />
      </div>
    </div>
  );
};

export default Chat;
