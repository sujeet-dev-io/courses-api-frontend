import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  InputAdornment,
  Select,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  EventNote as EventNoteIcon,
  School as SchoolIcon,
  FilterList as FilterListIcon,
  Error as ErrorIcon,
  SearchOff as SearchOffIcon,
} from '@mui/icons-material';
import { courseInstanceService, courseService } from '../../services/api';
import { toast } from 'react-toastify';

const CourseInstancesPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [instanceToDelete, setInstanceToDelete] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Current year and semester for default filter
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  // Default to current semester (1: Spring, 2: Summer, 3: Fall)
  const currentSemester = currentMonth >= 1 && currentMonth <= 5 ? 1 : 
                         currentMonth >= 6 && currentMonth <= 7 ? 2 : 3;

  // State for filters
  const [filters, setFilters] = useState({
    year: null,  
    semester: null  
  });

  // Generate years for dropdown (current year - 5 to current year + 5)
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
  
  // Semester options (1-8)
  const semesterOptions = Array.from({ length: 8 }, (_, i) => ({
    value: i + 1,
    label: String(i + 1)
  }));

  // Fetch course instances with filters and search
  const {
    data: instances = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['courseInstances', filters.year, filters.semester, searchTerm],
    queryFn: async () => {
      try {
        // If there's a search term, search for a specific course
        if (searchTerm && searchTerm.trim()) {
          const response = await courseInstanceService.getInstance(
            filters.year, 
            filters.semester, 
            searchTerm.trim()
          );
          // If we get a single instance, return it as an array
          return response.data ? [response.data] : [];
        }
        
        // If no filters are applied, get all instances
        if (!filters.year && !filters.semester) {
          const response = await courseInstanceService.getAllCourseInstances();
          return Array.isArray(response) ? response : [];
        }
        
        // Otherwise, get instances for the selected filters
        const response = await courseInstanceService.getInstances(
          filters.year, 
          filters.semester
        );
        // Ensure we always return an array
        return Array.isArray(response?.data) ? response.data : [];
      } catch (error) {
        console.error('Error fetching instances:', error);
        // If it's a 404, return empty array (no results)
        if (error.response?.status === 404) {
          return [];
        }
        throw error;
      }
    },
    keepPreviousData: true,
  });

  // Filter instances based on search term (client-side filtering if needed)
  const filteredInstances = useMemo(() => {
    if (!searchTerm) return instances || [];
    
    const searchLower = searchTerm.toLowerCase();
    return (instances || []).filter(instance => {
      if (!instance) return false;
      
      // Handle both direct and nested properties
      const title = instance.title || instance.course?.title || '';
      const courseId = instance.courseId || instance.course?.courseId || '';
      
      return (
        title.toString().toLowerCase().includes(searchLower) ||
        courseId.toString().toLowerCase().includes(searchLower)
      );
    });
  }, [instances, searchTerm]);

  // Delete instance mutation
  const deleteInstanceMutation = useMutation({
    mutationFn: ({ year, semester, courseId }) => 
      courseInstanceService.deleteInstance(year, semester, courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courseInstances'] });
      toast.success('Course instance deleted successfully');
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Failed to delete instance';
      toast.error(errorMessage);
    },
  });

  const handleDeleteClick = (instance) => {
    setInstanceToDelete(instance);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (instanceToDelete) {
      deleteInstanceMutation.mutate({
        year: instanceToDelete.year,
        semester: instanceToDelete.semester,
        courseId: instanceToDelete.course.courseId
      });
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle filter changes
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPage(0); // Reset to first page on filter change
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    const searchValue = e.target.elements?.search?.value?.trim() || '';
    console.log('Setting search term:', searchValue);
    setSearchTerm(searchValue);
  };

  // Pagination
  const paginatedInstances = filteredInstances.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          Course Instances
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            navigate('/instances/create');
          }}
          component="button"
          type="button"
        >
          Add Instance
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }} elevation={2}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <FilterListIcon sx={{ mr: 1 }} /> Filters
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              fullWidth
              // label="Year"
              value={filters.year || ''}
              onChange={(e) => handleFilterChange('year', e.target.value ? Number(e.target.value) : null)}
              SelectProps={{
                native: true,
              }}
              variant="outlined"
              size="small"
            >
              <option value="">All Years</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              fullWidth
              // label="Semester"
              value={filters.semester || ''}
              onChange={(e) => handleFilterChange('semester', e.target.value ? Number(e.target.value) : null)}
              SelectProps={{
                native: true,
              }}
              variant="outlined"
              size="small"
            >
              <option value="">All Semesters</option>
              {semesterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box component="form" onSubmit={handleSearch} display="flex" gap={2}>
              <TextField
                fullWidth
                size="small"
                name="search"
                placeholder="Search by course ID (e.g., CS101)"
                variant="outlined"
                defaultValue={searchTerm}
              />
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                disabled={isLoading}
              >
                Search
              </Button>
              {searchTerm && (
                <Button 
                  variant="outlined"
                  color="secondary"
                  onClick={() => {
                    setSearchTerm('');
                    // Reset the search input
                    const searchInput = document.querySelector('input[name="search"]');
                    if (searchInput) searchInput.value = '';
                  }}
                  disabled={isLoading}
                >
                  Clear
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error.message || 'Failed to load course instances. Please try again later.'}
        </Alert>
      )}

      {filteredInstances.length === 0 ? (
        <Alert severity="info">No course instances found for the selected filters.</Alert>
      ) : (
        <>
          <TableContainer component={Paper} elevation={2}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Course</TableCell>
                  <TableCell>Semester</TableCell>
                  <TableCell>Year</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredInstances.length > 0 ? (
                  filteredInstances.map((instance) => {
                    if (!instance) return null;
                    
                    // Handle both direct and nested course data structures
                    const courseTitle = instance.title || instance.course?.title || 'N/A';
                    const courseId = instance.courseId || instance.course?.courseId || 'N/A';
                    const year = instance.year || 'N/A';
                    const semester = instance.semester || 'N/A';
                    
                    return (
                      <TableRow 
                        key={`${year}-${semester}-${courseId}`}
                        hover
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <SchoolIcon color="primary" sx={{ mr: 1 }} />
                            <Box>
                              <Typography variant="subtitle2">
                                {courseTitle}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {courseId}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={semester}
                            color={semester === filters.semester ? 'primary' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={year}
                            color={year === filters.year ? 'primary' : 'default'}
                            variant="outlined"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => 
                                  navigate(`/instances/${year}/${semester}/${courseId}`)
                                }
                              >
                                <EventNoteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteClick(instance)}
                                disabled={deleteInstanceMutation.isLoading}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <SearchOffIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 1 }} />
                        <Typography variant="body1" color="text.secondary">
                          {isLoading ? 'Loading...' : 'No matching course instances found'}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredInstances.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{ mt: 2 }}
          />
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Course Instance</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this course instance? This action cannot be undone.
          </DialogContentText>
          {instanceToDelete && (
            <Box mt={2}>
              <Typography variant="subtitle2">
                {instanceToDelete.course?.title} ({instanceToDelete.course?.courseId})
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {instanceToDelete.semester === 1 ? 'Spring' : instanceToDelete.semester === 2 ? 'Summer' : instanceToDelete.semester === 3 ? 'Fall' : `Semester ${instanceToDelete.semester}`} {instanceToDelete.year}
              </Typography>
              <Alert severity="warning" sx={{ mt: 1 }} icon={<ErrorIcon />}>
                This will permanently remove this course instance.
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleteInstanceMutation.isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleteInstanceMutation.isLoading}
            startIcon={
              deleteInstanceMutation.isLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : null
            }
          >
            {deleteInstanceMutation.isLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CourseInstancesPage;