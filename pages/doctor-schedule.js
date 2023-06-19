/* eslint-disable */
import {useState,useMemo,useEffect,useRef} from "react";
import Fullcalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import DatePicker from "react-datepicker";
import tr from "date-fns/locale/tr";
import us from "date-fns/locale/en-US";
import 'react-datepicker/dist/react-datepicker.css'
import { useSelector } from "react-redux";
import { GoogleMap,useLoadScript, MarkerF } from "@react-google-maps/api";
import {useAuth,db} from '../firebase/firebase'
import {doc,setDoc,getDoc,updateDoc} from 'firebase/firestore'
import classes from "../styles/mapStyles.module.css";
import event_classes from '../styles/calendarStyles.module.css';
import pageClasses from '../styles/doctorSchedule.module.css';
import {v4} from 'uuid';
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/currentUserState";
import { IntlProvider,FormattedMessage } from "react-intl";
import {message} from '../data/langData';

// import * as bootstrap from "bootstrap";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "./index.css";


function DoctorSchedule() {
  const [events,setEvents] = useState([])
  const [startTime,setStartTime] = useState();
  const [endTime,setEndTime] = useState();
  const [cityName,setCityName] = useState("");
  const [designatedLocation,setDesignatedLocation] = useState({});
  const [designatedInsurance,setDesignatedInsurance] = useState("");
  const [appointmentSelected,setAppointmentSelected] = useState(false);
  const [designatedCity,setDesignatedCity] = useState("");
  const [title,setTitle] = useState("");
  const [doctorId,setDoctorId] = useState("");
  const [locationName,setLocationName] = useState("")
  const [detailsPanel,setDetailsPanel] = useState({});
  const router = useRouter()
  const calendarRef = useRef();
  const dispatch = useDispatch();
  // const [id,setId] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [selectedLocation,setSelectedLocation]  = useState({
    lat:35,
    lng:34
  })
  const [error,setError] = useState(false)
  
  
  const userData = useSelector(state => state.userData.data)
  const language = useSelector(state => state.theme.language);


  const currentUser = useAuth();

  const {isLoaded} = useLoadScript({
    googleMapsApiKey:process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  })
  

  useEffect(()=>{
    if(Object.keys(userData).length!==0){
      if(userData.role!=="doctor"){
        router.push("/")
      }
    }
  },[router, userData])

  
  
  useEffect(()=>{
    if(Object.keys(userData).length!==0){
      setEvents(prev => {
        return userData.schedule
      })
    }
  },[userData])
  // console.log(events)
 useEffect(()=>{

      const successCallback = (position) => {
        setSelectedLocation({
          lat:position.coords.latitude,
          lng:position.coords.longitude
        })
      };

      const errorCallback = (error) => {
        console.log(error);
      };
      navigator.geolocation.getCurrentPosition(successCallback, errorCallback)

  },[])

  useEffect(()=>{
    if(currentUser){
      setDoctorId(currentUser.uid)
      const docRef = doc(db,"Doctors",currentUser.uid);
    (async()=>{
      const data =(await getDoc(docRef)).data();
      dispatch(setUserData(data));
    })();
    }
  },[currentUser, dispatch])

  const handleSetAppointment  = async() =>{
    const year = startDate.getFullYear()
    let month = ""
    let day = "";

    if((startDate.getMonth()) + 1 < 10){
      month = "0" + (startDate.getMonth()+ 1) 
    }else{
      month = (startDate.getMonth()) + 1
    }

    if(startDate.getDate() < 10){
      day = "0" + startDate.getDate()
    }else{
      day = startDate.getDate()
    }

    let start = startTime.split(":");
    let end = endTime.split(":");
    if(parseInt(start[0]) > parseInt(end[0]) ){
      setError(true)
    }

    const eventStart = year + "-"  + month + "-" + day + "T" + startTime + ":00"
    const eventEnd = year + "-"  + month + "-" + day + "T" + endTime + ":00"
    const eventId = v4();
    

    const event = {
      title:title,
      start:eventStart,
      end:eventEnd,
      id:eventId,
      patientName:"",
      patientId:"",
      patientPhone:"",
      location:designatedLocation,
      city:designatedCity,
      insurance:designatedInsurance,
      doctorId:currentUser.uid,
      status:"available"
    }

    setEvents(prev => {
      return [...prev,event]
    })



    const docRef = doc(db,"Doctors",currentUser.uid);

    const prevSchedules = userData.schedule
    await setDoc(docRef,{
      ...userData,
      schedule:[
        ...prevSchedules,
        event
      ]
    })
    const newData = (await getDoc(docRef)).data();
    dispatch(setUserData(newData));
    // window.location.reload();
    calendarRef.current.scrollIntoView({behavior:'smooth'})
  }
  console.log(userData)
  const handleAppointmentDetails = (id) => {
    setAppointmentSelected(true);
        let data = []
        for(let i = 0 ; i < userData.schedule.length ; i++){
            if(id === userData.schedule[i].id){
                data = userData.schedule[i]
            }
        }
        
        let start = data.start.split("T");
        let end = data.end.split("T");

        setDetailsPanel({
            title:data.title,
            start:start,
            end:end,
            id:data.id,
            status:data.status,
            patientName:data.patientName,
            patientPhone:data.patientPhone,
            patientId:data.patientId
        });
  }

  const handleDeleteAppointment = async (id) => {
    const docRef = doc(db,"Doctors",currentUser.uid);
    const scheduleData = (await getDoc(docRef)).data().schedule;
    let newArr = []
    if(confirm("Do you want to delete this appointment?")){
      for(let i = 0 ; i < scheduleData.length ; i++){
        if(scheduleData[i]["id"] === id){
          newArr = [...scheduleData];
          newArr.splice(i,1);
        }
      }
      await setDoc(docRef,{
        ...userData,
        schedule:newArr
      })
      window.location.reload();
    }
  }

  const handleAppointmentStatus = async (id) => {
    const docRef = doc(db,"Doctors",currentUser.uid);
    let scheduleData = [];
    console.log("executed")
    let index = 0
    for(let i = 0 ; i < userData.schedule.length ;i++){
      if(id === userData.schedule[i].id){
        scheduleData = userData.schedule[i]
        index = i
      }
    }
    // console.log(scheduleData)
    console.log("executed")

    if(scheduleData.status==="available"){
      if(confirm("Do you want to cancel this appointment?")){
    console.log("executed")
        
        const event = {...userData.schedule[index],
          color:"red",
          status:"cancelled",
          cancelledBy:"doctor",
          cancelledById:currentUser.uid
        }
        let prevSchedule = [...userData.schedule]
        prevSchedule.splice(index,1)
        console.log(prevSchedule)
        await setDoc(docRef,{
          ...userData,
          schedule:[...prevSchedule,event]
        })
   
    window.location.reload();
    } else{
      return;
    }
  }else if (scheduleData.status === "cancelled"){
    if(confirm("Do you want to open this appointment?")){
        
      const event = {...userData.schedule[index],
        color:"#3788d8",
        status:"available"
      }
      let prevSchedule = [...userData.schedule]
      prevSchedule.splice(index,1)
      await setDoc(docRef,{
        ...userData,
        schedule:[...prevSchedule,event]
      })
 
  window.location.reload();
  } else{
    return;
  }
  }else if (scheduleData.status === "booked"){
    if(confirm("Do you want to cancel this appointment?")){
        
      const event = {...userData.schedule[index],
        color:"red",
        status:"cancelled"
      }
      let prevSchedule = [...userData.schedule]
      prevSchedule.splice(index,1)
      console.log(prevSchedule)
      await setDoc(docRef,{
        ...userData,
        schedule:[...prevSchedule,event]
      })
 
  window.location.reload();
  } else{
    return;
  }
}
  }
  
  // console.log(startDate)
  const handleStartTimeChange = (e)=>{
    setStartTime(e.target.value)
  }

  const handleEndTimeChange = (e)=>{
    setEndTime(e.target.value)
  }

  const handleTitleChange = (e) =>{
    setTitle(e.target.value)
  }
  const handleInsuranceSelectionChange = (insurance) => {
    setDesignatedInsurance(insurance)
  }

  const handleLocationSelection = (name,lat,lng) => {
    setDesignatedLocation(prev => {
      return {...prev,name:name,lat:lat,lng:lng}
    })
  }

  const handleLocationChange = (e) => {
    setSelectedLocation({
      lat:e.latLng.lat(),
      lng:e.latLng.lng()
    })
  }
  const handleDeleteLocation= async (name)=>{
    const docRef = doc(db,"Doctors",currentUser.uid);
    let locations = userData.locations;
    let newLocations = [...locations]
    if(confirm("Do you want to delete this location")){
      for(let i = 0 ; i < locations.length ; i++ ){
        if(locations[i].name === name){
          newLocations.splice(i,1)
        }
      }
      
      await setDoc(docRef,{
        ...userData,
        locations:newLocations
      })
      window.location.reload();
    }else{
      return;
    }
    // locations.splice(i,1);
    
  }

  const handleAutomaticLocation = () => {
    const successCallback = (position) => {
      
      setSelectedLocation({
        lat:position.coords.latitude,
        lng:position.coords.longitude
      })
    };
    const errorCallback = (error) => {
      
      console.log(error);
    };
    navigator.geolocation.getCurrentPosition(successCallback, errorCallback)
  }

  const handleLocationNameChange = (e) => {
    setLocationName(e.target.value)
  }

  const handleAddLocation = async (name) =>{
    const docRef = doc(db,"Doctors",currentUser.uid);
    const prevLocations = userData.locations
    const locationData = {lat:selectedLocation.lat,lng:selectedLocation.lng,name:name}
    let locations = [...prevLocations, locationData]

    await setDoc(docRef,{
      ...userData,
      locations,
    })
    window.location.reload();
  }

  const handleSetCity =async (cityName) => {
    const docRef = doc(db,"Doctors",currentUser.uid);
    const cityArr = [...userData.city,cityName];
    await setDoc(docRef,{
      ...userData,
      city:cityArr
    })
    const data = (await getDoc(docRef,currentUser.uid)).data();
    dispatch(setUserData(data));
    alert("The city has been set");
  }

  const handleDeleteCity = async (Name) => {
    const docRef = doc(db,"Doctors",currentUser.uid);
    const cityData = (await getDoc(docRef)).data().city;
    console.log(Name)
    let newArr = []
    if(cityData.length < 2){
      for(let i = 0 ; i < cityData.length ; i++){
        console.log("executed")
        if(cityData[i]===Name){
          newArr = cityData;
          delete newArr[i];
          if(newArr.length === 0){
            console.log("executed")
            await updateDoc(docRef,{
              ...userData,
              city:[]
            })
          }
        }
      }
    }else{
      for(let i = 0 ; i < cityData.length ; i++){
          newArr = cityData;
          delete newArr[i];
            await setDoc(docRef,{
              ...userData,
              city:newArr
            })
          
      }
    }
    
    const data = (await getDoc(docRef,currentUser.uid)).data();
    dispatch(setUserData(data));
    alert("The City has been deleted")

  }
  // console.log(startDate.getMonth())
  // console.log(designatedLocation)
  const center = useMemo(()=>({lat:selectedLocation.lat,lng:selectedLocation.lng}),[selectedLocation.lat, selectedLocation.lng])
  return (
    <IntlProvider locale={language} messages={message[language]} >
    <div>
     <div style={{"width":"100%", "display":"flex","flexDirection":"row","justifyContent":"space-between","alignItems":"center"}} >
      <div className={pageClasses.card} >
      <h1 className={pageClasses.heading} > <FormattedMessage id="determine_timeline" defaultMessage="Default" values={{language}} /> </h1>
      <p className={pageClasses.paragraph} > <FormattedMessage id="determined_timeline" defaultMessage="Default" values={{language}} /> </p>
      <div style={{display:"flex","justifyContent":"space-evenly","alignItems":"start" }} >
      <div>
      <h3 className={pageClasses.heading} ><FormattedMessage id="your_locations" defaultMessage="Default" values={{language}} /></h3>

{ Object.keys(userData).length !==0 && userData.locations.length !== 0 ? userData.locations.map((item,index)=>{
  return <div key={index} >
    <label style={{"cursor":"pointer"}} onClick={(e)=> {
      setSelectedLocation({
        lat:item.lat,
        lng:item.lng
      })
    }} htmlFor={item.name}>{item.name}</label> <input  id={item.name} onChange={() => handleLocationSelection(item.name,item.lat,item.lng)} value={item.name} name={"locations"} type="radio"  />
  </div>

}): <p className={pageClasses.paragraph} > <FormattedMessage id="no_designated_location" defaultMessage="Default" values={{language}} />  </p> }

<h3 className={pageClasses.heading} > <FormattedMessage id="city" defaultMessage="Default" values={{language}} /> </h3>
{ Object.keys(userData).length !==0 && userData.city.length !== 0 ? userData.city.map((item,index)=>{
  return <div key={index} >
    <input  id={item} onChange={(e)=>setDesignatedCity(e.target.value)} value={item} name={"city"} type="radio"  />
    <label className={pageClasses.paragraph} style={{"cursor":"pointer"}} onClick={(e)=> {
      setDesignatedCity(e.target.value)
    }} htmlFor={"city"}>{item}</label> 
  </div>

}): <p className={pageClasses.paragraph} > <FormattedMessage id="no_cities_designated" defaultMessage="Default" values={{language}} /> </p>}
      </div>
      <div>
      <h3 className={pageClasses.heading} > <FormattedMessage id="insurances_worked_with" defaultMessage="Default" values={{language}} /> </h3>
      {Object.keys(userData).length !== 0 && userData.insurance.map((item)=>{
        return <div key={item} >
        <label htmlFor={item}>{item}</label> <input id={item} onChange={()=>handleInsuranceSelectionChange(item)} value={item} name={"insurances"} type="radio"  />
      </div>
      }) }
      <p className={pageClasses.paragraph} > <FormattedMessage id="select_date" defaultMessage="Default" values={{language}} /></p>
     <div style={{zIndex:"99999"}} ><DatePicker dateFormat={"dd/MM/yyyy"} locale={language==="tr" ? tr : us} selected={startDate} onChange={(date) => setStartDate(date)} /></div>

     <p className={pageClasses.paragraph} ><FormattedMessage id="select_interval" defaultMessage="Default" values={{language}} /></p>
     <label className={pageClasses.paragraph} htmlFor="input"> <FormattedMessage id="start" defaultMessage="Default" values={{language}} />: </label>
     <input onChange={e => handleStartTimeChange(e)} type="time" />
     <label className={pageClasses.paragraph} htmlFor="input"> <FormattedMessage id="end" defaultMessage="Default" values={{language}} />: </label>
     <input onChange={e => handleEndTimeChange(e)} type="time" />
     <p className={pageClasses.paragraph} > <FormattedMessage id="title_for_appointment" defaultMessage="Default" values={{language}} /> </p>
     <input type="text" onChange={e => handleTitleChange(e)} /> <br /><br />
     <button className={pageClasses.button_class} onClick={()=>handleSetAppointment()} > <FormattedMessage id="set_appointment" defaultMessage="Default" values={{language}} /></button>
      </div>
      </div>
     <br />
      </div>
     <div style={{"height":"50vh","width":"50%","marginBottom":"250px"}} >
      
     {isLoaded ? <div style={{height:"100%",width:"100%"}} > 
     <GoogleMap zoom={16} center={center} mapContainerClassName={classes.map_container_schedule } onClick={(e)=>handleLocationChange(e)}>
      <MarkerF title="Selected Position" position={selectedLocation} />
      {
        Object.keys(userData).length !== 0 && userData.locations.map((item,index) => {
          return <MarkerF icon={"http://maps.google.com/mapfiles/ms/icons/blue-dot.png"} title={{lat:item.lat,lng:item.lng}} key={index} position={{lat:item.lat,lng:item.lng}} />
        })
      }
    </GoogleMap>
       </div> : "" }
    <div style={{display:"flex",justifyContent:"stretch"}} >
    {/* <div  >
        <div>
        <h3>Coordinates</h3> 
        <p>Lat: {selectedLocation.lat}</p>
        <p>Lng: {selectedLocation.lng}</p>
        </div>
        
    </div>   */}
    </div>
    <div style={{display:"flex"}}>
    <div className={pageClasses.card} >
    <div style={{display:"flex","alignItems":"center"}} >
        <h3><FormattedMessage id="coordinates" defaultMessage="Default" values={{language}} /></h3> 
        <span className={pageClasses.paragraph} style={{display:"inline",marginLeft:"15px"}} > {selectedLocation.lat.toFixed(2) +", " + selectedLocation.lng.toFixed(2)} </span>
        </div>
    <label className={pageClasses.input_label} htmlFor="locationName"><FormattedMessage id="location_name" defaultMessage="Default" values={{language}} /></label>: <input style={{padding:"5px",fontSize:"20px",width:"40%",marginTop:"15px"}} className={pageClasses.location_input} name="locationName" type="text" onChange={e => handleLocationNameChange(e)} />
    <br /><button className={pageClasses.button_class} onClick={() => handleAutomaticLocation()} > <FormattedMessage id="find_my_location" defaultMessage="Default" values={{language}} /></button>
    <button className={pageClasses.button_class} onClick={()=> handleAddLocation(locationName)} > <FormattedMessage id="add_this_location" defaultMessage="Default" values={{language}} /> </button>
    <button className={pageClasses.button_class} onClick={()=> handleDeleteLocation(locationName)} > <FormattedMessage id="delete_location" defaultMessage="Default" values={{language}} /> </button>
    </div>
    <div className={pageClasses.card} >
    <label className={pageClasses.input_label} htmlFor="locationName"><FormattedMessage id="select_city" defaultMessage="Default" values={{language}} /></label>: <span> <select style={{padding:"5px",fontSize:"20px",width:"40%",marginTop:"15px"}} onChange={e => setCityName(e.target.value)} name="" id="">
      <option selected value="Kyrenia">Kyrenia</option>
      <option value="Nicosia">Nicosia</option>
      <option value="Guzelyurt">Guzelyurt</option>
      <option value="Famagusta">Famagusta</option>
      <option value="Karpaz">Karpaz</option>
      <option value="Iskele">Iskele</option>
      </select> </span><br></br>
    <button className={pageClasses.button_class} onClick={()=> handleSetCity(cityName)} > <FormattedMessage id="add_this_city" defaultMessage="Default" values={{language}} /> </button>
    <button className={pageClasses.button_class} onClick={()=> handleDeleteCity(cityName)} > <FormattedMessage id="delete_this_city" defaultMessage="Default" values={{language}} /> </button>
    </div>
    </div>
    
     </div>
    </div>
      <div style={{"marginTop":"250px","display":"flex","flexDirection":"row",justifyContent:"space-between",marginTop:"100px"}} >
      {events.length > 0 &&  <div ref={calendarRef} style={{"width":"50%",marginLeft:"20px",marginBottom:"25px",marginTop:"150px"}}> <Fullcalendar
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
        {
          appointmentSelected && <div style={{marginTop:"150px"}} className={pageClasses.card}>
          <div className={pageClasses.card_container}>
              <h3> <FormattedMessage id="appointment_details" defaultMessage="Default" values={{language}} /> </h3> 
                <h4> {detailsPanel.title} </h4>
                <p style={{fontStyle:"italic",color:"rgb(128, 128, 128)"}} > {detailsPanel.start + " "} - {" " + detailsPanel.end} </p>
                <p><span><FormattedMessage id="patient_name" defaultMessage="Default" values={{language}} />:</span> {detailsPanel.patientName} </p>
                <p><span><FormattedMessage id="patient_phone_number" defaultMessage="Default" values={{language}} />:</span> {detailsPanel.patientPhone}</p>
                <p><FormattedMessage id="status" defaultMessage="Default" values={{language}} />: {detailsPanel.status==="booked" ? <FormattedMessage id="booked" defaultMessage="Default" values={{language}} /> :  detailsPanel.status==="available" ? <FormattedMessage id="available" defaultMessage="Default" values={{language}} /> : <FormattedMessage id="cancelled" defaultMessage="Default" values={{language}} /> }</p>
                
                 <button className={pageClasses.button_class} disabled={detailsPanel.status ==="available"} onClick={()=>handleAppointmentStatus(detailsPanel.id)} ><FormattedMessage id="open_this_appointment" defaultMessage="Default" values={{language}} /></button>
                 <button className={pageClasses.button_class} disabled={detailsPanel.status ==="cancelled"} onClick={()=>handleAppointmentStatus(detailsPanel.id)} ><FormattedMessage id="cancel_this_appointment" defaultMessage="Default" values={{language}} /></button>
                 <button className={pageClasses.button_class_danger}  onClick={()=>handleDeleteAppointment(detailsPanel.id)} ><FormattedMessage id="delete_this_appointment" defaultMessage="Default" values={{language}} /></button>
          </div>
        </div>
        }
      </div>
    </div>
    </IntlProvider>
  );
}

export default DoctorSchedule;