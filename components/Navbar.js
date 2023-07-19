/* eslint-disable */
import classes from '../styles/navbar.module.css'

function Navbar(props) {
    return (
      <nav className={classes.navbar}>
        <ul className={classes.navbar_nav}>{props.children}</ul>
      </nav>
    );
  }

export default Navbar;