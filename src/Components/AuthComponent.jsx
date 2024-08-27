import React, { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { Link } from 'react-router-dom';

function AuthComponent() {
    const { authToken, userEmail, logout } = useContext(AuthContext);

    return (
        <div>
            {authToken ? (
                <p className='text-danger'>
                    Logged in as: {userEmail}
                    <button onClick={logout}>Logout</button>
                </p>
            ) : (
                <Link to="/form">Go to Form</Link>
            )}
        </div>
    );
}

export default AuthComponent;
