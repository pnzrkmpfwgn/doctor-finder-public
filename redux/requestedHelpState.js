/* eslint-disable */
import { createSlice } from '@reduxjs/toolkit'

// const initialState = {
//   loading: false,
// }

export const requestedHelpDataSlice = createSlice({
  name: 'requestedHelpData',
  initialState:{
    data:{},
  },
  reducers: {
    setRequestedHelpData:(state,action)=>{
        state.data = action.payload
    }
  },
})

// Action creators are generated for each case reducer function
export const { setRequestedHelpData } = requestedHelpDataSlice.actions

export default requestedHelpDataSlice.reducer