/* eslint-disable */
import { useSelector } from "react-redux"
import { useState } from "react";
import CalendarComponent from "../components/calendar/CalendarComponent";

export default function PatientSchedule(){
    const userData = useSelector(state => state.userData.data);
    console.log(userData)
    return <div>
        {Object.keys(userData).length!==0 && <CalendarComponent events={userData.schedule} />}
    </div>
}