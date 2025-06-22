import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import theme from './services/theme';

// Pages
import DashboardPage from './pages/Dashboard/DashboardPage';
import CoursesPage from './pages/Courses/CoursesPage';
import CreateCoursePage from './pages/Courses/CreateCoursePage';
import EditCoursePage from './pages/Courses/EditCoursePage';
import CourseDetailsPage from './pages/Courses/CourseDetailsPage';
import CourseInstancesPage from './pages/CourseInstances/CourseInstancesPage';
import CreateInstancePage from './pages/CourseInstances/CreateInstancePage';

// Layout
import MainLayout from './components/Layout/MainLayout';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// This component wraps the layout and renders the Outlet for nested routes
const LayoutWrapper = () => {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route element={<LayoutWrapper />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="courses">
                <Route index element={<CoursesPage />} />
                <Route path="create" element={<CreateCoursePage />} />
                <Route path=":courseId" element={<CourseDetailsPage />} />
                <Route path=":courseId/edit" element={<EditCoursePage />} />
              </Route>
              <Route path="instances">
                <Route index element={<CourseInstancesPage />} />
                <Route path="create" element={<CreateInstancePage />} />
              </Route>
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </Router>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;