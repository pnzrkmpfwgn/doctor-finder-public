/* eslint-disable */
//*LEGACY
import { useEffect,useState,useRef } from "react";

import classes from  "../../styles/dropdown.module.css";

function DropdownItem({img,text}){
  return(
    <li className = {classes.dropdownItem}>
      <img src={img}></img>
      <a> {text} </a>
    </li>
  );
}

const Dropdown = () => {
  
  const [open, setOpen] = useState(false);

  let menuRef = useRef();

  useEffect(() => {
    let handler = (e)=>{
      if(!menuRef.current.contains(e.target)){
        setOpen(false);
        console.log(menuRef.current);
      }      
    };

    document.addEventListener("mousedown", handler);
    

    return() =>{
      document.removeEventListener("mousedown", handler);
    }

  });
  return (<div className={classes.menu_container} ref={menuRef}>
  <div className={classes.menu_trigger} onClick={()=>{setOpen(!open)}}>
    <i className="fa fa-user" ></i>
  </div>

  <div className={ classes.dropdown_menu + " " + open ? classes.active : classes.inactive} >
    <h3>The Kiet<br/><span>Website Designer</span></h3>
    <ul>
      <DropdownItem  text = {"My Profile"}/>
      <DropdownItem  text = {"Edit Profile"}/>
      <DropdownItem  text = {"Inbox"}/>
      <DropdownItem  text = {"Settings"}/>
      <DropdownItem  text = {"Helps"}/>
      <DropdownItem  text = {"Logout"}/>
    </ul>
  </div>
</div>
  );
};

export default Dropdown;