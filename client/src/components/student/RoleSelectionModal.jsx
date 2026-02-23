import React, { useState, useContext } from 'react';
import { assets } from '../../assets/assets';
import { useClerk } from '@clerk/clerk-react';
import { AppContext } from '../../context/AppContext';

const RoleSelectionModal = ({ isOpen, onClose }) => {
    const [step, setStep] = useState(1); // 1: Login vs Create, 2: Role Selection
    const [selectedRole, setSelectedRole] = useState(null);
    const { openSignIn, openSignUp } = useClerk();

    if (!isOpen) return null;

    const handleBack = () => {
        if (step === 2) setStep(1);
        else onClose();
    };

    const handleContinue = () => {
        if (step === 1) {
            setStep(2);
        } else if (selectedRole) {
            openSignUp({
                unsafeMetadata: { role: selectedRole }
            });
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="relative bg-[#120721] border border-white/10 w-full max-w-md rounded-2xl p-8 shadow-2xl overflow-hidden my-auto">


                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl -z-10"></div>

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {step === 1 ? (
                    <div className="text-center">
                        <img src={assets.logo} alt="Logo" className="w-32 mx-auto mb-8" />
                        <h2 className="text-2xl font-bold text-white mb-4">Welcome to Lurnix</h2>
                        <p className="text-gray-400 mb-8">Join our community of learners and educators</p>

                        <div className="space-y-4">
                            <button
                                onClick={() => { openSignIn(); onClose(); }}
                                className="w-full py-3 px-4 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all font-medium"
                            >
                                Already have an account? Log In
                            </button>
                            <button
                                onClick={() => setStep(2)}
                                className="w-full py-3 px-4 bg-primary text-white rounded-xl hover:bg-opacity-90 transition-all font-bold shadow-lg shadow-primary/20"
                            >
                                Create New Account
                            </button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <button
                            onClick={() => setStep(1)}
                            className="flex items-center text-sm text-purple-400 hover:text-purple-300 mb-6"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back
                        </button>

                        <h2 className="text-2xl font-bold text-white mb-2 text-center">Choose Your Role</h2>
                        <p className="text-gray-400 text-center mb-8">This determines your access level</p>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div
                                onClick={() => setSelectedRole('student')}
                                className={`cursor-pointer group p-6 rounded-2xl border transition-all duration-300 ${selectedRole === 'student'
                                    ? 'bg-primary/20 border-primary shadow-lg shadow-primary/10 scale-[1.02]'
                                    : 'bg-white/5 border-white/10 hover:border-white/20'
                                    }`}
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${selectedRole === 'student' ? 'bg-primary text-white' : 'bg-white/10 text-gray-400 group-hover:text-white'
                                    }`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path d="M12 14l9-5-9-5-9 5 9 5z" />
                                        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                                    </svg>
                                </div>
                                <h3 className="font-bold text-white mb-1">Student</h3>
                                <p className="text-xs text-gray-400">Join courses and learn</p>
                            </div>

                            <div
                                onClick={() => setSelectedRole('educator')}
                                className={`cursor-pointer group p-6 rounded-2xl border transition-all duration-300 ${selectedRole === 'educator'
                                    ? 'bg-primary/20 border-primary shadow-lg shadow-primary/10 scale-[1.02]'
                                    : 'bg-white/5 border-white/10 hover:border-white/20'
                                    }`}
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${selectedRole === 'educator' ? 'bg-primary text-white' : 'bg-white/10 text-gray-400 group-hover:text-white'
                                    }`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-7h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <h3 className="font-bold text-white mb-1">Educator</h3>
                                <p className="text-xs text-gray-400">Share knowledge and earn</p>
                            </div>
                        </div>

                        <button
                            disabled={!selectedRole}
                            onClick={handleContinue}
                            className={`w-full py-4 rounded-xl font-bold transition-all shadow-lg ${selectedRole
                                ? 'bg-primary text-white hover:bg-opacity-90 shadow-primary/20'
                                : 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/5'
                                }`}
                        >
                            Continue to Sign Up
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoleSelectionModal;
