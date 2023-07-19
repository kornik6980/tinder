import { createSlice } from "@reduxjs/toolkit";

const initialState = {
	user: null,
	token: null,
	matches: [],
};

export const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		setLogin: (state, action) => {
			state.user = action.payload.user;
			state.token = action.payload.token;
		},
		setLogout: (state) => {
			state.user = null;
			state.token = null;
			state.matches = [];
		},
		setMatches: (state, action) => {
			state.matches = action.payload.matches;
		},
		setUser: (state, action) => {
			state.user = action.payload.user;
		},
	},
});

export const { setLogin, setLogout, setMatches, setUser } = authSlice.actions;
export default authSlice.reducer;
