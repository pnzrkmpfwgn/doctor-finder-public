/* eslint-disable */
import { createSlice } from '@reduxjs/toolkit'

// const initialState = {
//   loading: false,
// }

export const patientDataSlice = createSlice({
  name: 'patientData',
  initialState:{
    data:{}
  },
  reducers: {
    setPatientData:(state,action)=>{
        state.data = action.payload
    }
  },
})

// Action creators are generated for each case reducer function
export const { setPatientData } = patientDataSlice.actions

export default patientDataSlice.reducer