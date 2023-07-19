/* eslint-disable */
import Fullcalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import tr from "date-fns/locale/tr";
import us from "date-fns/locale/en-US";
import { useSelector } from "react-redux";
import { GoogleMap,useLoadScript, MarkerF } from "@react-google-maps/api";
import event_classes from '../../styles/calendarStyles.module.css'
import classes from "../../styles/mapStyles.module.css";
import {db,useAuth} from '../../firebase/firebase';
import {useState,useMemo} from 'react';
import { useCookies } from "react-cookie";
import { IntlProvider,FormattedMessage } from "react-intl";
import {message} from '../../data/langData';

//Copy the logic of doc_id

const CalendarComponent = ({events}) => {
    const [doctorId,setDoctorId] = useState("");
    const [appointmentSelected,setAppointmentSelected] = useState(false);
    const [insuranceMatch,setInsuranceMatch] = useState(false);
    const [detailsPanel,setDetailsPanel] = useState({});
    const currentUser = useAuth();
    const userData = useSelector(state=> state.userData.data);
    const language = useSelector(state => state.theme.language)
    const [selectedLocation,setSelectedLocation]  = useState({
        lat:35,
        lng:34
      })
      const CONSTANT_LATITUDE = 111.32; //km
    const CONSTANT_LONGTITUDE = 40075*Math.cos(CONSTANT_LATITUDE)/360
    const [cookie, setCookie] = useCookies(["location"])

    console.log(events)
    console.log(currentUser)

    const {isLoaded} = useLoadScript({
        googleMapsApiKey:process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      })
      const handleAppointmentDetails = (id) =>{
        setAppointmentSelected(true);
        let data = []
        for(let i = 0 ; i < events.length ; i++){
            if(id === events[i].id){
                data = events[i]
            }
        }
        
        let start = data.start.split("T");
        let end = data.end.split("T");

        for(let i = 0 ; i < userData.insurance.length ; i++){
            if(data.insurance === userData.insurance[i]){
                setInsuranceMatch(true)
            }
        }
        let distance = 0;

        if(cookie.location){
            distance = Math.sqrt( Math.pow(data.location.lat*CONSTANT_LATITUDE-cookie.lat*CONSTANT_LATITUDE,2) + Math.pow(data.location.lng*CONSTANT_LONGTITUDE-cookie.lng*CONSTANT_LONGTITUDE,2) )
        }else{
            distance = Math.sqrt( Math.pow(data.location.lat*CONSTANT_LATITUDE-selectedLocation.lat*CONSTANT_LATITUDE,2) + Math.pow(data.location.lng*CONSTANT_LONGTITUDE-selectedLocation.lng*CONSTANT_LONGTITUDE,2) )
        }
        console.log(data.status)

        setDetailsPanel({
            title:data.title,
            start:start,
            end:end,
            id:data.id,
            insurance:data.insurance,
            location:data.location,
            distance:distance,
            status:data.status
        });
    }

    const handleAppointmentStatus = async (id,doctorId) => {
        const docRef = doc(db,"Doctors",doctorId);
        const docPatient = doc(db,"Patients",currentUser.uid);
        let scheduleData = [];
        let patientScheduleData = [];
        let index = 0
        let indexForPatient = 0
        // console.log(props.schedule)
        // console.log(id)
        // console.log(props.schedule)
        for(let i = 0 ; i < events.length ;i++){
          if(id === events[i].id){
            scheduleData = events[i]
            index = i
          }
        }

        for(let i = 0 ; i < userData.schedule.length ;i++){
            if(id === userData.schedule[i].id){
              patientScheduleData = userData.schedule[i]
              indexForPatient = i
            }
          }
        // console.log(scheduleData)
        if(scheduleData.status==="available"){
          if(confirm("Do you want to book this appointment")){
            const event = {...props.schedule[index],
              color:"#878a88",
              status:"booked",
              bookedby:currentUser.uid,
              patientName:userData.name + " " + userData.surname,
              patientId:currentUser.uid,
              patientPhone:userData.phone_number
            }
            let prevSchedule = [...props.schedule]
            let prevPatientSchedule = [...userData.schedule]

            prevSchedule.splice(index,1)
            // console.log(prevSchedule)
            await setDoc(docRef,{
              ...props,
              schedule:[...prevSchedule,event]
            })
            prevPatientSchedule.splice(indexForPatient,1)
            await setDoc(docPatient,{
                ...userData,
              schedule:[...prevPatientSchedule,event]
            })
       
        window.location.reload();
        } else{
          return;
        }
      }else if (scheduleData.status === "cancelled"){
        alert("This appointment is cancelled by you")
      }else if (scheduleData.status === "booked"){
        alert("This appointment is booked by you")
      }
        
      }

    const center = useMemo(()=>({lat:selectedLocation.lat,lng:selectedLocation.lng}),[selectedLocation.lat, selectedLocation.lng])

    return  <IntlProvider locale={language} messages={message[language]} > <div style={{"display":"flex","flexDirection":"row",justifyContent:"space-between",alignItems:"start",marginBottom:"100px"}} >
    {events.length > 0 && <div style={{"width":"50%"}}>
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
    eventClick={(info)=>{handleAppointmentDetails(info.event.id)}}
    height={"90vh"}
    events={events}
  />
        </div>}
        <div style={{"width":"30%"}} > 
        <h3 className={event_classes.heading} > <FormattedMessage id="appointment_details" defaultMessage={"default"} values={{language}} /> </h3> 
        <div>
            {appointmentSelected ? 
            <div>
            <h4 className={event_classes.heading_2}> {detailsPanel.title} </h4>
            <p className={event_classes.time_date}> {detailsPanel.start + " "} - {" " + detailsPanel.end} </p>
            <p> <span className={event_classes.insurance_heading} > <FormattedMessage id="insurance" defaultMessage={"default"} values={{language}} />: </span> {detailsPanel.insurance} {insuranceMatch && <i className={event_classes.tick_class + " fa fa-check"} ></i>} </p>
            <p className={event_classes.insurance_n}>{!insuranceMatch  &&  language ==="tr" ? "Sigortalarınız bu randevuda geçerli sigorta ile uyuşmamaktadır" : "You have no matching insurance with this appointment"} </p>
            <p><span className={event_classes.distance} ><FormattedMessage id="distance" defaultMessage={"default"} values={{language}} /> : </span>{detailsPanel.distance.toFixed(3)} KM</p>
            <p style={{textTransform:"capitalize"}} ><span className={event_classes.distance}><FormattedMessage id="status" defaultMessage={"default"} values={{language}} /> :</span>  {detailsPanel.status} {detailsPanel.status ==="booked" ? <i className={event_classes.tick_class + " fa fa-check"} ></i>:<i className={ event_classes.cross_class + " fa-solid fa-xmark"}></i>} </p>
            <div style={{"height":"50vh","width":"100%"}} >
            {isLoaded ? <GoogleMap zoom={8} center={center} mapContainerClassName={classes.map_container_medium} onClick={(e)=>handleLocationChange(e)}>
               <MarkerF title="Selected Position" position={selectedLocation} />
                <MarkerF icon={"http://maps.google.com/mapfiles/ms/icons/blue-dot.png"} title={{lat:detailsPanel.location.lat,lng:detailsPanel.location.lng}}  position={{lat:detailsPanel.location.lat,lng:detailsPanel.location.lng}} />
                
             </GoogleMap> : "" }
             <button className={event_classes.button_class} onClick={()=>handleAppointmentStatus(detailsPanel.id,doctorId)} > <FormattedMessage id="book_this_appointment" defaultMessage={"default"} values={{language}} /></button>
                </div>
            </div>
            :
            <p className={event_classes.text} >   <FormattedMessage id="click_appointment_details" defaultMessage={"default"} values={{language}} /> </p>
            }
        </div>
        </div>
    </div>
    </IntlProvider>
}

export default CalendarComponent