import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Button,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Chip,
  Alert,
} from '@mui/material';
import {
  School as SchoolIcon,
  EventNote as EventNoteIcon,
  Add as AddIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { courseService, courseInstanceService } from '../../services/api';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  // Debug: Log component mount
  useEffect(() => {
    console.log('=== Dashboard Mounted ===');
    return () => console.log('=== Dashboard Unmounted ===');
  }, []);

  // Calculate current year and month
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // 1-12 (January = 1)

  // Debug: Log date info
  console.log('Current Date:', {
    fullDate: currentDate.toString(),
    year: currentYear,
    month: currentMonth,
    monthName: currentDate.toLocaleString('default', { month: 'long' })
  });

  // Semester configuration
  const semesterInfo = {
    1: {
      name: 'Spring',
      startMonth: 1, // January
      endMonth: 7    // July
    },
    2: {
      name: 'Fall',
      startMonth: 8,  // August
      endMonth: 12    // December
    }
  };

  const currentSemester = currentMonth >= 8 ? 2 : 1;
  const nextSemester = currentSemester === 1 ? 2 : 1;
  const nextYear = nextSemester === 1 ? currentYear + 1 : currentYear;

  // Get current semester info
  const currentSem = semesterInfo[currentSemester];
  const nextSem = semesterInfo[nextSemester];

  // Calculate days until next semester
  const nextSemesterStart = new Date(
    nextSemester === 1 ? currentYear + 1 : currentYear,
    nextSem.startMonth - 1, // months are 0-indexed
    1
  );

  const daysUntilNextSemester = Math.ceil(
    (nextSemesterStart - currentDate) / (1000 * 60 * 60 * 24)
  );

  // Generate status message
  const getSemesterStatus = () => {
    if (daysUntilNextSemester <= 7) {
      return `Next ${nextSem.name} ${nextYear} starts in ${daysUntilNextSemester} days`;
    } else if (daysUntilNextSemester <= 30) {
      return `Mid ${currentSem.name} ${currentYear} semester`;
    } else {
      return `${currentSem.name} ${currentYear} Semester in Progress`;
    }
  };

  const semesterStatus = getSemesterStatus();

  // Fetch courses data
  const { 
    data: courses = [], 
    isLoading: isLoadingCourses, 
    error: coursesError,
    isError: isCoursesError
  } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      try {
        const response = await courseService.getAllCourses();
        console.log('Courses API Response:', response);
        return response.data;
      } catch (error) {
        console.error('Error fetching courses:', error);
        setError('Failed to load courses. Please try again.');
        throw error;
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Fetch course instances data for current semester
  const { 
    data: currentInstancesResponse, 
    isLoading: isLoadingCurrentInstances, 
    isError: isCurrentInstancesError,
    error: currentInstancesError
  } = useQuery({
    queryKey: ['currentInstances', currentYear, currentSemester],
    queryFn: async () => {
      try {
        console.log('Fetching instances with params:', {
          year: currentYear,
          semester: currentSemester,
          semesterName: currentSemester === 1 ? 'Spring' : 'Fall'
        });
        
        const response = await courseInstanceService.getInstances(currentYear, currentSemester);
        
        console.log('Raw API Response:', {
          status: response.status,
          statusText: response.statusText,
          data: response.data,
          headers: response.headers
        });
        
        // Handle response
        let instances = [];
        if (Array.isArray(response)) {
          instances = response;
        } else if (Array.isArray(response?.data)) {
          instances = response.data;
        } else if (response?.data) {
          instances = [response.data];
        }
        
        console.log('Processed Instances:', instances);
        return instances;
        
      } catch (error) {
        console.error('API Error Details:', {
          name: error.name,
          message: error.message,
          response: {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data
          },
          stack: error.stack
        });
        setError(`Failed to load current course instances: ${error.message}`);
        throw error;
      }
    },
    enabled: !!currentYear && !!currentSemester,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Process current instances - ensure it's always an array
  const currentInstances = Array.isArray(currentInstancesResponse) ? currentInstancesResponse : [];

  // Debug logs
  useEffect(() => {
    console.log('Current Year:', currentYear);
    console.log('Current Semester:', currentSemester);
    console.log('Current Instances Raw Response:', currentInstancesResponse);
    console.log('Processed Current Instances:', currentInstances);
  }, [currentInstances, currentInstancesResponse, currentYear, currentSemester]);

  // Fetch all course instances for total count
  const { 
    data: allInstancesData, 
    isLoading: isLoadingAllInstances, 
    isError: isAllInstancesError,
    error: allInstancesError
  } = useQuery({
    queryKey: ['allInstances'],
    queryFn: async () => {
      try {
        console.log('Fetching all course instances...');
        const response = await courseInstanceService.getAllCourseInstances();
        console.log('All Instances API Response:', response);
        // Ensure we're returning an array
        const instances = Array.isArray(response) ? response : (response?.data || []);
        console.log('Processed instances:', instances);
        return instances;
      } catch (error) {
        console.error('Error fetching all instances:', error);
        setError('Failed to load all course instances. Please try again.');
        throw error;
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Show error if any
  useEffect(() => {
    if (isCoursesError || isCurrentInstancesError || isAllInstancesError) {
      setError('Failed to load dashboard data. Please check your connection and try again.');
    }
  }, [isCoursesError, isCurrentInstancesError, isAllInstancesError]);

  // Calculate statistics
  const totalCourses = courses?.length || 0;
  const currentSemesterInstances = currentInstances.length;
  const totalInstances = Array.isArray(allInstancesData) ? allInstancesData.length : 0;

  // Debug logs
  console.log('Current instances:', currentInstances);
  console.log('Current semester instances count:', currentSemesterInstances);
  console.log('All instances data:', allInstancesData);
  console.log('Total instances count:', totalInstances);

  // Recent activities (mock data - replace with actual data from your API)
  const recentActivities = [
    { id: 1, type: 'course', action: 'created', name: 'CS 101', time: '2 hours ago' },
    { id: 2, type: 'instance', action: 'scheduled', name: 'CS 101 - Fall 2023', time: '5 hours ago' },
    { id: 3, type: 'course', action: 'updated', name: 'MATH 201', time: '1 day ago' },
  ];

  if (isLoadingCourses || isLoadingCurrentInstances || isLoadingAllInstances) {
    return (
      <Box sx={{ width: '100%', p: 3 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: 2,  
      pt: 1,  
      minHeight: 'calc(100vh - 64px)', 
      backgroundColor: 'background.default'
    }}>
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Dashboard Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        mt: 1  
      }}>
        <Typography variant="h4" component="h1">
          Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/courses/create')}
        >
          Add Course
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ 
            height: '90%',
            minHeight: '180px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Courses
                  </Typography>
                  <Typography variant="h4">{totalCourses}</Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <SchoolIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ 
            height: '100%',
            minHeight: '180px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Current Semester Instances
                  </Typography>
                  <Typography variant="h4" sx={{ mb: 1 }}>
                    {currentSemesterInstances}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {semesterStatus}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <EventNoteIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ 
            height: '100%',
            minHeight: '180px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Instances
                  </Typography>
                  <Typography variant="h4">{totalInstances}</Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <EventNoteIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activities */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Recent Activities</Typography>
              <Button color="primary" size="small" endIcon={<ArrowForwardIcon />}>
                View All
              </Button>
            </Box>
            <List>
              {recentActivities.map((activity) => (
                <ListItem key={activity.id}>
                  <ListItemIcon>
                    {activity.type === 'course' ? <SchoolIcon /> : <EventNoteIcon />}
                  </ListItemIcon>
                  <ListItemText
                    primary={`${activity.name} was ${activity.action}`}
                    secondary={activity.time}
                  />
                  <Chip
                    label={activity.type}
                    size="small"
                    color={activity.type === 'course' ? 'primary' : 'secondary'}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;