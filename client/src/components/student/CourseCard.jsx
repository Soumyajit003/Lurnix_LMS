import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContext'

const CourseCard = ({ course }) => {

    const { currency, calculateRating } = useContext(AppContext)

    return (
        <Link onClick={() => scrollTo(0, 0)} to={'/course/' + course._id} className="border border-gray-500/30 pb-6 overflow-hidden backdrop-blur-lg rounded-lg bg-purple-900/30 hover:bg-purple-600/30 hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300">
            <img className="w-full" src={course.courseThumbnail} alt='' />
            <div className="p-3 text-left">
                <h3 className="text-white font-semibold">{course.courseTitle}</h3>
                <p className="text-gray-400">{course.educator.name}</p>
                <div className="flex items-center space-x-2">
                    <p className='text-white'>{calculateRating(course)}</p>
                    <div className="flex">
                        {[...Array(5)].map((_, i) => (
                            <img
                                key={i}
                                className="w-3.5 h-3.5"
                                src={i < Math.floor(calculateRating(course)) ? assets.star : assets.star_blank}
                                alt=""
                            />
                        ))}
                    </div>
                    <p className="text-gray-400">({course.courseRatings.length})</p>
                </div>
                <p className="font-semibold text-gray-200">{currency}{(course.coursePrice - course.discount * course.coursePrice / 100).toFixed(2)}</p>
            </div>
        </Link>
    )
}

export default CourseCard