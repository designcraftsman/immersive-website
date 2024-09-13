import React from "react";
import categorie1 from '../../assets/plateforme/categorie1.jpg';
import { FaBookmark, FaStar } from "react-icons/fa";

const CourseCard = ({ id, name, firstName, lastName, teacherProfile, type, previewImg, bookmark, rating }) => {
  return (
    <div className="course-card">
      {/* Badge for course type */}
      {type && <div className={`badge ${type.toLowerCase()}`}>{type}</div>}
      
      {/* Course preview image */}
      <img src={previewImg} alt={name} className="course-image" />

      <div className="course-info">
        {/* Bookmark icon */}
        {bookmark && (
          <div className="bookmark">
            <FaBookmark />
          </div>
        )}

        {/* Course rating */}
        <div className="rating">
          {[...Array(5)].map((_, i) => (
            <FaStar key={i} className={i < rating ? "star filled" : "star"} />
          ))}
        </div>

        {/* Course title */}
        <h3 className="title">{name}</h3>
        
        {/* Teacher profile and name */}
        <div className="instructor">
          <img src={teacherProfile} alt={firstName+lastName} className="teacher-image" />
          <p>{firstName + ' '+ lastName}</p>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
