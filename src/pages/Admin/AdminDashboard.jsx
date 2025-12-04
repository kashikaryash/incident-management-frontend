import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import DropdownMenu from "../../components/admin/DropdownMenu";

const AdminDashboard = () => {
    const navigate = useNavigate();
    const importOptions = [
        { label: "Import Users", route: "import-users" },
        { label: "Import Roles", route: "import-roles" },
    ];

    const navButtonClass =
        "block w-full text-left rounded-md px-3 py-2 hover:bg-sky-500 hover:text-white transition-colors duration-150";

    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
            {/* Header */}
            <header className="bg-blue-600 text-white p-4 flex justify-between items-center shadow">
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
                <p className="hidden sm:block text-sm">Welcome, Admin</p>
                <button
                    onClick={() => {
                        localStorage.removeItem("token");
                        navigate("/");
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition duration-150"
                >
                    Sign Out
                </button>
            </header>

            {/* Main content */}
            <div className="flex flex-1">
                {/* Sidebar */}
                <nav className="w-64 bg-white border-r p-4 space-y-6 overflow-auto">
                    {/* User Management */}
                    <div>
                        <h3 className="font-bold mb-2 border-b pb-1">User Management</h3>
                        <ul className="space-y-1">
                            <li>
                                <button onClick={() => navigate("users")} className={navButtonClass}>
                                    Users
                                </button>
                            </li>
                            <li>
                                <button onClick={() => navigate("roles")} className={navButtonClass}>
                                    Roles
                                </button>
                            </li>
                            <li>
                                <button onClick={() => navigate("import")} className={navButtonClass}>
                                    Import
                                </button>
                            </li>

                        </ul>
                    </div>

                    {/* Infrastructure */}
                    <div>
                        <h3 className="font-bold mb-2 border-b pb-1">Infrastructure</h3>
                        <ul className="space-y-1">
                            <li>
                                <button onClick={() => navigate("workgroup-management")} className={navButtonClass}>
                                    Workgroup
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* Incident Masters */}
                    <div>
                        <h3 className="font-bold mb-2 border-b pb-1">Incident Masters</h3>
                        <ul className="space-y-1">
                            <li>
                                <button onClick={() => navigate("all-incidents")} className={navButtonClass}>
                                    All Incidents
                                </button>
                            </li>
                            <li>
                                <button onClick={() => navigate("category")} className={navButtonClass}>
                                    Category
                                </button>
                            </li>
                            <li>
                                <button onClick={() => navigate("classification")} className={navButtonClass}>
                                    Classification
                                </button>
                            </li>
                            <li>
                                <button onClick={() => navigate("closure-codes")} className={navButtonClass}>
                                    Closure Codes
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* SLA Configurations */}
                    <div>
                        <h3 className="font-bold mb-2 border-b pb-1">SLA Configurations</h3>
                        <ul className="space-y-1">
                            <li>
                                <button onClick={() => navigate("impact")} className={navButtonClass}>
                                    Impact
                                </button>
                            </li>
                            <li>
                                <button onClick={() => navigate("priority")} className={navButtonClass}>
                                    Priority
                                </button>
                            </li>
                            <li>
                                <button onClick={() => navigate("sla-matrix-ci")} className={navButtonClass}>
                                    SLA Matrix By CI
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* Others */}
                    <div>
                        <h3 className="font-bold mb-2 border-b pb-1">Other Config</h3>
                        <ul className="space-y-1">
                            <li>
                                <button onClick={() => navigate("cost-config")} className={navButtonClass}>
                                    Cost Config
                                </button>
                            </li>
                            <li>
                                <button onClick={() => navigate("feedback-config")} className={navButtonClass}>
                                    Feedback Config
                                </button>
                            </li>
                        </ul>
                    </div>
                </nav>

                {/* Content area */}
                <main className="flex-1 p-6 overflow-auto bg-gray-50">
                    {/* First page: Grid layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* User Management card */}
                        <div className="bg-white rounded-xl p-4 shadow hover:shadow-lg transition">
                            <h3 className="font-bold text-lg mb-2">User Management</h3>
                            <ul className="space-y-2">
                                <li>
                                    <button onClick={() => navigate("users")} className={navButtonClass}>
                                        Users
                                    </button>
                                </li>
                                <li>
                                    <button onClick={() => navigate("roles")} className={navButtonClass}>
                                        Roles
                                    </button>
                                </li>
                            </ul>
                        </div>

                        {/* Infrastructure card */}
                        <div className="bg-white rounded-xl p-4 shadow hover:shadow-lg transition">
                            <h3 className="font-bold text-lg mb-2">Infrastructure</h3>
                            <ul className="space-y-2">
                                <li>
                                    <button onClick={() => navigate("workgroup")} className={navButtonClass}>
                                        Workgroup
                                    </button>
                                </li>
                            </ul>
                        </div>

                        {/* Incident Masters card */}
                        <div className="bg-white rounded-xl p-4 shadow hover:shadow-lg transition">
                            <h3 className="font-bold text-lg mb-2">Incident Masters</h3>
                            <ul className="space-y-2">
                                <li>
                                    <button onClick={() => navigate("all-incidents")} className={navButtonClass}>
                                        All Incidents
                                    </button>
                                </li>
                                <li>
                                    <button onClick={() => navigate("category")} className={navButtonClass}>
                                        Category
                                    </button>
                                </li>
                            </ul>
                        </div>

                        {/* SLA card */}
                        <div className="bg-white rounded-xl p-4 shadow hover:shadow-lg transition">
                            <h3 className="font-bold text-lg mb-2">SLA Configurations</h3>
                            <ul className="space-y-2">
                                <li>
                                    <button onClick={() => navigate("impact")} className={navButtonClass}>
                                        Impact
                                    </button>
                                </li>
                                <li>
                                    <button onClick={() => navigate("priority")} className={navButtonClass}>
                                        Priority
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Nested routes render here */}
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
