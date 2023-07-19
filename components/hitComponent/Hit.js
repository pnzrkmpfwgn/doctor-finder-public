/* eslint-disable */
import { useEffect,useState } from "react";
import { useSelector } from "react-redux";
import { connectHits } from 'react-instantsearch-dom';
import classes from '../../styles/hitStyles.module.css'
import {motion,AnimatePresence} from 'framer-motion';
import {useCookies} from 'react-cookie';
import {useRouter} from 'next/router'
import StarRating from "../StarRating";
import { IntlProvider,FormattedMessage } from "react-intl";
import {message} from '../../data/langData';


const Distance = ({location,doctorLocation}) => {
    const [distance,setDistance] = useState(0);

    const CONSTANT_LATITUDE = 111.32; //km
    const CONSTANT_LONGTITUDE = 40075*Math.cos(CONSTANT_LATITUDE)/360
    useEffect(()=>{
        const distance = Math.sqrt( Math.pow(location.lat*CONSTANT_LATITUDE-doctorLocation.lat*CONSTANT_LATITUDE,2) + Math.pow(location.lng*CONSTANT_LONGTITUDE-doctorLocation.lng*CONSTANT_LONGTITUDE,2) ).toFixed(2)
        setDistance(distance)
    },[])
    return <> {distance} </>
}

const Hit = ({hits}) => {
    
    const language = useSelector(state => state.theme.language)
    const [cookie,setCookie] = useCookies(["location"]);
    const [location,setLocation] = useState({});

   

    useEffect(()=>{
        if(typeof window !=="undefined"){
            localStorage.setItem("locationData",JSON.stringify(hits))
        }
    },[hits])
    const router = useRouter();
    const handleDetails = (id) => {
        router.push(`doctor-page/${id}`)
    }

    // console.log(cookie.location)

    useEffect(()=>{
        if(cookie.location){
            setLocation({
                lat:cookie.location.lat,
                lng:cookie.location.lng
            })
        }else{
            console.log("executed")
            const successCallback = (position) => {
                setLocation({
                  lat:position.coords.latitude,
                  lng:position.coords.longitude
                })
              };
              
              const errorCallback = (error) => {
                console.log(error);
              };
            navigator.geolocation.getCurrentPosition(successCallback, errorCallback)
              
        }
    },[cookie.location])


    return <AnimatePresence>
    <IntlProvider locale={language} messages={message[language]} >
        <div
        className={classes.container} >
        {
            hits.map(hit=>(
                <>
                <motion.div
                key={hit.objectID}
                onClick={()=>handleDetails(hit.objectID)}
                initial={{opacity:0,translateY:-100}}
                whileInView={{opacity:1,translateY:0}}
                transition={{duration:0.6,type: "spring", stiffness: 30}}
                viewport={{ once: true, }}
                whileHover={{
                    scale: 1.04,
                    transition: { duration: 0.3 },
                  }}
                  whileTap={{ scale: 0.96 }}
                className={classes.card_hit}>
                <div>
                <div style={{display:"flex",justifyContent:"center",alignContent:"center",}} >
                <i className={"fa fa-user " + classes.person_icon} ></i>
                <div className={classes.card_hit_name}>
                    {language === "tr" ? hit.title_tr : hit.title_en}{ " " + hit.name + " " +  hit.surname}
                    <div className={classes.card_hit_sub}>
                    {language === "tr" ? hit.expertise_tr : hit.expertise_en}
                </div>
                </div>
                </div>

                <section>
                    <div className={classes.card_hit_insurance}>
                        <span style={{"fontWeight":"bold"}} > <FormattedMessage id="hit_page_insurances" defaultMessage="Default" values={{language}} /> : </span>{" " +hit.insurance + " "}
                    </div>
                    <div className={classes.card_hit_insurance}>
                        <span style={{"fontWeight":"bold"}} > <FormattedMessage id="hit_page_distance" defaultMessage="Default" values={{language}} />: {Object.keys(location).length!==0 ? <Distance location={location} doctorLocation={hit.locations[0]} />  : <FormattedMessage id="location_warning" defaultMessage="Default" values={{language}} />}</span>{" "  + " KM"}
                    </div>
                    <div className={classes.card_hit_numeric}>
                    <StarRating rating={hit.rating} />
                    </div>
                    <section>
                        {/* <Link href={`doctor-page/${hit.objectID}`} >Details</Link> */}
                    </section>
        
                </section>
                </div>
                <i className={"fa-solid fa-chevron-right " + classes.link} ></i>
            </motion.div>
            </>
            ))
        }
    </div>
    </IntlProvider>
    </AnimatePresence>
}
const CustomHits = connectHits(Hit);

export default CustomHits;