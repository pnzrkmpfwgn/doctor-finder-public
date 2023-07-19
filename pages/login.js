/* eslint-disable */
import {login,useAuth,auth} from '../firebase/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRef } from 'react';
import { useSelector, useDispatch } from "react-redux";
import {setLoading} from '../redux/authentication';
import { IntlProvider,FormattedMessage } from "react-intl";
import {useState} from 'react'; 
import {message} from '../data/langData';
import { useRouter} from 'next/router'; 
import classes from '../styles/patientLogin.module.css';

export default function Login(){

  const [error,setError] = useState("");

    const loading = useSelector(state => state.auth.loading);
    const language = useSelector(state => state.theme.language)
    const dispatch = useDispatch();

    const router = useRouter();

    const emailRef = useRef();
    const passwordRef = useRef();
    const currentUser = useAuth();
    console.log(currentUser)

    async function handleLogin(e){
      e.preventDefault();
        dispatch(setLoading(true))
        signInWithEmailAndPassword(auth,emailRef.current.value,passwordRef.current.value).catch(err => {
          const str = JSON.stringify(err)
          if(str.includes("user-not-found")){
            setError(language==="en" ?"User is not found" : "Kullanıcı Bulunamadı")
          }else if(str.includes("wrong-password")){
            setError(language === "en" ? "Password and email does not match" : "Şifre ve email uyuşmamaktadır" )
          }else{
            setError(language==="en" ? "Unexpected error please try again with valid credentials" : "Beklenmedik hata lütfen doğru bilgiler ile tekrar deneyin")
          }
        })
        // try{
        //   await login(emailRef.current.value,passwordRef.current.value);
        // }catch{
        //   alert("Error!")
        // }
        dispatch(setLoading(false))
        router.push("/");
      }

      console.log(error);
      
    return <IntlProvider locale={language} messages={message[language]} >
      <h2 className={classes.heading} > Login </h2>
      <div style={{height:"100vh"}} className={classes.containerbig} >
        <div className={classes.loginbox} >
          <p className={classes.info} > Please enter your account information  </p>
      <form id="fields">
      {<div className={classes.error_section} ><p> {error.length!==0 && error} </p></div>}
         <input className={classes.userpass} ref={emailRef} placeholder='Email' type="email" />
          <input className={classes.userpass} ref={passwordRef} type="password" placeholder='Password' />
      <button className={classes.btnblack}  onClick={(e)=>handleLogin(e)}><FormattedMessage id="login_button" defaultMessage="Default" values={{language}} /></button>
      </form>
        </div>
      
    </div>
    </IntlProvider>
}