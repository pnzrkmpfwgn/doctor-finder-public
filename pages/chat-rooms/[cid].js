/* eslint-disable */
import { useEffect } from "react";
import { ref, onValue, onDisconnect,set,push,serverTimestamp } from "firebase/database";
import {useAuth,realtimeDb} from '../../firebase/firebase';
import { useSelector } from "react-redux";

import classes from '../../styles/chatStyle.module.css';

import { useRouter } from 'next/router';

import ChatRoom from "../../components/chat/ChatComponent";



function PrivateChatRoom(){
    const currentUser = useAuth();
    const userData = useSelector(state => state.userData.data);
    const supportAgentId = useSelector(state=> state.supportAgentData.id)
    const router = useRouter();


    useEffect(() => {
        const unloadCallback = (event) => {
          event.preventDefault();
          event.returnValue = "";
          return "";
        };
      
        window.addEventListener("beforeunload", unloadCallback);
        return () => window.removeEventListener("beforeunload", unloadCallback);
      }, []);



    useEffect(()=>{
        if(currentUser && supportAgentId!=="" && Object.keys(userData).length!==0){
            if(userData.role === "patient" || userData.role==="doctor"){
                const lastOnlineRef = ref(realtimeDb, `pending/${currentUser.uid}/lastOnline`);
                const myConnectionsRef = ref(realtimeDb, `pending/${currentUser.uid}/connections`);
                const userId = ref(realtimeDb,`pending/${currentUser.uid}/id`);
                const agentId = ref(realtimeDb,`pending/${currentUser.uid}/supportAgentId`);
                const role = ref(realtimeDb,`pending/${currentUser.uid}/role`);
                const connectedRef = ref(realtimeDb, '.info/connected');

                onValue(connectedRef, (snap) => {
                  if (snap.val() === true) {
                    // We're connected (or reconnected)! Do anything here that should happen only if online (or on reconnect)
                    const con = push(myConnectionsRef);
                
                    // When I disconnect, remove this device
                    onDisconnect(con).remove();
                
                    // Add this device to my connections list
    // this value could contain info about the device or a timestamp too
                    set(con, true);
                    set(userId,currentUser.uid);
                    set(agentId,supportAgentId);
                    set(role,userData.role)
                    // When I disconnect, update the last time I was seen online
                    onDisconnect(lastOnlineRef).set(serverTimestamp());
                  }
                });
            }
        }
    },[currentUser, supportAgentId, userData])
    
    if(router.isFallback){
        return <div> 404 </div>
    }else{
        return <div style={{height:"100vh"}} className={classes.background} >
        <ChatRoom />
    </div>
    }
    
}

export default PrivateChatRoom;