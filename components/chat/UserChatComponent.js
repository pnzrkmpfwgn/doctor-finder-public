/* eslint-disable */
import {useCollectionData} from 'react-firebase-hooks/firestore';
import {collection,limit,orderBy,query,serverTimestamp,addDoc,getDocs} from 'firebase/firestore';
import { useSelector,useDispatch } from 'react-redux';
import Image from 'next/image';
import {useState,useRef, useEffect} from 'react';
import {ref as sref,getDownloadURL} from 'firebase/storage'
import { IntlProvider,FormattedMessage } from "react-intl";
import {message} from '../../data/langData';

import classes from '../../styles/chatStyle.module.css';

import {useAuth,db,realtimeDb,checkOnline, checkOnlinePatient,checkOnlineDoctor,storage} from '../../firebase/firebase';

import { ref,update, get} from "firebase/database";
import { setChatRoomId, setSupportAgentId,setSupportAgentData } from '../../redux/supportAgentState';
import { useRouter } from 'next/router';
import Link from 'next/link';


const ChatMessage = (props) =>{
    const {text,uid} = props.message;
    const currentUser = useAuth();
    const [imgSrc,setImgSrc] = useState("");
    useEffect(()=>{
        if(currentUser){
            getDownloadURL(sref(storage,`PersonImages/${currentUser.uid}.jpg`)).then(url =>{
                setImgSrc(url)
            }).catch(err => console.log(err))
        }
    },[currentUser])

    const messageClass = uid === props.userId ? 'sent' : 'received';
    
    return <div className={classes.message + " " + messageClass} >
        <Image className={classes.image} src={imgSrc} alt="" width="75" height="75" />
        <p className={classes.message} > {text} </p>
    </div>
}

const ChatRoom = () => {
    const messagesRef = collection(db,'messages');
    const currentUser = useAuth();
    const q = query(messagesRef,orderBy("createdAt"),limit(25));
    const userData = useSelector(state => state.userData.data) 
    
    
    const router = useRouter();
    const supportAgentId = useSelector(state => state.supportAgentData.id);

    const [messages] = useCollectionData (q,{idField:'id'})
    const [formValue,setFormValue] = useState('');


    const dummy = useRef();
    

    const sendMessage = async(e) => {
        e.preventDefault();

        const {uid,photoURL} = currentUser;

        await addDoc(messagesRef,{
            text:formValue,
            createdAt:serverTimestamp(),
            uid
        })

        setFormValue('')
        dummy.current.scrollIntoView({behavior:'smooth'})
    }



useEffect(()=>{
    
    return ()=>{
        const occupiedStatusRef = ref(realtimeDb,`users/${supportAgentId}`)
            return update(occupiedStatusRef,{occupied:false})  
    }
// eslint-disable-next-line react-hooks/exhaustive-deps
},[])


const closeChat = ()=>{
    router.push("/");
}
    // console.log("----------------------")
    // console.log(activeSupportAgents)
    // console.log("----------------------")
    // console.log(occupiedSupportAgents)
    // console.log("----------------------")
    // console.log(offlineSupportAgents)
    // console.log("----------------------")
    // console.log(supportAgentList);
    return <>
        <div className={classes.chat_body} >

            <button className={classes.button_class} onClick={()=>closeChat()} >X</button>
            <div>
                {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
            </div>
            <div ref={dummy} > </div>
            <form  className={classes.form_style} onSubmit={sendMessage} >
                <input className={classes.input_body} value={formValue} onChange={(e)=>setFormValue(e.target.value)} />

                <button className={classes.btn} type='submit' >&gt;</button>
            </form>
        </div>
    </>
}

const UserChatComponent = () => {
    const currentUser = useAuth();
    const agentData = useSelector(state => state.supportAgentData.data);
    const userData = useSelector(state => state.userData.data);
    const [supportAgentList,setSupportAgentList] = useState([]);
    const myConnectionsRef = ref(realtimeDb, "users/")
    const language = useSelector(state => state.theme.language);

    const dispatch = useDispatch();

    //Chat Initialization


    useEffect(()=>{
        (async ()=>{
            const ref = collection(db,"userAgents");
            const data = await getDocs(ref);
            setSupportAgentList(prev=>{
                let arr = []
                data.forEach(element => {
                   arr.push({...element.data(),id:element.id,online:false,occupied:false})
                });
                return arr;
            })
            
        })()
        console.log("Executed")
    },[])

    useEffect(()=>{
            
            const timer = setInterval(async()=> await get(myConnectionsRef).then(snap=>{
                const keys = Object.keys(snap.val())
                let arr =[]
                for(let i = 0 ; i < keys.length;i++){
                   arr.push(snap.val()[keys[i]]) 
                }
                
                (async ()=>{
                    
                    for(let i = 0 ; i < supportAgentList.length;i++){
                        if(supportAgentList){
                            
                            if(arr[i]["id"]===supportAgentList[i]["id"] && arr[i]["connections"]){
                                console.log(arr)
                                setSupportAgentList(prev=>{
                                    let array = prev;
                                    array[i]["online"]=true;
                                    array[i]["occupied"] = arr[i]["occupied"]
                                    return array;
                                })
                                console.log(supportAgentList)
                            }else{
                                setSupportAgentList(prev=>{
                                    let array = prev;
                                    array[i]["online"]=false;
                                    array[i]["occupied"] = arr[i]["occupied"]
                                    return array;
                                })
                            }
                        }
                    }
                })()
            }),2000) 
        return ()=> clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])
    
    // useEffect(()=>{
        
    //     return ()=>{
    //         const occupiedStatusRef = ref(realtimeDb,`users/${supportAgentId}`)
    //             return update(occupiedStatusRef,{occupied:false})  
    //     }
    // // eslint-disable-next-line react-hooks/exhaustive-deps
    // },[])

  

    useEffect(()=>{
        //This if is not really needed here just in case we put it here
        if(currentUser){
        if(agentData && agentData.role==="support agent" ){
            checkOnline(currentUser.uid);
        }
        if(userData && userData.role==="patient"){
            // console.log("executed")
            checkOnlinePatient(currentUser.uid);
        }
        if(userData && userData.role==="doctor"){
            checkOnlineDoctor(currentUser.uid);
        }
    }
        
    },[currentUser, agentData, userData])

    if(currentUser){
        return <IntlProvider locale={language} messages={message[language]} > <div style={{height:"900px"}} >
        <div>
        <h2 className={classes.heading} > <FormattedMessage id="our_support_agents" defaultMessage="Default" values={{language}} /></h2>
        {supportAgentList.length!==0 && supportAgentList.map(item=>{
            console.log(`m_${item.id}_${currentUser.uid}`)
            return <div  key={item.name} >
                <Link className={classes.profile_explanation} onClick={()=>{
                    dispatch(setSupportAgentId(item.id))
                    dispatch(setChatRoomId(`m_${item.id}_${currentUser.uid}`))
                    dispatch(setSupportAgentData({name:item.name,surname:item.surname}))
                }} href={{
                    pathname:`/chat-rooms/m_${item.id}_${currentUser.uid}`,
                }} > {item.name + " " + item.surname} </Link>
            </div>
        })}
    </div>
    <div className={classes.background} > 
    </div>
    </div>
    </IntlProvider> 
    }else{
        return <div></div> 
    }
    
}


export default UserChatComponent;