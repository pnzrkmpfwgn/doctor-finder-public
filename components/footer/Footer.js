/* eslint-disable */
import classes from "../../styles/Footer.module.css";

export default function Footer() {
  return (
    <footer title="footer" id="footer" className={classes.background + " " + classes.footer}>
      <small title="Ülkü Ayberk Yiğit" id="ülkü_ayberk_yiğit">
        {" "}
        Doctor Finder &copy; {new Date().getFullYear()}{" "}
      </small>
    </footer>
  );
}