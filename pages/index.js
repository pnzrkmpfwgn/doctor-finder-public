/* eslint-disable */
import CustomHits from '../components/hitComponent/Hit';
import algoliasearch from 'algoliasearch'
import { InstantSearch,Hits,SortBy,RefinementList,Panel,Menu,Configure,Highlight } from "react-instantsearch-dom";
import {useAuth} from '../firebase/firebase';
import { useEffect,useState } from "react";
import { useDispatch,useSelector } from "react-redux";
import {setLocationData} from "../redux/user_location";
import { useRouter } from "next/router";
import { delay } from "../utils/hooks";
import classes from '../styles/mainMenu.module.css';
import input_classes from '../styles/customSearcbar.module.css';
import { connectSearchBox } from "react-instantsearch-dom";
import { AnimatePresence,motion } from "framer-motion";

import { IntlProvider,FormattedMessage } from "react-intl";
import {message} from '../data/langData';


const SearchBox = ({ currentRefinement, isSearchStalled, refine }) => {
  const language = useSelector(state => state.theme.language)
  const [showInsurance,setShowInsurance] = useState(false);
  const [showExpertise,setShowExpertise] = useState(false);
  const [showCity,setShowCity] = useState(false);
  const [showTitle,setShowTitle] = useState(false);
  const [showRating,setShowRating] = useState(false);
  const router = useRouter();
  const handleLocationSearch = (e) => {
    e.preventDefault();
    // localStorage.clear()
    delay(500)
    // const unique = [];
    // for (const item of locations) {
    //   const isDuplicate = unique.find((obj) => obj.objectID === item.objectID);
    //   if (!isDuplicate) {
    //     unique.push(item);
    //   }
    // }

    // localStorage.setItem("locationData",JSON.stringify(unique))
    delay(1000)
    // console.log(sessionStorage.getItem("locationData"))
    router.push("/search-by-location")
  }


 return <IntlProvider locale={language} messages={message[language]} ><form className={input_classes.form_wrapper}>
    <p style={{fontSize:"20px",fontWeight:"bold"}} ><FormattedMessage id="without_preset" defaultMessage="Default" values={{language}} /></p>
    <input
      type="search"
      style={{width:"60%"}}
      value={currentRefinement}
      onChange={event => refine(event.currentTarget.value)}
      className={input_classes.userpass}
    />
    <button className={input_classes.btnblack} type="submit" value="Search" onClick={(e) => e.preventDefault()}  ><i className="fa fa-search" ></i></button>
    <button className={input_classes.btnblack} onClick={(e)=>handleLocationSearch(e)} > <FormattedMessage id="find_closest" defaultMessage="Default" values={{language}} /> </button>
    <SortBy
        defaultRefinement={"Doctors"}
        currentRefinement={"Doctors"}
             items={[
               { value: 'Doctors', label: language==="en" ? 'Featured': "Yayında" },
               { value: 'Doctors_rating_desc', label: language==="en" ? 'Rating ordered by descending': "Büyükten Küçüğe doğru reyting"},
               { value: 'Doctors_rating_asc', label: language==="en" ? 'Rating ordered by ascending':"Küçükten büyüğe doğru reyting"},
               { value: 'Doctors_expertise_desc', label: language==="en" ? 'Expertise ordered by descending':"Büyükten küçüğe doğru uzmanlık alanı"},
               { value: 'Doctors_expertise_asc', label: language==="en" ? 'Expertise ordered by ascending':"Küçükten büyüğe doğru uzmanlık alanı"},
            ]}
        />
      
        <div className={classes.column}>
      
        <div className={classes.refinement_container}>
      <div onClick={() => {
        setShowInsurance(prev => !prev)
        setShowCity(false)
        setShowExpertise(false)
        setShowTitle(false)
        setShowRating(false)
      }} style={{display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}} ><p className={classes.refinement_container_heading}  style={{cursor:"pointer"}} ><FormattedMessage id="insurance" defaultMessage="Default" values={{language}} /> </p> <span style={{marginRight:"25px"}} > {showInsurance ? <i className="fa fa-chevron-down" ></i> : <i className="fa fa-chevron-right" ></i>} </span> 
      </div>
    <div className={ showInsurance ? classes.refinement_item_active : classes.refinement_item_deactive}><RefinementList attribute="insurance" /></div>
    </div>
    
    <div className={classes.refinement_container}>
      <div onClick={() => {
        setShowInsurance(false)
        setShowCity(prev => !prev)
        setShowExpertise(false)
        setShowTitle(false)
        setShowRating(false)

      }} style={{display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}} ><p className={classes.refinement_container_heading}  style={{cursor:"pointer"}} ><FormattedMessage id="city" defaultMessage="Default" values={{language}} /> </p> <span style={{marginRight:"25px"}} > {showCity ? <i className="fa fa-chevron-down" ></i> : <i className="fa fa-chevron-right" ></i>} </span> </div>
    <div className={showCity ? classes.refinement_item_active : classes.refinement_item_deactive }  ><RefinementList attribute="city" /></div>
    </div>

        <div className={classes.refinement_container}>
      <div onClick={() => {
        setShowInsurance(false)
        setShowCity(false)
        setShowExpertise(prev => !prev)
        setShowTitle(false)
        setShowRating(false)

      }} style={{display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}} ><p className={classes.refinement_container_heading}  style={{cursor:"pointer"}} ><FormattedMessage id="expertise" defaultMessage="Default" values={{language}} /> </p> <span style={{marginRight:"25px"}} > {showExpertise ? <i className="fa fa-chevron-down" ></i> : <i className="fa fa-chevron-right" ></i>} </span> </div>
     <div className={showExpertise ? classes.refinement_item_active : classes.refinement_item_deactive}  >{language ==="tr" ? <RefinementList attribute="expertise_tr" /> : <RefinementList attribute="expertise_en" />}</div>
    </div>

    <div className={classes.refinement_container}>
      <div onClick={() => {
        setShowTitle(prev => !prev)
        setShowInsurance(false)
        setShowCity(false)
        setShowExpertise(false)
        setShowRating(false)

      }} style={{display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}} ><p className={classes.refinement_container_heading}  style={{cursor:"pointer"}} ><FormattedMessage id="title_" defaultMessage="Default" values={{language}} /> </p> <span style={{marginRight:"25px"}} > {showTitle ? <i className="fa fa-chevron-down" ></i> : <i className="fa fa-chevron-right" ></i>} </span> </div>
     <div className={showTitle ? classes.refinement_item_active : classes.refinement_item_deactive}  > {language ==="tr" ? <RefinementList attribute="title_tr" /> : <RefinementList attribute="title_en" />}</div>
    </div>

    <div className={classes.refinement_container}>
      <div onClick={() => {
        setShowRating(prev => !prev)
        setShowInsurance(false)
        setShowCity(false)
        setShowExpertise(false)
        setShowTitle(false)

      }} style={{display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}} ><p className={classes.refinement_container_heading}  style={{cursor:"pointer"}} ><FormattedMessage id="rating" defaultMessage="Default" values={{language}} /> </p> <span style={{marginRight:"25px"}} > {showRating ? <i className="fa fa-chevron-down" ></i> : <i className="fa fa-chevron-right" ></i>} </span> </div>
     <div className={showRating ? classes.refinement_item_active : classes.refinement_item_deactive}
       
        > {language ==="tr" ? <RefinementList attribute="rating" /> : <RefinementList attribute="title_en" />}</div>
    </div>
        </div>
  </form>
  </IntlProvider>
}

const CustomSearchBox = connectSearchBox(SearchBox);


// const RefinementList = ({
//   items,
//   isFromSearch,
//   refine,
//   searchForItems,
//   createURL,
// }) => (
//   <ul>
//     <li>
//       <input
//         type="search"
//         onChange={event => searchForItems(event.currentTarget.value)}
//       />
//     </li>
//     {items.map(item => (
//       <li key={item.label}>
//         <a
//           href={createURL(item.value)}
//           style={{ fontWeight: item.isRefined ? 'bold' : '' }}
//           onClick={event => {
//             event.preventDefault();
//             refine(item.value);
//           }}
//         >
//           {isFromSearch ? (
//             <Highlight attribute="label" hit={item} />
//           ) : (
//             item.label
//           )}{' '}
//           ({item.count})
//         </a>
//       </li>
//     ))}
//   </ul>
// );

// const RefinementList = connectRefinementList(RefinementList);


export default function Home() {
  const currentUser = useAuth();
  const dispatch = useDispatch();
  const locations = useSelector(state => state.results.data);
  const router = useRouter();
  const language = useSelector(state => state.theme.language);

  console.log(currentUser ? currentUser.uid:"")

  //Local States
const [recordFound,setRecordFound] = useState(false); 

//Legacy Local States
  //const [searchTerm,setSearchTerm] = useState("");
  //const [data,setData] = useState(null)

  useEffect(()=>{
    if(typeof window!=="undefined"){
      console.log(localStorage.getItem("locationData"))
    }
  },[])

  useEffect(()=>{
    const successCallback = (position) => {
      // console.log(position);
    };
    
    const errorCallback = (error) => {
      console.log(error);
    };
    dispatch(setLocationData(navigator.geolocation.getCurrentPosition(successCallback, errorCallback)))
  },[dispatch])


  //Algolia settings
  const searchClient = algoliasearch(process.env.ALGOLIA_PROJECT_ID,process.env.ALGOLIA_API_KEY);

  //LEGACY search function
  // const handleSearch = () =>{
  //   setData(search(searchTerm))
  // }
  // console.log(data)
  // console.log(location)
  
  

  const handleLocationSearch = () => {
    localStorage.clear()
    delay(500)
    const unique = [];
    for (const item of locations) {
      const isDuplicate = unique.find((obj) => obj.objectID === item.objectID);
      if (!isDuplicate) {
        unique.push(item);
      }
    }

    // console.log(unique)
    localStorage.setItem("locationData",JSON.stringify(unique))
    delay(1000)
    // console.log(sessionStorage.getItem("locationData"))
    router.push("/search-by-location")
  }

  return (
    <>
    <IntlProvider locale={language} messages={message[language]} >
       {/* eslint-disable-next-line @next/next/no-img-element */}
       <img
            src={"/background.jpg"}
            alt='slides'
            className={classes.slides}
          />
    <div className={classes.main_container} >
    
      <AnimatePresence>
        <motion.div className={classes.Heading} 
        initial={{ opacity: 0, translateX: -100 }}
        animate={{ opacity: 1, translateX: 0 }}
        transition={{ duration: 0.5 }}
        >
          <h1><FormattedMessage id="welcome" defaultMessage="Default" values={{language}} /> </h1>
        </motion.div>
        <div className={classes.explanation_container} >
        <motion.div 
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className={classes.explanation}>
        <i className="fa fa-search" ></i>
        <p> <FormattedMessage id="tut_1" defaultMessage="Default" values={{language}} /> </p>
        </motion.div>
        <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5,delay:1.5 }}
        className={classes.explanation} >
        <i class="fa-solid fa-users-viewfinder"></i>
          <p> <FormattedMessage id="tut_2" defaultMessage="Default" values={{language}} /> </p>
        </motion.div>
        <motion.div
        className={classes.explanation}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5,delay:2.5 }} >
          <i className="fa-regular fa-calendar-check" ></i>
          <p><FormattedMessage id="tut_3" defaultMessage="Default" values={{language}} />  </p>
        </motion.div>
        </div>
      </AnimatePresence>
    {/* {currentUser ? <Link href="/chat-page" > Get Help by Support Agent </Link> : "" } */}
     <div>
      {/* <p><FormattedMessage id="heading_main_menu" defaultMessage="Default" values={{locale}} /></p> */}
      {/* {userData ? userData.role ==="patient" ? <Link href="/patient-profile" > 
        <FormattedMessage id="user_main_menu_profile_link"  defaultMessage="Default" values={{locale}} /> 
        </Link> : userData.role==="doctor" ? <Link href="/doctor-profile" > 
        <FormattedMessage id="user_main_menu_profile_link"  defaultMessage="Default" values={{locale}} /> 
        </Link>: "" : ""} */}
     </div>
     
      <motion.div 
      
       className={classes.main_body} >
        <InstantSearch searchClient={searchClient} indexName="Doctors" onSearchParameters={(searchState)=>{
          setRecordFound(true)
        }} >

            <motion.div
            initial={{ opacity: 0, scale: 0,translateY:100 }}
            animate={{ opacity: 1, scale: 1,translateY:0 }}
            transition={{ duration: 0.5,delay:.5 }}
            className="site-grid">
            <CustomSearchBox />
            
            {recordFound && <CustomHits hitComponent={Hits} /> }
            </motion.div>
        </InstantSearch>
      </motion.div>
    </div>
    </IntlProvider>
    </>
  )
}

//LEGACY search bar
/* <div style={{"width":"50%","marginLeft":"20px"}} >
    <div className="search-wrapper">
    <label htmlFor="search">Search Doctors</label>
    <input type="search" id="search" onChange={(e)=>setSearchTerm(e.target.value)} />
    <button onClick={()=>handleSearch()} > Search </button>
      </div>
      <div className="user-cards" >Results</div>
      <template  />
    {/* {data ? data.map(item=>{
      return <div key={item.id} className="card">
      {item.expertise}
      <div className="header" >{item.name + " " + item.surname}</div>
      <div className="body" >{item.title}</div>
    </div>
    }) : ""} */

  //</div> */}