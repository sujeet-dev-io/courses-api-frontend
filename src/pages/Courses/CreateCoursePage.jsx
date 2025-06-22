import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
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
  FormHelperText,
  CircularProgress,
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { courseService } from '../../services/api';
import { toast } from 'react-toastify';

// Validation Schema
const validationSchema = Yup.object({
  courseId: Yup.string()
    .required('Course ID is required')
    .matches(
      /^[A-Za-z0-9\s-]+$/,
      'Only letters, numbers, and hyphens are allowed'
    ),
  title: Yup.string().required('Title is required'),
  description: Yup.string(),
  prerequisiteIds: Yup.array().of(Yup.string()),
});

const CreateCoursePage = () => {
  const navigate = useNavigate();

  // Create course mutation
  const createCourseMutation = useMutation({
    mutationFn: (courseData) => courseService.createCourse(courseData),
    onSuccess: () => {
      toast.success('Course created successfully!');
      navigate('/courses');
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || 'Failed to create course';
      toast.error(errorMessage);
    },
  });

  const formik = useFormik({
    initialValues: {
      courseId: '',
      title: '',
      description: '',
      prerequisiteIds: [],
    },
    validationSchema,
    onSubmit: (values) => {
      // Ensure prerequisiteIds is always an array
      const submissionValues = {
        ...values,
        prerequisiteIds: Array.isArray(values.prerequisiteIds) ? values.prerequisiteIds : []
      };
      createCourseMutation.mutate(submissionValues);
    },
  });

  const [prerequisiteInput, setPrerequisiteInput] = useState('');

  // Handle prerequisite input changes
  const handlePrerequisiteChange = (e) => {
    const value = e.target.value;
    setPrerequisiteInput(value);
  };

  // Process the input when field loses focus
  const handlePrerequisiteBlur = () => {
    if (prerequisiteInput.trim()) {
      const ids = [
        ...new Set([ // Remove duplicates
          ...formik.values.prerequisiteIds,
          ...prerequisiteInput
            .split(',')
            .map(id => id.trim())
            .filter(id => id !== '')
        ])
      ];
      formik.setFieldValue('prerequisiteIds', ids);
      setPrerequisiteInput('');
    }
    formik.handleBlur('prerequisiteIds');
  };

  // Get the display value for the input
  const getDisplayValue = () => {
    const savedIds = formik.values.prerequisiteIds.join(', ');
    return prerequisiteInput ? `${savedIds}${savedIds ? ', ' : ''}${prerequisiteInput}` : savedIds;
  };

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
      <Box width="100%" maxWidth="1000px" mx="auto">
        <Paper elevation={3} sx={{ p: 5, borderRadius: 2, width: '100%' }}>
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
              sx={{ height: '48px' }}
            >
              Back
            </Button>
            <Typography
              variant="h3"
              component="h1"
              sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}
            >
              Create New Course
            </Typography>
            <Box width={100} /> {/* Spacer for alignment */}
          </Box>

          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="courseId"
                  name="courseId"
                  label="Course ID"
                  value={formik.values.courseId}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.courseId && Boolean(formik.errors.courseId)}
                  helperText={formik.touched.courseId && formik.errors.courseId}
                  variant="outlined"
                  required
                  size="large"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: '0.7rem',
                      '& input': {
                        height: '30px',
                        width: '100px',
                        padding: '16px 12px',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: '1.1rem',
                      '&.MuiInputLabel-shrink': {
                        transform: 'translate(14px, -9px) scale(0.75)',
                      },
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="title"
                  name="title"
                  label="Course Title"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.title && Boolean(formik.errors.title)}
                  helperText={formik.touched.title && formik.errors.title}
                  variant="outlined"
                  required
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: '1.1rem',
                      '& input': {
                        height: '30px',
                        width: '100%',
                        padding: '16px 12px',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: '1.1rem',
                      '&.MuiInputLabel-shrink': {
                        transform: 'translate(14px, -9px) scale(0.75)',
                      },
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="description"
                  name="description"
                  label="Course Description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.description &&
                    Boolean(formik.errors.description)
                  }
                  helperText={
                    formik.touched.description && formik.errors.description
                  }
                  variant="outlined"
                  multiline
                  rows={4}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: '1.1rem',
                      '& textarea': {
                        padding: '8px 10px',
                        minHeight: '1vh',
                        lineHeight: 1.4,
                      },
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: '1.1rem',
                      '&.MuiInputLabel-shrink': {
                        transform: 'translate(14px, -9px) scale(0.75)',
                      },
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="prerequisiteIds"
                  name="prerequisiteIds"
                  label="Prerequisites (comma-separated course IDs)"
                  placeholder="e.g., CS201, CS501"
                  value={getDisplayValue()}
                  onChange={handlePrerequisiteChange}
                  onBlur={handlePrerequisiteBlur}
                  variant="outlined"
                  size="large"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: '1.1rem',
                      '& input': {
                        height: '30px',
                        width: '100%',
                        padding: '16px 12px',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: '1.1rem',
                      '&.MuiInputLabel-shrink': {
                        transform: 'translate(14px, -9px) scale(0.75)',
                      },
                    },
                  }}
                />
                <FormHelperText>
                  Type course IDs and separate them with commas (e.g., CS201, CS501)
                </FormHelperText>
              </Grid>

              <Grid item xs={12}>
                <Box display="flex" justifyContent="flex-end" mt={6}>
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
                    {formik.isSubmitting ? 'Creating...' : 'Create Course'}
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

export default CreateCoursePage;