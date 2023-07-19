/* eslint-disable */
import {login,useAuth} from '../firebase/firebase';
import { useRef } from 'react';
import { useSelector, useDispatch } from "react-redux";
import {setLoading} from '../redux/authentication';
import { IntlProvider,FormattedMessage } from "react-intl";
import {message} from '../data/langData';
import { useRouter} from 'next/router';

const SignUp = () => {
    const loading = useSelector(state => state.auth.loading);
    const language = useSelector(state => state.theme.language)
    const dispatch = useDispatch();

    const router = useRouter();
    
    const emailRef = useRef();
    const passwordRef = useRef();
    const currentUser = useAuth();
    console.log(currentUser)

    async function handleLogin(){
        dispatch(setLoading(true))
        try{
          await login(emailRef.current.value,passwordRef.current.value);
        }catch{
          alert("Error!")
        }
        dispatch(setLoading(false))
        router.push("/")
      }
      
    return <IntlProvider locale={language} messages={message[language]} >
      <div>
      <div id="fields" >
      <input ref={emailRef} placeholder='Email' type="email" />
      <input ref={passwordRef} type="password" placeholder='Password' />
      </div>
      <button disabled={loading || currentUser !== null} onClick={handleLogin}><FormattedMessage id="login_button" defaultMessage="Default" values={{language}} /></button>
    </div>
    </IntlProvider>
}

export default SignUp