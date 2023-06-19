/* eslint-disable */
/* eslint-disable @next/next/no-img-element */
import {db,useAuth,storage,sendVerification} from '../firebase/firebase';
import {ref,getDownloadURL,uploadBytes,listAll} from 'firebase/storage';
import { setDoc,doc } from 'firebase/firestore';
import { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from "react-redux";
import {setLoading} from '../redux/authentication';
import { IntlProvider,FormattedMessage } from "react-intl";
import {message} from '../data/langData';
import axios from 'axios';
import * as faceapi from 'face-api.js';
import {createWorker} from 'tesseract.js';
import classes from '../styles/patientEditProifle.module.css';
import Image from 'next/image'



// !! Resimleri !img! olarak renderla reflerini gönder
const EditProfile = () =>{
    //Local states
    const [idImageUpload,setIdImageUpload] = useState(null);
    const [personImageUpload,setPersonImageUpload] = useState(null);
    const [isId, setIsId] = useState(false);
    const [isPersonId,setIsPersonId] = useState(false);
    const [idImageUrl,setIdImageUrl] = useState(null);
    const [personImageUrl,setPersonImageUrl] = useState(null);
    const [sentForReading,setSentForReading] = useState(false);
    const [resultMessage,setResultMessage] = useState("...");
    const [faceResultMessage,setFaceResultMessage] = useState("...");
    const [failed,setFailed] = useState(false) 
    const [succes,setSuccess] = useState(false) 
    const [faceMatchSuccess,setFaceMatchSuccess] = useState(false) 
    const [faceMatchFailed,setFaceMatchFailed] = useState(false) 
    const [isFaceSimilar,setIsFaceSimilar] = useState(false);

    //Temp Console.logs
    console.log("----------------------------------")
    console.log("Is the sent ID is an id?",isId)
    console.log("Is card ID correct on the ID card",isPersonId)
    console.log("Are the faces similar?",isFaceSimilar)
    console.log("----------------------------------")
    

    //Refs
    const isFirstRender = useRef(true);
    const idCardRef = useRef();
    const selfieRef = useRef();

    //Global context
    const loading = useSelector(state => state.auth.loading);
    const language = useSelector(state => state.theme.language);
    const patientData = useSelector(state => state.userData.data);


    //Redux dispatch
    const dispatch = useDispatch();

    //Current User
    const currentUser = useAuth();

    //Functions

    //Canvas drawing function for face detection
    const renderFace = async (image, x, y, width, height) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");

    context?.drawImage(image, x, y, width, height, 0, 0, width, height);
    canvas.toBlob((blob) => {
      image.src = URL.createObjectURL(blob);
    }, "image/jpeg");
  };
    //File upload for ID photos
    const uploadIdFile = (e) => {
      e.preventDefault();
        if(idImageUpload==null){
          dispatch(setLoading(false))
          return;
        } 
        const imageRef = ref(storage, `IdImages/${currentUser.uid}`);
        uploadBytes(imageRef,idImageUpload).then(snapshot => {
            getDownloadURL(snapshot.ref).then( url => {
                setIdImageUrl(url)
            })
        })
        // dispatch(setLoading(false))
    }

    //Send Verification email again --> To Be implemented
    

    //File upload for persons' photo
    const uploadPersonFile = async () => {
        if(personImageUpload==null) return;
        const imageRef = ref(storage, `PersonImages/${currentUser.uid}`);
        uploadBytes(imageRef,personImageUpload).then(snapshot => {
            getDownloadURL(snapshot.ref).then( url => {
                setPersonImageUrl(url)
            })
        })
    }

    //Handling for submitting to /api/compare-images and setting the isId state
    const handleSubmit =  async (e) => {
      e.preventDefault()
      dispatch(setLoading(true));
      setSentForReading(true);
      setFailed(false)
      if(currentUser){
        axios.post("/api/compare-id-images",
      {
        "uid":currentUser.uid,
        "nationality":patientData.nationality
      }).then(res=>{
        if(res.data.misMatchPercentage < 36.0){
            setIsId(true)
            setSuccess(true)
           
          }else{
            setFailed(true)
            setResultMessage("not_id_message");
            setSuccess(false)
            setSentForReading(false)
            dispatch(setLoading(false))
          }
      })
      }
    }
    //Component did mounts
    useEffect(() => {
        //Here we check if the first render happened
        if (isFirstRender.current) {
            isFirstRender.current = false; 
            return;
          }

          //If the person is logged in we are going to get their uploaded photos
          if(currentUser){
            const idImageRef = ref(storage,`IdImages/${currentUser.uid}`)
            const personImageRef = ref(storage,`PersonImages/${currentUser.uid}`)
            
        listAll(idImageRef).then((response) => {
          response.items.forEach((item) => {
            getDownloadURL(item).then((url) => {
              setIdImageUrl(url);
            });
          });
        });
        listAll(personImageRef).then((response) => {
            response.items.forEach((item) => {
              getDownloadURL(item).then((url) => {
                setPersonImageUrl(url);
              });
            });
          });
        }      
        // If the urls for both person photo and id photo are provided we will begin the comparison
        if(idImageUrl && personImageUrl){
            //Check if the person sent the ID card picture again
              axios.post("/api/compare-person-images",
            {
              "uid":currentUser.uid,
              "nationality":patientData.nationality
            }).then(res=>{
              console.log("executed")
              if(res.data.misMatchPercentage <= 11.0){
                setFaceMatchFailed(true)
                setFaceResultMessage("same_with_id_message");
                setFaceMatchSuccess(false)
                console.log("executed")
                
                }else{
                  (async () =>{
                    //Models for face comparison
                    await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
                    await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
                    await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
                    await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
                    await faceapi.nets.faceExpressionNet.loadFromUri('/models');
                    // detect a single face from the ID card image
                    const idCardFacedetection = await faceapi.detectSingleFace(idCardRef.current,
                      new faceapi.TinyFaceDetectorOptions())
                      .withFaceLandmarks().withFaceDescriptor();
    
               // detect a single face from the selfie image
                  const selfieFacedetection = await faceapi.detectSingleFace(selfieRef.current,
                      new faceapi.TinyFaceDetectorOptions())
                      .withFaceLandmarks().withFaceDescriptor();
                      console.log("executed")
              if(idCardFacedetection && selfieFacedetection){
                console.log("executed")
                  // Using Euclidean distance to comapare face descriptions
                  const distance = faceapi.euclideanDistance(idCardFacedetection.descriptor, selfieFacedetection.descriptor);

                  if(distance <= 0.1){
                    setFaceResultMessage("face_too_similar")
                    setFaceMatchSuccess(false)
                    setFaceMatchFailed(true)
                  }else if(distance < 0.5){
                    setIsFaceSimilar(true)
                    setFaceMatchSuccess(true)
                    setFaceMatchFailed(false)
                    setFaceResultMessage("face_match_success")
                  }else{
                    setFaceResultMessage("face_does_not_match")
                    setFaceMatchSuccess(false)
                    setFaceMatchFailed(true)
                  }
                }
                if (idCardFacedetection) {
                  const { x, y, width, height } = idCardFacedetection.detection.box;
                  renderFace(idCardRef.current, x, y, width, height);
                }else{
                  setFaceMatchSuccess(false)
                  setFaceMatchFailed(true)
                  setSuccess(false),
                  dispatch(setLoading(false)),
                  setFailed(false);
                  console.log("id_face_cannot_be_detected")
                  setFaceResultMessage("id_face_cannot_be_detected")
                }
    
                if (selfieFacedetection) {
                  const { x, y, width, height } = selfieFacedetection.detection.box;
                  renderFace(selfieRef.current, x, y, width, height);
                }else{
                  setFaceMatchSuccess(false)
                  setFaceMatchFailed(true)
                  console.log("id_face_cannot_be_detected")
                  setFaceResultMessage("face_cannot_be_detected")
                }
                  })();
                }
            })
            }
          
          
          if(currentUser && isFaceSimilar){
            setDoc(doc(db,"Patients",currentUser.uid),{
              ...patientData,
              verified:true
            })
          }
      }, [currentUser, idImageUrl, isPersonId, patientData, personImageUrl, dispatch]);

      useEffect(()=>{
        //Here we read the contents of the ID
      if(idImageUrl && isId){
        const worker = createWorker({
          logger: m => console.log(m)
        });

         // Here we check if the contents of the ID match with the information provided by the patient before hand
        (async () => {
          await worker.load();
          await worker.loadLanguage('eng');
          await worker.initialize('eng');
          const { data: { text } } = await worker.recognize(idImageUrl);
          
          await worker.terminate();
          if(isId){
            if(text.includes(patientData.card_id)){
              setIsPersonId(true)
              setSentForReading(false)
              setSuccess(true)
              setResultMessage("id_confirmed_message")
            }else if(succes){
              setFailed(true)
              setSuccess(false)
              setSentForReading(false)
              setResultMessage("id_no_does_not_match")
            }
          }
        })();
        
      }
      },[idImageUrl, isId, patientData])

      // const HandleCheckFacesAndFinalize = async() =>{
      //   //Here we check if the first render happened
      //   if (isFirstRender.current) {
      //     console.log("Executed")
      //     isFirstRender.current = false; 
      //     return;
      //   }

      //   //If the person is logged in we are going to get their uploaded photos
      //   if(currentUser){
      //     const idImageRef = ref(storage,`IdImages/${currentUser.uid}`)
      //     const personImageRef = ref(storage,`PersonImages/${currentUser.uid}`)
          
      // listAll(idImageRef).then((response) => {
      //   response.items.forEach((item) => {
      //     getDownloadURL(item).then((url) => {
      //       setIdImageUrl(url);
      //     });
      //   });
      // });
      // listAll(personImageRef).then((response) => {
      //     response.items.forEach((item) => {
      //       getDownloadURL(item).then((url) => {
      //         setPersonImageUrl(url);
      //       });
      //     });
      //   });
      // }      
      // // If the urls for both person photo and id photo are provided we will begin the comparison
      // if(idImageUrl && personImageUrl){
      //     //Check if the person sent the ID card picture again
      //       axios.post("/api/compare-person-images",
      //     {
      //       "uid":currentUser.uid,
      //       "nationality":patientData.nationality
      //     }).then(res=>{
      //       console.log("executed")
      //       if(res.data.misMatchPercentage <= 11.0){
      //         setFaceMatchFailed(true)
      //         setFaceResultMessage("same_with_id_message");
      //         setFaceMatchSuccess(false)
      //         console.log("executed")
              
      //         }else{
      //           (async () =>{
      //             //Models for face comparison
      //             await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
      //             await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      //             await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      //             await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
      //             await faceapi.nets.faceExpressionNet.loadFromUri('/models');
      //             // detect a single face from the ID card image
      //             const idCardFacedetection = await faceapi.detectSingleFace(idCardRef.current,
      //               new faceapi.TinyFaceDetectorOptions())
      //               .withFaceLandmarks().withFaceDescriptor();
  
      //        // detect a single face from the selfie image
      //           const selfieFacedetection = await faceapi.detectSingleFace(selfieRef.current,
      //               new faceapi.TinyFaceDetectorOptions())
      //               .withFaceLandmarks().withFaceDescriptor();
      //               console.log("executed")
      //       if(idCardFacedetection && selfieFacedetection){
      //         console.log("executed")
      //           // Using Euclidean distance to comapare face descriptions
      //           const distance = faceapi.euclideanDistance(idCardFacedetection.descriptor, selfieFacedetection.descriptor);

      //           if(distance <= 0.1){
      //             setFaceResultMessage("face_too_similar")
      //             setFaceMatchSuccess(false)
      //             setFaceMatchFailed(true)
      //           }else if(distance < 0.5){
      //             setIsFaceSimilar(true)
      //             setFaceMatchSuccess(true)
      //             setFaceMatchFailed(false)
      //             setFaceResultMessage("face_match_success")
      //           }else{
      //             setFaceResultMessage("face_does_not_match")
      //             setFaceMatchSuccess(false)
      //             setFaceMatchFailed(true)
      //           }
      //         }
      //         if (idCardFacedetection) {
      //           const { x, y, width, height } = idCardFacedetection.detection.box;
      //           renderFace(idCardRef.current, x, y, width, height);
      //         }else{
      //           setFaceMatchSuccess(false)
      //           setFaceMatchFailed(true)
      //           setSuccess(false),
      //           dispatch(setLoading(false)),
      //           setFailed(false);
      //           console.log("id_face_cannot_be_detected")
      //           setFaceResultMessage("id_face_cannot_be_detected")
      //         }
  
      //         if (selfieFacedetection) {
      //           const { x, y, width, height } = selfieFacedetection.detection.box;
      //           renderFace(selfieRef.current, x, y, width, height);
      //         }else{
      //           setFaceMatchSuccess(false)
      //           setFaceMatchFailed(true)
      //           console.log("id_face_cannot_be_detected")
      //           setFaceResultMessage("face_cannot_be_detected")
      //         }
      //           })();
      //         }
      //     })
      //     }
        
        
      //   if(currentUser && isFaceSimilar && currentUser.emailVerified){
      //     setDoc(doc(db,"Patients",currentUser.uid),{
      //       ...patientData,
      //       verified:true
      //     })
      //   }
      // }
      
      console.log(faceMatchFailed)
      console.log(faceMatchSuccess)
    //Face comparison api comparison will return eucladian distance which means higher the difference lower the similarity of the faces
    //Resemble.js api will return "Mismatch" percentage which also means higher the percentage lower the similarity
    return Object.keys(patientData).length === 0 ? <div style={{height:"100vh",margin:"25px"}} > <img src="/spinner.gif" width={"100dvw"} height={"100dvh"} alt="" /> </div> : <IntlProvider locale={language} messages={message[language]} >
    {patientData.verified ? <div style={{height:"100dvh"}} ><h1 className={classes.heading} > <FormattedMessage id="patient_id_confirmed_message" defaultMessage="default" values={{language}} /> </h1> </div>
    :
    <>
    <div style={{height:"100vh"}} >
      <h1 className={classes.heading}> <FormattedMessage id="heading" defaultMessage="default" values={{language}} /> </h1>
    <p className={classes.profile_explanation} > <FormattedMessage id="patient_edit_profile_explanation" defaultMessage="default" values={{language}} /> </p>
    <p className={classes.profile_explanation} >  <FormattedMessage id="patient_edit_profile_first_step" defaultMessage="default" values={{language}} /> </p>
    {currentUser !== undefined && currentUser !== null ? <>
    {/* {currentUser.emailVerified ? 
    <FormattedMessage id="user_email_verified" defaultMessage="Default" values={{language}} />
    : 
    <div>
      <FormattedMessage id="user_email_not_verified" defaultMessage="Default" values={{language}} /> <br>
      </br>
      to be implemented
      <button  > <FormattedMessage id="send_verification_email" defaultMessage="Default" values={{language}} /> </button>
      </div>
    } */}
    <br />
    <br />
    <div className={classes.fields} id="fields" >
    <h3> <FormattedMessage id="send_your_photo" defaultMessage={"default"} values={language} /> </h3>
      <form onSubmit={e => handleSubmit(e)}>
      <label className={classes.button_class} htmlFor="file-upload">
      <input
      id='file-upload'
      style={{display: 'none'}}
      
            type="file"
            onChange={event => {
                setIdImageUpload(event.target.files[0]);
            }}
        />
        {language ==="tr" ? "Dosya Seç" : "Choose File"}
      </label>
        <button className={classes.button_class} onClick={(e)=>uploadIdFile(e)} >
        <FormattedMessage id="user_id_upload" defaultMessage="Default" values={{language}} />
        </button>
        <br />
        <button className={classes.button_class } disabled={loading}  type="submit">
        <FormattedMessage id="user_id_send" defaultMessage="Default" values={{language}} />
        </button>: 
        { 
        sentForReading ? 
        <img alt='' style={{marginLeft:"10px"}} width={30} height={30} src="/spinner.gif" ></img>
        : failed 
        ? <p className={classes.profile_explanation} ><FormattedMessage id={resultMessage} defaultMessage="Default" values={{language}} /></p> :
        succes ?  <p className={classes.profile_explanation} ><FormattedMessage id={resultMessage} defaultMessage="Default" values={{language}} /></p> : ""
        }
        
      </form>
        
        <br />
        {isId && isPersonId ? <div>
          <h3> <FormattedMessage id="send_your_photo" defaultMessage={"default"} values={language} /> </h3>
          <label className={classes.button_class} htmlFor="file-upload-picture">
          <input  
          id='file-upload-picture'
            type="file"
            style={{display:"none"}}
            onChange={event => {
                setPersonImageUpload(event.target.files[0]);
            }}
        />
        {language ==="en" ?"Choose File" : "Dosya Seç"}
          </label>
          
        <button className={classes.button_class} onClick={uploadPersonFile} >
        <FormattedMessage id="user_photo_button" defaultMessage="Default" values={{language}} />
        </button>
        </div> : "" }
        
    </div>
    
    {
        idImageUrl && personImageUrl ? <div>
            <img style={{marginLeft:"25px"}} crossOrigin='anonymous' width={200} height={"auto"} ref={idCardRef} src={idImageUrl} alt="" />
            <img crossOrigin='anonymous' width={200} height={"auto"} ref={selfieRef} src={personImageUrl} alt="" />
        </div> : "" 
    }
    <div>
    {
      faceMatchFailed ?
      <p className={classes.profile_explanation} ><FormattedMessage id={faceResultMessage} defaultMessage="default" values={{language}}  /> </p>
      : faceMatchSuccess ? <p className={classes.profile_explanation}> <FormattedMessage id={faceResultMessage} defaultMessage="default" values={{language}} /> </p> : ""
    }
    </div>
    </>
    :
    ""
    }
    </div>
    </>
    }
    
</IntlProvider>
    
}
export default EditProfile