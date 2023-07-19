/* eslint-disable */
import { createSlice } from '@reduxjs/toolkit'

//This is a 'counter' instance where createSlice function is used other 'slices' can be created such as exampleSlice
export const ratingSlice = createSlice({
  name: 'rating',
  initialState: {
    data: 0
  },
  reducers: {
    setRating: (state, action) => {
      state.data = action.payload
    }
  }
})

// Action creators are generated for each case reducer function
export const { setRating } = ratingSlice.actions

export default ratingSlice.reducer