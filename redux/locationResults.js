/* eslint-disable */
import { createSlice } from '@reduxjs/toolkit'

// const initialState = {
//   loading: false,
// }

export const locationResultsSlice = createSlice({
  name: 'results',
  initialState:{
    data:[]
  },
  reducers: {
    setLocationsData:(state,action)=>{
        state.data.push(action.payload)
    }
  },
})

// Action creators are generated for each case reducer function
export const { setLocationsData } = locationResultsSlice.actions

export default locationResultsSlice.reducer