import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  CircularProgress,
  Autocomplete,
  Chip,
  Divider,
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { courseService } from '../../services/api';
import { toast } from 'react-toastify';

// Validation Schema
const validationSchema = Yup.object({
  courseId: Yup.string()
    .required('Course ID is required')
    .matches(/^[A-Z0-9]+$/, 'Course ID must be alphanumeric and uppercase')
    .max(10, 'Course ID must be at most 10 characters'),
  title: Yup.string()
    .required('Title is required')
    .max(100, 'Title must be at most 100 characters'),
  description: Yup.string().max(500, 'Description must be at most 500 characters'),
  prerequisiteIds: Yup.array().of(Yup.string()),
});

const EditCoursePage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [availableCourses, setAvailableCourses] = useState([]);

  // Fetch course details
  const { data: course, isLoading } = useQuery(
    ['course', courseId],
    () => courseService.getCourseById(courseId).then((res) => res.data),
    {
      enabled: !!courseId,
    }
  );

  // Fetch all courses for prerequisites
  const { data: courses = [] } = useQuery(
    ['courses'],
    () => courseService.getAllCourses().then((res) => res.data),
    {
      enabled: !isLoading,
    }
  );

  // Update course mutation
  const updateCourseMutation = useMutation(
    ({ id, data }) => courseService.updateCourse(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['courses']);
        queryClient.invalidateQueries(['course', courseId]);
        toast.success('Course updated successfully');
        navigate(`/courses/${courseId}`);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update course');
      },
    }
  );

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      courseId: course?.courseId || '',
      title: course?.title || '',
      description: course?.description || '',
      prerequisiteIds: course?.prerequisiteIds || [],
    },
    validationSchema,
    onSubmit: (values) => {
      updateCourseMutation.mutate({ id: courseId, data: values });
    },
  });

  // Update available courses for prerequisites
  useEffect(() => {
    if (courses.length > 0) {
      setAvailableCourses(
        courses
          .filter((c) => c.courseId !== courseId) // Exclude current course from prerequisites
          .map((course) => ({
            id: course.courseId,
            label: `${course.courseId} - ${course.title}`,
          }))
      );
    }
  }, [courses, courseId]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!course) {
    return (
      <Box>
        <Typography variant="h6">Course not found</Typography>
        <Button onClick={() => navigate('/courses')} sx={{ mt: 2 }}>
          Back to Courses
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        Back to Course
      </Button>

      <Typography variant="h4" component="h1" gutterBottom>
        Edit Course
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
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
                margin="normal"
                variant="outlined"
                required
                disabled={updateCourseMutation.isLoading}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="title"
                name="title"
                label="Title"
                value={formik.values.title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.title && Boolean(formik.errors.title)}
                helperText={formik.touched.title && formik.errors.title}
                margin="normal"
                variant="outlined"
                required
                disabled={updateCourseMutation.isLoading}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                id="description"
                name="description"
                label="Description"
                multiline
                rows={4}
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
                margin="normal"
                variant="outlined"
                disabled={updateCourseMutation.isLoading}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  id="prerequisiteIds"
                  options={availableCourses}
                  getOptionLabel={(option) => option.label}
                  value={formik.values.prerequisiteIds
                    .map((id) => availableCourses.find((c) => c.id === id))
                    .filter(Boolean)}
                  onChange={(event, newValue) => {
                    formik.setFieldValue(
                      'prerequisiteIds',
                      newValue.map((v) => v.id)
                    );
                  }}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        {...getTagProps({ index })}
                        key={option.id}
                        label={option.label}
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Prerequisites"
                      variant="outlined"
                      placeholder="Select prerequisites..."
                      error={
                        formik.touched.prerequisiteIds &&
                        Boolean(formik.errors.prerequisiteIds)
                      }
                      helperText={
                        formik.touched.prerequisiteIds && formik.errors.prerequisiteIds
                      }
                      disabled={updateCourseMutation.isLoading}
                    />
                  )}
                  disabled={updateCourseMutation.isLoading}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
                <Button
                  variant="outlined"
                  onClick={() => navigate(`/courses/${courseId}`)}
                  color="secondary"
                  disabled={updateCourseMutation.isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={updateCourseMutation.isLoading}
                  startIcon={
                    updateCourseMutation.isLoading ? (
                      <CircularProgress size={24} />
                    ) : (
                      <SaveIcon />
                    )
                  }
                >
                  {updateCourseMutation.isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default EditCoursePage;