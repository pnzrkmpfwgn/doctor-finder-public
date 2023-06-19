/* eslint-disable */
import classes from '../styles/patientInsurance.module.css'
import {useState} from 'react';
import {db,useAuth} from '../firebase/firebase';
import { setDoc,doc } from 'firebase/firestore';
import { useSelector } from 'react-redux';
import { IntlProvider,FormattedMessage } from "react-intl";
import {message} from '../data/langData';
export default function PatientInsurance(){
    const userData = useSelector(state => state.userData.data);
    const [insurance,setInsurance] = useState("Devlet Sigortası");
    const [stagedInsurance,setStagedInsurances] = useState([])
    const currentUser = useAuth();
    const language = useSelector(state => state.theme.language)

    const handleInsurance = () => {
        setStagedInsurances(prev =>{
            let arr = [...prev,insurance]

            let uniqueChars = arr.filter((c, index) => {
                return arr.indexOf(c) === index;
            })
            
            console.log(uniqueChars)

            return uniqueChars
        })
    }

    const listenChange = e => {
        setInsurance(e.target.value)
    }

    const handleSetInsurance = async () => {
        if(currentUser){
            const docRef = doc(db,"Patients",currentUser.uid);
            await setDoc(docRef,{
                ...userData,
                insurance:[...userData.insurance,...stagedInsurance]
            })
            window.location.reload();
        }
    }

    const handleDeleteStaged = (index) => {
        setStagedInsurances((prev)=>{
            let arr = prev;

            arr.splice(index,1);

            return [...arr];
        })
    }

    const handleDelete = async (index) => {
        if(confirm("Do you want to delete this insurance")){
            const docRef = doc(db,"Patients",currentUser.uid);
            let insurance = [...userData.insurance];
            insurance.splice(index,1);

            console.log(insurance)

           await setDoc(docRef,{
                ...userData,
                insurance:insurance
            })
            window.location.reload();
        }else{
            return;
        }
    }

    console.log(insurance)
    console.log(stagedInsurance);
    return   <IntlProvider locale={language} messages={message[language]} ><div className={classes.container} >
        <div className={classes.insurance_item} >
            <h4 className={classes.insurance_heading} > <FormattedMessage id="your_insurances" defaultMessage="Default" values={{language}} /> </h4>
            {Object.keys(userData).length!==0 &&  userData.insurance.length!==0 ? userData.insurance.map((item,index)=>{
                return <div style={{display:"flex"}} key={index} >
                    <p className={classes.item_border} >{index+1 +". " + item } <button onClick={()=>handleDelete(index)} className={classes.button_class_delete_red} >X</button></p>
                </div> 
            } ) : <p style={{fontStyle:"italic",color:"rgba(140, 140, 140, 0.92)"}} > <FormattedMessage id="no_insurance_yet" defaultMessage="Default" values={{language}} />  </p> }
        </div>
        <div>
            <h4 className={classes.insurance_heading} > <FormattedMessage id="set_insurance" defaultMessage="Default" values={{language}} />  </h4> 
            <label htmlFor="select" style={{fontWeight:"bold"}} > <FormattedMessage id="select_company" defaultMessage="Default" values={{language}} />  </label>
            <br />
            <br />
                <select style={{fontSize:"15px",fontWeight:"bold",padding:"5px"}} onChange={e => listenChange(e)} >
                  <option defaultValue={"misleading"} >Devlet Sigortası</option>
                  <option>Axia</option>
                  <option>Allianz</option>
                  <option>Anadolu Sigorta</option>
                  <option>Garanti Emeklilik ve Hayat</option>
                  <option>Ziraat Hayat ve Emeklilik </option>
                  <option>Fiba Emeklilik ve Hayat</option>
                </select><br />
                <button className={classes.button_class} onClick={(e)=>handleInsurance(e)} >Add</button>
                <div>
                    <h5 className={classes.insurance_heading} > <FormattedMessage id="staged_insurance" defaultMessage="Default" values={{language}} /> s </h5>
                    {stagedInsurance.length > 0 ? stagedInsurance.map((item,index) =>{
                        return <div key={item} >
                                <div style={{display:"flex"}} >
                                    <p className={classes.item_border} >{index+1 +". " + item} 
                                        <button onClick={()=>handleDeleteStaged(index)} className={classes.button_class_delete_red} >X</button>
                                    </p>
                                </div>
                            </div>
                    }):<p style={{fontStyle:"italic",color:"rgba(140, 140, 140, 0.92)"}} > <FormattedMessage id="no_staged_insurance" defaultMessage="Default" values={{language}} /> </p>}
                    <button className={classes.button_class}  onClick={()=>handleSetInsurance()}><FormattedMessage id="set_insurance" defaultMessage="Default" values={{language}} /></button>
                </div>

        </div>
    </div></IntlProvider>
}