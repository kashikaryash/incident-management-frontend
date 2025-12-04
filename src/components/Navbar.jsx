import React from 'react';

const Navbar = () => {
  return (
    <nav className="bg-blue-600 text-white p-4 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="text-xl font-semibold">Admin Dashboard</h1>
        <span className="text-sm">Welcome, Admin</span>
      </div>
    </nav>
  );
};

export default Navbar;
