import React from 'react'
import { Navigate, NavLink, useLocation } from 'react-router-dom'
import AuthComponent from './AuthComponent';


const useAuth = () => {
    // Replace this with your actual token check logic
    const token = localStorage.getItem('authToken');
    return !!token;
  };
  
  function Menu() {
    const isAuthenticated = useAuth();
    const location = useLocation();
  
    // Redirect based on authentication status
    if (!isAuthenticated && location.pathname !== '/form') {
      return <Navigate to="/form" />;
    }
    
    if (isAuthenticated && location.pathname === '/form') {
      return <Navigate to="/" />;
    }
    return (
        <div>
            <ul>
                <li><NavLink className={(isActive)=>isActive?'active':'inactive'} to="/">Home</NavLink></li>
                <li><NavLink to="/chat/10"  className={(isActive)=>isActive?'active':'inactive'}>Chat</NavLink></li>
                <li><NavLink to="/form"  className={(isActive)=>isActive?'active':'inactive'}>Form</NavLink></li>
            </ul>
        </div>
    )
}

export default Menu
