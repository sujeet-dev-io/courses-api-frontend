import React from 'react';
import { useParams } from 'react-router-dom';

const InstanceDetailsPage = () => {
  const { year, semester, courseId } = useParams();
  
  return (
    <div>
      <h2>Course Instance Details</h2>
      <p>Year: {year}</p>
      <p>Semester: {semester}</p>
      <p>Course ID: {courseId}</p>
    </div>
  );
};

export default InstanceDetailsPage;