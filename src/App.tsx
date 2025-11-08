import React from 'react';
import { HashRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext.tsx';
import { CrmUpdatesProvider } from './contexts/CrmUpdatesContext.tsx';

// Layouts
import MainLayout from './pages/MainLayout.tsx';
import AdminLayout from './pages/admin/AdminLayout.tsx';
import FullScreenLoader from './components/FullScreenLoader.tsx';
import ProtectedRoute from './components/admin/ProtectedRoute.tsx';
import MasterRoute from './components/admin/MasterRoute.tsx';


// Public Pages
import HomePage from './pages/HomePage.tsx';
import RooftopSolarPage from './pages/RooftopSolarPage.tsx';
import SolarPumpsPage from './pages/SolarPumpsPage.tsx';
import CalculatorPage from './pages/CalculatorPage.tsx';
import SuccessStoriesPage from './pages/SuccessStoriesPage.tsx';
import SuccessStoryDetailPage from './pages/SuccessStoryDetailPage.tsx';
import SubsidiesPage from './pages/SubsidiesPage.tsx';
import AboutUsPage from './pages/AboutUsPage.tsx';
import ContactPage from './pages/ContactPage.tsx';

// Auth Pages
import LoginPage from './pages/LoginPage.tsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.tsx';
import ResetPasswordPage from './pages/ResetPasswordPage.tsx';

// Admin Pages
import DashboardPage from './pages/admin/DashboardPage.tsx';
import LeadsListPage from './pages/admin/LeadsListPage.tsx';
import LeadDetailPage from './pages/admin/LeadDetailPage.tsx';
import DataExplorerPage from './pages/admin/DataExplorerPage.tsx';
import FormBuilderPage from './pages/admin/FormBuilderPage.tsx';
import SettingsPage from './pages/admin/SettingsPage.tsx';
import UserProfilePage from './pages/admin/UserProfilePage.tsx';
import VendorManagementPage from './pages/admin/VendorManagementPage.tsx';
import AdminManagementPage from './pages/admin/AdminManagementPage.tsx';


const AppRoutes: React.FC = () => {
    const { isLoading } = useAuth();

    if (isLoading) {
        return <FullScreenLoader message="Loading Application..." />;
    }

    return (
        <Routes>
            {/* Public Website Routes */}
            <Route path="/" element={<MainLayout />}>
                <Route index element={<HomePage />} />
                <Route path="rooftop-solar" element={<RooftopSolarPage />} />
                <Route path="solar-pumps" element={<SolarPumpsPage />} />
                <Route path="calculator/:type" element={<CalculatorPage />} />
                <Route path="success-stories" element={<SuccessStoriesPage />} />
                <Route path="success-stories/:storyId" element={<SuccessStoryDetailPage />} />
                <Route path="subsidies" element={<SubsidiesPage />} />
                <Route path="about" element={<AboutUsPage />} />
                <Route path="contact" element={<ContactPage />} />
            </Route>

            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

            {/* Protected Admin Routes */}
            <Route
                path="/admin"
                element={
                    <ProtectedRoute>
                        <CrmUpdatesProvider>
                            <AdminLayout>
                                <Outlet />
                            </AdminLayout>
                        </CrmUpdatesProvider>
                    </ProtectedRoute>
                }
            >
                <Route index element={<DashboardPage />} />
                <Route path="leads" element={<LeadsListPage />} />
                <Route path="leads/:leadId" element={<LeadDetailPage />} />
                <Route path="data-explorer" element={<DataExplorerPage />} />
                <Route path="form-builder" element={<FormBuilderPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="profile" element={<UserProfilePage />} />
                <Route
                    path="vendors"
                    element={
                        <MasterRoute>
                            <VendorManagementPage />
                        </MasterRoute>
                    }
                />
                <Route
                    path="admins"
                    element={
                        <MasterRoute>
                            <AdminManagementPage />
                        </MasterRoute>
                    }
                />
            </Route>
        </Routes>
    );
};

const App: React.FC = () => {
    return (
        <HashRouter>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </HashRouter>
    );
};

export default App;