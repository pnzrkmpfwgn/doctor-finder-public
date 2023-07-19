/* eslint-disable */
import { createSlice } from '@reduxjs/toolkit'

// const initialState = {
//   loading: false,
// }

export const locationDataSlice = createSlice({
  name: 'locationData',
  initialState:{
    data:{}
  },
  reducers: {
    setLocationData:(state,action)=>{
        state.data = action.payload
    }
  },
})

// Action creators are generated for each case reducer function
export const { setLocationData } = locationDataSlice.actions

export default locationDataSlice.reducer