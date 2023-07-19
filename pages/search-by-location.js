/* eslint-disable */
import { GoogleMap,useLoadScript,MarkerF } from "@react-google-maps/api";
import classes from '../styles/mapStyles.module.css';
import {  useSelector } from "react-redux";
import pageClasses from '../styles/patientEditProifle.module.css';
import searchClasses from '../styles/searchBy.module.css';
import { useEffect,useState,useMemo } from "react";
import {useCookies} from 'react-cookie';
import { useRouter } from "next/router";
import { IntlProvider,FormattedMessage } from "react-intl";
import {message} from '../data/langData';

export default function SearchByLocation(){


  //Global constant to convert lat and lng to meters
  const CONSTANT_LATITUDE = 111.32; //km
  const CONSTANT_LONGTITUDE = 40075*Math.cos(CONSTANT_LATITUDE)/360

  // const sortingData = useSelector(state => state.sortingResults.data)
  const [userDetermined,setUserDetermined] = useState(false);
  const [localData,setLocalData] = useState({});
  const [localResults,setLocalResults] = useState();
  const [cookie, setCookie] = useCookies(["location"])
  const router = useRouter();
  const [sortedData, setSortedData] = useState([])
  const [detailsPanel,setDetailsPanel] = useState();
  const [userClicked,setUserClicked] = useState(false);
  const [counter,setCounter] = useState(0);
  const [induvidualLocation,setInduvidualLocation] = useState({lat:0,lng:0})
  const [showDetails,setShowDetails] = useState(false)
  // const userLocation = useSelector(state => state.locationData.data)
  const language = useSelector(state => state.theme.language)
  const {isLoaded} = useLoadScript({
    googleMapsApiKey:process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  })
  
  useEffect(()=>{
    if(typeof window !== 'undefined'){
      const data = localStorage.getItem("locationData")
      setLocalResults(JSON.parse(data))
    }
   
    if(Object.keys(localData).length === 0 && !userDetermined ){
      const successCallback = (position) => {
        setLocalData({
          lat:position.coords.latitude,
          lng:position.coords.longitude
        })
      };
      
      const errorCallback = (error) => {
        console.log(error);
      };
      navigator.geolocation.getCurrentPosition(successCallback, errorCallback)
    }
    
  },[localData, userDetermined])
  
  
  const handleLocation = (e) => {
    setLocalData({
      lat:position.coords.latitude,
      lng:position.coords.longitude
    })
    setUserDetermined(true);
  }

  // const handleSaveLocation = () =>{
  //   setCookie("location",localData)
  // }
  const handleRouting =(id) => {
    router.push(`/${id}`)
  }
  // const handleAutomaticLocation = () => {
  //   const successCallback = (position) => {
  //     setLocalData({
  //       lat:position.coords.latitude,
  //       lng:position.coords.longitude
  //     })
  //   };

    
    
  //   const errorCallback = (error) => {
  //     console.log(error);
  //   };
  //   navigator.geolocation.getCurrentPosition(successCallback, errorCallback)
  // }

  useEffect(()=>{
    if(cookie.location){
      if(Object.keys(localResults).length !==0 && localResults){
        localResults.map(item => {
          for(let i = 0 ; i < item.locations.length; i++){
            const distance = Math.sqrt( Math.pow(item.locations[i].lat*CONSTANT_LATITUDE-cookie.lat*CONSTANT_LATITUDE,2) + Math.pow(item.locations[i].lng*CONSTANT_LONGTITUDE-cookie.lng*CONSTANT_LONGTITUDE,2) )
            setSortedData(prev => {
              let arr = [...prev,{
                title_tr:item.title_tr,
                title_en:item.title_en,
                expertise_tr:item.expertise_tr,
                expertise_en:item.expertise_en,
                name:item.name,
                surname:item.surname,
                expertise:item.expertise,
                id:item.objectID,
                distance:distance,
                lat:item.locations[i].lat,
                lng:item.locations[i].lng
              }]
              arr.sort((a,b)=>(a.distance < b.distance) ? 1 : -1)
              return arr;
            })
            
          }
        })
       }
      }else{
      if(localResults && Object.keys(localResults).length !==0){
        console.log("executed")
        localResults.map(item => {
          for(let i = 0 ; i < item.locations.length; i++){
            const distance = Math.sqrt( Math.pow(item.locations[i].lat*CONSTANT_LATITUDE-localData.lat*CONSTANT_LATITUDE,2) + Math.pow(item.locations[i].lng*CONSTANT_LONGTITUDE-localData.lng*CONSTANT_LONGTITUDE,2) )
            setSortedData(prev => {
              let arr = [...prev,{
                title_tr:item.title_tr,
                title_en:item.title_en,
                expertise_tr:item.expertise_tr,
                expertise_en:item.expertise_en,
                name:item.name,
                surname:item.surname,
                expertise:item.expertise,
                id:item.objectID,
                distance:distance,
                lat:item.locations[i].lat,
                lng:item.locations[i].lng
              }]
              arr.sort((a,b)=>(a.distance < b.distance) ? 1 : -1)
              return arr;
            })
            
          }
        })
       }
    }
     
  },[CONSTANT_LONGTITUDE, cookie.lat, cookie.lng, cookie.location, localData, localResults])

  

  const center = useMemo(()=>{
    if(Object.keys(localData).length !== 0){
      return {lat:localData.lat,lng:localData.lng}
    }else{
      return {lat:35,lng:33}
    }
  },[localData])

  const handleUserStartSearch = () => {
    setUserClicked(true);
    if(sortedData.length!==0){
      let length = sortedData.length
      if(counter === length){
        setCounter(0);
      }
      setInduvidualLocation({lat:sortedData[counter].lat,lng:sortedData[counter].lng})
      setCounter(prev=> prev + 1);
      
    }
  }

  const handleDetails = (data)=>{
    setShowDetails(true);
    setDetailsPanel(data);
    
  }

  console.log(detailsPanel)

  console.log(sortedData[0])

  if(isLoaded){
    return  Object.keys(localData).length !==0 ? <IntlProvider locale={language} messages={message[language]} > <div className={classes.search_container} >
    <div>
    <button className={pageClasses.button_class} disabled={userClicked} onClick={()=>handleUserStartSearch()} > <FormattedMessage id="find_closest" defaultMessage="Default" values={{language}} />  </button>
    <button className={pageClasses.button_class} disabled={!userClicked} onClick={()=>handleUserStartSearch()}> <FormattedMessage id="find_next" defaultMessage="Default" values={{language}} /></button>
    </div>
    <div>
      {showDetails ? <div className={searchClasses.card_container}>
                  <h3> <FormattedMessage id="details" defaultMessage="Default" values={{language}} /> </h3> 
                 <div>
                    <div>
                    <p className={searchClasses.profile_explanation} > {language==="tr" ? detailsPanel.title_tr : detailsPanel.title_en } {detailsPanel.name + " " + detailsPanel.surname} </p>
                    <p className={searchClasses.profile_explanation} > {language==="tr" ? detailsPanel.expertise_tr : detailsPanel.expertise_en } </p>
                    <p className={searchClasses.profile_explanation} >Distance: {detailsPanel.distance.toFixed(3)} KM</p>
                    <button className={searchClasses.button_class} onClick={()=>handleRouting(detailsPanel.id)} > <FormattedMessage id="visit_page" defaultMessage="Default" values={{language}} /> </button>
                    
                    </div>  
            </div>     
              </div> :""}
    </div>
    
  <GoogleMap zoom={12} center={ !userClicked ? center : {lat:induvidualLocation.lat,lng:induvidualLocation.lng}} mapContainerClassName={classes.search_map_container} onClick={(e)=>handleLocation(e)}>
    <MarkerF  position={center} />
    {sortedData.length !== 0 && sortedData.map(item => <MarkerF onClick={()=>handleDetails(item)} key={item.distance} icon={{url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"}} position={{lat:item.lat,lng:item.lng}} />
      )}
  </GoogleMap>
</div> </IntlProvider> : <div>
      <GoogleMap zoom={10} center={{lat:0,lng:0}} mapContainerClassName={classes.search_map_container} onClick={(e)=>handleLocation(e)}>
        <MarkerF position={{lat:0,lng:0}} />
      </GoogleMap>
    </div>

  }else{
    return <div style={{height:"100dvh"}} >
    {language==="en" ? "Loading":"Yükleniyor"}
  </div>
   }
}