/* eslint-disable */
import { useState } from "react";
import classes from '../styles/starRatingButton.module.css'
import { useEffect } from "react";
const StarRatingButton = () => {
    const[rating,setRating] = useState(0);
    const [hover, setHover] = useState(0);

    const handleRating = (index) => {
        setRating(index)
        if(typeof window !== 'undefined'){
          localStorage.setItem("rating",rating)
        }
    }
    useEffect(()=>{
      if(typeof window !== "undefined"){
        localStorage.getItem("rating");
      }
    },[])

    return (
      <div className={classes.star_rating}>
        {[...Array(5)].map((star, index) => {
          index += 1;
          return (
            <span
              
              key={index}
              className={index <= (hover || rating) ? classes.on : classes.off}
              onClick={() => handleRating(index)}
              onMouseEnter={() => setHover(index)}
              onMouseLeave={() => setHover(rating)}
            >
              <span className={classes.star}>&#9733;</span>
            </span>
          );
        })}
      </div>
    );
  };

export default StarRatingButton