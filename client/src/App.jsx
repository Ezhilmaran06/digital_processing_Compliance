import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import Login from './pages/Login';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AuditorDashboard from './pages/AuditorDashboard';
import CreateRequestPage from './pages/CreateRequestPage';
import RequestsPage from './pages/RequestsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import LandingPage from './pages/LandingPage';
import UserManagement from './pages/UserManagement';
import ProfilePage from './pages/ProfilePage';

import { Toaster } from 'sonner';

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/" element={<AuthRedirect />} />
                            <Route path="/login" element={<Login />} />

                            {/* Protected Routes with Shared Layout */}
                            <Route element={<DashboardLayout allowedRoles={['Employee', 'Manager', 'Admin', 'Auditor']} />}>
                                {/* General Protected Routes */}
                                <Route path="/requests" element={<RequestsPage />} />
                                <Route path="/requests/create" element={<CreateRequestPage />} />
                                <Route path="/requests/edit/:id" element={<CreateRequestPage />} />
                                <Route path="/analytics" element={<AnalyticsPage />} />
                                <Route path="/settings" element={<SettingsPage />} />
                                <Route path="/profile" element={<ProfilePage />} />

                                {/* Role-Specific Dashboards */}
                                <Route
                                    path="/employee"
                                    element={
                                        <ProtectedRoute allowedRoles={['Employee']}>
                                            <EmployeeDashboard />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/manager"
                                    element={
                                        <ProtectedRoute allowedRoles={['Manager']}>
                                            <ManagerDashboard />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/admin"
                                    element={
                                        <ProtectedRoute allowedRoles={['Admin']}>
                                            <AdminDashboard />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/auditor"
                                    element={
                                        <ProtectedRoute allowedRoles={['Auditor']}>
                                            <AuditorDashboard />
                                        </ProtectedRoute>
                                    }
                                />

                                {/* Admin Specific Routes */}
                                <Route
                                    path="/admin/users"
                                    element={
                                        <ProtectedRoute allowedRoles={['Admin']}>
                                            <UserManagement />
                                        </ProtectedRoute>
                                    }
                                />
                            </Route>

                            {/* Default Redirect */}
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                        <Toaster position="top-right" richColors closeButton />
                    </div>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

/**
 * Helper component to handle smart redirection for the root route
 */
const AuthRedirect = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="spinner w-12 h-12"></div>
            </div>
        );
    }

    if (!user) {
        return <LandingPage />;
    }

    // Redirect to role-specific dashboard
    return <Navigate to={`/${user.role.toLowerCase()}`} replace />;
};

export default App;
