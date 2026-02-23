import React, { useContext } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import SideBar from '../../components/educator/SideBar'
import Navbar from '../../components/educator/Navbar'
import Footer from '../../components/educator/Footer'
import { AppContext } from '../../context/AppContext'

const Educator = () => {
    const { isEducator } = useContext(AppContext)

    if (!isEducator) {
        return <Navigate to="/" />
    }

    return (
        <div className="text-default min-h-screen">
            <Navbar />
            <div className='flex'>
                <SideBar />
                <div className='flex-1'>
                    {<Outlet />}
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default Educator
