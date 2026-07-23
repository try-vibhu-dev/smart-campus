import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import Complaints from './pages/Complaints';
import Announcements from './pages/Announcements';
import LostFound from './pages/LostFound';
import Classroom from './pages/Classroom';
import AdminDashboard from './pages/AdminDashboard';
import { useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Profile from './pages/Profile';
import ClassroomManager from './pages/ClassroomManager';

const AppLayout = ({ children }) => {
  const { user, darkMode } = useAuth();
  return (
    <div className={darkMode ? 'dark' : ''} style={{ minHeight: '100vh' }}>
      <div className={darkMode ? 'bg-gray-950 min-h-screen' : 'bg-gray-50 min-h-screen'}>
        {user && <Navbar />}
        {children}
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Navigate to="/login" />} />
              <Route path="/dashboard" element={<PrivateRoute><StudentDashboard /></PrivateRoute>} />
              <Route path="/complaints" element={<PrivateRoute><Complaints /></PrivateRoute>} />
              <Route path="/announcements" element={<PrivateRoute><Announcements /></PrivateRoute>} />
              <Route path="/lostfound" element={<PrivateRoute><LostFound /></PrivateRoute>} />
              <Route path="/classroom" element={<PrivateRoute><Classroom /></PrivateRoute>} />
              <Route path="/admin" element={<PrivateRoute adminOnly><AdminDashboard /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route path="/admin/classrooms" element={<PrivateRoute adminOnly><ClassroomManager /></PrivateRoute>} />
            </Routes>
          </AppLayout>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;