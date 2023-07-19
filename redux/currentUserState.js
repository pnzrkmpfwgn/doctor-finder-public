/* eslint-disable */
import { createSlice } from '@reduxjs/toolkit'

// const initialState = {
//   loading: false,
// }

export const userDataSlice = createSlice({
  name: 'userData',
  initialState:{
    data:{}
  },
  reducers: {
    setUserData:(state,action)=>{
        state.data = action.payload
    }
  },
})

// Action creators are generated for each case reducer function
export const { setUserData } = userDataSlice.actions

export default userDataSlice.reducer