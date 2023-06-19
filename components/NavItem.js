/* eslint-disable */
import classes from '../styles/navbar.module.css'
import {useState,useEffect} from 'react'

function NavItem(props) {
    const [open, setOpen] = useState(false);
    // useEffect(()=>{
    //     const handler = () => {
    //         setOpen(false)
    //     }

    //     window.addEventListener("click",handler);

    //     return ()=>{
    //         window.removeEventListener("click",handler)
    //     }
    //   });
    return (
      <li className={classes.nav_item}>
        <a href="#" className={classes.icon_button} onClick={(e) =>{e.stopPropagation(); setOpen(!open)}}>
          {props.icon}
        </a>
  
        {open && props.children}
      </li>
    );
  }

export default NavItem;