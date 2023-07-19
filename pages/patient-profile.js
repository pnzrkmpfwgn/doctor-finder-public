/* eslint-disable */
import {useState,useEffect} from 'react'
import {useAuth,storage} from '../firebase/firebase';
import { getDownloadURL,ref,uploadBytes } from '@firebase/storage';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from "react-redux";
import { IntlProvider, FormattedMessage } from 'react-intl';
import {message} from '../data/langData';
import Link from 'next/link'
import classes from '../styles/patientProfile.module.css';


const PatientProfile = () =>{
    const currentUser = useAuth();
    const router = useRouter();

    const [imgSrc,setImgSrc] = useState("");

    const patientData =useSelector(state => state.userData.data);
    const language = useSelector(state => state.theme.language)

    useEffect(()=>{
        if(currentUser){
            getDownloadURL(ref(storage,`PersonImages/${currentUser.uid}.jpg`)).then(url =>{
                setImgSrc(url)
            }).catch(err => console.log(err))
        }
    },[currentUser])

    const uploadFile = async (e) => {
        e.preventDefault();
          if(imgSrc==null){
            dispatch(setLoading(false))
            return;
          } 
          const imageRef = ref(storage, `PersoneImages/${currentUser.uid}.jpg`);
          await uploadBytes(imageRef,imgSrc).then(snapshot => {
              getDownloadURL(snapshot.ref).then( url => {
                  setImgSrc(url)
              })
          })
          // dispatch(setLoading(false))
      }

    return <IntlProvider locale={language} messages={message[language]} >
        {Object.keys(patientData).length!==0 ? <div style={{display:"flex"}} >
        <div className={classes.user_settings} >
            <div className={classes.user_summary_container} >
                {imgSrc.length!==0 ? 
                // eslint-disable-next-line @next/next/no-img-element
                <img className={classes.profile_pic} width={50} height={50} src={imgSrc} alt="" />
                :<i className={classes.person_icon + " "+'fa fa-user'} ></i>}
                <p className={classes.username} > {patientData.name + " " + patientData.surname} </p>
            </div>
            <div style={{display:'flex',flexDirection:"column",width:"100%",padding:"25px",height:"100vh"}} >
            <Link className={classes.button_class} href={"/patient-edit-profile"}> <FormattedMessage defaultMessage="Default" id="user_profile_edit_button" values={{language}} /></Link>
            <Link className={classes.button_class} href="/patient-insurance" > <FormattedMessage id="patient_insurance_link" defaultMessage="Default" values={{language}} /> </Link>
            <Link className={classes.button_class} href="/patient-schedule" > <FormattedMessage id="patient_appointments" defaultMessage="Default" values={{language}} /> </Link> 
            </div>
        </div>
    <div style={{width:"30%"}} >
        {currentUser===null || currentUser===undefined ? <div> Loading </div> :<div>
        {Object.keys(patientData).length ===0 ? "Loading":
        <>
        <div >
        <div style={{height:"150vh"}} className={classes.card} >
        <div className={classes.card_container}>
        <div className={classes.profile_container} >
        <p> <span className={classes._area} ><FormattedMessage id="user_profile_user_fullname" defaultMessage="Default" values={{language}} />:</span>  {patientData.name + " " + patientData.surname}</p> 
        <p> <span className={classes._area} ><FormattedMessage id="user_profile_user_phone_number" defaultMessage="Default" values={{language}} />:</span>{patientData.phone_number} </p>
        <p> <span className={classes._area} ><FormattedMessage id="user_profile_user_status" defaultMessage="Default" values={{language}} />:</span>  {patientData.verified 
        ? <FormattedMessage id="user_verified_positive" defaultMessage="Default" values={{language}} />
         :<FormattedMessage id="user_verified_negative" defaultMessage="Default" values={{language}} />} </p>
        <p className={classes._area_red} > {!patientData.verified ?<FormattedMessage id="user_verification_instruction" defaultMessage="Default" values={{language}} /> : ""}</p>
        <p> <span className={classes._area} ><FormattedMessage id="patient_insurance" defaultMessage="Default" values={{language}} />:</span>{patientData.insurance.map(e => " " + e + ", ")}</p>
        
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
      <button className={classes.button_class} onClick={(e)=>uploadFile(e)} > <FormattedMessage id="confirm" defaultMessage="Default" values={{language}} /> </button>
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