/* eslint-disable */
import {useState,useEffect} from "react";
import Fullcalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import tr from "date-fns/locale/tr";
import us from "date-fns/locale/en-US";
import { useSelector } from "react-redux";
import event_classes from '../styles/calendarStyles.module.css';
import pageClasses from '../styles/doctorSchedule.module.css';

export default function DoctorScheduleList(){
    const [events,setEvents] = useState([])
    const [bookedAppointments,setBookedAppointments] = useState([]);
    const [start,setStart] = useState();
    const [end,setEnd] = useState();
    const userData = useSelector(state => state.userData.data)
    const language = useSelector(state => state.theme.language);
    

    useEffect(()=>{
        if(Object.keys(userData).length!==0){
          setEvents(prev => {
            return userData.schedule
          })
        }
      },[userData])
      console.log(userData.schedule)
      useEffect(()=>{
        if(Object.keys(userData).length!==0){
            for(let i = 0 ; i < userData.schedule.length;i++){
                if(userData.schedule[i].status==="booked"){
                    setBookedAppointments(prev => {
                    const tempStart = userData.schedule[i].start.split("T")
                    const startDate =tempStart[0]
                    const tempStartTime = tempStart[1].split(":")
                    const startTime = tempStartTime[0] + ":" + tempStartTime[1]
                    
                    const tempEnd = userData.schedule[i].end.split("T")
                    const endDate =tempEnd[0]
                    const tempEndTime = tempEnd[1].split(":")
                    const endTime = tempEndTime[0] + ":" + tempEndTime[1]

                    const obj = {
                      title:userData.schedule[i].title,
                      patientName:userData.schedule[i].patientName,
                      patientPhone:userData.schedule[i].patientPhone,
                      start:startDate + " " +startTime,
                      end:endDate + " " + endTime
                    }
                    const arr = [...prev,obj]
                    const unique = arr.filter((obj,index)=>arr.findIndex( item => {
                        return item.id === obj.id === index
                    } ))
                    
                       return unique
                    })
                }
            }
        }
      },[userData])

      useEffect(()=>{

      },[])
    

    return <div className={pageClasses.list_calendar_container} >
        <div className={pageClasses.list_page_calendar} >
        <Fullcalendar
        plugins={[timeGridPlugin,dayGridPlugin]}
        initialView={"timeGridWeek"}
        locale={language==="tr" ? tr : us}
        headerToolbar={{
          start: "today prev,next", // will normally be on the left. if RTL, will be on the right
          center: "title",
          end: "timeGridDay,timeGridWeek,dayGridMonth", // will normally be on the right. if RTL, will be on the left
          url:"localhost",
          description:"description",
        }}
        eventClassNames={event_classes.event}
        height={"90vh"}
        events={events}
      /> 
    </div>
    <div className={pageClasses.list}>
        {bookedAppointments ? <div style={{width:"100%",height:"80%"}} className={pageClasses.card} >
            <div className={pageClasses.card_container}>
                <h4> Appointments </h4>
                    {bookedAppointments.map(item=>{
                    return <div key={item.id}>
                             <div className={pageClasses.list_item} >
                                <h5> {item.title} </h5>
                                <p> <span>Start:</span> <span style={{"fontStyle":"italic",fontWeight:"lighter"}} >{item.start}</span> </p>
                                <p> <span>End:</span> <span style={{"fontStyle":"italic",fontWeight:"lighter"}} >{item.end}</span> </p>
                                <p> <span>Patient Full Name:</span> {item.patientName} </p>
                                <p> <span>Patient Phone Number:</span> {item.phoneNumber} </p>
                                <p></p>
                            </div>
                        </div>
                    }) }
                    </div>
            
             </div>: <p style={{fontStyle:"italic",color:"rgb(128, 128, 128)"}} > There are no appointments booked </p>}
    </div>
    </div>
}