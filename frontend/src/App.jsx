import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Home from './pages/home/Home';
import AllBlogs from './pages/allBlogs/AllBlogs';
import BlogInfo from './pages/blogInfo/BlogInfo';
import AdminLogin from './pages/admin/adminLogin/AdminLogin';
import Dashboard from './pages/admin/dashboard/Dashboard';
import Nopage from './pages/nopage/Nopage';
import { Toaster } from 'react-hot-toast';
import DonorDashboard from './pages/donor/dashboard/DonorDashboard';
import NgoDashboard from './pages/ngo/dashboard/NgoDashboard';
import Register from './pages/register/Register';
import CreateDonation from './components/createDonation/CreateDonation';
import { SpeedInsights } from '@vercel/speed-insights/react';
import CreateBlog from './pages/createBlog/CreateBlog';
import { useAuth } from './hooks/useAuth';
import { Loader2 } from 'lucide-react';

function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/allblogs" element={<AllBlogs />} />
          <Route path="/bloginfo/:id" element={<BlogInfo />} />
          <Route path="/adminlogin" element={<AdminLogin />} />
          <Route path="/register" element={<Register />} />
          <Route path="/createdonation" element={<CreateDonation />} />

          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/createblog" element={
            <ProtectedRoute allowedRoles={["ADMIN", "PROVIDER", "DISTRIBUTOR"]}>
              <CreateBlog />
            </ProtectedRoute>
          } />
          <Route path="/donor-dashboard" element={
            <ProtectedRoute allowedRoles={["PROVIDER"]}>
              <DonorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/ngo-dashboard" element={
            <ProtectedRoute allowedRoles={["DISTRIBUTOR"]}>
              <NgoDashboard />
            </ProtectedRoute>
          } />
          <Route path="/*" element={<Nopage />} />
        </Routes>
        <Toaster />
      </Router>
      <SpeedInsights />
    </div>
  );
}

export default App;

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/adminlogin" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    const dashboardByRole = {
      PROVIDER: '/donor-dashboard',
      DISTRIBUTOR: '/ngo-dashboard',
      ADMIN: '/dashboard',
    };
    return <Navigate to={dashboardByRole[user.role] || '/'} replace />;
  }

  return children;
};
