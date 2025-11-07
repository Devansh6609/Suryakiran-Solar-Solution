
import React from 'react';
// FIX: Changed to namespace import to resolve module export errors.
import * as ReactRouterDOM from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface MasterRouteProps {
    children: React.ReactElement;
}

const MasterRoute: React.FC<MasterRouteProps> = ({ children }) => {
    const { user } = useAuth();

    if (user?.role !== 'Master') {
        // You can redirect to a 'not-authorized' page or back to the dashboard
        return (
            <div className="p-8 text-center">
                <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
                <p className="mt-2 text-gray-600">You do not have permission to access this page.</p>
                <ReactRouterDOM.Link to="/admin" className="mt-4 inline-block text-primary-green hover:underline">
                    &larr; Back to Dashboard
                </ReactRouterDOM.Link>
            </div>
        );
    }

    return children;
};

export default MasterRoute;
