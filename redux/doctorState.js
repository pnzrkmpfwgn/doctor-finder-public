/* eslint-disable */
import { createSlice } from '@reduxjs/toolkit'

// const initialState = {
//   loading: false,
// }

export const doctorDataSlice = createSlice({
  name: 'doctorData',
  initialState:{
    data:{}
  },
  reducers: {
    setDoctorData:(state,action)=>{
        state.data = action.payload
    }
  },
})

// Action creators are generated for each case reducer function
export const { setDoctorData } = doctorDataSlice.actions

export default doctorDataSlice.reducer