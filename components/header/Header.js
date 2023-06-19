/* eslint-disable */
import { IntlProvider,FormattedMessage } from "react-intl";
import { useSelector, useDispatch } from "react-redux";
import {useAuth} from '../../firebase/firebase';
import { setLanguage } from "../../redux/theme";
import { useRouter} from 'next/router';
import {useCookies} from 'react-cookie';
import { useEffect,useState } from "react";
import {message} from '../../data/langData';
import Link from "next/link";
import classes from "../../styles/nav.module.css";
import Navbar from "../Navbar";
import NavItem from "../NavItem";
import DropdownMenu from "../DropdownMenu";

export default function Header({visible}){
    const [cookie, setCookie] = useCookies(["lang"])

    const [logoStyle, setLogoStyle] = useState({});
    const [style, setStyle] = useState({});


    // const loading = useSelector(state => state.auth.loading);
    const language = useSelector(state => state.theme.language);
    const dispatch = useDispatch();

    const user = useAuth();
    useEffect(() => {
        if (!visible) {
          setStyle({
            padding: "0",
            fontSize: "20px",
            height: "100px",
            transition: "0.4s"
          });
          setLogoStyle({
            transform: "scale(0.6)",
            transition: "0.4s",
          });
        } else {
          setStyle({
            padding: "10px 5px",
            fontSize: "24px",
            transition: "0.4s"
          });
          setLogoStyle({
            transform: "scale(1)",
            transition: "0.4s",
          });
        }
      }, [visible]);
    
    useEffect(()=>{
        if(cookie.lang){
            dispatch(setLanguage(cookie.lang))
          }else if(navigator.language){
            let ln = navigator.language.split("-")
            dispatch(setLanguage(ln[0]))
            setCookie("lang",ln[0])
          }
    },[cookie.lang, dispatch, setCookie])

   
    
    // async function handleLogout(){
    //     setLoading(true);
    //     dispatch(setUserData({}));
    //     dispatch(setSupportAgentData({}))
    //     try{
    //       logOut()
    //     }catch(error){
    //       alert(error);
    //     }
    //     router.push("/")
    //   }
    

    const router = useRouter();
    const handleChange = (lang) => {
      console.log("executed")
        dispatch(setLanguage(lang))
        setCookie("lang",lang)
        console.log(language)
      };
    return<IntlProvider locale={language} messages={message[language]} > <header>
      
    {/* {user ? <button onClick={handleLogout} ><FormattedMessage id="logout_button" defaultMessage="Default" values={{language}} ></FormattedMessage></button> 
    : <div>
    <Link href="/patient-sign-up" ><FormattedMessage id="patient_sign_up_link"/></Link> <br/> 
    <Link href="/doctor-sign-up" ><FormattedMessage id="doctor_sign_up_link"/></Link> <br/>
    <Link href="/patient-login" ><FormattedMessage id="patient_login_link"/></Link> <br/>
    <Link href="/doctor-login" ><FormattedMessage id="doctor_login_link"/></Link> <br/>
    </div>
    
    } */}
    <Navbar>
      <div style={{display:"flex",justifyContent:"space-between",width:"100%"}} >
      <Link href="/" >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img style={{marginTop:"5px"}} className={classes.logo} src="/logo.png" />
      </Link>
      <div style={{display:"flex","flexDirection":"row",justifyContent:"center",alignItems:"center"}} >
      {user ? <NavItem icon={<svg viewBox="0 0 320 512">
        <path d="M31.3 192h257.3c17.8 0 26.7 21.5 14.1 34.1L174.1 354.8c-7.8 7.8-20.5 7.8-28.3 0L17.2 226.1C4.6 213.5 13.5 192 31.3 192z" class=""/>
      </svg>} >
      <DropdownMenu></DropdownMenu>
      </NavItem> : <div>
      <div style={{display:"flex"}} >
      <Link href="/login" className={classes.link} > <FormattedMessage id="login_button" defaultMessage="Default" values={{language}} /> </Link>
      <Link href="/signup" className={classes.link} > <FormattedMessage id="sign_up_button" defaultMessage="Default" values={{language}} /></Link>
      {language ==="tr" && <img onClick={()=>dispatch(setLanguage("en"))} style={{borderRadius:"50%",marginTop:"30px",marginRight:"15px"}} width={30} height={30} src="/en-flag.jpg" />}
      {language ==="en" && <img onClick={()=>dispatch(setLanguage("tr"))} style={{borderRadius:"50%",marginTop:"30px",marginRight:"15px"}} width={30} height={30} src="/tr-flag.jpg" />}
      
      </div>
      </div> }
      </div>
      </div>
    </Navbar>
    
    </header>
    </IntlProvider>
}

{/* <motion.nav initial={{opacity:0,y:-200}} animate={{opacity:1,y:0}} transition={{duration:0.3,ease:"easeInOut"}}  style={style} className={classes.Nav}>
      
        <Link href={"/"} style={logoStyle}>
          <Image
            title="Karbel Çelik"
            id="logo"
            src={"/Logo.png"}
            width={300}
            height={200}
            alt="logo"
            className={classes.logo}
          />
        </Link>
      
      <ul className={classes.links_container}>
        <li>
          {!user &&  <Link
              className={classes.link_login}
              title="Hakkımızda Linki"
              id="hakkımızda_linki_nav"
              href="/login"
            >
              Login
            </Link>}
        </li>
        <li>
          {!user && <Link
              className={classes.link_login}
              title="Hakkımızda Linki"
              id="hakkımızda_linki_nav"
              href="/signup"
            >
              Sign Up
            </Link>}
        </li>
        <li>
          
            <Link
              className={classes.link}
              title="Hakkımızda Linki"
              id="hakkımızda_linki_nav"
              href="/"
            >
              Anasayfa
            </Link>
        
        </li>
        <li style={{display:"flex",justifyContent:"start",alignItems:"center"}} >
       <motion.div
       whileHover={{
        scale:1.1
      }}
       >
       {language==="en" && <Image alt="flag" onClick={()=>handleChange("tr")} src={"/tr-flag.jpg"} width={35} height={25} className={classes.flag_button}/>}
        {language==="tr" && <Image alt="flag" onClick={()=>handleChange("en")} src={"/en-flag.jpg"} width={35} height={25} className={classes.flag_button}/>  }
       </motion.div>
      {user && <button className={classes.button_class} >  <i onClick={()=>logOut()} className={"fa-solid fa-right-from-bracket"}></i></button>}
        </li>

        <li>
        
        </li>
      </ul>
      {/* <div className={classes.social_icons}>
        <a
          href="https://twitter.com/KarbelC"
          title="Twitter Linki"
          id="twitter_linki_nav"
        >
          <i className={"fab fa-twitter-square fa-lg " + classes.icon}></i>
        </a>
        <a
          href="https://www.facebook.com/Karbel-%C3%87elik-107643741432544"
          title="Facebook Linki"
          id="facebook_linki_nav"
        >
          <i className={"fab fa-facebook-square fa-lg " + classes.icon}></i>{" "}
        </a>
        <a
          href="https://www.linkedin.com/in/fikret-yi%C4%9Fit-24518a20a/"
          title="Linkedin Linki"
          id="linkedin_linki_nav"
        >
          <i className={"fab fa-linkedin fa-lg " + classes.icon}></i>{" "}
        </a>
      </div> */}
   //s </motion.nav> */}