/* eslint-disable */
import {signUpAsDoctor,signUpAsPatient ,useAuth,auth,db} from '../firebase/firebase';
import { useRef,useState } from 'react';
import { useSelector, useDispatch } from "react-redux";
import {setLoading} from '../redux/authentication';
import { IntlProvider,FormattedMessage } from "react-intl";
import {message} from '../data/langData';
import { useRouter} from 'next/router';
import classes from '../styles/signUp.module.css';
import {createUserWithEmailAndPassword,sendEmailVerification,} from "firebase/auth";
import {setDoc,doc,} from "firebase/firestore";
import { keywords_tr } from '../data/keywordData';
import { keywords_en } from '../data/keywordData';
import { expertiseData } from '../data/expertiseData';
import { useEffect } from 'react';

export default function SignUp(){
  
    const loading = useSelector(state => state.auth.loading);
    const language = useSelector(state => state.theme.language);
    const [gender, setGender] = useState("male");
    const [nationality, setNationality] = useState("tc")
    const [show,setShow] = useState("patient");
    const [dob, setDob] = useState("");
    const [error,setError] = useState("");
    const [expertise_tr,setExpertiseTr] = useState("");
    const [expertise_en,setExpertiseEn] = useState("");
    const [title_tr,setTitleTr] = useState("");
    const [title_en,setTitleEn] = useState("");
    const dispatch = useDispatch();
    const router = useRouter();


    const emailRef = useRef();
    const passwordRef = useRef();
    const nameRef = useRef();
    const surnameRef = useRef();
    const card_idRef = useRef();
    const medical_lic_idRef = useRef();
    const phone_numberRef = useRef();
    const date_of_birth_ref = useRef();
    const currentUser = useAuth();

    async function handlePatientSignUp(e){
      e.preventDefault();
        dispatch(setLoading(true))
        if(!card_idRef.current.value || !phone_numberRef.current.value || !nameRef.current.value || !surnameRef.current.value || dob.length ===0){
          setError("*Please Fill in all of the fields!")
          dispatch(setLoading(false))
        }else{
          const user = createUserWithEmailAndPassword(auth,emailRef.current.value,passwordRef.current.value).catch(err => {
            const str = JSON.stringify(err)
            if(str.includes("already-in-use")){
              setError("*This email is already in use.")
            }else if(str.includes("invalid-email")){
              setError("*This email is not valid please use a valid email.")
            }else if(str.includes("weak-password")){
              setError("*Password is not strong please use a stronger password")
            }else{
              setError("*Unexpected error please try again and fill all the blanks correctly")
            }
            dispatch(setLoading(false))
            return err
          }).then( async (cred) => {
            if(cred.user){
              await setDoc(doc(db,"Patients",cred.user.uid),{
                name:nameRef.current.value,
                surname:surnameRef.current.value,
                gender:gender,
                nationality:nationality,
                card_id:card_idRef.current.value,
                phone_number:phone_numberRef.current.value,
                insurance:[],
                role:"patient",
                my_testimonials:[],
                schedule:[],
                verified:false,
                dob:dob
             });
         sendEmailVerification(cred.user);
         router.push("/patient-edit-profile")
          }   
    })
    }
  }

  const handleExpertise = (e) =>{
    let arr = e.target.value.split(",");
      setExpertiseTr(arr[0])
      setExpertiseEn(arr[1])
    // if(language ==="tr"){
    //   let arr = e.target.value.split(",");
    //   setExpertiseTr(arr[0])
    //   setExpertiseEn(arr[1])
    //   console.log(arr)
    // }else{
    //   let arr = e.target.value.split(",");
    //   setExpertiseEn(arr[1])
    //   setExpertiseTr(arr[0])
    //   console.log(arr)
    // }
  }

  const handleTitle = (e) => {
    if(language === "tr"){
      let arr = e.target.value.split(",")
      setTitleTr(arr[0])
      setTitleEn(arr[1])
    }else{
      let arr = e.target.value.split(",")
      
      setTitleEn(arr[0])
      setTitleTr(arr[1])
    }
  }
    async function handleDoctorSignUp(e){
      e.preventDefault();
        dispatch(setLoading(true))
        // console.log(!card_idRef.current.value , !phone_numberRef.current.value , !nameRef.current.value , !surnameRef.current.value  , expertise_tr.length ===0 , !medical_lic_idRef.current.value , title_tr.length===0 , title_en.length===0)
        // console.log(expertise_tr.length)
        if(!card_idRef.current.value || !phone_numberRef.current.value || !nameRef.current.value || !surnameRef.current.value  || expertise_tr.length ===0 || expertise_en.length ===0 || !medical_lic_idRef.current.value || title_tr.length===0 || title_en.length===0){
          setError("*Please Fill in all of the fields!")
          dispatch(setLoading(false))
        }else{
          const user = createUserWithEmailAndPassword(auth,emailRef.current.value,passwordRef.current.value).catch(err=>{
            const str = JSON.stringify(err)
            if(str.includes("already-in-use")){
              setError("*This email is already in use.")
            }else if(str.includes("invalid-email")){
              setError("*This email is not valid please use a valid email.")
            }else if(str.includes("weak-password")){
              setError("*Password is not strong please use a stronger password")
            }else{
              setError("*Unexpected error please try again and fill all the blanks correctly")
            }
            dispatch(setLoading(false))
            return err

          }).then( async (cred) => {
    if(cred.user){
      const keywordsTr= keywords_tr[expertise_tr];
      const keywordsEn = keywords_en[expertise_en];
      console.log(nameRef.current.value,surnameRef.current.value,gender,nationality,card_idRef.current.value,medical_lic_idRef.current.value,expertise_tr,expertise_en,title_en,title_tr,phone_numberRef.current.value,keywordsTr,keywordsEn)
      await setDoc(doc(db,"Doctors",cred.user.uid),{
        name:nameRef.current.value,
        surname:surnameRef.current.value,
        gender:gender,
        nationality:nationality,
        card_id:card_idRef.current.value,
        medical_license_id:medical_lic_idRef.current.value,
        expertise_tr:expertise_tr,
        expertise_en:expertise_en,
        title_en:title_en,
        title_tr:title_tr,
        insurance:[], 
        phone_number:phone_numberRef.current.value,
        role:"doctor",
        city:[],
        verified:false,
        registered:true,
        schedule:[],
        locations:[],
        testimonials:[],
        keywords_tr:keywordsTr,
        keywords_en:keywordsEn,
        rating:0
      });
      sendEmailVerification(cred.user);
      router.push("/doctor-edit-profile")
    }
    
  })
        } 
      }

      // const handleInsurance = () => {
      //   const insurance = insurance_ref.current.value
      //   setInsurance(prev => {
      //     const array = [...prev,insurance]
      //     const uniqueArray = [...new Set(array)]

      //     return uniqueArray
      //   })
      //   insurance_ref.current.value = "";
        
      // }

      const handleShow = (e) => {
        setShow(e);
      }
      

      const handleChange = (e) => {
        setGender(e.target.value);
      };

      const handleDobChange = ()=>{
        setDob(date_of_birth_ref.current.value);
      }

      const handleIdCardChange = (e) => {
        setNationality(e.target.value);
      }
      // console.log( show ? classes.selection_button  + " " +  classes.selected_button : classes.selection_button)
    return <IntlProvider locale={language} messages={message[language]}  >
       <div style={{height:"85vh",display:"flex", "flexDirection":"column" ,"justifyContent":"center","alignItems":"center"}}>
         <div style={{ display:"flex",justifyContent:"center",alignItems:"center",width:"100%"}} >
        <div className={classes.selection_container} >
            <div onClick={()=>handleShow("patient")} className={show==="patient" ?  classes.selection_button  + " " +  classes.selected_button : classes.selection_button } > Register as patient </div>
            <div onClick={()=>handleShow("doctor")} className={show==="doctor" ? classes.selection_button  + " " +  classes.selected_button : classes.selection_button} > Register as doctor </div>
        </div>
        </div>
    {
        show ==="patient" ?
        <div>
    <div className={classes.signupbox} >
    <form id="fields" >
    {<div className={classes.error_section} ><p> {error.length!==0 && error} </p></div>}
    <div className={classes.row}>

    <div className={classes.rowright}>
    <input className={classes.userinput} required ref={emailRef} placeholder='Email' type="email" /> <br /> <br />
    <input className={classes.userinput} required ref={passwordRef} type="password" placeholder='Password' /> <br /> <br />
    
    <select className={classes.selectdropdown} required onChange={handleIdCardChange}>
    <option value="tc" >T.C. Kimlik</option>
    <option value="kktc" >K.K.T.C. Kimlik</option>
    <option value="uk" >British ID Card</option>
    </select>
     <br /> <br />
    <input required className={classes.userinput} ref={card_idRef} placeholder='ID No.' /> <br /> <br /> 
    <input required className={classes.userinput} onChange={()=>handleDobChange()} type='date' ref={date_of_birth_ref} placeholder='Date of Birth' /> <br /> <br /> 
    {/* <input className={classes.userinput} ref={medical_lic_idRef} placeholder='Medical License ID' /> <br /> <br />  */}
    {/* <input className={classes.userinput} ref={expertise_ref} placeholder='Expertise' /> <br /> <br />  */}
    </div>

    <div className={classes.rowleft}>
    <input required className={classes.userinput} ref={nameRef} placeholder='Name' /> <br /> <br />
    <input required className={classes.userinput} ref={surnameRef} placeholder='Surname' /> <br /> <br />
    
    <select className={classes.selectdropdown} required onChange={handleChange}>
    <option value="male" ><FormattedMessage id="sign_up_gender_male" defaultMessage="Default" values={{language}} /></option>
    <option value="female" ><FormattedMessage id="sign_up_gender_female" defaultMessage="Default" values={{language}} /></option>
    <option value="not-specified" ><FormattedMessage id="sign_up_gender_not_specified" defaultMessage="Default" values={{language}} /></option>
    </select>
     <br /> <br />
    {/* <input className={classes.userinput} ref={title_ref} placeholder='Title' /> <br /> <br />  */}
    <input required className={classes.userinput} ref={phone_numberRef} type="tel" placeholder='Phone Number' /> <br /> <br />
    {/* <input className={classes.userinput} ref={insurance_ref} placeholder='Insurance' />  */}
    {/* <button className={classes.btnblack} onClick={handleInsurance} > Add </button><br /> <br /> */}
    </div> 
    </div>
    
    <div className={classes.buddon}>
    <button type='submit' className={classes.btnblack}  onClick={(e)=>handlePatientSignUp(e)}><FormattedMessage id="signup" defaultMessage="Default" values={{language}} /></button>
    </div>
   
    </form> 
    
    </div>
    </div>
        :
         <div>
        <div className={classes.signupbox} >
        <form id="fields" >
        {<div className={classes.error_section} ><p> {error.length!==0 && error} </p></div>}
        <div className={classes.row}>
    
        <div className={classes.rowright}>
        <input className={classes.userinput} ref={emailRef} placeholder='Email' type="email" /> <br /> <br />
        <input className={classes.userinput} ref={passwordRef} type="password" placeholder='Password' /> <br /> <br />
        
        <select className={classes.selectdropdown} onChange={handleIdCardChange}>
        <option value="tc" >T.C. Kimlik</option>
        <option value="kktc" >K.K.T.C. Kimlik</option>
        <option value="uk" >British ID Card</option>
        </select>
        <br /> <br />
        <input className={classes.userinput} ref={card_idRef} placeholder='ID No.' /> <br /> <br /> 
        <input className={classes.userinput} ref={medical_lic_idRef} placeholder='Medical License ID' /> <br /> <br /> 
        <select className={classes.selectdropdown} onChange={ e => handleExpertise(e)} name="expertise" id="expertise">
          {expertiseData.map(item => {
            return <>
              <option key={item} value={item}> {language==="tr" ? item[0] : item[1]} </option>
            </>
          })}
        {/* {language ==="tr" ? Object.keys(keywords_tr).map(item => {
          return <option key={item} value={item}>{item}</option>
        }) : Object.keys(keywords_en).map(item => {
          return <option key={item} value={item}>{item}</option>
        }) } */}
        </select>
        
        </div>
    
        <div className={classes.rowleft}>
        <input className={classes.userinput} ref={nameRef} placeholder='Name' /> <br /> <br />
        <input className={classes.userinput} ref={surnameRef} placeholder='Surname' /> <br /> <br />
        
        <select className={classes.selectdropdown} onChange={handleChange}>
        <option value="male" ><FormattedMessage id="sign_up_gender_male" defaultMessage="Default" values={{language}} /></option>
        <option value="female" ><FormattedMessage id="sign_up_gender_female" defaultMessage="Default" values={{language}} /></option>
        </select>
        <br /> <br />
        
        <input className={classes.userinput} ref={phone_numberRef} type="tel" placeholder='Phone Number' /> <br /> <br />
        {/* <input className={classes.userinput} ref={insurance_ref} placeholder='Insurance' />  */}
        {/* <button className={classes.btnblack} onClick={handleInsurance} > Add </button><br /> <br /> */}
        <select className={classes.selectdropdown} name="title" id="title" onChange={e => handleTitle(e)} >
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
        </select><br /> <br />  
        </div> 
        </div>
        
        <div className={classes.buddon}>
        <button className={classes.btnblack}  onClick={(e) => handleDoctorSignUp(e)}><FormattedMessage id="signup" defaultMessage="Default" values={{language}} /></button>
        </div>
       
        </form> 
        
        </div>
        </div>
    }
       </div>
  </IntlProvider>
}