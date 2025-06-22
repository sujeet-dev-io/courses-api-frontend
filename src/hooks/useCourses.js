import { useQuery } from '@tanstack/react-query';
import { courseService } from '../services/api';

/**
 * Custom hook to fetch and manage courses data
 * @returns {Object} Courses query result with additional helper methods
 */
export const useCourses = () => {
  const queryResult = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const response = await courseService.getAllCourses();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  });

  // Helper method to get course options for select/dropdown
  const getCourseOptions = (courses = []) => {
    return courses.map((course) => ({
      id: course.courseId,
      label: `${course.courseId} - ${course.title}`,
    }));
  };

  return {
    ...queryResult,
    courseOptions: getCourseOptions(queryResult.data || []),
  };
};
