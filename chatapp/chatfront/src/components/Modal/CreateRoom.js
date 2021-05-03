import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import { validateRoomName, validteFileType } from "../../utils/formValidation";
import { useFormik } from "formik";
import { useStateValue } from "../../StateProvider";
import { isRoomExists, uploadImages } from "../../utils/apiClient";
import "./CreateRoom.css";

const ROOM_EXISTS = "The rome name is taken please chose another";

function rand() {
  return Math.round(Math.random() * 20) - 10;
}

function getModalStyle() {
  const top = 50 + rand();
  const left = 50 + rand();

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const useStyles = makeStyles((theme) => ({
  paper: {
    position: "absolute",
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

const CreateRoom = ({ setRoomName, createNewRoom, setOpenModal }) => {
  const classes = useStyles();
  const [modalStyle] = useState(getModalStyle);
  const [previewSource64Encoded, setPreviewSource64Encoded] = useState("");
  const [error, setError] = useState("");

  const [state, dispatch] = useStateValue();

  // Convert the image to 64encoded
  const previweFile = (file) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setPreviewSource64Encoded(reader.result);
    };
  };

  // Set preview source of the image.
  const setPreviewSource = (previewSource) => {
    dispatch({
      type: "ADD_PREVIEW_SOURCE",
      previewSource: previewSource,
    });
  };

  const formik = useFormik({
    initialValues: {
      roomName: "",
      file: "",
    },
    validate: (values) => {
      // returns error object, if empty then there are not errors and the form is valid

      const newFile = {
        fileName: values.file.name,
        type: values.file.type,
        size: `${values.file.size}`,
      };

      return {
        ...validateRoomName(values.roomName),
        ...validteFileType(newFile),
      };
    },
    onSubmit: async (values) => {
      const roomExists = await isRoomExists(values.roomName);
      // If room exists show error else create new room
      if (roomExists) {
        setError(ROOM_EXISTS);
      } else {
        //upload image to the server
        if (previewSource64Encoded) {
          const response = await uploadImages(previewSource64Encoded);
          setPreviewSource(response);
        }
        createNewRoom();
        setRoomName(values.roomName);
        setOpenModal(false);
      }
    },
  });

  return (
    <div style={modalStyle} className={classes.paper}>
      <form onSubmit={formik.handleSubmit}>
        <TextField
          error={formik.errors.roomName}
          helperText={formik.errors.roomName}
          fullWidth={true}
          required
          label="RoomName"
          name="roomName"
          placeholder="Enter room name"
          onChange={formik.handleChange}
          value={formik.values.roomName}
        />

        <input
          className="choose"
          fullWidth={true}
          required
          id="file"
          name="file"
          label="file"
          type="file"
          onChange={(event) => {
            formik.setFieldValue("file", event.target.files[0]);
            previweFile(event.target.files[0]);
          }}
        />
        <TextField
          error={formik.errors.file}
          helperText={formik.errors.file}
          fullWidth={true}
          disabled
          required
        />

        {previewSource64Encoded && (
          <img
            src={previewSource64Encoded}
            alt="chosen"
            style={{ height: "300px", width: "300px" }}
          />
        )}

        <Button
          type="submit"
          color="primary"
          fullWidth={true}
          variant="contained"
          disabled={false}
        >
          Create room
        </Button>
      </form>

      {error && (
        <p style={{ color: "red", display: "flex", justifyContent: "center" }}>
          {error}
        </p>
      )}
    </div>
  );
};

export default CreateRoom;
