import React, { useState } from 'react';
import Navbar from '../Navbar.jsx';
import DashboardMain from './DashboardMain.jsx';
import SidebarAdmin from './SidebarAdmin.jsx';

const Dashboard = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#000814]">
    <SidebarAdmin isOpen={isOpen} onClose={() => setIsOpen(false)} role="admin" />
    <Navbar onMenuClick={() => setIsOpen(!isOpen)} />
      
    <main className="mt-16 text-white md:ml-57.5 transition-all duration-300 min-h-[calc(100vh-64px)] bg-[#000814]">
      <DashboardMain />
    </main>
    </div>
  )
}

export default Dashboard
