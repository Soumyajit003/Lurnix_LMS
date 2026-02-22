import React from 'react'
import { assets } from '../../assets/assets'
import SearchBar from './SearchBar'

const Hero = () => {
  return (
    <div className='flex flex-col items-center justify-center w-full md:pt-36 pt-20 px-7 md:px-0 space-y-7 text-center bg-gradient-to-b from-purple-200/70'>
      <h1 className='md:text-home-heading-large text-home-heading-small relative font-bold text-gray-800 max-w-3x1 mx-auto'>Education without <span className='text-primary'>limits</span>, <br />success without <span className='text-primary'>boundaries</span>!<img src={assets.sketch} alt="Sketch" className='md:block hidden w-[230px] absolute -bottom-7 right-0'/></h1>

      <p className='md:block hidden text-gray-500 max-w-2x1 mx-auto'>We bring together world-class instructors, interactive content, and supportive community to help you achieve your personal and professional goals.</p> 

      <p className='md:hidden text-gray-500 max-w-sm mx-auto'>We bring together world-class instructors to help you achieve your professional goals.</p>  
      <SearchBar/>
    </div>
  )
}

export default Hero
