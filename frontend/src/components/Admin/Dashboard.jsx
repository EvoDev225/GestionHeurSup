import React, { useState } from 'react';
import Sidebar from '../Sidebar.jsx';
import Navbar from '../Navbar.jsx';
import DashboardMain from './DashboardMain.jsx';

const Dashboard = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#000814]">
    <Sidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />
    <Navbar onMenuClick={() => setIsOpen(!isOpen)} />
      
    <main className="mt-16 text-white md:ml-57.5 transition-all duration-300 min-h-[calc(100vh-64px)] bg-[#000814]">
      <DashboardMain />
    </main>
    </div>
  )
}

export default Dashboard
