import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import {
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';

import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';

import { toast } from 'react-toastify';
import { courseService } from '../../services/api';

const CourseDetailsPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const {
    data: course,
    isLoading,
    isError,
    error,
  } = useQuery(['course', courseId], () =>
    courseService.getCourseById(courseId).then((res) => res.data)
  );

  const handleDelete = async () => {
    try {
      await courseService.deleteCourse(courseId);
      toast.success('Course deleted successfully');
      navigate('/courses');
    } catch (err) {
      toast.error(err.message || 'Failed to delete course');
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error.message || 'Failed to load course details'}
      </Alert>
    );
  }

  if (!course) {
    return (
      <Alert severity="warning" sx={{ my: 2 }}>
        Course not found
      </Alert>
    );
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        Back to Courses
      </Button>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          {course.title}
        </Typography>
        <Box>
          <IconButton
            color="primary"
            onClick={() => navigate(`/courses/${courseId}/edit`)}
            sx={{ mr: 1 }}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color="error"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" color="textSecondary">
              Course ID
            </Typography>
            <Typography variant="body1" paragraph>
              {course.courseId}
            </Typography>

            <Typography variant="subtitle1" color="textSecondary" sx={{ mt: 2 }}>
              Description
            </Typography>
            <Typography variant="body1" paragraph>
              {course.description || 'No description available'}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" color="textSecondary">
              Prerequisites
            </Typography>
            {course.prerequisiteIds && course.prerequisiteIds.length > 0 ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {course.prerequisiteIds.map((prereqId) => (
                  <Chip
                    key={prereqId}
                    label={prereqId}
                    component={Link}
                    to={`/courses/${prereqId}`}
                    clickable
                    variant="outlined"
                  />
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="textSecondary">
                No prerequisites
              </Typography>
            )}
          </Grid>
        </Grid>
      </Paper>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Course</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this course? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            startIcon={<DeleteIcon />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CourseDetailsPage;
