import React, { useContext } from 'react'
import { Routes, Route, useLocation, useMatch } from 'react-router-dom'
import Navbar from './components/student/Navbar'
import { AppContext } from './context/AppContext'

import Home from './pages/student/Home'
import CourseDetails from './pages/student/CourseDetails'
import CoursesList from './pages/student/CoursesList'
import Dashboard from './pages/educator/Dashboard'
import AddCourse from './pages/educator/AddCourse'
import MyCourses from './pages/educator/MyCourses'
import StudentsEnrolled from './pages/educator/StudentsEnrolled'
import Educator from './pages/educator/Educator'
import 'quill/dist/quill.snow.css'
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify'
import Player from './pages/student/Player'
import MyEnrollments from './pages/student/MyEnrollments'
import Loading from './components/student/Loading'
import DiscussionPage from './pages/student/DiscussionPage'
import CommunityPage from './pages/student/CommunityPage'
import PostDetailsPage from './pages/student/PostDetailsPage'
import RoleSelectionModal from './components/student/RoleSelectionModal'

const App = () => {

  const { showRoleModal, setShowRoleModal } = useContext(AppContext)
  const isEducatorRoute = useMatch('/educator/*');

  return (
    <div className="text-default min-h-screen bg-gradient-to-br from-black via-[#0f0524] to-[#2B0F5A] bg-[length:200%_200%]">
      <ToastContainer />
      {/* Render Student Navbar only if not on educator routes */}
      {!isEducatorRoute && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/course/:id" element={<CourseDetails />} />
        <Route path="/course-list" element={<CoursesList />} />
        <Route path="/course-list/:input" element={<CoursesList />} />
        <Route path="/my-enrollments" element={<MyEnrollments />} />
        <Route path="/player/:courseId" element={<Player />} />
        <Route path="/loading/:path" element={<Loading />} />
        <Route path="/discussion" element={<DiscussionPage />} />
        <Route path="/discussion/:slug" element={<CommunityPage />} />
        <Route path="/discussion/post/:postId" element={<PostDetailsPage />} />
        <Route path='/educator' element={<Educator />}>
          <Route path='/educator' element={<Dashboard />} />
          <Route path='add-course' element={<AddCourse />} />
          <Route path='my-courses' element={<MyCourses />} />
          <Route path='student-enrolled' element={<StudentsEnrolled />} />
        </Route>
      </Routes>
      <RoleSelectionModal isOpen={showRoleModal} onClose={() => setShowRoleModal(false)} />
    </div>

  )
}

export default App