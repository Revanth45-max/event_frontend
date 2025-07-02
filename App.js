import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthForm from './components/Auth/AuthForm'; // Unified AuthForm for Login/Signup
import ForgotPassword from './components/Auth/ForgotPassword'; // New ForgotPassword component
import ResetPassword from './components/Auth/ResetPassword';   // New ResetPassword component
import Dashboard from './components/Dashboard/Dashboard';
import LoadingSpinner from './components/Common/LoadingSpinner';
import './styles/globals.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    console.log('🛡️ ProtectedRoute - Loading:', loading, 'Authenticated:', isAuthenticated);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <LoadingSpinner />
            </div>
        );
    }

    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Route Component (redirects to dashboard if already authenticated)
const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    console.log('🌐 PublicRoute - Loading:', loading, 'Authenticated:', isAuthenticated);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <LoadingSpinner />
            </div>
        );
    }

    return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

// App Routes Component
const AppRoutes = () => {
    // State to toggle between Login/Signup and ForgotPassword forms on the /login path
    const [showForgotPassword, setShowForgotPassword] = useState(false);

    return (
        <Router>
            <Routes>
                {/* Login/Signup and Forgot Password */}
                <Route
                    path="/login"
                    element={
                        <PublicRoute>
                            {/* Conditionally render AuthForm or ForgotPassword based on state */}
                            {showForgotPassword ? (
                                <ForgotPassword onBackToLogin={() => setShowForgotPassword(false)} />
                            ) : (
                                <AuthForm onForgotPasswordClick={() => setShowForgotPassword(true)} isLoginInitial={true} />
                            )}
                        </PublicRoute>
                    }
                />
                {/* Direct Signup Route (if you want a separate /signup page, though AuthForm handles both) */}
                <Route
                    path="/signup"
                    element={
                        <PublicRoute>
                            <AuthForm isLoginInitial={false} /> {/* Sets initial state to signup */}
                        </PublicRoute>
                    }
                />

                {/* Reset Password Route - expects a token in the URL */}
                <Route
                    path="/reset-password/:token"
                    element={
                        <PublicRoute>
                            <ResetPassword />
                        </PublicRoute>
                    }
                />

                {/* Protected Dashboard Route */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Default redirect to dashboard */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                {/* Catch-all for undefined routes, redirects to dashboard */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </Router>
    );
};

// Main App Component
function App() {
    return (
        <AuthProvider>
            {/* Added basic styling to the main App div for a consistent background and font */}
            <div className="App min-h-screen bg-gray-50 font-sans text-gray-900 antialiased">
                <AppRoutes />
            </div>
        </AuthProvider>
    );
}

export default App;
5