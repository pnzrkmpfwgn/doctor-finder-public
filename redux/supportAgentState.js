/* eslint-disable */
import { createSlice } from '@reduxjs/toolkit'

// const initialState = {
//   loading: false,
// }

export const supportAgentDataSlice = createSlice({
  name: 'supportAgentData',
  initialState:{
    data:{},
    id:"",
    chatRoomId:""
  },
  reducers: {
    setSupportAgentData:(state,action)=>{
        state.data = action.payload
    },
    setSupportAgentId:(state,action)=>{
      state.id = action.payload
    },
    setChatRoomId:(state,action)=>{
      state.chatRoomId= action.payload
    }
  },
})

// Action creators are generated for each case reducer function
export const { setSupportAgentData,setSupportAgentId,setChatRoomId } = supportAgentDataSlice.actions

export default supportAgentDataSlice.reducer