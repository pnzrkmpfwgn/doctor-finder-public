/* eslint-disable */
import {signUpAsDoctor ,useAuth} from '../firebase/firebase';
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
    const medical_lic_idRef = useRef();
    const phone_numberRef = useRef();
    const expertise_ref = useRef();
    const insurance_ref = useRef();
    const title_ref = useRef();
    const currentUser = useAuth();
    console.log(currentUser)


    async function handleSignUp(){
        dispatch(setLoading(true))
        try{
          await signUpAsDoctor(emailRef.current.value,passwordRef.current.value,
            nameRef.current.value,
            surnameRef.current.value,
            gender,
            nationality,
            card_idRef.current.value,
            medical_lic_idRef.current.value,
            title_ref.current.value,
            expertise_ref.current.value,
            insurance,
            phone_numberRef.current.value);
        }catch{
          alert("Error!")
        }
        dispatch(setLoading(false))
        router.push("/doctor-edit-profile")
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
      console.log(insurance)
      const handleChange = (e) => {
        setGender(e.target.value);
      };

      const handleIdCardChange = (e) => {
        setNationality(e.target.value);
      }
      // IMPORTANT NOTE at the time of the development we have no way of actually determining if person is real doctor 
      // or not since there is no public api that checks legitemacy of the diploma however there is one way of using puppteerJS
      // with headless mode where we can automate a login to e-devlet as myself in the target computer and check the barcode that is given by the user and return the result to this site
      // without open GUI which I assume is not a really good way of checking stuff plus probalby e-devlet will deny such automation since we will scrape the returning results
      // we will try to implement this as a gimmick feature other than that the confirmation of the doctor is not going to be accurate
      //email,password,name,surname,gender,nationality,card_id,medical_license_id,expertise,phonenumber
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
      <input ref={card_idRef} placeholder='ID No.' /> <br /> <br /> 
      <input ref={medical_lic_idRef} placeholder='Medical License ID' /> <br /> <br /> 
      <input ref={expertise_ref} placeholder='Expertise' /> <br /> <br /> 
      <input ref={insurance_ref} placeholder='Insurance' /> <br /> <br /> 
      <button onClick={handleInsurance} > Add </button><br /> <br />
      <input ref={title_ref} placeholder='Title' /> <br /> <br /> 
      <input ref={phone_numberRef} type="tel" placeholder='Phone Number' /> <br /> <br /> 
      </div>
      <button disabled={loading || currentUser !== null} onClick={handleSignUp}><FormattedMessage id="signup" defaultMessage="Default" values={{language}} /></button>
    </div>
    </IntlProvider>
}

export default SignUp