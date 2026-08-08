import React, { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { CrmUpdatesProvider } from './contexts/CrmUpdatesContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/admin/ProtectedRoute';
import MasterRoute from './components/auth/MasterRoute';
import LoadingSpinner from './components/LoadingSpinner';
import WebsitePageSkeleton from './components/skeletons/WebsitePageSkeleton';

// Lazy load layouts
const MainLayout = lazy(() => import('./pages/MainLayout'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));

// Lazy load pages
const HomePage = lazy(() => import('./pages/HomePage'));
const RooftopSolarPage = lazy(() => import('./pages/RooftopSolarPage'));
const SolarPumpsPage = lazy(() => import('./pages/SolarPumpsPage'));
const CalculatorPage = lazy(() => import('./pages/CalculatorPage'));
const SuccessStoriesPage = lazy(() => import('./pages/SuccessStoriesPage'));
const SuccessStoryDetailPage = lazy(() => import('./pages/SuccessStoryDetailPage'));
const SubsidiesPage = lazy(() => import('./pages/SubsidiesPage'));
const AboutUsPage = lazy(() => import('./pages/AboutUsPage'));
const CareerPage = lazy(() => import('./pages/CareerPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));

// Admin Pages
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'));
const LeadsListPage = lazy(() => import('./pages/admin/LeadsListPage'));
const ManualLeadEntryPage = lazy(() => import('./pages/admin/ManualLeadEntryPage'));
const LeadDetailPage = lazy(() => import('./pages/admin/LeadDetailPage'));
const DataExplorerPage = lazy(() => import('./pages/admin/DataExplorerPage'));
const FormBuilderPage = lazy(() => import('./pages/admin/FormBuilderPage'));
const SettingsPage = lazy(() => import('./pages/admin/SettingsPage'));
const QuotationGeneratorPage = lazy(() => import('./pages/admin/QuotationGeneratorPage'));
const QuotationsListPage = lazy(() => import('./pages/admin/QuotationsListPage'));
const SurveyDashboardPage = lazy(() => import('./pages/admin/SurveyDashboardPage'));
const SurveyDetailPage = lazy(() => import('./pages/admin/SurveyDetailPage'));
const InventoryPage = lazy(() => import('./pages/admin/InventoryPage'));

const UserProfilePage = lazy(() => import('./pages/admin/UserProfilePage'));
const VendorManagementPage = lazy(() => import('./pages/admin/VendorManagementPage'));
const AdminManagementPage = lazy(() => import('./pages/admin/AdminManagementPage'));

const AppRoutes: React.FC = () => {
    return (
        <Suspense fallback={<WebsitePageSkeleton />}>
            <Routes>
                {/* Public Routes */}
                <Route element={<MainLayout />}>
                    <Route index element={<HomePage />} />
                    <Route path="rooftop-solar" element={<RooftopSolarPage />} />
                    <Route path="solar-pumps" element={<SolarPumpsPage />} />
                    <Route path="calculator/:type" element={<CalculatorPage />} />
                    <Route path="success-stories" element={<SuccessStoriesPage />} />
                    <Route path="success-stories/:storyId" element={<SuccessStoryDetailPage />} />
                    <Route path="subsidies" element={<SubsidiesPage />} />
                    <Route path="about" element={<AboutUsPage />} />
                    <Route path="career" element={<CareerPage />} />
                    <Route path="about" element={<AboutUsPage />} />
                    <Route path="career" element={<CareerPage />} />
                    <Route path="contact" element={<ContactPage />} />
                    <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
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
                    <Route path="leads/manual" element={<ManualLeadEntryPage />} />
                    <Route path="leads/:leadId" element={<LeadDetailPage />} />
                    <Route path="quotations" element={<QuotationsListPage />} />
                    <Route path="surveys" element={<SurveyDashboardPage />} />
                    <Route path="surveys/:surveyId" element={<SurveyDetailPage />} />
                    <Route path="inventory" element={<InventoryPage />} />
                    <Route path="quotation/:leadId?" element={<QuotationGeneratorPage />} />
                    <Route path="quotation/new/:leadId?" element={<QuotationGeneratorPage />} />
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
        </Suspense>
    );
};

const App: React.FC = () => {
    return (
        <HashRouter>
            <AuthProvider>
                <ThemeProvider>
                    <ToastProvider>
                        <AppRoutes />
                    </ToastProvider>
                </ThemeProvider>
            </AuthProvider>
        </HashRouter>
    );
};

export default App;