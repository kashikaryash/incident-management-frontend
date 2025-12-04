import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AnalystSidebar from "../../components/AnalystSidebar";

export default function AnalystLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex">
      {/* Sidebar */}
       <AnalystSidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Content */}
      <div
        className={`transition-all duration-300 p-6 w-full ${
          isSidebarOpen ? "ml-56" : "ml-0"
        }`}
      >
        <Outlet />
      </div>
    </div>
  );
}
