
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getCourseById, Course } from '../services/DataService';
import { ErrorHandler } from '../utils/errorHandler';

const CourseDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const courseData = await getCourseById(id);
        setCourse(courseData);
      } catch (err) {
        setError('Failed to load course details.');
        ErrorHandler.handle(err, 'An error occurred while fetching course details.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!course) {
    return <div>Course not found.</div>;
  }

  return (
    <div>
      <h1>{course.name}</h1>
      <p>{course.description}</p>
      {/* Render other course details here */}
    </div>
  );
};

export default CourseDetails;
