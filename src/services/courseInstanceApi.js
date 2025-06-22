import { courseInstanceService } from './api';

/**
 * Create a new course instance
 * @param {Object} data - Course instance data
 * @param {string} data.courseId - The ID of the course
 * @param {number} data.year - The year of the course instance
 * @param {number} data.semester - The semester of the course instance (1-8)
 * @returns {Promise<Object>} The created course instance
 */
export const createCourseInstance = async ({ courseId, year, semester }) => {
  console.log('Creating course instance with:', { courseId, year, semester });
  
  try {
    const payload = {
      courseId,
      year: Number(year),
      semester: Number(semester),
    };
    
    console.log('Sending payload:', payload);
    
    const response = await courseInstanceService.createInstance(payload);
    
    console.log('API Response:', response);
    
    if (!response || !response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error in createCourseInstance:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data,
      },
    });
    
    // Create a more user-friendly error message
    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        'Failed to create course instance';
    
    throw new Error(errorMessage);
  }
};

// You can add more course instance related API calls here as needed
