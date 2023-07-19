/* eslint-disable */
import {doc,getDoc} from 'firebase/firestore';
import { useSelector,useDispatch } from 'react-redux';
import {useState, useEffect} from 'react';
import { IntlProvider,FormattedMessage } from "react-intl";

import classes from '../../styles/chatStyle.module.css';

import {useAuth,db,realtimeDb,checkOnline} from '../../firebase/firebase';
import { ref,get } from "firebase/database";
import { setChatRoomId } from '../../redux/supportAgentState';
import { setRequestedHelpData } from '../../redux/requestedHelpState';
import Link from 'next/link';
import {message} from '../../data/langData';





const AgentChatComponent = () => {
    const currentUser = useAuth();
    const [userList,setUserList] = useState([])

    const myConnectionsPatientRef = ref(realtimeDb, "pending/")
    const dispatch = useDispatch();
    const language = useSelector(state => state.theme.language);

    useEffect(()=>{
        let timer = ()=>{}
        if(currentUser){
                timer = setInterval(async()=> await get(myConnectionsPatientRef).then(snap=>{
                const keys = Object.keys(snap.val())
                let arr =[]
                for(let i = 0 ; i < keys.length;i++){
                   arr.push(snap.val()[keys[i]]) 
                }
                    (async()=>{
                        for(let i = 0 ; i < arr.length;i++){
                            if(arr[i]["connections"] && arr[i]["supportAgentId"]===currentUser.uid){
                                if(arr[i]["role"]==="patient"){
                                    const docRef = doc(db,"Patients",arr[i]["id"]);
                                    const docSnap = await getDoc(docRef);
                                    const data = docSnap.data();
                                    const id = {id:arr[i]["id"]}
                                    Object.assign(data,id)
                                    console.log(data)
                                    setUserList(prev=>{
                                        const array = [...prev,data]
                                        const unique = array.filter(
                                            (obj, index) =>
                                              array.findIndex((item) => item.id === obj.id) === index
                                          );
                                        return unique
                                    })
                                }
                                if(arr[i]["role"]==="doctor"){
                                    const docRef = doc(db,"Doctors",arr[i]["id"]);
                                    const docSnap = await getDoc(docRef);
                                    const data = docSnap.data();
                                    console.log(data.id)
                                    setUserList(prev=>{
                                    const array = [...prev,data]
                                    const unique = array.filter(
                                        (obj, index) =>
                                          array.findIndex((item) => item.name === obj.name) === index
                                      );
                                    return unique
                                })
                                }
                                
                            }
                    }
                    })()
            }),2000)
        } 
    return ()=> clearInterval(timer);

},[currentUser, myConnectionsPatientRef])
//    console.log(userList)
    useEffect(()=>{
        if(currentUser){
            checkOnline(currentUser.uid);
        }
    },[currentUser])
    console.log(userList)
    console.log()
    if(currentUser){
        return <IntlProvider locale={language} messages={message[language]} ><div><h2> <FormattedMessage id="people_support_request" defaultMessage={"default"} values={{language}} /></h2>
        { userList.length !== 0 && userList.map(item=>{
            console.log(`m_${item.id}_${currentUser.uid}`)
            return <div key={item.id}>
                <Link onClick={()=>{
                    dispatch(setChatRoomId(`m_${currentUser.uid}_${item.id}`))
                    dispatch(setRequestedHelpData(item))
                }} href={
                    {
                        pathname:`/chat-rooms/m_${currentUser.uid}_${item.id}`
                    }
                } > {item.name + " " + item.surname} </Link >
            </div>
            })} <div className={classes.background} >
            
        </div>
    </div>
    </IntlProvider>
    }else{
        return <div></div>
    }
    
}

export default AgentChatComponent;