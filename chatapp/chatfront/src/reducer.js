export const initialState = {
  messages: [],
  roomName: "",
  previewSource: "",
};

const reducer = (state, action) => {
  switch (action.type) {
    // Add new messages to messages collection
    case "ADD_TO_MESSAGES":
      return {
        ...state,
        messages: [...state.messages, action.message],
      };
    // Fetch messages from the server
    case "ADD_FETCH_MESSAGES":
      return {
        ...state,
        messages: action.message,
      };
    // Clear all messages in the chat board
    case "CLEAR_MESSAGES":
      return {
        ...state,
        messages: [],
      };
    // Change user room
    case "CHANGE_USER_ROOM":
      return {
        ...state,
        roomName: action.roomName,
      };
    // Set preview source
    case "ADD_PREVIEW_SOURCE":
      return {
        ...state,
        previewSource: action.previewSource,
      };

    // Clear preview source
    case "CLEAR_PREVIEW_SOURCE":
      return {
        ...state,
        previewSource: "",
      };

    default:
      return state;
  }
};

export default reducer;
