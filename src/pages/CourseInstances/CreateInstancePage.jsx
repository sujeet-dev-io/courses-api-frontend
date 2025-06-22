import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  Autocomplete,
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { createCourseInstance } from '../../services/courseInstanceApi';
import { useCourses } from '../../hooks/useCourses';
import { toast } from 'react-toastify';

// Validation Schema
const validationSchema = Yup.object({
  courseId: Yup.string().required('Course is required'),
  year: Yup.number().required('Year is required'),
  semester: Yup.number()
    .required('Semester is required')
    .min(1, 'Semester must be between 1 and 8')
    .max(8, 'Semester must be between 1 and 8'),
});

const CreateInstancePage = () => {
  const navigate = useNavigate();
  const { data: courses = [], isLoading: isLoadingCourses, courseOptions } = useCourses();

  // Generate years for dropdown (current year - 5 to current year + 5)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
  
  // Semester options (1-8)
  const semesterOptions = Array.from({ length: 8 }, (_, i) => ({
    value: i + 1,
    label: String(i + 1)
  }));

  const formik = useFormik({
    initialValues: {
      courseId: '',
      year: currentYear,
      semester: 1,
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        console.log('Form submission started with values:', values);
        
        if (!values.courseId) {
          toast.error('Please select a course');
          return;
        }
        
        // Use the createCourseInstance function from courseInstanceApi
        const createdInstance = await createCourseInstance({
          courseId: values.courseId,
          year: values.year,
          semester: values.semester,
        });

        console.log('Instance created successfully:', createdInstance);
        toast.success('Course instance created successfully');
        
        // Navigate back to instances list after a short delay
        setTimeout(() => {
          navigate('/instances');
        }, 1000);
        
      } catch (error) {
        console.error('Error in form submission:', error);
        toast.error(error.message || 'Failed to create course instance');
      } finally {
        setSubmitting(false);
      }
    },
  });

  if (isLoadingCourses) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box 
      display="flex" 
      flexDirection="column" 
      minHeight="calc(100vh - 64px)" 
      justifyContent="flex-start"
      alignItems="center"
      pt={8}
      px={3}
      pb={3}
    >
      <Box 
        width="100%" 
        maxWidth="1000px"
        mx="auto"
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: 5,
            borderRadius: 2,
            width: '100%',
          }}
        >
          <Box 
            display="flex" 
            justifyContent="space-between" 
            alignItems="center" 
            mb={5}
            flexWrap="wrap"
            gap={2}
          >
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(-1)}
              variant="outlined"
              size="large"
              sx={{ height: '40px' }}
            >
              Back
            </Button>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}>
              Create New Course Instance
            </Typography>
            <Box width={80} /> {/* Spacer for alignment */}
          </Box>

          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <Autocomplete
                    id="course-select"
                    options={courseOptions}
                    getOptionLabel={(option) => option.label}
                    value={courseOptions.find(option => option.id === formik.values.courseId) || null}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('courseId', newValue?.id || '');
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Course"
                        variant="outlined"
                        size="large"
                        error={formik.touched.courseId && Boolean(formik.errors.courseId)}
                        helperText={formik.touched.courseId && formik.errors.courseId}
                        required
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            height: '59px',
                            width: '180px',
                            fontSize: '1.1rem',
                          },
                          '& .MuiInputLabel-root': {
                            fontSize: '1.1rem',
                            transform: 'translate(14px, 16px) scale(1)',
                            '&.MuiInputLabel-shrink': {
                              transform: 'translate(14px, -9px) scale(0.75)',
                            },
                          },
                        }}
                      />
                    )}
                  />
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel sx={{ fontSize: '1.1rem' }}>Year</InputLabel>
                  <Select
                    name="year"
                    value={formik.values.year}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.year && Boolean(formik.errors.year)}
                    variant="outlined"
                    size="large"
                    required
                    sx={{
                      '& .MuiSelect-select': {
                        height: '28px',
                        width: '100px',
                        padding: '16px 32px 16px 14px',
                        fontSize: '1.1rem',
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        top: 0,
                        '& legend': {
                          width: 'auto',
                        },
                      },
                    }}
                  >
                    {years.map((year) => (
                      <MenuItem key={year} value={year} sx={{ fontSize: '1.1rem' }}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.year && formik.errors.year && (
                    <FormHelperText error sx={{ fontSize: '0.9rem', ml: 2 }}>
                      {formik.errors.year}
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel sx={{ fontSize: '1.1rem' }}>Semester</InputLabel>
                  <Select
                    name="semester"
                    value={formik.values.semester}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.semester && Boolean(formik.errors.semester)}
                    variant="outlined"
                    size="large"
                    required
                    sx={{
                      '& .MuiSelect-select': {
                        height: '28px',
                        width: '100px',
                        padding: '16px 32px 16px 14px',
                        fontSize: '1.1rem',
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        top: 0,
                        '& legend': {
                          width: 'auto',
                        },
                      },
                    }}
                  >
                    {semesterOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value} sx={{ fontSize: '1.1rem' }}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.semester && formik.errors.semester && (
                    <FormHelperText error sx={{ fontSize: '0.9rem', ml: 2 }}>
                      {formik.errors.semester}
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Box 
                  display="flex" 
                  justifyContent="flex-end" 
                  mt={6}
                >
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={formik.isSubmitting}
                    startIcon={
                      formik.isSubmitting ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        <SaveIcon />
                      )
                    }
                    sx={{
                      minWidth: '220px',
                      height: '56px',
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      borderRadius: '8px',
                      textTransform: 'none',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      '&:hover': {
                        boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)',
                      },
                    }}
                  >
                    {formik.isSubmitting ? 'Creating...' : 'Create Instance'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </Box>
  );
};

export default CreateInstancePage;