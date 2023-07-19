/* eslint-disable */
import pageClasses from '../styles/starRating.module.css'
const StarRating = ({rating}) => {
    return (
      <div className={pageClasses.star_rating}>
        {[...Array(5)].map((star, index) => {
          index += 1;
          return (
            index <= (rating)
                ? 
                <span
                
                key={index}
                className={pageClasses.on }
              >
                <span className={pageClasses.star}>&#9733;</span>
              </span>
                :
                <span
                
                key={index}
                className={pageClasses.off}
              >
                <span className={pageClasses.star}>&#9733;</span>
              </span>
          );
        })}
      </div>
    );
  };////////////////

  export default StarRating;