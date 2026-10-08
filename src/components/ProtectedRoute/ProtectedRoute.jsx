import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx'; 

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

 
  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#0b0f12',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#00e58b',
          fontWeight: 'bold',
          fontSize: '1.1rem',
        }}
      >
        Carregando...
      </div>
    );
  }


  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }


  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }



  return children ? children : <Outlet />;
}