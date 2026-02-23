import React, { useState } from 'react'
import { assets } from '../../assets/assets'
import { useNavigate } from 'react-router-dom'

const SearchBar = ({ data }) => {

  const navigate = useNavigate()

  const [input, setInput] = useState(data ? data : '')

  const onSearchHandler = (e) => {
    e.preventDefault()

    navigate('/course-list/' + input)

  }

  return (
    <form onSubmit={onSearchHandler} className="max-w-xl w-full md:h-14 h-12 flex items-center bg-transparent/5 backdrop-blur-lg border border-white/10 shadow-lg shadow-purple-900/20 rounded-xl">
      <img className="md:w-auto w-10 px-3" src={assets.search_icon} alt="search_icon" />
      <input onChange={e => setInput(e.target.value)} value={input} type="text" className="w-full h-full outline-none text-gray-200 bg-transparent" placeholder="Search for courses" />
      <button type='submit' className="bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-600/30 transition-all duration-300 rounded text-white md:px-10 px-7 md:py-3 py-2 mx-1">Search</button>
    </form>
  )
}

export default SearchBar