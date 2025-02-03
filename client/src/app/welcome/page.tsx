import React from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';

const WelcomePage = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <div className="p-4">
          <h1 className="text-2xl font-bold">Welcome to the Application</h1>
          <p>This is the welcome screen.</p>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
