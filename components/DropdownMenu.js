/* eslint-disable */
import { useState,useEffect,useRef } from 'react';
import { CSSTransition } from 'react-transition-group';
import classes from '../styles/dropdown.module.css'
import {storage,useAuth,logOut} from '../firebase/firebase';
import {ref,getDownloadURL} from 'firebase/storage';
import { useSelector } from 'react-redux';
import { setUserData } from '../redux/currentUserState';
import {useCookies} from 'react-cookie'
import { setSupportAgentData } from '../redux/supportAgentState';
import { setLanguage } from '../redux/theme';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import Link from 'next/link';

function DropdownMenu() {
    const [activeMenu, setActiveMenu] = useState('main');
    const [menuHeight, setMenuHeight] = useState(null);
    const [imgSrc,setImageSrc] = useState("");
    const [cookie,setCookie] =useCookies(["lang"])
    const dropdownRef = useRef(null);
    const userData = useSelector(state => state.userData.data)
    const language = useSelector(state => state.theme.language)
    
    const router = useRouter();
  
    const currentUser = useAuth();
    const dispatch = useDispatch();

    useEffect(() => {
      setMenuHeight(dropdownRef.current?.firstChild.offsetHeight)
      if(currentUser){
        getDownloadURL(ref(storage,`PersonImages/${currentUser.uid}.jpg`)).then(url=>{
          setImageSrc(url)
        }).catch(err => console.log(err))
      }
      
    }, [currentUser])
  
    function calcHeight(el) {
      const height = el.offsetHeight;
      setMenuHeight(height);
    }
  
    function DropdownItem(props) {
      return (
        <a href={props.slug} style={{color:"#dadce1", textDecoration: "none"}}  className={classes.menu_item} onClick={() => props.goToMenu && setActiveMenu(props.goToMenu)}>
          <span className={classes.icon_button}>{props.leftIcon}</span>
          {props.children}
          <span className={classes.icon_right}>{props.rightIcon}</span>
        </a>
      );
    }

    async function handleLogout(){
      dispatch(setUserData({}));
      dispatch(setSupportAgentData({}))
      try{
        logOut()
      }catch(error){
        alert(error);
      }
      router.push("/")
    }

    const handleChange = (lang) => {
      console.log("executed")
        dispatch(setLanguage(lang))
        setCookie("lang",lang)
        console.log(language)
      };
    if(Object.keys(userData).length !==0){
      return (
        <div className={classes.dropdown} style={{ height: menuHeight }} ref={dropdownRef}>
    
          <CSSTransition
            in={activeMenu === 'main'}
            timeout={500}
            classNames={classes.menu_primary}
            unmountOnExit
            onEnter={calcHeight}>
            <div className="menu">
              <DropdownItem slug={ userData.role==="patient" ? "/patient-profile" : "/doctor-profile"} leftIcon={imgSrc ? <img src={imgSrc} style={{borderRadius:"50%"}} width={35} height={35} /> : <i className='fa fa-user' ></i> }  >{language ==="en" ? "My Profile" : "Profilim"}
</DropdownItem>
              <Link href="/chat-page" >
              <DropdownItem goToMenu="main" leftIcon={<i className='fa-solid fa-question' ></i>}>
                {language ==="tr" ? "Yardım":"Help"}
              </DropdownItem>
              </Link>
              <DropdownItem
                leftIcon={<svg viewBox="0 0 512 512">
                <path d="M487.4 315.7l-42.6-24.6c4.3-23.2 4.3-47 0-70.2l42.6-24.6c4.9-2.8 7.1-8.6 5.5-14-11.1-35.6-30-67.8-54.7-94.6-3.8-4.1-10-5.1-14.8-2.3L380.8 110c-17.9-15.4-38.5-27.3-60.8-35.1V25.8c0-5.6-3.9-10.5-9.4-11.7-36.7-8.2-74.3-7.8-109.2 0-5.5 1.2-9.4 6.1-9.4 11.7V75c-22.2 7.9-42.8 19.8-60.8 35.1L88.7 85.5c-4.9-2.8-11-1.9-14.8 2.3-24.7 26.7-43.6 58.9-54.7 94.6-1.7 5.4.6 11.2 5.5 14L67.3 221c-4.3 23.2-4.3 47 0 70.2l-42.6 24.6c-4.9 2.8-7.1 8.6-5.5 14 11.1 35.6 30 67.8 54.7 94.6 3.8 4.1 10 5.1 14.8 2.3l42.6-24.6c17.9 15.4 38.5 27.3 60.8 35.1v49.2c0 5.6 3.9 10.5 9.4 11.7 36.7 8.2 74.3 7.8 109.2 0 5.5-1.2 9.4-6.1 9.4-11.7v-49.2c22.2-7.9 42.8-19.8 60.8-35.1l42.6 24.6c4.9 2.8 11 1.9 14.8-2.3 24.7-26.7 43.6-58.9 54.7-94.6 1.5-5.5-.7-11.3-5.6-14.1zM256 336c-44.1 0-80-35.9-80-80s35.9-80 80-80 80 35.9 80 80-35.9 80-80 80z" class=""/>
                </svg>}
                rightIcon={<svg viewBox="0 0 256 512">
                <path d="M24.707 38.101L4.908 57.899c-4.686 4.686-4.686 12.284 0 16.971L185.607 256 4.908 437.13c-4.686 4.686-4.686 12.284 0 16.971L24.707 473.9c4.686 4.686 12.284 4.686 16.971 0l209.414-209.414c4.686-4.686 4.686-12.284 0-16.971L41.678 38.101c-4.687-4.687-12.285-4.687-16.971 0z" class=""/>
                </svg>}
                goToMenu="settings">
                {language ==="en" ? "Settings" : "Ayarlar"}
              </DropdownItem>
              <div onClick={()=>handleLogout()} ><DropdownItem leftIcon={
            <i className='fa-solid fa-right-from-bracket' ></i>} >
                {language ==="en" ? "Logout" : "Çıkış Yap"}
              </DropdownItem>
              </div>
            </div>
          </CSSTransition>
    
          <CSSTransition
            in={activeMenu === 'settings'}
            timeout={500}
            classNames={classes.menu_secondary}
            unmountOnExit
            onEnter={calcHeight}>
            <div className={classes.menu}>
              <DropdownItem goToMenu="main" leftIcon={<svg viewBox="0 0 448 512">
              <path fill="currentColor" d="M257.5 445.1l-22.2 22.2c-9.4 9.4-24.6 9.4-33.9 0L7 273c-9.4-9.4-9.4-24.6 0-33.9L201.4 44.7c9.4-9.4 24.6-9.4 33.9 0l22.2 22.2c9.5 9.5 9.3 25-.4 34.3L136.6 216H424c13.3 0 24 10.7 24 24v32c0 13.3-10.7 24-24 24H136.6l120.5 114.8c9.8 9.3 10 24.8.4 34.3z" class=""/>
              </svg>}>
                <h2>
                {language ==="en" ? "My Settings" : "Ayarlarım"}
                </h2>
              </DropdownItem>
                {
                  language === "en" && <div onClick={()=>handleChange("tr")} ><DropdownItem leftIcon={<img style={{borderRadius:"50%"}} width={30} height={30} src="/tr-flag.jpg" />}>
                     Türkçe 
                  </DropdownItem>
                  </div>
                }
                {
                  language === "tr" && <div onClick={()=>handleChange("en")} > <DropdownItem leftIcon={<img style={{borderRadius:"50%"}} width={30} height={30} src="/en-flag.jpg" />}>
                     English
                  </DropdownItem> </div>
                }
                <Link href={userData.role==="patient" ? "/patient-edit-profile" : "/doctor-edit-profile"}>
                <DropdownItem leftIcon={
                <i className='fa fa-user' ></i>
                }>
                {language ==="en" ? "Profile Settings" : "Profil Ayarlar"}
                </DropdownItem>
                </Link>
                <Link href={userData.role==="patient" ? "/patient-insurance" : "/doctor-insurance"}>
                <DropdownItem leftIcon={<i class="fa-regular fa-file"></i>} >
                {language ==="en" ? "Insurance Settings" : "Sigorta Ayarları"}
                </DropdownItem>
                </Link>
                <Link href={"/determine-locations"}>
                <DropdownItem leftIcon={<i class="fa-solid fa-location-dot"></i>} >
                {language ==="en" ? "Location Settings" : "Konum Ayarları"}
                </DropdownItem>
                </Link>
                <Link href={userData.role==="patient" ? "/patient-schedule" : "/doctor-schedule"}>            
                <DropdownItem leftIcon={<i class="fa-solid fa-calendar-days"></i>} >
                {language ==="en" ? "Schedule Settings" : "Takvim Ayarları"}
                </DropdownItem>
                </Link>  
            </div>
          </CSSTransition>
  
        </div>
      )
    }else{
      return ;
    }
    
  }

export default DropdownMenu;