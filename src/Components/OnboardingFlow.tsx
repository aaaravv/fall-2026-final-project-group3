import React, { useState } from 'react';
// @ts-ignore CSS imports are handled by the bundler.
import './OnboardingFlow.css';

export const OnboardingFlow: React.FC = () => {
    // Track which step the user is on
    const [step, setStep] = useState<'signup' | 'profile' | 'complete'>('signup');
    //
    const [formData, setFormData] = useState({
        firstName: '',
        stretchability: '3'
    });
    // Handle input changes for the form fields
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Handle profile userID check
    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Sending profile data to backend for user id check', formData);
        //once complete and checked for first time move on
        setStep('complete');
    };

    // 
    return(
        <div className="onboarding-wrapper">
            <div className="onboarding-card">
                {/* Sign up with OAuth */}
                {step == 'signup'&& (
                    <div className="step-container">
                        <h1 className="brand-title">StretchMaster</h1>
                        <p className="brand-subtitle">REACH YOUR TOES DAMN IT</p>

                        <div className="oauth-buttons">
                            <button className="oauth-btn google-btn"
                                onClick={() => setStep('profile')}
                            >
                                Sign in with Google
                            </button>
                        </div>
                    </div>
                )}

                {/* Profile setup step */}
                {step == 'profile' && (
                    <form onSubmit={handleProfileSubmit} className="step-container">
                        <h2>Tell us about yourself</h2>
                        <p className="step-desc">Let's get your info down queen</p>
                        {/* Name input field */}
                        <div className="input-group">
                            <label>Name</label>
                            <input 
                                type="text" 
                                name="firstName" 
                                value={formData.firstName} 
                                onChange={handleInputChange} 
                                placeholder="Enter your name" 
                                required 
                            />
                        </div>

                        {/* 1-5 stretch scale */}
                        <div className="input-group">
                            <label>Stretchability (1-5)</label>
                            <select  
                                name="stretchability" 
                                value={formData.stretchability} 
                                onChange={handleInputChange} 
                                className="stretch-select"
                            >
                                <option value="1">1 - Brick wall(Can't reach shins)</option>
                                <option value="2">2 - Getting there(Can reach ankles)</option>
                                <option value="3">3 - Moderate(Can touch toes with bent knee)</option>
                                <option value="4">4 - Flexible(Can touch toes)</option>
                                <option value="5">5 - Gummy worm(Grabbing the bottom of your feet)</option>
                            </select>
                        </div>

                        <button type="submit" className="submit-btn">
                            Save Profile
                        </button>
                    </form>
                )}
                {/* Completion step */}
                {step === 'complete' && (
                    <div className="step-container">
                        <h2>You're all set, {formData.firstName}! 🎉</h2>
                        <p className="brand-subtitle">User ID verified & profile saved.</p>
                        <button className="submit-btn" onClick={() => alert('Entering StretchMaster Dashboard...')}>
                            Let's Go
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
