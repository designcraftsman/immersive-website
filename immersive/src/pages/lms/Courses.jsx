import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import CourseCard from '../../components/lms/CourseCard.jsx';
import { courseShape } from '../../types/types.js';
import { useNavigate } from 'react-router-dom';
import OffCanvasCourse from '../../components/lms/OffCanvasCourse.jsx';

function Courses() {
    const [showOffCanvas, setShowOffCanvas] = useState(false);
    const [currentCourse, setCurrentCourse] = useState(null);
    const [visibleCourses, setVisibleCourses] = useState({});
    const [expandedCategories, setExpandedCategories] = useState({});
    const [role, setRole] = useState(null);
    const [courses, setCourses] = useState([]);
    const [id, setId] = useState(null);

    useEffect(() => {
        const storedId = sessionStorage.getItem('id');
        setId(storedId);
    }, []);

    useEffect(() => {
        const storedRole = sessionStorage.getItem('role');
        setRole(storedRole);
    }, []);

    const navigate = useNavigate();
    const [token, setToken] = useState(null);

    useEffect(() => {
        const storedToken = sessionStorage.getItem('token');
        if (!storedToken) {
            navigate('/sign-in');
        } else {
            setToken(storedToken);
        }
    }, [navigate]);

    const getCourses = async () => {
        try {
            const url = role === "teacher" 
                ? `http://localhost:4200/courses/get/${id}`
                : `http://localhost:4200/courses`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch courses');
            }

            const jsonData = await response.json();
            setCourses(jsonData.courses);

            // Initialize visibility for each category
            const categories = jsonData.courses.reduce((acc, course) => {
                acc[course.category] = 4;
                return acc;
            }, {});
            setVisibleCourses(categories);
        } catch (error) {
            console.error('Error:', error);
            setCourses([]); // Set courses to an empty array on error
        }
    };

    useEffect(() => {
        if (token) {
            getCourses();
        }
    }, [token]);

    const handleShow = (course) => {
        setCurrentCourse(course);
        setShowOffCanvas(true);
    };

    const handleClose = () => {
        setShowOffCanvas(false);
        setCurrentCourse(null);
    };

    const handleLoadMore = (category) => {
        const remainingCourses = courses.filter(course => course.category === category).length - visibleCourses[category];
        setVisibleCourses(prev => ({
            ...prev,
            [category]: expandedCategories[category] ? 4 : prev[category] + Math.min(remainingCourses, 8)
        }));
        setExpandedCategories(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    };

    useEffect(() => {
        const exploreBtn = document.querySelector(".explore-button");
        if (exploreBtn) {
            exploreBtn.textContent = "Make a new course";
            exploreBtn.setAttribute("href", "make-course");
        }
    }, []);

    const uniqueCategories = [...new Set(courses.map(course => course.category))];

    return (
        <div className="lms course-list mt-4 px-md-5">
            {role === "teacher" && (
                <React.Fragment>
                    <div className="d-flex justify-content-end">
                        <a href="make-course" className='px-3 btn btn-primary btn-lg fw-bolder text-white'>Make a course</a>
                    </div>
                    <div className="table-responsive mt-3">
                        <table className="table table-bordered">
                            <thead className="thead-light">
                                <tr>
                                    <th scope="col" className="d-none d-sm-table-cell">Preview</th>
                                    <th scope="col">Course</th>
                                    <th scope="col">Field</th>
                                    <th scope="col">Privacy</th>
                                    <th scope="col">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {courses.length > 0 ? (
                                    courses.map((course) => (
                                        <tr key={course.idCourse} className="course rounded">
                                            <td className="text-center d-none d-sm-table-cell">
                                                <img
                                                    className="rounded course-list-previewImg img-fluid"
                                                    src={course.previewimage}
                                                    alt={`Preview of ${course.name}`}
                                                    style={{ maxWidth: '100px', height: 'auto' }}
                                                />
                                            </td>
                                            <td>
                                                <div className="d-flex flex-column">
                                                    <strong>Course</strong> 
                                                    <span>{course.name}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="d-flex flex-column">
                                                    <strong>Field</strong> 
                                                    <span>{course.category}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="d-flex flex-column">
                                                    <strong>Privacy</strong> 
                                                    <span>{course.privacy}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="d-flex flex-column">
                                                    <strong>Actions</strong> 
                                                    <div className="d-flex justify-content-center justify-content-md-start">
                                                        <a
                                                            href={`view-course/${course.idCourse}`}
                                                            onClick={() => handleShow(course)}
                                                            role="button"
                                                            className="btn btn-sm btn-primary  px-2 me-2"
                                                        >
                                                            View
                                                        </a>
                                                        <a
                                                            href={`edit-course/${course.idCourse}`}
                                                            role="button"
                                                            className="btn btn-sm borderButton px-2"
                                                        >
                                                            Edit
                                                        </a>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center">
                                            No courses available.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </React.Fragment>
            )}
            {role === "student" && (
                <React.Fragment>
                    <div className="lms dashboard">
                        <div className="mt-5 mb-5" id='topPicks'>
                            <h2 className="mt-2">Courses</h2>
                            <div className="row">
                                {uniqueCategories.map((category, catIndex) => (
                                    <React.Fragment key={catIndex}>
                                        <h4 className="mt-2" id={category}>{category}</h4>
                                        {courses.filter(course => course.category === category)
                                            .slice(0, visibleCourses[category])
                                            .map((course, index) => (
                                                <div className="col-12 col-sm-6 col-md-3 mb-2 lms" key={index}>
                                                    <a onClick={() => handleShow(course)} href={`#${category}`}><CourseCard {...course} /></a>
                                                </div>
                                            ))}
                                        {courses.filter(course => course.category === category).length > visibleCourses[category] && (
                                            <div className="loadMoreButton ms-md-3 lms">
                                                <a onClick={() => handleLoadMore(category)}>
                                                    {expandedCategories[category] ? 'Display Less' : `Display ${Math.min(courses.filter(course => course.category === category).length - visibleCourses[category], 8)} More`}
                                                </a>
                                            </div>
                                        )}
                                        <div className="col-12">
                                            <div className="borderButton btn-lg btn-pr mt-3">
                                                <a href="">See All</a>
                                                <i className="bi bi-arrow-right ms-1"></i>
                                            </div> 
                                        </div>
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    </div>
                </React.Fragment>
            )}
            {currentCourse && (
                <OffCanvasCourse show={showOffCanvas} onClose={handleClose} course={currentCourse} id={`offcanvasCourse${currentCourse.id}`} />
            )}
        </div>
    );
}

Courses.propTypes = {
    courses: PropTypes.arrayOf(courseShape),
}

export default Courses;
