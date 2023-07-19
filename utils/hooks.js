/* eslint-disable */
import {useEffect,useState,useRef,useCallback} from 'react';

//IF MEMORY LEAK HAPPENS CHANGE dependencies just in case.

export const useOnClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(!event);
    };
    document.addEventListener('mousedown', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
    };
  }, [handler, ref]);
};


export const useOnScreen=(options)=> {
  //Creating ref with ref hook
  const ref = useRef();

  //Visiblity state
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    //ref.curernt assigned to a variable for cleanup
    const current = ref.current;

    //Intersection observer takes a function which has an array parameter and returns
    //some information about viewport
    const observer = new IntersectionObserver(([entry]) => {
      //isIntersecting is one of those params which is a boolean and will return accordingly
      //to options which is an object {threshold,rootMargin,queryselector}
      // !Can't use querySelector we are using rootMargin
      setVisible(entry.isIntersecting);
    }, options);

    if (current) {
      //continue to observe current viewport
      observer.observe(current);
    }

    return () => {
      //cleanup function to stop unnecessary observing
      if (current) {
        observer.unobserve(current);
      }
    };
  }, [ref, options]); // useEffect will accordingly to ref and options parameters.

  // return this values where we use in components
  return [ref, visible];
}

export const useDimensions = ref => {
  const dimensions = useRef({ width: 0, height: 0 });

  useEffect(() => {
    dimensions.current.width = ref.current.offsetWidth;
    dimensions.current.height = ref.current.offsetHeight;
  }, [ref]);

  return dimensions.current;
};

export const useMediaQuery = (width) => {
  const [targetReached, setTargetReached] = useState(false);

  const updateTarget = useCallback(e =>{
      if(e.matches){
          setTargetReached(true);
      }else{
          setTargetReached(false);
      }
  },[]);

  useEffect(()=>{
      const media = window.matchMedia(`(max-width:${width}px)`);
      media.addEventListener('change',e => updateTarget(e))
      //Check on mount (callback is not called until a change occurs)
      if(media.matches){
          setTargetReached(true)
      }

      return () => media.removeEventListener('change',e => updateTarget(e))
  },[updateTarget, width])

  return targetReached;
}

export const delay = ms => new Promise(
  resolve => setTimeout(resolve,ms)
) 