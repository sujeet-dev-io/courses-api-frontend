import axios from 'axios';
import { toast } from 'react-toastify';

// API Configuration
const API_BASE_URL = 'http://localhost:8080';
const API_VERSION = '/api/v1';

console.log('Initializing API with base URL:', API_BASE_URL);

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
  timeout: 15000, // Increased timeout to 15 seconds
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Don't modify URL for external requests
    if (!config.url.startsWith('http') && !config.url.includes(API_VERSION)) {
      config.url = `${API_VERSION}${config.url.startsWith('/') ? '' : '/'}${config.url}`;
    }
    
    // Add auth token if exists
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(`[${config.method?.toUpperCase()}] ${config.baseURL}${config.url}`, {
      params: config.params,
      data: config.data,
    });
    
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`[${response.status}] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      data: response.data,
    });
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with a status code outside 2xx
      console.error('Response Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        url: error.config.url,
        method: error.config.method,
        data: error.response.data,
      });
      
      // Handle specific status codes
      if (error.response.status === 401) {
        // Handle unauthorized
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else if (error.response.status >= 500) {
        toast.error('Server error. Please try again later.');
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received:', error.request);
      if (error.code === 'ECONNABORTED') {
        toast.error('Request timeout. Please check your connection.');
      } else {
        toast.error('Network error. Please check your connection.');
      }
    } else {
      // Something happened in setting up the request
      console.error('Request setup error:', error.message);
      toast.error('Request setup error. Please try again.');
    }
    
    return Promise.reject(error);
  }
);

// Course Service
const courseService = {
  getAllCourses: async () => {
    console.log('Fetching all courses...');
    try {
      const response = await api.get('/getAll/course');
      console.log('Courses API Response:', response.data);
      return response;
    } catch (error) {
      console.error('Error in getAllCourses:', error);
      throw error;
    }
  },
  
  getCourseById: async (courseId) => {
    console.log(`Fetching course with ID: ${courseId}`);
    try {
      const response = await api.get(`/getById/course/${courseId}`);
      return response;
    } catch (error) {
      console.error(`Error fetching course ${courseId}:`, error);
      throw error;
    }
  },
  
  createCourse: async (data) => {
    console.log('Creating new course:', data);
    try {
      const response = await api.post('/course', data);
      console.log('Course created successfully:', response.data);
      return response;
    } catch (error) {
      console.error('Error creating course:', error);
      if (error.response) {
        // If we get a response from the server, forward it
        throw new Error(error.response.data?.message || 'Failed to create course');
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error('No response from server. Please check your connection.');
      } else {
        // Something happened in setting up the request
        throw new Error('Error setting up request: ' + error.message);
      }
    }
  },
  
  updateCourse: async (courseId, data) => {
    console.log(`Updating course ${courseId}:`, data);
    try {
      const response = await api.put(`/update/course/${courseId}`, data);
      return response;
    } catch (error) {
      console.error(`Error updating course ${courseId}:`, error);
      throw error;
    }
  },
  
  deleteCourse: async (courseId) => {
    console.log(`Deleting course ${courseId}`);
    try {
      const response = await api.delete(`/delete/course/${courseId}`);
      return response;
    } catch (error) {
      console.error(`Error deleting course ${courseId}:`, error);
      throw error;
    }
  },
};

// Course Instance Service
const courseInstanceService = {
  // Get all course instances without any filters
  getAllCourseInstances: async () => {
    try {
      console.log('Fetching all course instances...');
      const response = await api.get('/instance/getAllCourseInstance');
      console.log('All course instances response:', response);
      return response.data;
    } catch (error) {
      console.error('Error fetching all course instances:', error);
      if (error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  },

  // Get all instances for a specific year and semester
  getInstances: async (year, semester) => {
    console.log(`Fetching instances for ${year}-${semester}`);
    try {
      const response = await api.get(`/instance/${year}/${semester}`);
      return response;
    } catch (error) {
      console.error(`Error fetching instances for ${year}-${semester}:`, error);
      // Return empty array if no instances found for the filters
      if (error.response?.status === 404) {
        return { data: [] };
      }
      throw error;
    }
  },

  // Get a specific course instance
  getInstance: async (year, semester, courseId) => {
    console.log(`Fetching instance ${courseId} for ${year}-${semester}`);
    try {
      const response = await api.get(`/instance/${year}/${semester}/${courseId}`);
      return response;
    } catch (error) {
      console.error(`Error fetching instance ${courseId}:`, error);
      throw error;
    }
  },
  
  getInstanceDetails: async (year, semester, courseId) => {
    console.log(`Fetching instance details for ${courseId} ${year}-${semester}`);
    try {
      const response = await api.get(`/instance/${year}/${semester}/${courseId}`);
      return response;
    } catch (error) {
      console.error(`Error fetching instance details for ${courseId}:`, error);
      throw error;
    }
  },
  
  createInstance: async (data) => {
    console.log('Creating new instance:', data);
    try {
      const response = await api.post('/instance', data);
      console.log('Instance created successfully:', response.data);
      return response;
    } catch (error) {
      console.error('Error creating instance:', error);
      if (error.response) {
        throw new Error(error.response.data?.message || 'Failed to create instance');
      } else if (error.request) {
        throw new Error('No response from server. Please check your connection.');
      } else {
        throw new Error('Error setting up request: ' + error.message);
      }
    }
  },
  
  deleteInstance: async (year, semester, courseId) => {
    console.log(`Deleting instance ${courseId} ${year}-${semester}`);
    try {
      const response = await api.delete(`/instance/${year}/${semester}/${courseId}`);
      return response;
    } catch (error) {
      console.error(`Error deleting instance ${courseId}:`, error);
      throw error;
    }
  },
};

export { courseService, courseInstanceService };
export default api;