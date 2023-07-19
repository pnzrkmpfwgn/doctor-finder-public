/* eslint-disable */
import { useEffect } from "react"; 
import { useSelector,useDispatch } from "react-redux"
import { useAuth,getSupportAgent } from "../firebase/firebase"
import { setSupportAgentData } from "../redux/supportAgentState";
import AgentChatComponent from "../components/chat/AgentChatComponent";

export default function UserAgentControlPanel(){
    const dispatch = useDispatch();
    const userData = useSelector(state => state.supportAgentData.data)
    const currentUser = useAuth();
    const language = useSelector(state => state.theme.language)

    

    useEffect(()=>{
        const getData = async () =>{
            try{if(currentUser){
                const userData = await getSupportAgent(currentUser.uid);
                dispatch(setSupportAgentData(userData));
            }
            }catch(error){
                console.log(error)
            }
        }

        const timer = setTimeout(()=>{
            if(currentUser){
              if(userData && Object.keys(userData).length === 0){
                getData();
            }
            }
        },1000)

        return ()=> clearTimeout(timer);
    },[currentUser, dispatch, userData])
    console.log(userData)
    return <div>
        <h1>{language==="en"?"Support Agent Control Panel": "Destek Birimi Kontrol Paneli"}</h1>
           {currentUser && userData  && <div>
                <p>{language==="en" ? "Name": "Ad"}: {userData.name}</p>
                <p>{language==="en" ? "Surname" :"Soyad"}: {userData.surname}</p>
            </div> }
            <AgentChatComponent />
    </div>
}