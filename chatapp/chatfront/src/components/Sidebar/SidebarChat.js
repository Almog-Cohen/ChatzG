import React from "react";
import { Avatar } from "@material-ui/core";
import "./SidebarChat.css";
import { Image } from "cloudinary-react";

const SidebarChat = ({ roomName, roomImage }) => {
  return (
    <div className="side-bar-chat">
      <Image
        key={roomName}
        cloudName="dndmacjgo"
        publicId={roomImage}
        width="50"
        height="50"
        crop="scale"
      />

      <div className="side-bar-chatInfo">
        <h1>{roomName}</h1>
        <p>Welcome to room {roomName}</p>
      </div>
    </div>
  );
};

export default SidebarChat;
