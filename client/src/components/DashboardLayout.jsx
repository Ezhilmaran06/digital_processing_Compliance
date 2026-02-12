import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppNavbar from './Navbar';
import ProtectedRoute from './ProtectedRoute';

/**
 * Dashboard Layout Component
 * Provides a consistent structure for all protected dashboard pages
 */
const DashboardLayout = ({ allowedRoles = [] }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 border-t-4 border-indigo-600">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-indigo-200 dark:border-indigo-900 rounded-full animate-spin"></div>
                    <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-indigo-600 rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <ProtectedRoute allowedRoles={allowedRoles}>
            <div className="min-h-screen relative pb-10">
                <div className="page-bg-mesh"></div>
                <AppNavbar />
                <main className="content-container animate-fade-in px-4 md:px-8 mt-10">
                    <Outlet />
                </main>
            </div>
        </ProtectedRoute>
    );
};

export default DashboardLayout;
