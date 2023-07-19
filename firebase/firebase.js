/* eslint-disable */
// import {initializeApp} from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js';
// import {auth} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import {initializeApp} from 'firebase/app';
import {getAuth, 
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  sendEmailVerification,
  at
} from "firebase/auth";
import {useState,useEffect} from 'react';
import { getFirestore,
  collection,
   setDoc,
   doc,
   getDocs,
   getDoc,
   query,
   where,
  onSnapshot
  } from "firebase/firestore";
import {getStorage,listAll} from 'firebase/storage';
import { getDatabase, ref, onValue, push, onDisconnect, set, serverTimestamp } from "firebase/database";
import { stringify, v4 } from 'uuid';


const firebaseConfig = initializeApp({
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId: process.env.APP_ID,
    databaseURL:process.env.DATABASE_URL
})
console.log(process.env.DATABASE_URL)


export const db = getFirestore(firebaseConfig)
export const realtimeDb = getDatabase(firebaseConfig)


export const auth = getAuth(firebaseConfig)
export const storage = getStorage(firebaseConfig);

export function signUp(email,password){
    return createUserWithEmailAndPassword(auth,email,password);
}

export const signUpAsPatient = async (email,password,name,surname,gender,nationality,card_id,phonenumber,dob) =>{
  const user = createUserWithEmailAndPassword(auth,email,password).
  then( async (cred) => {
    
    await setDoc(doc(db,"Patients",cred.user.uid),{
      name:name,
      surname:surname,
      gender:gender,
      nationality:nationality,
      card_id:card_id,
      phone_number:phonenumber,
      insurance:[],
      role:"patient",
      my_testimonials:[],
      schedule:[],
      verified:false,
      dob:dob
    });
    sendEmailVerification(cred.user);
  }).catch(err => {
    alert(err)
    return err
  })
  console.log("Executed")
  return { user };
}

export const signUpAsDoctor = async (email,password,name,surname,gender,nationality,card_id,medical_license_id,title,expertise,phonenumber) =>{
  const user = createUserWithEmailAndPassword(auth,email,password).
  then( async (cred) => {
    
    await setDoc(doc(db,"Doctors",cred.user.uid),{
      name:name,
      surname:surname,
      gender:gender,
      nationality:nationality,
      card_id:card_id,
      medical_license_id:medical_license_id,
      title:title,
      expertise:expertise,
      insurance:[], 
      phone_number:phonenumber,
      role:"doctor",
      city:[],
      verified:false,
      registered:true,
      schedule:[],
      locations:[],
      testimonials:[],
      rating:0
    });
    sendEmailVerification(cred.user);
  }).catch(err => err)
  return { user };
}

export const signUpAsSupportAgent = async (email,password,name,surname) => {
  const user = createUserWithEmailAndPassword(auth,email,password).then(
    async (cred)=>{
      await setDoc(doc(db,"userAgents",cred.user.uid),{
        name:name,
        surname:surname,
        role:"support agent"
      })
    }
  )

  return { user };
}



//LEGACY confirmation
// export const confirmId =  (currentUser,idImageText,patientIdText) => {
//   if(currentUser){
//     async () => {

//     }
//   }
  
// }

export const getPatientData = async (user_id) =>{
  const docRef = doc(db,"Patients",user_id);
  const docSnap = await getDoc(docRef);
  const data = docSnap.data();
  return data;
}

export const getDoctorData = async (user_id) =>{
  const docRef = doc(db,"Doctors",user_id);
  const docSnap = await getDoc(docRef);
  const data = docSnap.data();
  return data;
}

export const getUserData = async(user_id) => {
  const docRefDoctor = doc(db,"Patients",user_id)
  const docSnapDoctor = await getDoc(docRefDoctor)
  const docRefPatient = doc(db,"Doctors",user_id);
  const docSnapPatient = await getDoc(docRefPatient)
  const docRefUserAgent = doc(db,"userAgents",user_id);
  const docSnapUserAgent = await getDoc(docRefUserAgent)
  const doctorData = docSnapDoctor.data();
  const patientData = docSnapPatient.data();
  const userAgentData = docSnapUserAgent.data();

  if(doctorData){
    return doctorData;
  }else if(patientData) {
    return patientData;
  }else{
    return userAgentData;
  }

}

export const getDoctorIds = async()=>{
  const docRef = collection(db,"Doctors")
  const docSnap = await getDocs(docRef);
  
  let idArr = []

  docSnap.forEach(elemet => idArr.push(elemet.id))
  
  return idArr;
}

export const getSupportAgent = async(user_id) =>{
  const docRefUserAgent = doc(db,"userAgents",user_id)
  const docSnapUserAgent = await getDoc(docRefUserAgent);
  const supportAgentData = docSnapUserAgent.data();
  return supportAgentData;
}

export function login(email,password){
    return signInWithEmailAndPassword(auth,email,password);
}

export function logOut(){
    return signOut(auth)
}

//Custom React Hook
export function useAuth(){
    const [currentUser, setCurrentUser] = useState();
    
    useEffect(()=>{
        const unSub = onAuthStateChanged(auth,user=> setCurrentUser(user));
        return unSub;
    },[])

    return currentUser;
}

//Testimonial Functions

export const postTestimonial=async(text,from,to,rating,isAnonymous,doctorData,patientData,patientPrevTestimonials,doctorPrevTestimonials,name,surname,created_at) =>{
 
  const patientDocRef = doc(db,"Patients",from)
  const doctorDocRef = doc(db,"Doctors",to);
  
  const testimonial_id = v4();

  await setDoc(patientDocRef,{
    ...patientData,
    my_testimonials:[
      ...patientPrevTestimonials,
      {testimonial_text:text,
      from:from,
      to:to,
      rating:rating,
      isAnonymous:isAnonymous,
      name,
      surname,
      testimonial_id:testimonial_id,
      created_at:created_at
    }
    ]
  })
  
  await setDoc(doctorDocRef,{
    ...doctorData,
    testimonials:[
      ...doctorPrevTestimonials,
      {
        testimonial_text:text,
        from:from,
        to:to,
        rating:rating,
        isAnonymous:isAnonymous,
        name,
        surname,
        testimonial_id:testimonial_id,
        created_at:created_at
      }]
  })
  window.location.reload()
}

export const deleteTestimonial = async (user_id,doctorId,doctorData,patientData) => {
  const patientTestimonialDocRef = doc(db,"Patients",user_id)
  const doctorTestimonialDocRef = doc(db,"Doctors",doctorId);
  const my_testimonials_data = (await getDoc(patientTestimonialDocRef)).data().my_testimonials
  const testimonials_data = (await getDoc(doctorTestimonialDocRef)).data().testimonials

  if(confirm("Do you want to delete this testimonial")){
    for(let i = 0 ; i < my_testimonials_data.length; i++){
      if(doctorId === my_testimonials_data[i]["to"]){
        let new_my_testimonials_data = my_testimonials_data;
        my_testimonials_data.splice(i,1)
        
        await setDoc(patientTestimonialDocRef,{
          ...patientData,
          my_testimonials:new_my_testimonials_data});
      }
    }
  
    
    for(let i = 0 ; i < testimonials_data.length; i++){
      if(user_id === testimonials_data[i]["from"]){
        let new_testimonials_data = testimonials_data;
        new_testimonials_data.splice(i,1)
        
        await setDoc(doctorTestimonialDocRef,{
          ...doctorData,
          testimonials:new_testimonials_data});
      }
    }
    window.location.reload();
  }else{
    return;
  }

}

export const updateTestimonial=async(text,from,to,rating,isAnonymous,doctorData,patientData,patientPrevTestimonials,doctorPrevTestimonials,name,surname,) =>{
  
  const patientDocRef = doc(db,"Patients",from);
  const doctorDocRef = doc(db,"Doctors",to);

  const my_testimonials_data = (await getDoc(patientDocRef)).data().my_testimonials
  const testimonials_data = (await getDoc(doctorDocRef)).data().testimonials
  let testimonial_id = "";
  for(let i = 0; i < patientPrevTestimonials.length ; i++){
    if(patientPrevTestimonials[i]["to"]===to){
      testimonial_id = patientPrevTestimonials[i]["testimonial_id"];
    }
  }

 if(confirm("Do you want to update this testimonial")){
  for(let i = 0 ; i < my_testimonials_data.length; i++){
    if(to === my_testimonials_data[i]["to"]){
      let new_prev_testimonials = patientPrevTestimonials;
      new_prev_testimonials.splice(i,1)
      let new_data ={
        ...patientData,
        my_testimonials:[
          ...new_prev_testimonials,
          {
            testimonial_text:text,
            from:from,
            to:to,
            rating:rating,
            isAnonymous:isAnonymous,
            name,
            surname,
            testimonial_id:testimonial_id
          }]
      }
      await setDoc(patientDocRef,new_data)
    }
  }

  for(let i = 0 ; i < testimonials_data.length; i++){
    if(from === testimonials_data[i]["from"]){
      let new_prev_testimonials = doctorPrevTestimonials;
      doctorPrevTestimonials.splice(i,1)
      
      let new_data ={
        ...doctorData,
        testimonials:[
          ...new_prev_testimonials,
          {
            testimonial_text:text,
            from:from,
            to:to,
            rating:rating,
            isAnonymous:isAnonymous,
            name,
            surname,
            testimonial_id:testimonial_id
          }]
      }
      await setDoc(doctorDocRef,new_data)
    }
  }
  window.location.reload();
 }else{
  return;
 }
  
}

export const reportTestimonial = async (reason,additional_info,reported_user_id,user_id,doctor_id,testimonial_id)=>{

  console.log(reason)
  console.log(user_id)
  console.log(additional_info)
  console.log(testimonial_id)
  const docRef = doc(db,"Reported Testimonials",testimonial_id);

  await setDoc(docRef,{
    reason:reason,
    additional_info:additional_info,
    id:user_id,
    doctor_id:doctor_id,
    testimonial_id:testimonial_id
  })
   
  // for(let i = 0 ; i < data.my_testimonials.length; i++){
  //   if(doctor_id ===data.my_testimonials[i]["to"]){
  //     const reportData = {}
  //     await setDoc(patientRef,{
  //       ...data,
  //       //Burası
  //       my_testimonials[i]:
  //     })
  //   }
  // } 
}

//Building Presence
//Realtime Database connection
export const checkOnline = (uid) => {
  const lastOnlineRef = ref(realtimeDb, `users/${uid}/lastOnline`);
  const myConnectionsRef = ref(realtimeDb, `users/${uid}/connections`);
  const occupiedRef = ref(realtimeDb, `users/${uid}/occupied`);
  const agentId = ref(realtimeDb,`users/${uid}/id`);
  const connectedRef = ref(realtimeDb, '.info/connected');
console.log(connectedRef)
onValue(connectedRef, (snap) => {
  if (snap.val() === true) {
    // We're connected (or reconnected)! Do anything here that should happen only if online (or on reconnect)
    const con = push(myConnectionsRef);

    // When I disconnect, remove this device
    onDisconnect(con).remove();

    // Add this device to my connections list
    // this value could contain info about the device or a timestamp too
    set(con, true);
    set(agentId,uid);
    set(occupiedRef,false)

    // When I disconnect, update the last time I was seen online
    onDisconnect(lastOnlineRef).set(serverTimestamp());
  }
});

onValue(myConnectionsRef,(snap)=>{
  if(Object.keys(snap.val()).length!==0){
    console.log("Online!")
    return true
  }else{
    console.log("Offline!")
    return false
  }
})
}

export const checkOnlinePatient = (uid) => {
  const lastOnlineRef = ref(realtimeDb, `patients/${uid}/lastOnline`);
  const myConnectionsRef = ref(realtimeDb, `patients/${uid}/connections`);
  const occupiedRef = ref(realtimeDb, `patients/${uid}/occupied`);
  const patientId = ref(realtimeDb,`patients/${uid}/id`);
const connectedRef = ref(realtimeDb, '.info/connected');
console.log(connectedRef)
onValue(connectedRef, (snap) => {
  if (snap.val() === true) {
    // We're connected (or reconnected)! Do anything here that should happen only if online (or on reconnect)
    const con = push(myConnectionsRef);

    // When I disconnect, remove this device
    onDisconnect(con).remove();

    // Add this device to my connections list
    // this value could contain info about the device or a timestamp too
    set(con, true);
    set(patientId,uid);
    set(occupiedRef,false)

    // When I disconnect, update the last time I was seen online
    onDisconnect(lastOnlineRef).set(serverTimestamp());
  }
});

onValue(myConnectionsRef,(snap)=>{
  if(Object.keys(snap.val()).length!==0){
    console.log("Online!")
    return true
  }else{
    console.log("Offline!")
    return false
  }
})
}

export const checkOnlineDoctor = (uid) => {
  const lastOnlineRef = ref(realtimeDb, `doctors/${uid}/lastOnline`);
  const myConnectionsRef = ref(realtimeDb, `doctors/${uid}/connections`);
  const occupiedRef = ref(realtimeDb, `doctors/${uid}/occupied`);
  const agentId = ref(realtimeDb,`doctors/${uid}/id`);
const connectedRef = ref(realtimeDb, '.info/connected');
console.log(connectedRef)
onValue(connectedRef, (snap) => {
  if (snap.val() === true) {
    // We're connected (or reconnected)! Do anything here that should happen only if online (or on reconnect)
    const con = push(myConnectionsRef);

    // When I disconnect, remove this device
    onDisconnect(con).remove();

    // Add this device to my connections list
    // this value could contain info about the device or a timestamp too
    set(con, true);
    set(agentId,uid);
    set(occupiedRef,false)

    // When I disconnect, update the last time I was seen online
    onDisconnect(lastOnlineRef).set(serverTimestamp());
  }
});

onValue(myConnectionsRef,(snap)=>{
  if(Object.keys(snap.val()).length!==0){
    console.log("Online!")
    return true
  }else{
    console.log("Offline!")
    return false
  }
})
}


// LEGACY Search Queries

// export const  search = async(name)=>{
//   const doctorRef = collection(db,"Doctors");
//   let doctors = []
//   const q = query(doctorRef,where("name","==",name))
//   console.log(q.firestore)

//   const querySnapshot = await getDocs(q);

//   await querySnapshot.forEach(doc=>{
//     console.log(doc.data)
//   })

//   // console.log(doctors)
//   // return doctors
// }

// const querySnapshot = await getDocs(collection(db, "users"));
// querySnapshot.forEach((doc) => {
//   console.log(`${doc.id} => ${doc.data()}`);
// });
  