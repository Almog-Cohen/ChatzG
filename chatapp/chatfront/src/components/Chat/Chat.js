import React, { useEffect, useState } from "react";
import { Avatar } from "@material-ui/core";
import InsertEmoticon from "@material-ui/icons/InsertEmoticon";
import MicIcon from "@material-ui/icons/Mic";
import "./Chat.css";
import axios from "axios";
import io from "socket.io-client";
import { useStateValue } from "../../StateProvider";

const END_POINT = "localhost:3001";
let socket;
const connectionOptions = {
  "force new connection": true,
  reconnectionAttempts: "Infinity",
  timeout: 10000,
  transports: ["websocket"],
};

const Chat = ({ roomNumber, userName }) => {
  const [users, setUsers] = useState([]);

  const [message, setMessage] = useState("");
  const [{ messages }, dispatch] = useStateValue();

  const addToMessages = (message) => {
    dispatch({
      type: "ADD_TO_MESSAGES",
      message: message,
    });
  };

  const clearMessages = () => {
    dispatch({
      type: "CLEAR_MESSAGES",
      message: [],
    });
  };

  const addFetchMessages = (message) => {
    dispatch({
      type: "ADD_FETCH_MESSAGES",
      message: message,
    });
  };

  const [userExsits, setUserExists] = useState(true);
  // Check if user exists in the room
  useEffect(() => {
    const fetchData = async () => {
      try {
        const messagesData = await axios.get(
          `http://localhost:3001/chat/${roomNumber}`
        );
        console.log("THIS IS MY MESSAGES", messagesData);
        messagesData.data.length > 0 && addFetchMessages(messagesData.data);

        socket = io(END_POINT, connectionOptions);

        socket.emit("join", { name: userName, room: roomNumber }, (error) => {
          if (error) {
            alert(error);
          }
        });

        socket.on("message", (message) => {
          addToMessages(message);
        });

        socket.on("roomData", ({ users }) => {
          setUsers(users);
        });
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();

    return () => {
      socket.emit("disconnected", { name: userName, room: roomNumber });
      socket.disconnect();

      clearMessages();
    };
  }, [roomNumber]);

  const sendMessage = (event) => {
    event.preventDefault();
    if (message) {
      socket.emit(
        "sendMessage",
        {
          name: userName,
          room: roomNumber,
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

  // Fetching data from the server
  // If user is new we send him a replay message
  // Getting as response the messages for the room chat
  // const fetchData = async () => {
  //   try {
  //     const messagesData = await axios.get(
  //       `http://localhost:3001/chat/${roomNumber}`
  //     );
  //     // messagesData.data.length > 0 && setMessages(messagesData.data);
  //     return messagesData.data.length > 0
  //       ? addFetchMessages(messagesData.data)
  //       : null;
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  const checkUserLayout = (userName, messageName) => {
    if (userName === messageName) {
      return true;
    } else {
      return false;
    }
  };

  const checkUserExists = async () => {
    const responseUserExists = await axios.post(
      `http://localhost:3001/playerExists/${roomNumber}`,
      {
        userName: userName,
      }
    );

    if (responseUserExists.data !== "userExists") {
      // Add to message
      setUserExists(false);
    } else {
      setUserExists(true);
    }
  };

  return (
    <div className="chat">
      <div className="chat-header">
        <Avatar />

        <div className="chat-header-info">
          <h3>Room {roomNumber}</h3>
          {users && users.map((user) => ` ,${user}`)}
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
              {message.name !== "Chat system" && <Avatar />}
              <span className="chat-name">{message.name}</span>
              {message.message}
              <span className="chat-timeStamp">
                {dateFormatter(message.timestamp)}
              </span>
            </p>
          ))}
        {!userExsits && (
          <p>
            Welcome {userName} to room {roomNumber}
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
