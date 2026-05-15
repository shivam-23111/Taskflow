import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/projects': 'Projects',
  '/tasks': 'Tasks',
  '/profile': 'Profile',
};

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = () => {
    if (location.pathname.startsWith('/projects/')) return 'Project Details';
    return pageTitles[location.pathname] || 'TaskFlow';
  };

  return (
    <div className="min-h-screen bg-dark-950 text-dark-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-[288px] min-h-screen flex flex-col">
        <Navbar
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          pageTitle={getPageTitle()}
        />

        <main className="flex-1 px-4 py-5 sm:px-5 lg:px-8 lg:py-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
