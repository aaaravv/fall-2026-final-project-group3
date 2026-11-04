import React, { useCallback, useEffect, useRef, useState } from 'react';
// @ts-ignore CSS imports are handled by the bundler.
import './OnboardingFlow.css';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface GoogleCredentialResponse {
    credential?: string;
}

declare global {
    interface Window {
        google?: {
            accounts: {
                id: {
                    initialize: (options: {
                        client_id: string;
                        callback: (response: GoogleCredentialResponse) => void;
                    }) => void;
                    renderButton: (
                        parent: HTMLElement,
                        options: {
                            theme: 'outline';
                            size: 'large';
                            text: 'continue_with';
                            shape: 'rectangular';
                            width: number;
                        }
                    ) => void;
                };
            };
        };
    }
}

export const OnboardingFlow: React.FC = () => {
    // Track which step the user is on
    const [step, setStep] = useState<'signup' | 'profile' | 'complete'>('signup');
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [authError, setAuthError] = useState('');
    const [profileError, setProfileError] = useState('');
    const googleButtonRef = useRef<HTMLDivElement>(null);
    //
    const [formData, setFormData] = useState({
        firstName: '',
        stretchability: '3'
    });

    const handleGoogleCredential = useCallback(async (response: GoogleCredentialResponse) => {
        if (!response.credential) {
            setAuthError('Google did not return a sign-in credential. Please try again.');
            return;
        }

        if (!API_BASE_URL) {
            setAuthError('Sign-in is not configured. Add the backend URL to .env.local and restart the app.');
            return;
        }

        setAuthError('');
        setIsSigningIn(true);

        try {
            const apiBaseUrl = API_BASE_URL.replace(/\/+$/, '');
            const backendResponse = await fetch(`${apiBaseUrl}/api/auth/google`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ credential: response.credential })
            });

            if (!backendResponse.ok) {
                throw new Error(`Sign-in failed (HTTP ${backendResponse.status}). Please try again.`);
            }

            const result: { user?: { firstName?: string | null } } = await backendResponse.json();
            const googleFirstName = result.user?.firstName;
            if (googleFirstName) {
                setFormData((current) => ({ ...current, firstName: googleFirstName }));
            }
            setStep('profile');
        } catch (error) {
            setAuthError(
                error instanceof Error
                    ? error.message
                    : 'Could not complete Google sign-in. Please try again.'
            );
        } finally {
            setIsSigningIn(false);
        }
    }, []);

    useEffect(() => {
        if (step !== 'signup' || !googleButtonRef.current) {
            return;
        }

        if (!GOOGLE_CLIENT_ID) {
            setAuthError('Google sign-in is not configured. Add the client ID to .env.local and restart the app.');
            return;
        }

        let isCancelled = false;
        const buttonContainer = googleButtonRef.current;
        let script = document.querySelector<HTMLScriptElement>('script[data-google-identity-services]');

        const handleScriptLoad = () => {
            if (isCancelled) {
                return;
            }

            if (!window.google) {
                setAuthError('Google sign-in could not be initialized. Please refresh and try again.');
                return;
            }

            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: handleGoogleCredential
            });
            window.google.accounts.id.renderButton(buttonContainer, {
                theme: 'outline',
                size: 'large',
                text: 'continue_with',
                shape: 'rectangular',
                width: 300
            });
        };

        const handleScriptError = () => {
            if (!isCancelled) {
                setAuthError('Google sign-in could not load. Check your connection and try again.');
            }
        };

        if (window.google) {
            handleScriptLoad();
        } else {
            if (!script) {
                script = document.createElement('script');
                script.src = 'https://accounts.google.com/gsi/client';
                script.async = true;
                script.defer = true;
                script.dataset.googleIdentityServices = 'true';
                document.head.appendChild(script);
            }

            script.addEventListener('load', handleScriptLoad);
            script.addEventListener('error', handleScriptError);
        }

        return () => {
            isCancelled = true;
            script?.removeEventListener('load', handleScriptLoad);
            script?.removeEventListener('error', handleScriptError);
        };
    }, [handleGoogleCredential, step]);

    // Handle input changes for the form fields
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!API_BASE_URL) {
            setProfileError('Profile saving is not configured. Add the backend URL to .env.local and restart the app.');
            return;
        }

        setProfileError('');
        setIsSavingProfile(true);
        try {
            const apiBaseUrl = API_BASE_URL.replace(/\/+$/, '');
            const response = await fetch(`${apiBaseUrl}/api/profile`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: formData.firstName,
                    stretchability: Number(formData.stretchability)
                })
            });

            if (!response.ok) {
                let message = `Could not save your profile (HTTP ${response.status}).`;
                try {
                    const result: { error?: string } = await response.json();
                    if (result.error) {
                        message = result.error;
                    }
                } catch {
                    // Keep the HTTP status message when the server doesn't return JSON.
                }
                throw new Error(message);
            }

            setStep('complete');
        } catch (error) {
            setProfileError(
                error instanceof Error
                    ? error.message
                    : 'Could not save your profile. Please try again.'
            );
        } finally {
            setIsSavingProfile(false);
        }
    };

    // 
    return(
        <div className="onboarding-wrapper">
            <div className="onboarding-card">
                {/* Sign up with OAuth */}
                {step === 'signup' && (
                    <div className="step-container">
                        <h1 className="brand-title">StretchMaster</h1>
                        <p className="brand-subtitle">REACH YOUR TOES DAMN IT</p>

                        <div className="oauth-buttons">
                            <div
                                ref={googleButtonRef}
                                className={`google-button-container${isSigningIn ? ' is-loading' : ''}`}
                                aria-busy={isSigningIn}
                                aria-disabled={isSigningIn}
                            />
                            {isSigningIn && <p className="auth-status" role="status">Signing you in...</p>}
                            {authError && <p className="auth-error" role="alert">{authError}</p>}
                        </div>
                    </div>
                )}

                {/* Profile setup step */}
                {step === 'profile' && (
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

                        <button type="submit" className="submit-btn" disabled={isSavingProfile}>
                            {isSavingProfile ? 'Saving...' : 'Save Profile'}
                        </button>
                        {profileError && <p className="auth-error" role="alert">{profileError}</p>}
                    </form>
                )}
                {/* Completion step */}
                {step === 'complete' && (
                    <div className="step-container">
                        <h2>You're all set, {formData.firstName}! 🎉</h2>
                        <p className="brand-subtitle">Your profile has been saved.</p>
                        <button className="submit-btn" onClick={() => alert('Entering StretchMaster Dashboard...')}>
                            Let's Go
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
