import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { FaUser } from "react-icons/fa";

export default function AnalystSidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const linkClass = ({ isActive }) =>
    `block px-3 py-2 rounded-md transition text-sm ${
      isActive
        ? "bg-blue-100 text-blue-700 font-semibold"
        : "text-gray-600 hover:bg-gray-100 hover:text-blue-600"
    }`;

  return (
    <div className="flex">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-white border-r shadow-lg p-4 transform transition-transform duration-300 ease-in-out z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-60"
        } w-64 overflow-y-auto`} // Added overflow-y-auto for scrolling if menu gets long
      >
        {/* Toggle Arrow */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute top-4 -right-5 bg-gray-800 text-white px-2 py-1 rounded-r-md shadow"
        >
          {isOpen ? "❮" : "❯"}
        </button>

        {/* User Heading */}
        <div className="flex items-center mb-3">
          <FaUser className="text-blue-500 mr-2 text-lg" />
          <span className="font-semibold text-gray-800 text-base">
            <NavLink to="/analyst/dashboard" className="hover:text-blue-600">
              {user ? user.name : "User"}
            </NavLink>
          </span>
        </div>
        <hr className="mb-4 border-gray-200" />

        {/* --- SECTION 1: MY WORKSPACE (Tasks for the Analyst) --- */}
        <div className="mb-6">
          <div className="font-bold text-gray-500 mb-2 text-xs uppercase tracking-wider">
            My Workspace
          </div>
          <div className="space-y-1">
            {/* 1. Incidents Assigned TO the Analyst */}
            <NavLink to="/analyst/assigned-incidents" className={linkClass}>
              Assigned to Me
            </NavLink>
            
            <NavLink to="/analyst/approve-incidents" className={linkClass}>
              Approve Incident Records
            </NavLink>
            
            <NavLink to="/analyst/feedback" className={linkClass}>
              Feedback Moderation
            </NavLink>
          </div>
        </div>

        {/* --- SECTION 2: MY REQUESTS (Incidents raised BY the Analyst) --- */}
        <div className="mb-6">
          <div className="font-bold text-gray-500 mb-2 text-xs uppercase tracking-wider">
            My Requests
          </div>
          <div className="space-y-1">
             {/* 2. Incidents Created BY the Analyst */}
            <NavLink to="/analyst/incidentsIRaised" className={linkClass}>
              Incidents I Raised
            </NavLink>
            
            <NavLink to="/analyst/log-incident" className={linkClass}>
              Log New Incident
            </NavLink>
          </div>
        </div>

        {/* --- SECTION 3: MANAGE ALL --- */}
        <div>
          <div className="font-bold text-gray-500 mb-2 text-xs uppercase tracking-wider">
            Global Management
          </div>
          <div className="space-y-1 pl-2 border-l-2 border-gray-200">
            <NavLink to="/analyst/incidents" className={linkClass}>
              All Incidents List
            </NavLink>
            <NavLink to="/analyst/work-orders" className={linkClass}>
              Work Order List
            </NavLink>
          </div>
        </div>
        
      </div>
    </div>
  );
}