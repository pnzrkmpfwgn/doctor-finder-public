/* eslint-disable */
import { GoogleMap,useLoadScript, MarkerF } from "@react-google-maps/api";
import classes from '../../styles/mapStyles.module.css';
import { useDispatch, useSelector } from "react-redux";
import  { setLocationData } from "../../redux/user_location";
import { useEffect,useState,useMemo } from "react";
import {useCookies} from 'react-cookie';
import pageClasses from '../../styles/doctorSchedule.module.css';
import { IntlProvider,FormattedMessage } from "react-intl";
import {message} from '../../data/langData';


export default function MapComponent(){
  const language = useSelector(state => state.theme.language);
  const [userDetermined,setUserDetermined] = useState(false);
  const [cookie, setCookie] = useCookies(["location"])
  const userLocation = useSelector(state => state.locationData.data)
  const dispatch = useDispatch();
  const {isLoaded} = useLoadScript({
    googleMapsApiKey:process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  })

  useEffect(()=>{
    if(Object.keys(userLocation).length === 0 && !userDetermined ){
      const successCallback = (position) => {
        dispatch(setLocationData({
          lat:position.coords.latitude,
          lng:position.coords.longitude
        }))
      };
      
      const errorCallback = (error) => {
        console.log(error);
      };
      navigator.geolocation.getCurrentPosition(successCallback, errorCallback)
    }
  },[cookie.location, dispatch, userDetermined, userLocation])

  const handleLocation = (e) => {
    dispatch(setLocationData({
      lat:e.latLng.lat(),
      lng:e.latLng.lng()
    }))
    setUserDetermined(true);
  }

  const handleSaveLocation = () =>{
    setCookie("location",userLocation)
  }
  
  const handleAutomaticLocation = () => {
    const successCallback = (position) => {
      dispatch(setLocationData({
        lat:position.coords.latitude,
        lng:position.coords.longitude
      }))
    };
    
    const errorCallback = (error) => {
      console.log(error);
    };
    navigator.geolocation.getCurrentPosition(successCallback, errorCallback)
  }

  const center = useMemo(()=>({lat:userLocation.lat,lng:userLocation.lng}),[userLocation.lat, userLocation.lng])
  console.log(cookie.location)
  console.log(userLocation)
  if(isLoaded){
    return  Object.keys(userLocation).length !== 0 ?  <IntlProvider locale={language} messages={message[language]} ><div>
      <h1 className={pageClasses.heading} ><FormattedMessage id="determine_location" defaultMessage="Default" values={{language}} /></h1>
    <p className={pageClasses.paragraph} >
    <FormattedMessage id="patient_location_explanation" defaultMessage="Default" values={{language}} />
    </p>
    <p className={pageClasses.paragraph} >
    <FormattedMessage id="patient_location_explanation_2" defaultMessage="Default" values={{language}} />
    </p>
    <p className={pageClasses.paragraph} >
    <FormattedMessage id="patient_location_explanation_3" defaultMessage="Default" values={{language}} />
    </p>
    <p className={pageClasses.paragraph} > <FormattedMessage id="your_coordinates" defaultMessage="Default" values={{language}} />: { userLocation.lat.toFixed(2) + ", " + userLocation.lng.toFixed(2)} </p>
    <p className={pageClasses.paragraph} > <FormattedMessage id="previously_saved_locations" defaultMessage="Default" values={{language}} />: {cookie.location && cookie.location.lat.toFixed(2) + ", " + cookie.location.lng.toFixed(2) } </p>
    <p className={pageClasses.paragraph} style={{color:"red"}} ><FormattedMessage id="automatic_location_warning" defaultMessage="Default" values={{language}} /></p>
    <button className={pageClasses.button_class} onClick={()=> handleAutomaticLocation()}> <FormattedMessage id="find_my_location" defaultMessage="Default" values={{language}} /></button> <br />
    <button className={pageClasses.button_class} onClick={()=>handleSaveLocation()} > <FormattedMessage id="save_this_location" defaultMessage="Default" values={{language}} /></button>
    
    
  <GoogleMap zoom={16} center={center} mapContainerClassName={classes.map_container} onClick={(e)=>handleLocation(e)}>
    <MarkerF position={center} />
  </GoogleMap>
</div> </IntlProvider> : <div>
        <p>
        <FormattedMessage id="patient_location_explanation" defaultMessage="Default" values={{language}} /> 
        </p>
        <p>
        <FormattedMessage id="patient_location_explanation_2" defaultMessage="Default" values={{language}} />
        </p>
        <p>
        <FormattedMessage id="patient_location_explanation_3" defaultMessage="Default" values={{language}} />
        </p>
    <p> <FormattedMessage id="your_locations" defaultMessage="Default" values={{language}} /> : {0 + ", " + 0} </p>
        
      <GoogleMap zoom={16} center={{lat:0,lng:0}} mapContainerClassName={classes.map_container} onClick={(e)=>handleLocation(e)}>
        <MarkerF position={{lat:0,lng:0}} />
      </GoogleMap>
    </div>

  }else{
    return <div>
    <FormattedMessage id="loading" defaultMessage="Default" values={{language}} />
  </div>
  }
}