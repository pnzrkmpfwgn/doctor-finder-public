/* eslint-disable */
import { useSelector } from "react-redux"
import StarRating from "../components/StarRating";
import pageClasses from '../styles/docPage.module.css';
export default function TestimonialsForDoctor(){
    const userData = useSelector(state => state.userData.data);
    const language = useSelector(state => state.theme.language)
    return <div style={{height:"100vh"}} >       
        {Object.keys(userData).length!==0 ? userData.testimonials.map(item=>(
            <div style={{marginBottom:"25px"}} key={item.from} className={pageClasses.card}>
            <div className={pageClasses.card_container}>
            <div>
            {!item.isAnonymous ? <div style={{marginTop:"10px"}} > <i className={"fa fa-user " + pageClasses.person_icon} ></i> <p style={{fontWeight:"bold",fontSize:"28px"}} >{item.name + " " + item.surname }</p> </div> :<div style={{marginTop:"10px"}} ><i className={"fa fa-user " + pageClasses.person_icon} ></i><p style={{color: "rgb(169, 169, 169)",}} > {language==="en" ? "Anonymous": "Anonim"} </p></div>}
            <div> <p style={{fontStyle:"italic"}} > {language==="en" ? "Posted At": "Gönderildi"}: {item.created_at} </p> </div>
            </div>
                    <p className={pageClasses.testimonial_text}> <i class="fa-solid fa-quote-left"></i> {item.testimonial_text} <i class="fa-solid fa-quote-right"></i> </p>
                    <StarRating rating={item.rating} />
                </div>
              </div>
        )) :<img src="/spinner.gif" />}
    </div>
}