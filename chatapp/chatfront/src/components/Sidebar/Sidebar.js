import React, { useEffect, useState } from "react";
import "./Sidebar.css";
import CreateRoom from "../Modal/CreateRoom";
import SidebarChat from "./SidebarChat";
import { Avatar } from "@material-ui/core";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import ButtonBase from "@material-ui/core/ButtonBase";
import Modal from "@material-ui/core/Modal";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import IconButton from "@material-ui/core/IconButton";
import io from "socket.io-client";
import { deleteRefreshToken } from "../../utils/apiClient";
import LocalStorageService from "../../utils/LocalStorageService";

const localStorageService = LocalStorageService.getService();

const styles = {
  width: "100%",
};

const END_POINT = "localhost:3001";
let socket;
const connectionOptions = {
  "force new connection": true,
  reconnectionAttempts: "Infinity",
  timeout: 10000,
  transports: ["websocket"],
};

const Sidebar = ({ setRoomName }) => {
  const [openModal, setOpenModal] = useState(false);
  const [roomsList, setRoomsList] = useState([]);

  // Open and close create room modal
  const setModal = (e) => {
    e.preventDefault();
    setOpenModal((state) => !state);
  };

  const logoutFromApp = async (e) => {
    e.preventDefault();
    const refreshToken = localStorageService.getRefreshToken();
    try {
      const response = await deleteRefreshToken(refreshToken);
      console.log(response);
      if (response === "logout") {
        localStorageService.clearToken();
        window.location = "/login";
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Socket send the server that new room has created
  const createNewRoom = () => {
    socket.emit("rooms");
  };

  // Connect to socket and get the list of existing rooms
  useEffect(() => {
    socket = io(END_POINT, connectionOptions);

    socket.on("rooms", (rooms) => {
      setRoomsList(rooms);
    });

    socket.emit("rooms", {});
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="side-bar">
      <div className="side-bar-header">
        <Avatar />
        <ButtonBase onClick={logoutFromApp}>
          <ExitToAppIcon color="primary" fontSize="large" />
        </ButtonBase>
        <div className="side-bar-headerRight"></div>
      </div>
      <div className="side-bar-search">
        <div className="side-bar-searchContainer">Channels</div>

        <IconButton onClick={setModal}>
          <AddCircleIcon color="primary" fontSize="large" />
        </IconButton>
      </div>

      <div className="side-bar-chats">
        {roomsList?.map((room) => (
          <ButtonBase
            key={room.roomName}
            style={styles}
            onClick={() => setRoomName(room.roomName)}
          >
            <SidebarChat roomName={room.roomName} roomImage={room.imageUrl} />
          </ButtonBase>
        ))}
      </div>

      <div>
        <Modal
          open={openModal}
          onClose={setModal}
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
        >
          <div>
            <CreateRoom
              createNewRoom={createNewRoom}
              setRoomName={setRoomName}
              setOpenModal={setOpenModal}
            />
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Sidebar;
