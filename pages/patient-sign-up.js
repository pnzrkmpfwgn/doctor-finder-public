/* eslint-disable */
import {signUpAsPatient ,useAuth} from '../firebase/firebase';
import { useRef,useState } from 'react';
import { useSelector, useDispatch } from "react-redux";
import {setLoading} from '../redux/authentication';
import { IntlProvider,FormattedMessage } from "react-intl";
import {message} from '../data/langData';
import { useRouter} from 'next/router';

const SignUp = () => {
    const loading = useSelector(state => state.auth.loading);
    const language = useSelector(state => state.theme.language);
    const [gender, setGender] = useState("male");
    const [nationality, setNationality] = useState("tc");
    const [insurance, setInsurance] = useState([]);
    const dispatch = useDispatch();
    const router = useRouter();


    const emailRef = useRef();
    const passwordRef = useRef();
    const nameRef = useRef();
    const surnameRef = useRef();
    const card_idRef = useRef();
    const phone_numberRef = useRef();
    const insurance_ref = useRef();
    const currentUser = useAuth();
    console.log(currentUser)


    async function handleSignUp(){
        dispatch(setLoading(true))
        try{
          await signUpAsPatient(emailRef.current.value,passwordRef.current.value,
            nameRef.current.value,
            surnameRef.current.value,
            gender,
            nationality,
            card_idRef.current.value,
            phone_numberRef.current.value,
            insurance
            );
        }catch{
          alert("Error!")
        }
        dispatch(setLoading(false))
        router.push("/patient-edit-profile")
      }

      const handleInsurance = () => {
        const insurance = insurance_ref.current.value
        setInsurance(prev => {
          const array = [...prev,insurance]
          const uniqueArray = [...new Set(array)]

          return uniqueArray
        })
        insurance_ref.current.value = "";
        
      }

      const handleChange = (e) => {
        setGender(e.target.value);
      };

      const handleIdCardChange = (e) => {
        setNationality(e.target.value);
      }
      
    return <IntlProvider locale={language} messages={message[language]} >
      <div>
      <div id="fields" >
      <input ref={emailRef} placeholder='Email' type="email" /> <br /> <br />
      <input ref={passwordRef} type="password" placeholder='Password' /> <br /> <br />
      <input ref={nameRef} placeholder='Name' /> <br /> <br />
      <input ref={surnameRef} placeholder='Surname' /> <br /> <br />
      <select onChange={handleChange}>
      <option value="male" ><FormattedMessage id="sign_up_gender_male" defaultMessage="Default" values={{language}} /></option>
      <option value="female" ><FormattedMessage id="sign_up_gender_female" defaultMessage="Default" values={{language}} /></option>
      </select> <br /> <br /> 
      <select onChange={handleIdCardChange}>
      <option value="tc" >T.C. Kimlik</option>
      <option value="kktc" >K.K.T.C. Kimlik</option>
      <option value="uk" >British ID Card</option>
      </select> <br /> <br />
      <input ref={insurance_ref} placeholder='Insurance' /> <br /> <br /> 
      <button onClick={handleInsurance} > Add </button><br /> <br />
      <input ref={card_idRef} placeholder='ID No.' /> <br /> <br /> 
      <input ref={phone_numberRef} type="tel" placeholder='Phone Number' /> <br /> <br /> 
      </div>
      <button disabled={loading || currentUser !== null} onClick={handleSignUp}><FormattedMessage id="signup" defaultMessage="Default" values={{language}} /></button>
    </div>
    </IntlProvider>
}

export default SignUp