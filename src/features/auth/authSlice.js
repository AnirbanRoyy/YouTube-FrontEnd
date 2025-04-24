import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    userDetails: {},
    isLoggedIn: false,
};

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setUserDetails: (state, action) => {
            state.userDetails = action.payload;
        },
        setIsLoggedIn: (state, action) => {
            state.isLoggedIn = action.payload;
        },
    },
});

export const { setUserDetails, setIsLoggedIn } = authSlice.actions;

export default authSlice.reducer;
