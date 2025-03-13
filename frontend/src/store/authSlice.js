import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  status: false,
  userData: null,
  mode: "light",
  onlineUsers: {},
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login(state, action) {
      state.status = true;
      state.userData = action.payload;
    },
    logout(state) {
      state.status = false;
      state.userData = null;
    },
    updateUserData(state, action) {
      state.userData = action.payload;
    },
    toggleMode(state) {
      state.mode = state.mode === "light" ? "dark" : "light";
    },
    updateOnlineUsers(state, action) {
      state.onlineUsers = action.payload; 
    },
    removeOnlineUser(state, action) {
        // console.log(action.payload);
        delete state.onlineUsers[action.payload];
    }
  },
});

export const { login, logout, updateUserData, toggleMode, updateOnlineUsers ,removeOnlineUser} =
  authSlice.actions;

export default authSlice.reducer;
