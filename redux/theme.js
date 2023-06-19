/* eslint-disable */
import { createSlice } from '@reduxjs/toolkit';

//This is a 'counter' instance where createSlice function is used other 'slices' can be created such as exampleSlice
export const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    language:"en"
  },
  reducers: {
    setLanguage: (state,action) => {
        state.language = action.payload
    }
  }
})

// Action creators are generated for each case reducer function
export const { setLanguage } = themeSlice.actions

export default themeSlice.reducer