/* eslint-disable */
import MapComponent from "../components/map/MapComponent";
import DoctorMapComponent from "../components/map/DoctorMapComponent";
import { useSelector } from "react-redux";

export default function DetermineLocation(){
  const userData = useSelector((state)=> state.userData.data );

  return userData && userData.role==="patient" ? <MapComponent/> : <DoctorMapComponent/>
}