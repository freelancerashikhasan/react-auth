import React, { useEffect } from 'react';
import PhoneLogin from './PhoneLogin';
import OtpVerification from './OtpVerification';
import { useAuth } from '../context/AuthContext';
import Layout from '../Layout/Layout';
import '../Components/css/Login.css';

const Login = () => {
    const { otpSent,getAndStoreRedirectUrl  } = useAuth();
      useEffect(() => {
        getAndStoreRedirectUrl();
    }, [getAndStoreRedirectUrl]);

    return (
        <Layout>
            <div className="login-page">
                <div className="background-animation">
                    <div className="blob blob-1"></div>
                    <div className="blob blob-2"></div>
                    <div className="blob blob-3"></div>
                </div>

                <div className="login-content">
                    {otpSent ? <OtpVerification /> : <PhoneLogin />}
                </div>
            </div>
        </Layout>
    );
};

export default Login;