import React, { useContext, useState, useEffect, useRef } from 'react';
import { assets } from '../../assets/assets';
import { Link, useLocation } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { useClerk, UserButton, useUser } from '@clerk/clerk-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import ConfirmModal from './ConfirmModal';

const Navbar = () => {

  const location = useLocation();

  const isCoursesListPage = location.pathname.includes('/course-list');

  const { backendUrl, isEducator, setIsEducator, navigate, getToken } = useContext(AppContext)

  const { openSignIn, openSignUp } = useClerk()
  const { user } = useUser()

  const [aiDropdownOpen, setAiDropdownOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const aiRef = useRef(null);
  const moreRef = useRef(null);
  const mobileAiRef = useRef(null);
  const mobileMoreRef = useRef(null);

  const role = user?.publicMetadata?.role || 'student';

  useEffect(() => {
    const handleClickOutside = (event) => {
      const isOutsideAi = (!aiRef.current || !aiRef.current.contains(event.target)) &&
        (!mobileAiRef.current || !mobileAiRef.current.contains(event.target));

      const isOutsideMore = (!moreRef.current || !moreRef.current.contains(event.target)) &&
        (!mobileMoreRef.current || !mobileMoreRef.current.contains(event.target));

      if (isOutsideAi) {
        setAiDropdownOpen(false);
      }
      if (isOutsideMore) {
        setMoreDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const becomeEducator = async () => {
    console.log('becomeEducator called, isEducator:', isEducator);
    if (isEducator) {
      navigate('/educator')
      return;
    }
    setMoreDropdownOpen(false);
    setIsConfirmOpen(true);
  }

  const handleConfirmBecomeEducator = async () => {
    try {
      const token = await getToken()
      const { data } = await axios.get(backendUrl + '/api/educator/update-role', { headers: { Authorization: `Bearer ${token}` } })
      if (data.success) {
        toast.success(data.message)
        setIsEducator(true)
        setIsConfirmOpen(false);
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div className="flex items-center justify-between px-4 sm:px-10 md:px-14 lg:px-36 border-b border-white/10 py-4 bg-purple-900/30 backdrop-blur-md sticky top-0 z-50">
      <img onClick={() => navigate('/')} src={assets.logo} alt="Logo" className="w-20 lg:w-32 cursor-pointer" />
      <div className="md:flex hidden items-center gap-7 text-gray-300">
        <div className="flex items-center gap-7">
          {user && (
            <>
              {role === 'educator' ? (
                <button
                  className="text-purple-400 font-medium hover:text-purple-300 transition-colors"
                  onClick={() => navigate('/educator')}
                >
                  Educator Dashboard
                </button>
              ) : (
                <Link to="/my-enrollments" className="hover:text-white transition-colors">
                  My Enrollments
                </Link>
              )}

              <Link to="/discussion" className="hover:text-white transition-colors">
                Discussion
              </Link>

              {/* AI Tools Dropdown */}
              <div className="relative" ref={aiRef}>
                <button
                  onClick={() => setAiDropdownOpen(!aiDropdownOpen)}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  AI Tools
                  <img src={assets.dropdown_icon} alt="" className={`w-2.5 transition-transform ${aiDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {aiDropdownOpen && (
                  <div className="absolute top-10 left-0 w-52 bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl shadow-lg p-2 z-50 animate-zoomIn">
                    <Link to="/ai-quiz" className="block px-4 py-2 hover:bg-white/10 rounded-lg transition-colors">AI Quiz Generator</Link>
                    <Link to="/ai-roadmap" className="block px-4 py-2 hover:bg-white/10 rounded-lg transition-colors">AI Career Roadmap</Link>
                    <Link to="/ai-resume" className="block px-4 py-2 hover:bg-white/10 rounded-lg transition-colors">AI Resume Review</Link>
                  </div>
                )}
              </div>

              {/* More Dropdown */}
              <div className="relative" ref={moreRef}>
                <button
                  onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  More
                  <img src={assets.dropdown_icon} alt="" className={`w-2.5 transition-transform ${moreDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {moreDropdownOpen && (
                  <div className="absolute top-10 right-0 w-48 bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl shadow-lg p-2 z-50 animate-zoomIn">
                    {role === 'student' ? (
                      <button
                        onClick={becomeEducator}
                        className="w-full text-left px-4 py-2 hover:bg-white/10 rounded-lg transition-colors text-purple-400"
                      >
                        Become Educator
                      </button>
                    ) : (
                      <Link to="/my-enrollments" className="block px-4 py-2 hover:bg-white/10 rounded-lg transition-colors">My Enrollments</Link>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {!user && <Link to="/discussion" className="hover:text-white transition-colors">Discussion</Link>}
        </div>

        {user ? (
          <UserButton />
        ) : (
          <div className='flex items-center gap-5'>
            <button onClick={() => openSignIn()} className="hover:text-white transition-colors font-medium">Login</button>
            <button onClick={() => openSignUp()} className="bg-primary text-white px-6 py-2 rounded-full hover:bg-primary/90 transition-colors font-medium">Sign Up</button>
          </div>
        )}
      </div>

      {/* For Phone Screens */}
      <div className="md:hidden flex items-center gap-2 sm:gap-4 text-gray-300">
        <div className="flex items-center gap-3 sm:gap-4 text-[12px]">
          {user && (
            <>
              {role === 'educator' ? (
                <button
                  className="text-purple-400 font-medium"
                  onClick={() => navigate('/educator')}
                >
                  Dashboard
                </button>
              ) : (
                <Link to="/my-enrollments" className="hover:text-white transition-colors">
                  Enrolled
                </Link>
              )}

              <Link to="/discussion" className="hover:text-white transition-colors">
                Discussion
              </Link>

              {/* Mobile AI Tools Dropdown */}
              <div className="relative" ref={mobileAiRef}>
                <button
                  onClick={() => setAiDropdownOpen(!aiDropdownOpen)}
                  className="flex items-center gap-0.5 hover:text-white transition-colors"
                >
                  AI
                  <img src={assets.dropdown_icon} alt="" className={`w-2 transition-transform ${aiDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {aiDropdownOpen && (
                  <div className="absolute top-8 left-[-80px] w-44 bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl shadow-lg p-1.5 z-50 animate-zoomIn">
                    <Link to="/ai-quiz" className="block px-3 py-1.5 hover:bg-white/10 rounded-lg transition-colors text-[12px]">AI Quiz</Link>
                    <Link to="/ai-roadmap" className="block px-3 py-1.5 hover:bg-white/10 rounded-lg transition-colors text-[12px]">AI Roadmap</Link>
                    <Link to="/ai-resume" className="block px-3 py-1.5 hover:bg-white/10 rounded-lg transition-colors text-[12px]">AI Resume</Link>
                  </div>
                )}
              </div>

              {/* Mobile More Dropdown */}
              <div className="relative" ref={mobileMoreRef}>
                <button
                  onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                  className="flex items-center gap-0.5 hover:text-white transition-colors"
                >
                  More
                  <img src={assets.dropdown_icon} alt="" className={`w-2 transition-transform ${moreDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {moreDropdownOpen && (
                  <div className="absolute top-8 right-0 w-36 bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl shadow-lg p-1.5 z-50 animate-zoomIn">
                    {role === 'student' ? (
                      <button
                        onClick={becomeEducator}
                        className="w-full text-left px-3 py-1.5 hover:bg-white/10 rounded-lg transition-colors text-purple-400 text-[12px]"
                      >
                        Become Educator
                      </button>
                    ) : (
                      <Link to="/my-enrollments" className="block px-3 py-1.5 hover:bg-white/10 rounded-lg transition-colors text-[12px]">My Enrollments</Link>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {!user && <Link to="/discussion" className="hover:text-white transition-colors">Discussion</Link>}
        </div>

        {user ? (
          <UserButton />
        ) : (
          <div className='flex items-center gap-2'>
            <button onClick={() => openSignIn()} className='text-gray-400 font-medium text-sm px-2'>Login</button>
            <button onClick={() => openSignUp()} className='bg-primary text-white px-4 py-1.5 rounded-full text-xs font-semibold'>Sign Up</button>
          </div>
        )}
      </div>
      <ConfirmModal
        isOpen={isConfirmOpen}
        onConfirm={handleConfirmBecomeEducator}
        onCancel={() => setIsConfirmOpen(false)}
        message="Are you sure you want to become an educator? This will grant you access to the Educator Dashboard."
        title="Become Educator"
        confirmText="Confirm"
        confirmColor="bg-purple-600 hover:bg-purple-500"
      />
    </div>
  );
};

export default Navbar;