import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Users from './pages/Users';
import Subscriptions from './pages/Subscriptions';
import Analytics from './pages/Analytics';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Admins from './pages/Admins';
import SupportChats from './pages/SupportChats';
import Notifications from './pages/Notifications';

function RequireAuth({ children }) {
  const { admin, token } = useAuth();
  const location = useLocation();
  if (!admin || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="*"
          element={
            <RequireAuth>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/users" element={<Users />} />
                  <Route path="/admins" element={<Admins />} />
                  <Route path="/subscriptions" element={<Subscriptions />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/support-chats" element={<SupportChats />} />
                  <Route path="/notifications" element={<Notifications />} />
                </Routes>
              </Layout>
            </RequireAuth>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
