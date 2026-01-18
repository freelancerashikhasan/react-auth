import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation(); // get current route

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth', // optional, can use 'auto'
    });
  }, [pathname]); // run effect whenever route changes

  return null; // this component does not render anything
};

export default ScrollToTop;
