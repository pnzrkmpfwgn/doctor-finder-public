/* eslint-disable */
import { GoogleMap,useLoadScript, MarkerF } from "@react-google-maps/api";
import classes from '../../styles/mapStyles.module.css';
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "../../redux/currentUserState";
import { useState,useMemo } from "react";
import {doc,getDoc,setDoc} from 'firebase/firestore';
import {db, useAuth} from '../../firebase/firebase'; 
import { v4 } from "uuid";
import pageClasses from '../../styles/doctorSchedule.module.css';
import { IntlProvider,FormattedMessage } from "react-intl";
import {message} from '../../data/langData';


export default function MapComponent(){

  const userData = useSelector(state => state.userData.data);
  const language = useSelector(state => state.theme.language)
  const dispatch = useDispatch();
  const currentUser = useAuth();
  // const [userDetermined,setUserDetermined] = useState(false);
  const [selectedLocation,setSelectedLocation]  = useState({
    lat:35,
    lng:34
  })
  const CONSTANT_LATITUDE = 111.32; //km
    const CONSTANT_LONGTITUDE = 40075*Math.cos(CONSTANT_LATITUDE)/360

  //Local States
  const [locationName,setLocationName] = useState("Location");
  const [city,SetCity] = useState("Famagusta")

  // const userLocation = useSelector(state => state.locationData.data)
  // const dispatch = useDispatch();
  const {isLoaded} = useLoadScript({
    googleMapsApiKey:process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  })
  
  // useEffect(()=>{
  //   if(Object.keys(userLocation).length === 0 && !userDetermined ){
  //     const successCallback = (position) => {
  //       setSelectedLocation({
  //         lat:position.coords.latitude,
  //         lng:position.coords.longitude
  //       })
  //     };
      
  //     const errorCallback = (error) => {
  //       console.log(error);
  //     };
  //     navigator.geolocation.getCurrentPosition(successCallback, errorCallback)
  //   }
  // },[dispatch, userDetermined, userLocation])

  

  const handleAddLocation = async (name) =>{
    const docRef = doc(db,"Doctors",currentUser.uid);
    const prevLocations = userData.locations
    const locationData = {lat:selectedLocation.lat,lng:selectedLocation.lng,name:name}
    const language = useSelector(state => state.theme.language);
    let locations = [...prevLocations, locationData]

    await setDoc(docRef,{
      ...userData,
      locations,
    })
    window.location.reload();
  }

  const handleTextChange = (e) => {
    setLocationName(e.target.value);
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

  const handleLocationSelection  = (e) => {
    setSelectedLocation({
      lat:e.latLng.lat(),
      lng:e.latLng.lng()
    })

  }

  const handleDeleteLocation= async (i)=>{
    const docRef = doc(db,"Doctors",currentUser.uid);
    let locations = userData.locations;
    let newLocations = [...locations]
    newLocations.splice(i,1)
    
    await setDoc(docRef,{
      ...userData,
      locations:newLocations
    })
    window.location.reload();
    // locations.splice(i,1);
    
  }

  const handleCityChange =(e) =>{
    SetCity(e.target.value)
  }

  const handleSetCity =async () => {
    const docRef = doc(db,"Doctors",currentUser.uid);
    const cityArr = [...userData.city,city];
    await setDoc(docRef,{
      ...userData,
      city:cityArr
    })
    const data = (await getDoc(docRef,currentUser.uid)).data();
    dispatch(setUserData(data));
    alert("The city has been set");
  }
  console.log(city)
  console.log(userData)
  const center = useMemo(()=>({lat:selectedLocation.lat,lng:selectedLocation.lng}),[selectedLocation.lat, selectedLocation.lng])
  
   console.log(locationName)
    if(isLoaded){
      return  selectedLocation ?   <IntlProvider locale={language} messages={message[language]} > <div style={{display:"flex",justifyContent:"space-between",margin:"50px"}} >
      <div style={{width:"70%"}} >
        <h1 className={pageClasses.heading} >  <FormattedMessage id="determine_location" defaultMessage="Default" values={{language}} /> </h1>
      <p className={pageClasses.paragraph} style={{width:"70%"}} >
      <FormattedMessage id="doctor_map_explanation" defaultMessage="Default" values={{language}} />
      </p>
      <button  className={pageClasses.button_class} onClick={()=> handleAutomaticLocation()}> <FormattedMessage id="find_my_location" defaultMessage="Default" values={{language}} /></button>
      <p style={{fontWeight:"bold"}} className={pageClasses.paragraph} > <FormattedMessage id="selected_coordinate" defaultMessage="Default" values={{language}} />: {selectedLocation.lat.toFixed(2) + ", " + selectedLocation.lng.toFixed(2) }  </p>

      <p className={pageClasses.paragraph} ><FormattedMessage id="location_name" defaultMessage="Default" values={{language}} />:</p>
      <input style={{height:"35px",width:"350px"}} type="text" onChange={(e)=>handleTextChange(e)} />
      <button className={pageClasses.button_class} onClick={()=>handleAddLocation(locationName)} > <FormattedMessage id="add_this_location" defaultMessage="Default" values={{language}} /></button>
      <p className={pageClasses.paragraph} > <FormattedMessage id="determined_location" defaultMessage="Default" values={{language}} />: </p>
      {Object.keys(userData).length !==0 &&

        <ul>
        { userData.locations.length === 0? <p style={{color:"rgb(110, 110, 110)",fontStyle:"italic"}} className={pageClasses.paragraph} ><FormattedMessage id="no_determined_location" defaultMessage="Default" values={{language}} /></p> : userData.locations.map((item,index) => {
          const uniqueKey = v4();
          return <li style={{"cursor":"pointer"}} key={uniqueKey} >
          {item.name}
          <button onClick={()=>handleDeleteLocation(index) } ><FormattedMessage id="delete_location" defaultMessage="Default" values={{language}} /></button>
        </li>
        })}  
        </ul>
      }
      
      <p style={{fontWeight:"bold",fontStyle:"italic",color:"red"}} className={pageClasses.paragraph} ><FormattedMessage id="automatic_location_warning" defaultMessage="Default" values={{language}} /></p>
      <p className={pageClasses.paragraph} ><FormattedMessage id="select_city" defaultMessage="Default" values={{language}} />:</p>
      <select style={{height:"35px",width:"150px"}} name="" id="" onChange={(e)=>handleCityChange(e)} >
        <option value="Famagusta">Famagusta</option>
        <option value="Nicosia">Lefkoşa</option>
        <option value="Kyrenia">Girne</option>
        <option value="Guzelyurt">Guzelyurt</option>
        <option value="Karpaz">Karpaz</option>
        <option value="Lapta">Lapta</option>
      </select>
      <button className={pageClasses.button_class} onClick={()=>handleSetCity()} ><FormattedMessage id="set_city" defaultMessage="Default" values={{language}} /></button>
      </div>
      
    <GoogleMap zoom={16} center={center} mapContainerClassName={classes.map_container} onClick={(e)=>handleLocationSelection(e)}>
      <MarkerF title="Selected Position" position={selectedLocation} />
      {
        Object.keys(userData).length !== 0 && userData.locations.map((item,index) => {
          const uniqueKey = v4();
          return <MarkerF icon={"http://maps.google.com/mapfiles/ms/icons/blue-dot.png"} title={{lat:item.lat,lng:item.lng}} key={uniqueKey} position={{lat:item.lat,lng:item.lng}} />
        })
      }
    </GoogleMap>
  </div> </IntlProvider> : <div>
      <p>
      <FormattedMessage id="doctor_map_explanation" defaultMessage="Default" values={{language}} />
      </p>
      
      <p> <FormattedMessage id="your_coordinates" defaultMessage="Default" values={{language}} />: { 0 + ", " + 0} </p>
      
      <p><FormattedMessage id="automatic_location_warning" defaultMessage="Default" values={{language}} /></p>
      <button onClick={()=> handleAutomaticLocation()}> <FormattedMessage id="find_my_location" defaultMessage="Default" values={{language}} /></button> 
      
          
        <GoogleMap zoom={16} center={{lat:0,lng:0}} mapContainerClassName={classes.map_container} onClick={(e)=>handleLocationSelection(e)}>
          <MarkerF position={{lat:0,lng:0}} />
        </GoogleMap>
      </div>
  
    }else{
      return <div style={{height:"100dvh"}} >
      <FormattedMessage id="loading" defaultMessage="Default" values={{language}} />
    </div>
    }
  
}