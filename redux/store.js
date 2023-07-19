/* eslint-disable */
import { configureStore } from "@reduxjs/toolkit";
import counterReducer from './counter';
import authReducer from './authentication';
import themeReducer from "./theme";
import patientReducer from './patientState';
import locationReducer from './user_location';
import doctorReducer from './doctorState';
import userReducer from './currentUserState';
import supportAgentReducer from './supportAgentState';
import requestedHelpState from "./requestedHelpState";
import locationResults from "./locationResults";
import rating from "./rating";


export default configureStore({
    reducer:{
        counter:counterReducer,
        auth:authReducer,
        theme:themeReducer,
        patientData:patientReducer,
        doctorData:doctorReducer,
        locationData:locationReducer,
        userData:userReducer,
        supportAgentData:supportAgentReducer,
        requestedHelpData:requestedHelpState,
        results:locationResults,
        rating:rating
        
    }
})