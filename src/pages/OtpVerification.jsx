import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const OtpVerification = () => {
    const { verifyOtp, phoneNumber, resetOtpState } = useAuth();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(300);
    const inputRefs = useRef([]);

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    const handleChange = (index, value) => {
        if (value.length > 1) return;
        
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1].focus();
        }

        if (newOtp.every(digit => digit !== '') && index === 5) {
            handleSubmit();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleSubmit = async () => {
        const otpString = otp.join('');
        if (otpString.length !== 6) return;

        setLoading(true);
        try {
            await verifyOtp(otpString);
        } catch (error) {
            console.error(error);
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0].focus();
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleResendOtp = async () => {
        setTimer(300);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0].focus();
    };

    return (
        <div className="otp-container">
            <div className="otp-card">
                {/* Back Button */}
                <button
                    onClick={resetOtpState}
                    className="back-button"
                >
                    <ArrowLeft className="back-icon" />
                </button>

                {/* Header */}
                <div className="otp-header">
                    <div className="otp-icon-container">
                        <svg className="otp-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h2 className="otp-title">Enter Verification Code</h2>
                  <p className="otp-subtitle">
                        We sent a code to <span className="phone-number">{phoneNumber}</span>
                        <br />
                        <small className="otp-method">via {phoneNumber.includes('whatsapp') ? 'WhatsApp' : 'SMS'}</small>
                    </p>
                </div>

                {/* OTP Inputs */}
                <div className="otp-form-container">
                    <div className="otp-inputs">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => inputRefs.current[index] = el}
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength="1"
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="otp-input"
                            />
                        ))}
                    </div>

                    {/* Timer */}
                    <div className="timer-container">
                        <Clock className="timer-icon" />
                        <span className="timer-text">{formatTime(timer)}</span>
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={loading || otp.join('').length !== 6}
                        className={`otp-submit-btn ${loading ? 'loading' : ''}`}
                    >
                        {loading ? 'Verifying...' : 'Verify OTP'}
                    </button>

                    {/* Resend OTP */}
                    <div className="resend-container">
                        <button
                            onClick={handleResendOtp}
                            disabled={timer > 0}
                            className={`resend-btn ${timer > 0 ? 'disabled' : ''}`}
                        >
                            {timer > 0 ? `Resend OTP in ${formatTime(timer)}` : 'Resend OTP'}
                        </button>
                    </div>

                    {/* Footer Note */}
                    <div className="otp-footer">
                        <p className="footer-text">
                            Didn't receive the code? Check your spam folder or{' '}
                            <button onClick={resetOtpState} className="footer-link">
                                try another method
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OtpVerification;