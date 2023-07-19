/* eslint-disable */
import {useState,useEffect} from 'react'
import {useAuth,storage,db} from '../firebase/firebase';
import{doc,setDoc} from 'firebase/firestore'
import { getDownloadURL,ref,uploadBytes } from '@firebase/storage';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from "react-redux";
import { IntlProvider, FormattedMessage } from 'react-intl';
import {message} from '../data/langData';
import Link from 'next/link'
import classes from '../styles/patientProfile.module.css';
import StarRating from '../components/StarRating';
import { expertiseData } from '../data/expertiseData';


const PatientProfile = () =>{
    const currentUser = useAuth();
    const router = useRouter();

    const [imgSrc,setImgSrc] = useState("");
    const [showEditTitle,setShowEditTitle] = useState(false);
    const [showEditExpertise,setShowEditExpertise] = useState(false);


    const doctorData =useSelector(state => state.userData.data);
    const language = useSelector(state => state.theme.language)

    useEffect(()=>{
        if(currentUser){
            getDownloadURL(ref(storage,`PersonImages/${currentUser.uid}.jpg`)).then(url =>{
                setImgSrc(url)
            }).catch(err => console.log(err))
        }
    },[currentUser])

    console.log(imgSrc)

    const uploadFile =async (e) => {
        e.preventDefault();
          if(imgSrc==null){
            dispatch(setLoading(false))
            return;
          } 
          const imageRef = ref(storage, `PersonImages/${currentUser.uid}.jpg`);
          await uploadBytes(imageRef,imgSrc).then(snapshot => {
              getDownloadURL(snapshot.ref).then( url => {
                  setImgSrc(url)
              })
          })
          // dispatch(setLoading(false))
      }
      console.log(doctorData)
      const handleTitle = async (e) => {
        let title_tr="";
        let title_en="";
        if(language === "tr"){
          let arr = e.target.value.split(",")
          title_tr = arr[0];
          title_en = arr[1];
        }else{
          let arr = e.target.value.split(",")
            title_en = arr[0];
            title_tr = arr[1];
        }

        const docRef = doc(db,"Doctors",currentUser.uid);
        await setDoc(docRef,{...doctorData,title_en:title_en,title_tr:title_tr});
        window.location.reload();
      }

      const handleExpertise =  async(e) => {
        const arr = e.target.value.split(",")
        console.log(arr)
        const expertise_tr = arr[0];
        const expertise_en = arr [1];

        const docRef = doc(db,"Doctors",currentUser.uid);
        await setDoc(docRef,{
            ...doctorData,
            expertise_en:expertise_en,
            expertise_tr:expertise_tr
        })
        window.location.reload();
      }

      const handleEditPhoneNumber = async e => {
        const phoneNumber = prompt(language === "tr" ? "Lütfen Telefon Numaranızı Giriniz" : "Please Enter Your Phone Number","");
        
        const docRef = doc(db,"Doctors",currentUser.uid);
        await setDoc(docRef,{
            ...doctorData,
            phone_number:phoneNumber
        })

        window.location.reload();
      }

    return <IntlProvider locale={language} messages={message[language]} >
        {Object.keys(doctorData).length!==0 ? <div style={{display:"flex"}} >
        <div className={classes.user_settings} >
            <div className={classes.user_summary_container} >
                {imgSrc.length!==0 ? 
                // eslint-disable-next-line @next/next/no-img-element
                <img className={classes.profile_pic} width={50} height={50} src={imgSrc} alt="" />
                :<i className={classes.person_icon + " "+'fa fa-user'} ></i>}
                <p className={classes.username} > {doctorData.name + " " + doctorData.surname} </p>
            </div>
            <div style={{display:'flex',flexDirection:"column",width:"100%",padding:"25px",height:"100vh"}} >
            <Link className={classes.button_class} href={"/doctor-edit-profile"}> <FormattedMessage defaultMessage="Default" id="user_profile_edit_button" values={{language}} /></Link>
            <Link className={classes.button_class} href="/doctor-insurance" > <FormattedMessage id="doctor_insurance_link" defaultMessage="Default" values={{language}} /> </Link>
            <Link className={classes.button_class} href="/doctor-schedule" > <FormattedMessage id="doctor_appointments" defaultMessage="Default" values={{language}} /> </Link> 
            <Link className={classes.button_class} href="/testimonials-for-doctor" > <FormattedMessage id="testimonials_for_doctor" defaultMessage="Default" values={{language}} /> </Link> 
            </div>
        </div>
    <div style={{width:"30%"}} >
        {currentUser===null || currentUser===undefined ? <div> Loading </div> :<div>
        {Object.keys(doctorData).length ===0 ? "Loading":
        <>
        <div >
        <div style={{height:"150vh"}} className={classes.card} >
        <div className={classes.card_container}>
        <div className={classes.profile_container} >
        <p> <span className={classes._area} ><FormattedMessage id="user_profile_doctor_title" defaultMessage="Default" values={{language}} />: </span> {showEditTitle ?<select className={classes.selectdropdown} name="title" id="title" onChange={e => handleTitle(e)} >
        {language==="tr" ? 
        <>
        <option value={["Pratisyen Hekim","General Practitioner"]}>
          Pratisyen Hekim
        </option>
        <option value={["Uzman Dr.","Specialist"]} >
          Uzman Dr.
        </option>
        <option value={["Operatör Dr.","Operator Dr."]} >
          Operatör Dr.
        </option>
        <option value={["Yardımcı Doçent Dr.","Assistant Professor Dr."]} >
          Yardımcı Doçent Dr.
        </option>
        <option value={["Doçent Dr.","Associate Professor Dr."]} >
          Doçent Dr.
        </option>
        <option value={["Profesör Dr.","Professor Dr."]} >
          Profesör Dr.
        </option>
        </>
        :
        <>
        <option value={["General Practitioner","Pratisyen Hekim"]} >
          General Practitioner
        </option>
        <option value={["Specialist","Uzman Dr."]} >
        Specialist
        </option>
        <option value={["Operator Dr.","Operatör Dr."]}>
        Operator Dr.
        </option>
        <option value={["Assistant Professor Dr.","Yardımcı Doçent Dr."]} >
        Assistant Professor Dr.
        </option>
        <option value={["Associate Professor Dr.","Doçent Dr."]} >
        Associate Professor Dr.
        </option>
        <option value={["Professor Dr.","Profesör Dr."]} >
          Professor Dr.
        </option>
        </>
        }  
        </select> : language ==="tr" ? doctorData.title_tr : doctorData.title_en}  <i onClick={()=>setShowEditTitle(prev => !prev)} style={{cursor:"pointer"}} className="fa-solid fa-pen-to-square"></i> </p> 
        <p> <span className={classes._area} ><FormattedMessage id="user_profile_user_fullname" defaultMessage="Default" values={{language}} />: </span>  {doctorData.name + " " + doctorData.surname}</p> 
        <p> <span className={classes._area} ><FormattedMessage id="user_profile_doctor_expertise" defaultMessage="Default" values={{language}} />: </span> {showEditExpertise ? <select className={classes.selectdropdown_expertise} onChange={ e => handleExpertise(e)} name="expertise" id="expertise">
          {expertiseData.map(item => {
            return <>
              <option key={item} value={item}> {language==="tr" ? item[0] : item[1]} </option>
            </>
          })}
        </select>: language ==="tr" ? doctorData.expertise_tr : doctorData.expertise_en}  <i style={{cursor:"pointer"}} onClick={()=>setShowEditExpertise(prev =>!prev)} className="fa-solid fa-pen-to-square"></i> </p> 
        <p> <span className={classes._area} ><FormattedMessage id="user_profile_user_phone_number" defaultMessage="Default" values={{language}} />: </span>{doctorData.phone_number} <i style={{cursor:"pointer"}} onClick={(e) => handleEditPhoneNumber(e)} className="fa-solid fa-pen-to-square"></i></p>
        <p> <span className={classes._area} ><FormattedMessage id="user_profile_user_email" defaultMessage="Default" values={{language}} />:</span>{currentUser.email} </p>
        <p> <span className={classes._area} ><FormattedMessage id="doctor_rating" defaultMessage="Default" values={{language}} />: </span><StarRating rating={doctorData.rating} /> </p>
        <p> <span className={classes._area} ><FormattedMessage id="user_profile_user_status" defaultMessage="Default" values={{language}} />:</span>  {doctorData.verified 
        ? <FormattedMessage id="user_verified_positive" defaultMessage="Default" values={{language}} />
         :<FormattedMessage id="user_verified_negative" defaultMessage="Default" values={{language}} />} </p>
        <p className={classes._area_red} > {!doctorData.verified ?<FormattedMessage id="user_verification_instruction" defaultMessage="Default" values={{language}} /> : ""}</p>
        <p> <span className={classes._area} ><FormattedMessage id="doctor_insurance" defaultMessage="Default" values={{language}} />:</span>{doctorData.insurance.map(e => " " + e + ", ")}</p>
        
        </div>
        </div>
       </div>
        </div>
       
        </>
        }
        </div> }
    </div>
    <div style={{marginLeft:"25px",display:"flex",flexDirection:"column",alignItems:"center"}} >
    {imgSrc.length!==0 ? 
    // eslint-disable-next-line @next/next/no-img-element
    <img height={350} width={350} className={classes.profile_pic_big} src={imgSrc} alt="" />
        :    <i className={classes.profile_pic_big + " " + classes.person_icon_big  +" " + " "+'fa fa-user'} ></i>
    }
    <label className={classes.button_class} htmlFor="file-upload">
      <input
      id='file-upload'
      style={{display: 'none'}}
      
            type="file"
            onChange={event => {
                setImgSrc(event.target.files[0]);
            }}
        />
        {language ==="en" ? "Change Profile Picture" : "Profile Resmini Değiştir"}
      </label>
      <button className={classes.button_class} onClick={(e)=>uploadFile(e)} > Confirm </button>
    </div>
    </div> : <div style={{display:"flex","justifyContent":"center",alignItems:"center",height:"100vh",width:"100wv",color:"black",background:"black"}} > 
    <svg className={classes.filter_black} width="58%" height="25%" color='black' viewBox="0 0 58 58" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" fill-rule="evenodd">
        <g transform="translate(2 1)" stroke="#FFF" stroke-width="1.5">
            <circle cx="42.601" cy="11.462" r="5" fill-opacity="1" fill="#fff">
                <animate attributeName="fill-opacity"
                     begin="0s" dur="1.3s"
                     values="1;0;0;0;0;0;0;0" calcMode="linear"
                     repeatCount="indefinite" />
            </circle>
            <circle cx="49.063" cy="27.063" r="5" fill-opacity="0" fill="#fff">
                <animate attributeName="fill-opacity"
                     begin="0s" dur="1.3s"
                     values="0;1;0;0;0;0;0;0" calcMode="linear"
                     repeatCount="indefinite" />
            </circle>
            <circle cx="42.601" cy="42.663" r="5" fill-opacity="0" fill="#fff">
                <animate attributeName="fill-opacity"
                     begin="0s" dur="1.3s"
                     values="0;0;1;0;0;0;0;0" calcMode="linear"
                     repeatCount="indefinite" />
            </circle>
            <circle cx="27" cy="49.125" r="5" fill-opacity="0" fill="#fff">
                <animate attributeName="fill-opacity"
                     begin="0s" dur="1.3s"
                     values="0;0;0;1;0;0;0;0" calcMode="linear"
                     repeatCount="indefinite" />
            </circle>
            <circle cx="11.399" cy="42.663" r="5" fill-opacity="0" fill="#fff">
                <animate attributeName="fill-opacity"
                     begin="0s" dur="1.3s"
                     values="0;0;0;0;1;0;0;0" calcMode="linear"
                     repeatCount="indefinite" />
            </circle>
            <circle cx="4.938" cy="27.063" r="5" fill-opacity="0" fill="#fff">
                <animate attributeName="fill-opacity"
                     begin="0s" dur="1.3s"
                     values="0;0;0;0;0;1;0;0" calcMode="linear"
                     repeatCount="indefinite" />
            </circle>
            <circle cx="11.399" cy="11.462" r="5" fill-opacity="0" fill="#fff">
                <animate attributeName="fill-opacity"
                     begin="0s" dur="1.3s"
                     values="0;0;0;0;0;0;1;0" calcMode="linear"
                     repeatCount="indefinite" />
            </circle>
            <circle cx="27" cy="5" r="5" fill-opacity="0" fill="#fff">
                <animate attributeName="fill-opacity"
                     begin="0s" dur="1.3s"
                     values="0;0;0;0;0;0;0;1" calcMode="linear"
                     repeatCount="indefinite" />
            </circle>
        </g>
    </g>
</svg>
        </div>}
    </IntlProvider>
}

export default PatientProfile;